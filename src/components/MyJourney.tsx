"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Play, Trash2, AlertTriangle, X } from "lucide-react";
import StoryPublishButton from "./StoryPublishButton";
import { AnimatePresence, motion } from "framer-motion";
import { deleteStory } from "@/lib/actions";
import { useToast } from "@/context/ToastContext";

interface Story {
  id: number;
  user_id: string;
  title: string;
  genre: string;
  language: string;
  goal: string | null;
  lesson: string | null;
  is_completed: boolean;
  is_published: boolean;
  full_story: string | null;
  updated_at: string;
  story_parts: { content: string }[];
}

interface MyJourneyProps {
  initialStories: Story[];
}

export default function MyJourney({ initialStories }: MyJourneyProps) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<
    "all" | "completed" | "in_progress" | "published"
  >("all");
  const [stories, setStories] = useState<Story[]>(initialStories);

  // Derived stats
  const completedCount = stories.filter((s) => s.is_completed).length;
  const inProgressCount = stories.filter((s) => !s.is_completed).length;
  const publishedCount = stories.filter((s) => s.is_published).length;

  const filteredStories = stories.filter((story) => {
    if (filter === "completed") return story.is_completed;
    if (filter === "in_progress") return !story.is_completed;
    if (filter === "published") return story.is_published;
    return true; // 'all'
  });

  const getStatsCardClass = (active: boolean) =>
    `p-4 rounded-xl border transition-all cursor-pointer ${
      active
        ? "bg-card border-primary/50 shadow-lg shadow-purple-500/10 dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] dark:bg-white/10 ring-1 ring-primary/20"
        : "bg-card/50 border-border hover:bg-card hover:shadow-md dark:bg-white/5 dark:hover:bg-white/10"
    }`;

  // Callback to update story status locally when toggled in child component
  const handlePublishToggle = (storyId: number, isPublished: boolean) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, is_published: isPublished } : s,
      ),
    );
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (storyId: number) => {
    setDeleting(true);
    const res = await deleteStory(storyId);
    setDeleting(false);
    if (res.success) {
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      setConfirmDeleteId(null);
      showToast("Story deleted successfully.", "success");
    } else {
      alert(res.error || "Failed to delete story.");
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Stats */}
        <div className="bg-card dark:glass-dark rounded-2xl p-8 border border-border dark:border-white/5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              My Journey
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <button
                onClick={() => setFilter("all")}
                className={getStatsCardClass(filter === "all")}
              >
                <div className="text-3xl font-bold text-foreground text-left">
                  {stories.length}
                </div>
                <div className="text-sm text-muted-foreground text-left">
                  Total Stories
                </div>
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={getStatsCardClass(filter === "completed")}
              >
                <div className="text-3xl font-bold text-green-500 text-left">
                  {completedCount}
                </div>
                <div className="text-sm text-muted-foreground text-left">
                  Completed
                </div>
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={getStatsCardClass(filter === "in_progress")}
              >
                <div className="text-3xl font-bold text-purple-500 text-left">
                  {inProgressCount}
                </div>
                <div className="text-sm text-muted-foreground text-left">
                  In Progress
                </div>
              </button>
              <button
                onClick={() => setFilter("published")}
                className={getStatsCardClass(filter === "published")}
              >
                <div className="text-3xl font-bold text-blue-500 text-left">
                  {publishedCount}
                </div>
                <div className="text-sm text-muted-foreground text-left">
                  Published
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story) => {
              const preview = story.is_completed
                ? story.full_story ||
                  story.story_parts?.[0]?.content ||
                  "No content available."
                : story.story_parts?.[0]?.content || "No content available.";

              return (
                <motion.div
                  key={story.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-card dark:glass-dark rounded-xl border border-border dark:border-white/5 overflow-hidden hover:border-purple-500/30 transition-all hover:-translate-y-1 shadow-sm"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                          story.is_completed
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {story.is_completed ? "Completed" : "In Progress"}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-purple-500 transition-colors">
                      {story.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                        {story.genre}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                        {story.language}
                      </span>
                      {story.goal && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border line-clamp-1 max-w-[150px]">
                          Goal: {story.goal}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[60px]">
                      {preview}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border dark:border-white/5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(story.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 pt-2 flex items-center gap-3">
                    <Link
                      href={`/stories/${story.id}`}
                      className="flex-1 text-center py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {story.is_completed ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {story.is_completed ? "Read Story" : "Continue"}
                    </Link>
                    <StoryPublishButton
                      storyId={story.id}
                      initialIsPublished={story.is_published}
                      onStatusChange={(isPub) =>
                        handlePublishToggle(story.id, isPub)
                      }
                    />
                    {/* Delete Button */}
                    <button
                      onClick={() => setConfirmDeleteId(story.id)}
                      className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300 transition-all"
                      title="Delete story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {(!filteredStories || filteredStories.length === 0) && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                No stories found
              </h3>
              <p className="text-muted-foreground mb-6">
                {filter === "all"
                  ? "Start your first adventure today!"
                  : `No ${filter} stories yet.`}
              </p>
              {filter === "all" && (
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
                >
                  Create Story
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-foreground text-center mb-2">
                Delete Story?
              </h3>
              <p className="text-muted-foreground text-sm text-center mb-7 leading-relaxed">
                This will permanently delete this story and all its chapters.
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId!)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
