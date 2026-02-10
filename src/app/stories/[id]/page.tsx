'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/context/SidebarContext'
import {
    BookOpen, CheckCircle, Trash2, StopCircle,
    Share2, Edit3, Image as ImageIcon, Flag,
    User, Bot, Send, Loader2
} from 'lucide-react'
import StoryChoices from '@/components/StoryChoices'


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
        await supabase
            .from('stories')
            .update({ is_completed: true, updated_at: new Date().toISOString() })
            .eq('id', storyId)
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
                            <div key={part.id} className="space-y-6">
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
        </div >
    )
}
