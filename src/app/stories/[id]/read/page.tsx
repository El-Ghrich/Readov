'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, BookOpen, Loader2, Share2, User, Bot, AlertTriangle } from 'lucide-react'
import StoryBrancher from '@/components/StoryBrancher'

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: storyId } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [story, setStory] = useState<any>(null)
    const [parts, setParts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStoryAndParts = async () => {
            try {
                // 1. Fetch Story
                const { data: storyData, error: storyError } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('id', storyId)
                    .single()

                if (storyError) throw storyError

                // Redirect if not completed
                if (!storyData.is_completed) {
                    router.replace(`/stories/${storyId}`)
                    return
                }

                setStory(storyData)

                // 2. Fetch Parts
                const { data: partsData, error: partsError } = await supabase
                    .from('story_parts')
                    .select('*')
                    .eq('story_id', storyId)
                    .order('part_number', { ascending: true })

                if (partsError) throw partsError
                setParts(partsData || [])

            } catch (err: any) {
                console.error("Error loading reader:", err)
                setError("Failed to load story.")
            } finally {
                setLoading(false)
            }
        }

        fetchStoryAndParts()
    }, [storyId, supabase, router])

    const handleFeatureMock = (feature: string, instruction: string, partNumber: number) => {
        alert(`[${feature} Feature]\n\nInstruction: "${instruction}"\n\nTarget: Part #${partNumber}\n\nThis feature requires backend implementation to modify the story graph.`)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                <p className="text-gray-500">Opening story...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{error}</p>
                <Link href="/stories" className="text-purple-600 hover:underline">Return to Library</Link>
            </div>
        </div>
    )

    if (!story) return null // Should have redirected or shown error

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] pb-32">

            {/* Minimal Floating Navigation */}
            <div className="fixed top-6 left-6 z-40">
                <Link
                    href="/stories"
                    className="flex items-center justify-center w-10 h-10 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-black hover:scale-105 transition-all shadow-sm"
                    title="Back to Library"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            {/* Story Content */}
            <main className="max-w-3xl mx-auto px-4 md:px-8 py-20">
                <div className="space-y-8">

                    {/* Minimal Story Title Section */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-widest text-purple-600 dark:text-purple-400 uppercase bg-purple-100 dark:bg-purple-900/20 rounded-full">
                            {story.genre || 'Story'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            {story.title}
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-4 h-4" />
                            <span>Readov Original</span>
                        </div>
                    </div>

                    {/* Rendering Parts */}
                    {parts.map((part, index) => (
                        <div key={part.id} className="relative group">
                            {/* Part Content with Line-by-Line Animation */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.15 // Stagger delay for each line/block
                                        }
                                    }
                                }}
                                className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                            >
                                <span className={`float-left mr-2 mt-1 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${part.is_user_input
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    }`}>
                                    {part.is_user_input ? 'You' : 'AI'}
                                </span>

                                {/* 
                                    Split content by newlines to animate blocks/lines.
                                    Using a heuristic: double newline is paragraph, single is line break.
                                */}
                                {part.content.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                                    <motion.p
                                        key={i}
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                                        }}
                                        className="mb-4"
                                    >
                                        {line}
                                    </motion.p>
                                ))}
                            </motion.div>

                            {/* Branching UI between paragraphs */}
                            <div className="my-8">
                                <StoryBrancher
                                    index={index}
                                    choices={part.choices || []}
                                    onBranch={(instruction) => handleFeatureMock('Branch', instruction || '', part.part_number)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* The End Marker */}
                    <div className="flex items-center justify-center gap-4 py-12 opacity-50">
                        <div className="h-px bg-gray-300 dark:bg-gray-700 w-24"></div>
                        <span className="font-serif italic text-gray-500 dark:text-gray-400">The End</span>
                        <div className="h-px bg-gray-300 dark:bg-gray-700 w-24"></div>
                    </div>
                </div>
            </main>
        </div>
    )
}
