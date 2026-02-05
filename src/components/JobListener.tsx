'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface JobListenerProps {
    jobId: string
    onComplete?: (result: any) => void
}

export default function JobListener({ jobId, onComplete }: JobListenerProps) {
    const [status, setStatus] = useState<string>('pending')
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (!jobId) return

        // Initial fetch
        const fetchStatus = async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single()

            if (error) {
                console.error('Error fetching job:', error)
                setError(error.message)
            } else if (data) {
                setStatus(data.status)
                if (data.status === 'completed') {
                    if (onComplete) {
                        onComplete(data.result)
                    } else if (data.result?.story_id) {
                        router.push(`/stories/${data.result.story_id}`)
                    }
                } else if (data.status === 'failed') {
                    setError(data.error || 'Job failed')
                }
            }
        }

        fetchStatus()

        // Realtime subscription
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
                    console.log('Job update received:', payload)
                    const newStatus = payload.new.status
                    setStatus(newStatus)

                    if (newStatus === 'completed') {
                        if (onComplete) {
                            onComplete(payload.new.result)
                        } else if (payload.new.result?.story_id) {
                            // Default behavior: redirect to story
                            router.push(`/stories/${payload.new.result.story_id}`)
                        }
                    } else if (newStatus === 'failed') {
                        setError(payload.new.error || 'Job failed')
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [jobId, supabase, router, onComplete])

    if (status === 'completed') {
        return <div className="text-green-400 font-semibold">Completed! Redirecting...</div>
    }

    if (status === 'failed') {
        return <div className="text-red-400 font-semibold">Error: {error}</div>
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-xl glass-dark max-w-md w-full mx-auto">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
                <p className="text-lg font-medium text-gray-200">
                    Weaving your story...
                </p>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                    Status: {status}
                </p>
            </div>
        </div>
    )
}
