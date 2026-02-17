'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Heart, BookOpen, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock genres for filter - should match DB or be dynamic
const GENRES = ['All', 'Fantasy', 'Mystery', 'Romance', 'Sci-Fi', 'Horror', 'Adventure'];

interface Story {
    id: string;
    title: string;
    genre: string;
    created_at: string;
    is_completed: boolean;
    likes: number;
    liked_by_user?: boolean;
    content_preview?: string;
}

export default function FeedPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [filteredStories, setFilteredStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const ITEMS_PER_PAGE = 9;

    const supabase = createClient();
    const router = useRouter();

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router, supabase]);

    // Initial Fetch
    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            try {
                // In a real app, we would paginate on the server.
                // For now, let's try to fetch completed stories.
                // If "likes" isn't a column, we might simply fetch stories.
                // We really need to know the schema. assuming 'stories' table.

                // Let's assume we want all completed stories for the feed.
                const { data, error } = await supabase
                    .from('stories')
                    .select(`
            *,
            story_parts(content)
          `)
                    .eq('is_published', true)
                    .order('created_at', { ascending: false })
                    .limit(50); // Fetch first 50 for now to keep it simple locally

                if (error) throw error;
                console.log(data)
                // Process data to mimic "Feed" object structure
                const formattedStories: Story[] = data.map((s: any) => ({
                    ...s,
                    // Simple preview from first part if available
                    content_preview: s.full_story ? s.full_story : s.story_parts?.[0]?.content?.substring(0, 150) + '...' || 'No preview available.',
                    likes: 0, // Placeholder
                    liked_by_user: false // Placeholder
                }));

                setStories(formattedStories);
                setFilteredStories(formattedStories);
            } catch (err) {
                console.error('Error fetching feed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [supabase]);

    // Filter Logic
    useEffect(() => {
        if (selectedGenre === 'All') {
            setFilteredStories(stories);
        } else {
            setFilteredStories(stories.filter(s => s.genre?.toLowerCase() === selectedGenre.toLowerCase()));
        }
    }, [selectedGenre, stories]);

    // Infinite Scroll Handler (Mock implementation for now)
    const handleLoadMore = () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);

        // Simulate network delay
        setTimeout(() => {
            // In reality, fetch next page from Supabase here
            setLoadingMore(false);
            setHasMore(false); // No more mock data for this example
        }, 1000);
    };

    const toggleLike = (id: string) => {
        // Optimistic update
        setStories(prev => prev.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    liked_by_user: !s.liked_by_user,
                    likes: s.liked_by_user ? s.likes - 1 : s.likes + 1
                };
            }
            return s;
        }));
        // TODO: Send update to backend DB
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Open Shelf</h1>

                    {/* Genre Slider / Filter */}
                    <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 max-w-full no-scrollbar">
                        {GENRES.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedGenre === genre
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredStories.map((story) => (
                                <div key={story.id} className="group relative glass-dark rounded-2xl overflow-hidden border border-white/5 transition-all hover:-translate-y-2 hover:border-blue-500/30">
                                    {/* Image Placeholder based on genre */}
                                    {/* Image Placeholder based on genre */}
                                    <div className="h-48 w-full relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                        <img
                                            src={getGenreImage(story.genre)}
                                            alt={story.genre}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                            <h3 className="text-xl font-bold text-white truncate drop-shadow-md">{story.title}</h3>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 min-h-[60px]">
                                            {story.content_preview}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={`/stories/${story.id}?mode=read`}
                                                className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                Read more <span className="text-lg">→</span>
                                            </Link>

                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{story.genre}</span>
                                                <button
                                                    onClick={() => toggleLike(story.id)}
                                                    className={`flex items-center gap-1 text-sm transition-colors ${story.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                                                >
                                                    <Heart className={`w-4 h-4 ${story.liked_by_user ? 'fill-current' : ''}`} />
                                                    <span>{story.likes}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!hasMore && filteredStories.length > 0 && (
                            <div className="text-center mt-16 text-gray-500 text-sm">
                                No more stories to explore. Why not <Link href="/create" className="text-blue-400 hover:underline">create one?</Link>
                            </div>
                        )}

                        {filteredStories.length === 0 && (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-xl mb-4">No stories found in this genre.</p>
                                <button onClick={() => setSelectedGenre('All')} className="text-blue-400 hover:underline">View all stories</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function getGenreImage(genre: string) {
    const map: Record<string, string> = {
        'fantasy': '/img/fantasy.jpg',
        'mystery': '/img/mystery.jpg',
        'romance': '/img/romance.jpg',
        'sci-fi': '/img/sci-fi.jpg',
        'horror': '/img/horror.jpg',
        'adventure': '/img/adventure.jpg',
        'custom': '/img/custom.jpg'
    };
    return map[genre?.toLowerCase()] || '/img/Mockup_img.png';
}
