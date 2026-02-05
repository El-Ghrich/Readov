'use client'

import { useState, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Rotate3D } from 'lucide-react'

// Custom hook for mouse position
function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            })
        }

        window.addEventListener('mousemove', updateMousePosition)

        return () => {
            window.removeEventListener('mousemove', updateMousePosition)
        }
    }, [])

    return mousePosition
}

export default function Hero3D() {
    const { x, y } = useMousePosition()

    // Springs for heavy, fluid movement
    const springConfig = { stiffness: 100, damping: 30 }
    const mouseX = useSpring(0, springConfig)
    const mouseY = useSpring(0, springConfig)

    useEffect(() => {
        // Normalize mouse position (-1 to 1) for parallax
        if (typeof window !== 'undefined') {
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            mouseX.set((x - centerX) / centerX)
            mouseY.set((y - centerY) / centerY)
        }
    }, [x, y, mouseX, mouseY])

    // Layer movement transforms - Strict parallax multipliers
    const moveStars = {
        x: useTransform(mouseX, [-1, 1], [5, -5]), // 0.01 ish
        y: useTransform(mouseY, [-1, 1], [5, -5])
    }

    const moveDeepPages = {
        x: useTransform(mouseX, [-1, 1], [15, -15]), // 0.03
        y: useTransform(mouseY, [-1, 1], [15, -15])
    }

    const moveHeadline = {
        x: useTransform(mouseX, [-1, 1], [25, -25]), // 0.05
        y: useTransform(mouseY, [-1, 1], [25, -25])
    }

    const moveForeground = {
        x: useTransform(mouseX, [-1, 1], [-60, 60]), // 0.12 (Heavy)
        y: useTransform(mouseY, [-1, 1], [-30, 30])
    }

    const images = [
        { src: '/page-01.png', top: '15%', left: '10%', z: 10, blur: true, delay: 0 },
        { src: '/page-02.png', top: '25%', right: '12%', z: 25, blur: false, delay: 1 },
        { src: '/page-02.png', top: '25%', right: '12%', z: 25, blur: false, delay: 1 },
        { src: '/page-03.png', bottom: '35%', left: '15%', z: 25, blur: false, delay: 2 },
        { src: '/page-03.png', Rotate3D: '40deg', bottom: '100%', left: '15%', z: 25, blur: false, delay: 2 },
        { src: '/page-04.png', bottom: '25%', right: '20%', z: 10, blur: true, delay: 3 },
    ]

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0d0c1d]">
            {/* Layer 0: Background Starfield */}
            <motion.div
                className="starfield-container"
                style={{ x: moveStars.x, y: moveStars.y }}
            >
                <div className="stars-layer" />
            </motion.div>

            {/* Layer 1: Midground (Floating Pages) */}
            <div className="absolute inset-0 pointer-events-none">
                {images.map((img, index) => (
                    <motion.div
                        key={index}
                        className={`absolute rounded-lg shadow-2xl opacity-80 ${img.blur ? 'backdrop-blur-[4px]' : ''}`}
                        style={{
                            zIndex: img.z,
                            top: img.top,
                            left: img.left,
                            right: img.right,
                            bottom: img.bottom,
                            x: img.z === 10 ? moveDeepPages.x : moveHeadline.x, // Z-25 moves slightly faster closer to headline
                            y: img.z === 10 ? moveDeepPages.y : moveHeadline.y
                        }}
                    >
                        <motion.img
                            src={img.src}
                            className="w-[150px] md:w-[250px] h-auto object-contain"
                            animate={{
                                y: [0, -15, 0],
                            }}
                            transition={{
                                duration: 6,
                                ease: "easeInOut",
                                repeat: Infinity,
                                delay: img.delay
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Layer 2: Text */}
            <motion.div
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                style={{ x: moveHeadline.x, y: moveHeadline.y }}
            >
                <h1 className="text-6xl md:text-9xl font-serif font-bold text-white text-center tracking-tight drop-shadow-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>
                    Your Story<br />Starts Here
                </h1>
            </motion.div>

            {/* Layer 3: Foreground (Mountains) */}
            <motion.div
                className="absolute bottom-[-5%] left-[-10%] right-[-10%] z-30"
                style={{
                    x: moveForeground.x,
                    y: moveForeground.y
                }}
            >
                <svg
                    viewBox="0 0 1440 320"
                    className="w-full h-[40vh] text-[#050505] fill-current drop-shadow-[0_-20px_40px_rgba(0,0,0,0.8)]"
                    preserveAspectRatio="none"
                >
                    <path fillOpacity="1" d="M0,128L48,154.7C96,181,192,235,288,245.3C384,256,480,224,576,213.3C672,203,768,213,864,224C960,235,1056,245,1152,234.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <path fillOpacity="0.8" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,160C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </motion.div>
        </div>
    )
}
