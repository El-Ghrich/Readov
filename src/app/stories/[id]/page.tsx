'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    BookOpen, CheckCircle, Trash2, StopCircle,
    Share2, Edit3, Image as ImageIcon, Flag,
    User, Bot, Send, Loader2
} from 'lucide-react'

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id: storyId } = use(params)

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
                    setStory(payload.new)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [storyId, supabase])


    const handleContinue = async (type: 'ai' | 'custom') => {
        setGenerating(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            console.log(user)
            // We use the 'jobs' table to trigger the Edge Function
            await supabase
                .from('jobs')
                .insert({
                    user_id: user?.id,
                    type: 'continue_story',
                    params: {
                        story_id: storyId,
                        type,
                        user_direction: type === 'custom' ? customInput : null,
                        context_summary: parts.map(p => p.content).join('\n\n') // Naive approach
                    },
                    status: 'pending'
                })

            // clear input
            setCustomInput('')

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
        <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{story.title}</h1>
                    <div className="flex gap-2 text-sm text-gray-400">
                        <span className="px-2 py-0.5 bg-white/10 rounded">{story.genre}</span>
                        <span className="px-2 py-0.5 bg-white/10 rounded">{story.language}</span>
                        {story.is_completed && <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>}
                    </div>
                </div>

                <div className="flex gap-2">
                    {!story.is_completed &&
                        <button onClick={handleComplete} className="p-2 hover:bg-white/10 rounded-full text-green-400 transition-colors" title="Mark Complete">
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    }
                    <button onClick={handleDelete} className="p-2 hover:bg-white/10 rounded-full text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6 mb-12">
                {story.is_completed ? (
                    <div className="group relative glass-dark p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="prose prose-invert max-w-none leading-relaxed text-gray-200 whitespace-pre-wrap">
                            {story.full_story || story.content || "No content available."}
                        </div>
                    </div>
                ) : (
                    <>
                        {parts.map((part) => (
                            <div key={part.id} className="group relative glass-dark p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                        {part.is_user_input ? <User className="w-3 h-3 text-purple-400" /> : <Bot className="w-3 h-3 text-blue-400" />}
                                        Part {part.part_number}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button className="p-1 hover:text-white text-gray-500" title="Generate Image">
                                            <ImageIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:text-white text-gray-500" title="Report">
                                            <Flag className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="prose prose-invert max-w-none leading-relaxed text-gray-200 whitespace-pre-wrap">
                                    {part.content}
                                </div>
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
            </div>

            {/* Controls */}
            {!story.is_completed && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5 z-40 md:pl-64 transition-all">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
                        {inputMode === 'ai' ? (
                            <button
                                onClick={() => handleContinue('ai')}
                                disabled={generating}
                                className="flex-1 py-3 px-6 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Bot className="w-5 h-5" />
                                Continue with AI
                            </button>
                        ) : (
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="What happens next?"
                                    className="flex-1 px-4 bg-black/40 border border-gray-600 rounded-full focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <button
                                    onClick={() => handleContinue('custom')}
                                    disabled={generating || !customInput.trim()}
                                    className="px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2 justify-center md:justify-end">
                            <button
                                onClick={() => setInputMode('ai')}
                                className={`p-3 rounded-full border ${inputMode === 'ai' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400 hover:text-white'}`}
                            >
                                <Bot className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setInputMode('custom')}
                                className={`p-3 rounded-full border ${inputMode === 'custom' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400 hover:text-white'}`}
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {story.is_completed && (
                <div className="text-center p-8 glass-dark rounded-xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-2">The End</h3>
                    <p className="text-gray-400 mb-6">This story has been completed.</p>
                    <Link href="/create" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                        Start New Story
                    </Link>
                </div>
            )}
        </div>
    )
}
