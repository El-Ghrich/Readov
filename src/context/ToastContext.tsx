'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className="pointer-events-auto min-w-[300px] bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                    toast.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                        'bg-blue-500/20 text-blue-400'}
                            `}>
                                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                                {toast.type === 'info' && <Info className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 text-sm font-medium text-white">
                                {toast.message}
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
