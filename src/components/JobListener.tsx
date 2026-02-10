'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface JobListenerProps {
    jobId: string
    onComplete?: (result: any) => void
}

export default function JobListener({ jobId, onComplete }: JobListenerProps) {
    const [status, setStatus] = useState<string>('pending')
    const [error, setError] = useState<string | null>(null)
    const [isTakingLong, setIsTakingLong] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const isCompletedRef = useRef(false)


    useEffect(() => {
        if (!jobId) return

        let pollingInterval: NodeJS.Timeout

        // 1. Define the check function
        const checkJob = async () => {
            if (isCompletedRef.current) return

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single()

            if (error) {
                console.error('Error fetching job:', error)
                // Don't set error state immediately on network blips, just retry
            } else if (data) {
                if (data.status !== status) setStatus(data.status)

                if (data.status === 'completed' && !isCompletedRef.current) {
                    isCompletedRef.current = true
                    handleCompletion(data.result)
                } else if (data.status === 'failed') {
                    isCompletedRef.current = true
                    setError(data.error || 'Job failed')
                }
            }
        }

        const handleCompletion = (result: any) => {
            // Clear interval immediately
            clearInterval(pollingInterval)

            if (onComplete) {
                onComplete(result)
            } else if (result?.story_id) {
                router.push(`/stories/${result.story_id}`)
            }
        }

        // 2. Initial Check
        checkJob()

        // 3. Set up Polling (Backup Safety Net) - Checks every 4 seconds
        pollingInterval = setInterval(checkJob, 4000)

        // 4. Set up Realtime (Speed Layer)
        const channel = supabase
            .channel(`job-${jobId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'jobs',
                    filter: `id=eq.${jobId}`,
                },
                (payload: any) => {
                    const newStatus = payload.new.status
                    setStatus(newStatus)

                    if (newStatus === 'completed' && !isCompletedRef.current) {
                        isCompletedRef.current = true
                        handleCompletion(payload.new.result)
                    } else if (newStatus === 'failed') {
                        setError(payload.new.error || 'Job failed')
                    }
                }
            )
            .subscribe()

        // 5. Timeout Warning (60s)
        const timeoutTimer = setTimeout(() => {
            if (!isCompletedRef.current) setIsTakingLong(true)
        }, 60000)

        return () => {
            clearInterval(pollingInterval)
            clearTimeout(timeoutTimer)
            supabase.removeChannel(channel)
        }
    }, [jobId, supabase, router, onComplete]) // Removed 'status' to prevent re-subscribing loop

    if (status === 'completed') {
        return <div className="text-green-400 font-semibold animate-pulse">Success! Redirecting...</div>
    }

    if (status === 'failed') {
        return <div className="text-red-400 font-semibold">Error: {error}</div>
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-xl bg-white/10 dark:bg-[#1e1e2e]/50 backdrop-blur-md border border-white/10 max-w-md w-full mx-auto shadow-2xl">
            {isTakingLong ? (
                <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-amber-400 font-medium">This is taking longer than usual...</p>
                    <p className="text-sm text-gray-400">The AI might be busy. We are still checking...</p>
                </div>
            ) : (
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    {/* Optional: Add a subtle pulse effect behind the spinner */}
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                </div>
            )}

            <div className="text-center">
                <p className="text-lg font-medium text-black dark:text-white">
                    Weaving your story...
                </p>
                <p className="text-xs text-black dark:text-gray-400 mt-2 font-mono uppercase tracking-wider">
                    Status: {status === 'pending' ? 'QUEUEING' : 'GENERATING'}
                </p>
            </div>
        </div>
    )
}