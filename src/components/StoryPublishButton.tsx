'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Share2, Globe, Check, Loader2, Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'

export default function StoryPublishButton({
    storyId,
    initialIsPublished,
    onStatusChange
}: {
    storyId: number,
    initialIsPublished: boolean,
    onStatusChange?: (isPublished: boolean) => void
}) {
    const [isPublished, setIsPublished] = useState(initialIsPublished)
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const { showToast } = useToast()
    const supabase = createClient()

    const handlePublish = async () => {
        if (loading) return
        setLoading(true)
        try {
            const { error } = await supabase
                .from('stories')
                .update({ is_published: true })
                .eq('id', storyId)

            if (error) throw error

            setIsPublished(true)
            onStatusChange?.(true)
            showToast('Story published to Open Shelf!', 'success')
        } catch (err) {
            console.error('Error publishing story:', err)
            showToast('Failed to publish story.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleUnpublish = async () => {
        if (loading) return
        setLoading(true)
        try {
            const { error } = await supabase
                .from('stories')
                .update({ is_published: false })
                .eq('id', storyId)

            if (error) throw error

            setIsPublished(false)
            onStatusChange?.(false)
            setShowModal(false)
            showToast('Story removed from public feed.', 'info')
        } catch (err) {
            console.error('Error unpublishing story:', err)
            showToast('Failed to unpublish story.', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (isPublished) {
        return (
            <>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 text-green-400 text-sm font-medium px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    title="Click to unpublish"
                >
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                </button>

                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Unpublish Story?"
                    type="danger"
                >
                    <div className="space-y-6">
                        <p className="text-gray-300">
                            Are you sure you want to make this story private? It will be removed from the Open Shelf feed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnpublish}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Processing...' : 'Unpublish'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </>
        )
    }

    return (
        <button
            onClick={handlePublish}
            disabled={loading}
            className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-white/10"
            title="Publish to Open Shelf"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            <span>Publish</span>
        </button>
    )
}
