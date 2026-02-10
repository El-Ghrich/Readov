'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, PenTool, Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import SpotlightCard from './SpotlightCard'

interface StoryChoicesProps {
    choices: string[]
    onSelect: (choice: string, type: 'ai' | 'custom') => void
    isLoading: boolean
    showInput?: boolean
    disabled?: boolean
}

export default function StoryChoices({ choices, onSelect, isLoading, showInput = true, disabled = false }: StoryChoicesProps) {
    const [customInput, setCustomInput] = useState('')
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    // Auto-open if it's the active choice block
    useEffect(() => {
        if (!disabled && choices.length > 0) {
            setIsOpen(true)
        } else {
            setIsOpen(false) // Collapse historic ones by default
        }
    }, [disabled, choices.length])

    const handleChoiceClick = (choice: string, index: number) => {
        if (isLoading || disabled) return
        setSelectedChoiceIndex(index)
        onSelect(choice, 'ai')
    }

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading || disabled || !customInput.trim()) return
        onSelect(customInput, 'custom')
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 relative">

            {/* Floating Toggle Button */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full shadow-lg transition-all duration-300 z-10 font-medium text-sm group ${disabled
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-default'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105'
                        }`}
                >
                    <Sparkles className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-yellow-300'}`} />
                    {disabled ? "History" : "Director's Chair"}
                    {isOpen ? <ChevronDown className="w-4 h-4 ml-1 opacity-70" /> : <ChevronUp className="w-4 h-4 ml-1 opacity-70" />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: 20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="space-y-8 p-1"
                    >
                        {!disabled && (
                            <div className="text-center space-y-2 pt-2">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Choose how the story continues...</p>
                            </div>
                        )}

                        {/* AI Generated Options */}
                        {choices && choices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
                                {choices.map((choice, index) => {
                                    // Dynamic Theme Logic
                                    const themes = [
                                        { // Left - Red
                                            badge: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10',
                                            spotlight: 'rgba(239, 68, 68, 0.25)',
                                            active: '!border-red-500 !bg-red-500/10',
                                            hover: 'hover:!border-red-500/50',
                                            shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                        },
                                        { // Middle - Yellow
                                            badge: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10',
                                            spotlight: 'rgba(245, 158, 11, 0.25)',
                                            active: '!border-amber-500 !bg-amber-500/10',
                                            hover: 'hover:!border-amber-500/50',
                                            shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                                        },
                                        { // Right - Blue/Purple
                                            badge: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10',
                                            spotlight: 'rgba(6, 182, 212, 0.25)',
                                            active: '!border-cyan-500 !bg-cyan-500/10',
                                            hover: 'hover:!border-cyan-500/50',
                                            shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                                        }
                                    ]
                                    const theme = themes[index % 3]

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleChoiceClick(choice, index)}
                                            className={`h-full transition-all duration-300 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.03] hover:z-10'}`}
                                        >
                                            <SpotlightCard
                                                className={`
                                                    h-full flex flex-col justify-between p-6 rounded-3xl text-left backdrop-blur-md group shadow-sm transition-colors duration-300
                                                    ${disabled
                                                        ? '!bg-gray-100 dark:!bg-white/5 !border-gray-200 dark:!border-white/5'
                                                        : isLoading && selectedChoiceIndex === index
                                                            ? `${theme.active} ${theme.shadow}`
                                                            : `!bg-white/80 dark:!bg-[#1e1e2e]/40 !border-gray-200 dark:!border-white/5 hover:!bg-white dark:hover:!bg-[#1e1e2e]/80 ${theme.hover} hover:shadow-xl`
                                                    }
                                                `}
                                                spotlightColor={disabled ? 'transparent' : theme.spotlight}
                                            >
                                                <div className="mb-4 relative z-10">
                                                    <span className={`text-xs font-mono uppercase tracking-widest px-2 py-1 rounded inline-block ${disabled
                                                            ? 'bg-gray-200 dark:bg-white/10 text-gray-500'
                                                            : theme.badge
                                                        }`}>
                                                        Option {index + 1}
                                                    </span>
                                                </div>
                                                <p className={`font-medium leading-relaxed relative z-10 transition-colors ${disabled
                                                        ? 'text-gray-500 dark:text-gray-500'
                                                        : 'text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white'
                                                    }`}>
                                                    {choice}
                                                </p>

                                                {isLoading && selectedChoiceIndex === index && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/20 backdrop-blur-[1px] rounded-3xl z-20">
                                                        <Loader2 className="w-6 h-6 text-gray-600 dark:text-white animate-spin" />
                                                    </div>
                                                )}
                                            </SpotlightCard>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            !disabled && (
                                <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-white/5">
                                    <p className="text-gray-500 dark:text-gray-400 italic">
                                        No AI options available for this part.
                                    </p>
                                </div>
                            )
                        )}

                        {showInput && !disabled && (
                            <>
                                {/* OR Divider */}
                                <div className="relative flex items-center justify-center py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                        <span className="bg-gray-50 dark:bg-[#0a0a0a] px-4 text-gray-500 font-mono">Or write your own</span>
                                    </div>
                                </div>

                                {/* Custom Input */}
                                <form onSubmit={handleCustomSubmit} className="relative group pb-4">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <div className="relative flex gap-2">
                                        <input
                                            type="text"
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            placeholder="Describe what happens next..."
                                            disabled={isLoading}
                                            className="w-full px-6 py-4 bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !customInput.trim()}
                                            className="absolute right-2 top-2 bottom-2 px-6 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            Next <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
