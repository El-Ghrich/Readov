'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Share2, X, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'

// Fallback database from original app
const FALLBACK_WORDS: Record<string, { synonyms: string[], antonyms: string[] }> = {
    'happy': { synonyms: ['joyful', 'cheerful', 'glad', 'pleased'], antonyms: ['sad', 'unhappy', 'miserable'] },
    'sad': { synonyms: ['unhappy', 'sorrowful', 'melancholy'], antonyms: ['happy', 'joyful', 'cheerful'] },
    'big': { synonyms: ['large', 'huge', 'enormous'], antonyms: ['small', 'tiny', 'little'] },
    'small': { synonyms: ['tiny', 'little', 'miniature'], antonyms: ['big', 'large', 'huge'] },
    'good': { synonyms: ['excellent', 'great', 'wonderful'], antonyms: ['bad', 'terrible', 'awful'] },
    'bad': { synonyms: ['terrible', 'awful', 'horrible'], antonyms: ['good', 'excellent', 'great'] },
    'fast': { synonyms: ['quick', 'rapid', 'swift'], antonyms: ['slow', 'sluggish', 'gradual'] },
    'slow': { synonyms: ['sluggish', 'gradual', 'leisurely'], antonyms: ['fast', 'quick', 'rapid'] },
    'hot': { synonyms: ['warm', 'heated', 'burning'], antonyms: ['cold', 'chilly', 'freezing'] },
    'cold': { synonyms: ['chilly', 'freezing', 'icy'], antonyms: ['hot', 'warm', 'heated'] },
    'love': { synonyms: ['adore', 'cherish', 'treasure'], antonyms: ['hate', 'despise', 'loathe'] },
    'hate': { synonyms: ['despise', 'loathe', 'detest'], antonyms: ['love', 'adore', 'cherish'] },
    'beautiful': { synonyms: ['gorgeous', 'stunning', 'lovely'], antonyms: ['ugly', 'hideous', 'unsightly'] },
    'ugly': { synonyms: ['hideous', 'unsightly', 'repulsive'], antonyms: ['beautiful', 'gorgeous', 'stunning'] }
}

type AnimatedWord = {
    id: number;
    text: string;
    type: 'synonym' | 'antonym';
    style: React.CSSProperties;
}

