import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyJourney from '@/components/MyJourney'

export default async function StoriesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: stories, error } = await supabase
        .from('stories')
        .select(`
            *,
            story_parts (
                content
            )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching stories:', error)
        return <div className="p-8 text-center text-red-400">Error loading stories.</div>
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <MyJourney initialStories={stories || []} />
        </div>
    )
}
