'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/context/SidebarContext'
import {
    BookOpen, CheckCircle, Trash2, StopCircle,
    Share2, Edit3, Image as ImageIcon, Flag,
    User, Bot, Send, Loader2, AlertTriangle
} from 'lucide-react'
import StoryChoices from '@/components/StoryChoices'
import StoryBrancher from '@/components/StoryBrancher'


export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id: storyId } = use(params)
    const { isCollapsed } = useSidebar()


    const [story, setStory] = useState<any>(null)
    const [parts, setParts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [generating, setGenerating] = useState(false)
    const [inputMode, setInputMode] = useState<'ai' | 'custom'>('ai')
    const [customInput, setCustomInput] = useState('')
    const [showEndStoryModal, setShowEndStoryModal] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchStory = async () => {
            try {
                // Get User
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    // Optionally redirect or allow public view? Leaving as is for now.
                    // return router.push('/login')
                }

                // Get Story
                const { data: storyData, error: storyError } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('id', storyId)
                    .single()

                if (storyError) throw storyError

                // If story is completed, redirect to reader view
                if (storyData.is_completed) {
                    router.replace(`/stories/${storyId}/read`)
                    return
                }

                setStory(storyData)

                // Get Parts
                const { data: partsData, error: partsError } = await supabase
                    .from('story_parts')
                    .select('*')
                    .eq('story_id', storyId)
                    .order('part_number', { ascending: true })

                if (partsError) throw partsError
                setParts(partsData || [])

            } catch (err: any) {
                console.error(err)
                setError("Failed to load story")
            } finally {
                setLoading(false)
            }
        }
        fetchStory()

    }, [storyId, supabase])
    // Subscribe to new parts (Realtime)
    useEffect(() => {
        const fetchParts = async () => {
            const { data: partsData } = await supabase
                .from('story_parts')
                .select('*')
                .eq('story_id', storyId)
                .order('part_number', { ascending: true })

            if (partsData) {
                setParts(partsData)
                setGenerating(false)
            }
        }

        const channel = supabase
            .channel(`story-${storyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'story_parts',
                    filter: `story_id=eq.${storyId}`
                },
                (payload) => {
                    setParts(prev => {
                        // Avoid duplicates
                        if (prev.find(p => p.id === payload.new.id)) return prev
                        return [...prev, payload.new]
                    })
                    // Stop generating state if we were waiting
                    setGenerating(false)
                }
            )
            // Listen for Story Updates (e.g. Completed status)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'stories',
                    filter: `id=eq.${storyId}`
                },
                (payload) => {
                    setStory((prev: any) => ({ ...prev, ...payload.new }))
                }
            )
            // Listen for Job Completion (Backup trigger)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'jobs',
                    filter: `status=eq.completed`
                },
                async (payload) => {
                    // Check if this job belongs to our story (if result has story_id)
                    // Note: RLS might block reading 'jobs' if not careful, but usually users can read their own jobs.
                    // The filter `status=eq.completed` is broad, so we check the result payload.
                    const result = payload.new.result as any;
                    if (result?.story_id === storyId) {
                        console.log("Job completed for this story, refreshing parts...");
                        await fetchParts()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [storyId, supabase])

    // Polling fallback to ensure we don't get stuck
    useEffect(() => {
        if (!generating) return

        const interval = setInterval(async () => {
            const { data: partsData } = await supabase
                .from('story_parts')
                .select('*')
                .eq('story_id', storyId)
                .order('part_number', { ascending: true })

            if (partsData && partsData.length > parts.length) {
                setParts(partsData)
                setGenerating(false)
            }
        }, 4000) // Poll every 4 seconds

        return () => clearInterval(interval)
    }, [generating, parts.length, storyId, supabase])


    // Scroll reference
    const bottomRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when parts update
    useEffect(() => {
        if (parts.length > 0 && generating) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [parts, generating])

    const handleContinue = async (type: 'ai' | 'custom', overrideInput?: string) => {
        if (generating) return
        setGenerating(true)

        const inputToUse = overrideInput !== undefined ? overrideInput : customInput

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Prepare context: Sort parts and take the last ~20,000 characters to stay within reasonable limits
            // while providing enough context for the AI.
            const sortedParts = [...parts].sort((a, b) => a.part_number - b.part_number)
            const fullText = sortedParts.map(p => p.content).join('\n\n')
            const contextSummary = fullText.length > 20000
                ? "..." + fullText.slice(-20000)
                : fullText

            // We use the 'jobs' table to trigger the Edge Function
            const { error: jobError } = await supabase
                .from('jobs')
                .insert({
                    user_id: user?.id,
                    type: 'continue_story',
                    params: {
                        story_id: storyId,
                        type,
                        user_direction: type === 'custom' ? inputToUse : null,
                        context_summary: contextSummary
                    },
                    status: 'pending'
                })

            if (jobError) throw jobError

            // clear input
            setCustomInput('')

            // Scroll to bottom immediately to show loading state
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

        } catch (err) {
            console.error(err)
            alert("Failed to queue generation job")
            setGenerating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure?")) return
        await supabase.from('stories').delete().eq('id', storyId)
        router.push('/stories')
    }

    const handleComplete = async () => {
        // 1. Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()

        console.log("Debug: Attempting to complete story", {
            userId: user?.id,
            storyId,
            storyOwnerId: story?.user_id
        })

        if (!user) {
            alert("You must be logged in to save the story.")
            return
        }

        // Check ownership locally if possible
        if (story?.user_id && user.id !== story.user_id) {
            console.warn("Debug: User ID mismatch!", { current: user.id, owner: story.user_id })
            alert("Warning: You do not appear to be the owner of this story.")
        }

        // 2. Compile the full story from parts
        // sort by part number to ensure correct order
        const sortedParts = [...parts].sort((a, b) => a.part_number - b.part_number)
        const fullStoryContent = sortedParts.map(p => p.content).join('\n\n')

        try {
            const { data, error } = await supabase
                .from('stories')
                .update({
                    is_completed: true,
                    updated_at: new Date().toISOString(),
                    full_story: fullStoryContent, // Save the compiled story
                    // ensure we set context/content if needed, but 'full_story' seems to be the target based on render
                })
                .eq('id', storyId)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                // If 0 rows returned, the update failed to match a row (RLS or ID mismatch)
                console.warn("Update returned 0 rows. Possible RLS issue or not owner.")
                alert("Could not save completion. Ensure you are logged in and own this story.")
                return
            }

            // 3. Update local state and redirect to Reader
            setStory(data[0])
            router.push(`/stories/${storyId}/read`)

        } catch (err) {
            console.error("Error completing story:", err)
            alert("Failed to complete story. Please try again.")
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-400"><Loader2 className="animate-spin" /></div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>
    if (!story) return <div className="min-h-screen flex items-center justify-center text-gray-400">Story not found</div>

    return (
        <div className="min-h-screen pt-20 pb-32 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{story.title}</h1>
                    <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded">{story.genre}</span>
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded">{story.language}</span>
                        {story.is_completed && <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>}
                    </div>
                </div>

                <div className="flex gap-2">
                    {!story.is_completed &&
                        <button onClick={handleComplete} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-green-600 dark:text-green-400 transition-colors" title="Mark Complete">
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    }
                    <button onClick={handleDelete} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-red-600 dark:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {/* Content */}
            <div className="space-y-6 mb-12">
                {story.is_completed ? (
                    <div className="group relative bg-white dark:bg-transparent dark:glass-dark p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none hover:border-gray-300 dark:hover:border-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {story.full_story || story.content || "No content available."}
                        </div>
                    </div>
                ) : (
                    <>
                        {parts.map((part, index) => (
                            <div key={part.id} className="space-y-6 relative">
                                <div className="group relative bg-white dark:bg-transparent dark:glass-dark p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none hover:border-gray-300 dark:hover:border-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                            {part.is_user_input ? <User className="w-3 h-3 text-purple-600 dark:text-purple-400" /> : <Bot className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                                            Part {part.part_number}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button className="p-1 hover:text-black dark:hover:text-white text-gray-400 dark:text-gray-500" title="Generate Image">
                                                <ImageIcon className="w-4 h-4" />
                                            </button>
                                            <button className="p-1 hover:text-black dark:hover:text-white text-gray-400 dark:text-gray-500" title="Report">
                                                <Flag className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                        {part.content}
                                    </div>
                                </div>

                                {/* Mid-Story Branching Point */}
                                {!story.is_completed && (
                                    <StoryBrancher
                                        index={index}
                                        onRewrite={(instruction) => {
                                            console.log(`Rewriting from part ${part.part_number}:`, instruction)
                                            alert(`[Rewrite Feature Mock]\n\nInstruction: ${instruction}\n\nThis would delete all parts after #${part.part_number} and generate a new continuation.`)
                                        }}
                                        onBranch={(instruction) => {
                                            console.log(`Branching at part ${part.part_number}:`, instruction)
                                            alert(`[Branch Feature Mock]\n\nInstruction: ${instruction}\n\nThis would create a new story ID cloned from parts 1-${part.part_number} and generate a divergent path.`)
                                        }}
                                    />
                                )}

                                {/* Show choices for this part */}
                                {part.choices && part.choices.length > 0 && (
                                    <StoryChoices
                                        choices={part.choices}
                                        onSelect={(text, type) => handleContinue(type, text)}
                                        isLoading={generating && index === parts.length - 1}
                                        showInput={false}
                                        disabled={index !== parts.length - 1 || story.is_completed}
                                    />
                                )}
                            </div>
                        ))}
                    </>
                )}

                {generating && (
                    <div className="glass p-6 rounded-xl flex items-center justify-center gap-3 text-gray-400 animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        Writing next part...
                    </div>
                )}

                {/* Complete Story Button */}
                {!story.is_completed && parts.length > 0 && !generating && (
                    <div className="flex justify-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={handleComplete}
                            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Save & Finish Story
                        </button>
                    </div>
                )}
                {/* Scroll Anchor */}
                <div ref={bottomRef} className="h-24" /> {/* Add padding for footer */}
            </div>

            {/* Fixed Footer with Custom Input Only */}
            {
                !story.is_completed && (
                    <div className={`fixed bottom-0 right-0 left-0 transition-all duration-300 p-4 bg-white/80 dark:bg-background/80 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 z-20 shadow-lg dark:shadow-none ${isCollapsed ? 'md:left-20' : 'md:left-64'}`}>
                        <div className="max-w-4xl mx-auto flex gap-2">
                            <input
                                type="text"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Describe what happens next..."
                                disabled={generating}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-[#1e1e2e] border border-gray-300 dark:border-white/10 rounded-full focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white transition-colors"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !generating && customInput.trim()) {
                                        handleContinue('custom')
                                    }
                                }}
                            />
                            <button
                                onClick={() => setShowEndStoryModal(true)}
                                disabled={generating}
                                className="px-4 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 font-medium whitespace-nowrap"
                                title="Generate Ending"
                            >
                                <StopCircle className="w-5 h-5" />
                                <span className="hidden md:inline">End Story</span>
                            </button>
                            <button
                                onClick={() => handleContinue('custom')}
                                disabled={generating || !customInput.trim()}
                                className="px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-md flex items-center gap-2 font-medium"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )
            }

            {
                story.is_completed && (
                    <div className="text-center p-8 bg-white dark:glass-dark rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The End</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">This story has been completed.</p>
                        <Link href="/create" className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Start New Story
                        </Link>
                    </div>
                )
            }
            {/* End Story Confirmation Modal */}
            {showEndStoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1e1e2e] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Wrap it up?
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                This will generate a conclusion for your story without any further choices. Are you ready to see how it ends?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowEndStoryModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        setShowEndStoryModal(false)
                                        await handleContinue('custom', 'Write a creative and satisfying conclusion to this story. Tie up all loose ends. Do not provide any choices for continuation.')
                                    }}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02]"
                                >
                                    Generate Ending
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