export default function EditorPage() {
    const [title, setTitle] = useState('Untitled Story')
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [animatedWords, setAnimatedWords] = useState<AnimatedWord[]>([])
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'default' | 'success' | 'danger';
        onConfirm: () => void
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'default',
        onConfirm: () => { }
    })

    // Save Meta Data
    const [formData, setFormData] = useState({
        genre: 'General',
        language: 'English',
        goal: '',
        lesson: '',
        isPublic: false
    })

    const processedWords = useRef(new Set<string>())
    const wordIdCounter = useRef(0)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()

    // Animation Logic
    const createAnimatedWord = (word: string, type: 'synonym' | 'antonym', index: number, total: number) => {
        const id = ++wordIdCounter.current

        const margin = 15
        let startX = 50
        let startY = 50

        if (type === 'synonym') {
            // Top/Left
            const positions = [{ x: margin, y: margin }, { x: 50, y: margin }, { x: 85, y: margin }, { x: margin, y: 30 }]
            const pos = positions[index % positions.length]
            startX = pos.x
            startY = pos.y
        } else {
            // Bottom/Right
            const positions = [{ x: 85, y: 70 }, { x: 50, y: 85 }, { x: margin, y: 85 }, { x: 85, y: 50 }]
            const pos = positions[index % positions.length]
            startX = pos.x
            startY = pos.y
        }

        // Random variations
        const endX = startX + (Math.random() - 0.5) * 20
        const endY = startY + (Math.random() - 0.5) * 15
        const rotation = (Math.random() - 0.5) * 20

        const style: React.CSSProperties = {
            left: `${startX}%`,
            top: `${startY}%`,
            transform: `rotate(${rotation}deg)`,
            opacity: 0,
            animation: `float-in-out 3s ease-in-out forwards` // define keyframes globally
        } as any

        setAnimatedWords(prev => [...prev, { id, text: word, type, style }])

        // Remove after animation
        setTimeout(() => {
            setAnimatedWords(prev => prev.filter(w => w.id !== id))
        }, 3000)
    }

    const getWords = async (word: string) => {
        try {
            // API
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            if (response.ok) {
                const data = await response.json()
                const synonyms = new Set<string>()
                const antonyms = new Set<string>()

                data.forEach((entry: any) => {
                    entry.meanings?.forEach((meaning: any) => {
                        // Meaning level
                        meaning.synonyms?.forEach((s: string) => s.toLowerCase() !== word.toLowerCase() && synonyms.add(s))
                        meaning.antonyms?.forEach((a: string) => a.toLowerCase() !== word.toLowerCase() && antonyms.add(a))

                        // Definition level
                        meaning.definitions?.forEach((def: any) => {
                            def.synonyms?.forEach((s: string) => s.toLowerCase() !== word.toLowerCase() && synonyms.add(s))
                            def.antonyms?.forEach((a: string) => a.toLowerCase() !== word.toLowerCase() && antonyms.add(a))
                        })
                    })
                })

                if (synonyms.size > 0 || antonyms.size > 0) {
                    return { synonyms: Array.from(synonyms).slice(0, 4), antonyms: Array.from(antonyms).slice(0, 4) }
                }
            }
        } catch (e) { /* ignore */ }

        // Fallback
        const fb = FALLBACK_WORDS[word.toLowerCase()]
        return fb || { synonyms: [], antonyms: [] }
    }

    const processInput = async (currentText: string) => {
        const cleanedText = currentText.replace(/\s{2,}/g, ' ')
        const words = cleanedText.trim().split(' ')

        // Only process if ends with space
        if (currentText.endsWith(' ') && !currentText.endsWith('  ') && words.length > 0) {
            const lastWord = words[words.length - 1].replace(/[^\w]/g, '')
            if (lastWord.length < 2) return
            if (processedWords.current.has(lastWord.toLowerCase())) return

            processedWords.current.add(lastWord.toLowerCase())
            setTimeout(() => processedWords.current.delete(lastWord.toLowerCase()), 3000)

            const { synonyms, antonyms } = await getWords(lastWord)

            synonyms.forEach((s, i) => setTimeout(() => createAnimatedWord(s, 'synonym', i, synonyms.length), i * 200))
            antonyms.forEach((a, i) => setTimeout(() => createAnimatedWord(a, 'antonym', i, antonyms.length), (synonyms.length * 200) + i * 200))
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        setText(val)

        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => processInput(val), 200)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data: storyData, error: storyError } = await supabase.from('stories').insert({
                user_id: user.id,
                title: title || 'Untitled Story',
                genre: formData.genre,
                language: formData.language,
                goal: formData.goal,
                lesson: formData.lesson,
                full_story: text,
                is_completed: true,
                is_published: formData.isPublic
            }).select().single()

            if (storyError) throw storyError

            // Insert into story_parts for compatibility with Reader
            const { error: partError } = await supabase.from('story_parts').insert({
                story_id: storyData.id,
                part_number: 1,
                content: text,
                is_user_input: true
            })

            if (partError) throw partError

            setShowSaveModal(false)
            setModalState({
                isOpen: true,
                title: 'Success!',
                message: 'Story saved successfully!',
                type: 'success',
                onConfirm: () => {
                    setModalState(s => ({ ...s, isOpen: false }))
                    router.push('/stories')
                }
            })
            showToast('Story saved successfully!', 'success')
        } catch (err: any) {
            setModalState({
                isOpen: true,
                title: 'Error',
                message: err.message,
                type: 'danger',
                onConfirm: () => setModalState(s => ({ ...s, isOpen: false }))
            })
            showToast('Failed to save story.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animation Keyframes */}
            <style jsx global>{`
                @keyframes float-in-out {
                    0% { opacity: 0; transform: scale(0.5) translateY(0); }
                    20% { opacity: 1; transform: scale(1.1) translateY(-10px); }
                    80% { opacity: 1; transform: scale(1) translateY(-20px); }
                    100% { opacity: 0; transform: scale(0.8) translateY(-40px); }
                }
            `}</style>

            <div className="max-w-4xl mx-auto h-[80vh] flex flex-col glass-dark rounded-2xl border border-white/5 relative">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-gray-500 w-full"
                        placeholder="Story Title..."
                    />
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative p-6">
                    <textarea
                        value={text}
                        onChange={handleInput}
                        className="w-full h-full bg-transparent text-lg text-gray-200 resize-none focus:outline-none leading-relaxed custom-scrollbar placeholder-gray-600"
                        placeholder="Start typing any word and add a space to see the magic..."
                        spellCheck={false}
                    />

                    {/* Animated Words Layer */}
                    <div className="absolute inset-0 pointer-events-none p-6 overflow-hidden">
                        {animatedWords.map(word => (
                            <div
                                key={word.id}
                                className={`absolute px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm border ${word.type === 'synonym'
                                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                                    }`}
                                style={word.style}
                            >
                                {word.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Legend */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        Synonyms
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        Antonyms
                    </div>
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-white">Save Story</h2>
                            <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
                                <select
                                    value={formData.genre}
                                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                >
                                    <option>General</option>
                                    <option>Fantasy</option>
                                    <option>Sci-Fi</option>
                                    <option>Romance</option>
                                    <option>Horror</option>
                                    <option>Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                                <select
                                    value={formData.language}
                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Goal (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.goal}
                                    onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                    placeholder="e.g. Learn new vocabulary"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Lesson (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.lesson}
                                    onChange={e => setFormData({ ...formData, lesson: e.target.value })}
                                    placeholder="e.g. Past tense"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div
                                className="flex items-center gap-4 pt-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                            >
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${formData.isPublic ? 'bg-purple-600' : 'bg-gray-600'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">Publish to Open Shelf</span>
                                    <span className="text-xs text-gray-400">Make this story public for everyone to read</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 mt-4"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Saving...' : 'Save to Library'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Modal
                isOpen={modalState.isOpen}
                onClose={modalState.onConfirm}
                title={modalState.title}
                type={modalState.type}
            >
                <div className="space-y-6">
                    <p className="text-gray-300">{modalState.message}</p>
                    <button
                        onClick={modalState.onConfirm}
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
                    >
                        Okay
                    </button>
                </div>
            </Modal>
        </div>
    )
}
