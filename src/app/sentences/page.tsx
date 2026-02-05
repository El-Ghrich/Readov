'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Volume2, Bookmark, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Dummy Data (replace with API)
const DUMMY_SENTENCES = [
    {
        id: '1',
        english: 'Welcome! Swipe up to start learning',
        arabic: 'مرحباً! اسحب لأعلى لبدء التعلم',
        color: '#70D7D0'
    },
    {
        id: '2',
        english: 'How are you today?',
        arabic: 'كيف حالك اليوم؟',
        color: '#FF8E8E'
    },
    {
        id: '3',
        english: 'I love learning new languages',
        arabic: 'أحب تعلم لغات جديدة',
        color: '#AEDFCF'
    }
]

export default function SentencesPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [sentences, setSentences] = useState(DUMMY_SENTENCES)
    const constraintsRef = useRef(null)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-100, 0, 100], [10, 0, -10])
    const opacity = useTransform(y, [-200, 0, 200], [0, 1, 0])
    const router = useRouter()

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.y < -100) {
            // Swipe Up -> Next
            nextSentence()
        } else if (info.offset.y > 100) {
            // Swipe Down -> Prev
            prevSentence()
        }
    }

    const nextSentence = () => {
        if (currentIndex < sentences.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            // Fetch next from API
            setCurrentIndex(0) // Loop for demo
        }
    }

    const prevSentence = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        window.speechSynthesis.speak(utterance)
    }

    const currentSentence = sentences[currentIndex]

    return (
        <div className="h-screen w-full bg-black overflow-hidden relative">
            <Link href="/" className="absolute top-6 left-6 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="absolute top-6 right-6 z-50 flex gap-2">
                <div className="px-4 py-2 bg-black/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
                    {currentIndex + 1} / {sentences.length}
                </div>
            </div>

            <motion.div
                className="h-full w-full flex items-center justify-center p-6 cursor-grab active:cursor-grabbing"
                style={{ backgroundColor: currentSentence.color }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
            >
                <motion.div
                    style={{ y, rotateX, opacity }}
                    className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center space-y-8"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-gray-800">{currentSentence.english}</h2>
                        <button
                            onClick={() => speak(currentSentence.english)}
                            className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-purple-100 hover:text-purple-600 transition-colors mx-auto block"
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="h-px bg-gray-200 w-full" />

                    <div>
                        <p className="text-3xl font-bold text-indigo-700 font-arabic" dir="rtl">{currentSentence.arabic}</p>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <button className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-yellow-500">
                            <Bookmark className="w-6 h-6" />
                        </button>
                        <button className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-green-500">
                            <CheckCircle className="w-6 h-6" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm animate-bounce">
                Swipe up for next
            </div>
        </div>
    )
}
