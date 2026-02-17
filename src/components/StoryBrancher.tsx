'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Split, ArrowRight, X } from 'lucide-react'

interface StoryBrancherProps {
    onBranch: (instruction?: string) => void
    choices?: string[]
    index?: number
}

export default function StoryBrancher({ onBranch, choices = [], index }: StoryBrancherProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [instruction, setInstruction] = useState('')

    const handleExpand = () => {
        setIsExpanded(true)
    }

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setIsExpanded(false)
        setInstruction('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!instruction.trim()) return
        onBranch(instruction)
        handleClose()
    }

    const handleChoiceClick = (choice: string) => {
        onBranch(choice)
        handleClose()
    }

    return (
        <div className="relative group w-full my-2">
            {/* The "Ghost" Divider / Hover Area */}
            {/* EXPANDED HOVER AREA: -left-16 to -right-16 ensures the mouse doesn't leave the trigger zone easily */}
            <div
                className={`
                    absolute -left-4 -right-4 md:-left-16 md:-right-16 -top-4 bottom-4 z-10 flex items-center justify-center cursor-pointer 
                    ${isExpanded ? 'pointer-events-none' : ''}
                `}
                onClick={handleExpand}
            >
                {/* The Visible Line on Hover - Triggered by parent group hover */}
                <div className={`w-full mx-4 md:mx-16 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-transform duration-500 ease-out 
                    ${isExpanded ? 'opacity-0' : 'scale-x-0 group-hover:scale-x-100 opacity-50 group-hover:opacity-100'}
                `} />

                {/* Floating Icon - Visible on group hover - Positioned relative to the line center */}
                <div className={`
                    absolute bg-white dark:bg-[#1e1e2e] shadow-lg border border-purple-500/20 p-2 rounded-full text-purple-600 dark:text-purple-400 
                    transition-all duration-300 delay-75 transform left-1/2 -translate-x-1/2
                    ${isExpanded ? 'opacity-0 scale-0' : 'scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100'}
                `}>
                    <Split className="w-4 h-4" />
                </div>
            </div>

            {/* The Expanded "Director's Panel" */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="relative bg-white dark:bg-[#151520] rounded-2xl border border-purple-500/20 shadow-xs py-6 px-4 md:px-8 m-1">

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                                        <Split className="w-5 h-5 text-purple-600" />
                                        Explore an Alternate Path
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Redirect the story from this point. This will create a new timeline.
                                    </p>
                                </div>

                                {/* Unused Choices Grid (if any) */}
                                {choices && choices.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {choices.map((choice, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleChoiceClick(choice)}
                                                className="text-left p-3 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all group/choice"
                                            >
                                                <span className="font-medium text-gray-700 dark:text-gray-300 line-clamp-2 group-hover/choice:text-purple-700 dark:group-hover/choice:text-purple-300">
                                                    "{choice}"
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Input Area */}
                                <form onSubmit={handleSubmit} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 transition duration-500"></div>
                                    <div className="relative flex flex-col md:flex-row gap-2 bg-white dark:bg-[#1e1e2e] p-1 rounded-xl">
                                        <input
                                            value={instruction}
                                            onChange={(e) => setInstruction(e.target.value)}
                                            placeholder="Write your own direction..."
                                            className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={!instruction.trim()}
                                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                        >
                                            Branch <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
