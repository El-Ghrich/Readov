"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Heart, BookOpen, Filter, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublishedStories } from "@/lib/actions";

// Mock genres for filter - should match DB or be dynamic
const GENRES = [
  "All",
  "Fantasy",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Horror",
  "Adventure",
];

interface Story {
  id: string;
  title: string;
  genre: string;
  created_at: string;
  is_completed: boolean;
  likes: number;
  liked_by_user?: boolean;
  content_preview?: string;
  language?: string;
}

export default function FeedPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const supabase = createClient();
  const router = useRouter();

  // Auth Check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [router, supabase]);

  const fetchStories = useCallback(
    async (isLoadMore = false) => {
      const nextPage = isLoadMore ? page + 1 : 1;
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await getPublishedStories({
        genre: selectedGenre,
        page: nextPage,
        pageSize: ITEMS_PER_PAGE,
      });

      if (res.success) {
        const { list, hasMore: _hasMore } = res.data;
        if (isLoadMore) {
          setStories((prev) => [...prev, ...list]);
          setPage(nextPage);
        } else {
          setStories(list);
          setPage(1);
        }
        setHasMore(_hasMore);
      } else {
        console.error(res.error);
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [page, selectedGenre, stories.length],
  );

  // Initial Fetch & Genre Filter
  useEffect(() => {
    fetchStories();
  }, [selectedGenre]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    fetchStories(true);
  };

  const toggleLike = (id: string) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              liked_by_user: !s.liked_by_user,
              likes: s.liked_by_user ? s.likes - 1 : s.likes + 1,
            }
          : s,
      ),
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-gray-50 via-white to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Open Shelf
          </h1>

          {/* Genre Slider / Filter */}
          <div className="flex pb-2 md:pb-0 gap-2 max-w-full no-scrollbar">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? "bg-blue-600 text-white shadow-[0px_0px_21px_-4px_#1c6beb] dark:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                    : "bg-white/5 text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white "
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
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="group relative bg-white/60 dark:bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl-2 hover:border-purple-300 dark:hover:border-purple-500/30 dark:hover:shadow-purple-500/20"
                >
                  {/* Image Placeholder based on genre */}
                  <div className="h-48 w-full relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-linear-to-t from-purple-500/40 via-black/20 to-transparent z-10" />
                    <img
                      src={getGenreImage(story.genre)}
                      alt={story.genre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <h3 className="text-xl font-bold text-white truncate drop-shadow-md">
                        {story.title}
                      </h3>
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
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                          {story.genre}
                        </span>
                        <button
                          onClick={() => toggleLike(story.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${story.liked_by_user ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
                        >
                          <Heart
                            className={`w-4 h-4 ${story.liked_by_user ? "fill-current" : ""}`}
                          />
                          <span>{story.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md"
                >
                  {loadingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <>
                      <span>Load More Stories</span>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMore && stories.length > 0 && (
              <div className="text-center mt-16 text-gray-500 text-sm">
                No more stories to explore. Why not{" "}
                <Link href="/create" className="text-blue-400 hover:underline">
                  create one?
                </Link>
              </div>
            )}

            {stories.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-xl mb-4">No stories found in this genre.</p>
                <button
                  onClick={() => setSelectedGenre("All")}
                  className="text-blue-400 hover:underline"
                >
                  View all stories
                </button>
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
    fantasy: "/img/fantasy.jpg",
    mystery: "/img/mystery.jpg",
    romance: "/img/romance.jpg",
    "sci-fi": "/img/sci-fi.jpg",
    science_fiction: "/img/sci-fi.jpg",
    horror: "/img/horror.jpg",
    adventure: "/img/adventure.jpg",
    custom: "/img/custom.jpg",
    general: "/img/general.png",
  };
  return map[genre?.toLowerCase()] || "/img/Mockup_img.png";
}
