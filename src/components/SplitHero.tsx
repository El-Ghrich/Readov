'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Homemade_Apple, Inter, Nanum_Brush_Script } from 'next/font/google'
import Link from 'next/link'

const homemadeApple = Homemade_Apple({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
})

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
})

const nanum = Nanum_Brush_Script({
    weight: "400",
    subsets: ['latin'],
    display: 'swap',
})



// --- 2. MAIN COMPONENT ---
const INITIAL_PROMPT = "Where legends are written... Unfold your imagination."

export default function SplitHero() {
    // 3D Tilt Logic
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const mouseX = useSpring(0, { stiffness: 40, damping: 25 })
    const mouseY = useSpring(0, { stiffness: 40, damping: 25 })
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]) // Increased tilt
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]) // Increased tilt

    // Ink Drop Logic
    const [inkBlots, setInkBlots] = useState<{ id: number, x: number, y: number }[]>([])

    const handleScrollClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Get click position relative to the scroll container
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newBlot = { id: Date.now(), x, y };
        setInkBlots(prev => [...prev, newBlot]);

        // Remove blot after animation prevents DOM clutter
        setTimeout(() => {
            setInkBlots(prev => prev.filter(b => b.id !== newBlot.id))
        }, 2000)
    }

    // Typewriter & AI Logic
    const [currentStory, setCurrentStory] = useState(INITIAL_PROMPT)
    const [displayedText, setDisplayedText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isWaitingForAI, setIsWaitingForAI] = useState(false)
    const [typingSpeed, setTypingSpeed] = useState(50)

    const fetchNewStory = useCallback(async () => {
        setIsWaitingForAI(true)
        try {
            await new Promise(r => setTimeout(r, 1500))
            const randomPhrases = [
                "The old library whispered secrets only the brave could hear...",
                "In a kingdom made of glass, a single stone changed everything...",
                "The stars aligned to form a map that led to no known land...",
                "She opened the book, and the room filled with the smell of the sea..."
            ]
            const newText = randomPhrases[Math.floor(Math.random() * randomPhrases.length)]
            setCurrentStory(newText)
        } catch (error) {
            console.error("AI Error:", error)
            setCurrentStory("The ink has run dry... try again later.")
        } finally {
            setIsWaitingForAI(false)
        }
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth
                const height = window.innerHeight
                setMousePos({
                    x: (e.clientX / width) - 0.5,
                    y: (e.clientY / height) - 0.5
                })
            }
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useEffect(() => {
        mouseX.set(mousePos.x)
        mouseY.set(mousePos.y)
    }, [mousePos, mouseX, mouseY])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isWaitingForAI) return

        if (isDeleting) {
            if (displayedText.length > 0) {
                timer = setTimeout(() => {
                    setDisplayedText(prev => prev.slice(0, -1))
                }, 30)
            } else {
                setIsDeleting(false)
                fetchNewStory()
            }
        } else {
            if (displayedText.length < currentStory.length) {
                timer = setTimeout(() => {
                    setDisplayedText(currentStory.slice(0, displayedText.length + 1))
                }, typingSpeed + (Math.random() * 20))
            } else {
                timer = setTimeout(() => {
                    setIsDeleting(true)
                }, 4000)
            }
        }
        return () => clearTimeout(timer)
    }, [displayedText, isDeleting, currentStory, isWaitingForAI, fetchNewStory, typingSpeed])

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#0d0c1d] flex flex-col lg:flex-row overflow-hidden relative">

            {/* Background Elements */}
            <div className="starfield-container absolute inset-0 pointer-events-none z-0">
                <div className="stars-layer opacity-40" />
            </div>

            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {[
                    { src: '/page-01.png', top: '10%', left: '5%', delay: 0, duration: 8 },
                    { src: '/page-02.png', top: '20%', right: '10%', delay: 2, duration: 10 },
                    { src: '/page-03.png', bottom: '15%', left: '15%', delay: 4, duration: 9 },
                    { src: '/page-04.png', bottom: '25%', right: '5%', delay: 1, duration: 11 },
                ].map((item, i) => (
                    <motion.img
                        key={i}
                        src={item.src}
                        className="absolute w-32 md:w-48 opacity-0"
                        style={{
                            top: item.top, left: item.left, right: item.right, bottom: item.bottom
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0, 0.2, 0]
                        }}
                        transition={{
                            duration: item.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item.delay
                        }}
                    />
                ))}
            </div>

            {/* Left Side - Content */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 z-10 relative">
                <div className={`max-w-xl mx-auto lg:mx-0 ${inter.className}`}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight relative z-10"
                    >
                        Turn your <span className="text-gradient">imagination</span> into living stories
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-[#a1a1b5] mb-10 leading-relaxed font-light relative z-10"
                    >
                        Create worlds that teach, inspire, and entertain — where every story you imagine becomes an unforgettable learning journey
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 relative z-10"
                    >
                        <Link href="/create" className="px-8 py-4 bg-[#4e45e3] hover:bg-[#3d36b8] text-white rounded-full text-lg font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(78,69,227,0.3)] hover:shadow-[0_0_30px_rgba(78,69,227,0.5)]">
                            <Sparkles className="w-5 h-5" />
                            Begin Your Story
                        </Link>
                        <Link href="#features" className="px-8 py-4 border border-[#a1a1b5]/30 hover:bg-white/5 text-[#e0e0e0] rounded-full text-lg font-medium flex items-center justify-center transition-all">
                            How It Works
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Magic Scroll */}
            <div className="flex-1 flex items-center justify-center relative perspective-1000 py-12 lg:py-0 z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[700px] bg-[#6d7de8]/10 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d"
                    }}
                    whileTap={{ scale: 0.98 }}
                    // Added onClick handler for ink drops
                    onClick={handleScrollClick}
                    // REMOVED DRAG PROPS HERE, ADDED 'magic-scroll-zone' and 'cursor-none'
                    className="magic-scroll-zone cursor-none relative w-[500px] sm:w-[600px] lg:w-[600px] h-auto p-4 transition-all duration-200 ease-out"
                >
                    <img
                        src="/scroll.svg"
                        alt="Magic Scroll"
                        className="w-full h-full drop-shadow-2xl pointer-events-none"
                    />

                    {/* Render Ink Blots */}
                    <AnimatePresence>
                        {inkBlots.map((blot) => (
                            <motion.div
                                key={blot.id}
                                initial={{ opacity: 0.8, scale: 0 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{
                                    left: blot.x,
                                    top: blot.y,
                                    width: 30, // Base size of ink drop
                                    height: 30,
                                    position: 'absolute',
                                    borderRadius: '90%',
                                    backgroundColor: '#2D241E', // Ink color
                                    pointerEvents: 'none',
                                    filter: 'blur(2px)', // Makes it look like soaking ink
                                    mixBlendMode: 'multiply',
                                    zIndex: 50
                                }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Handwriting Overlay */}
                    <div className="absolute inset-0 flex items-start justify-start p-[20%] pt-[38%] pointer-events-none">
                        <div className={`${nanum.className} text-base sm:text-xl lg:text-3xl text-[#2D241E] mix-blend-multiply text-left w-full break-words whitespace-pre-wrap`}>
                            <motion.span
                                animate={{
                                    opacity: isDeleting || isWaitingForAI ? 0.5 : 0.9,
                                    filter: isDeleting ? "blur(2px)" : "blur(0px)"
                                }}
                                style={{
                                    textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
                                }}
                            >
                                {displayedText}
                            </motion.span>
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block w-[3px] h-[1em] bg-[#2D241E] ml-1 align-middle"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}