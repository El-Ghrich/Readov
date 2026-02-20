"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/context/SidebarContext";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

// Import Sub-Components
import { StoryHeader } from "@/components/story/StoryHeader";
import { StoryPartItem } from "@/components/story/StoryPartItem";
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars";

// --- Types ---

export interface NarrativeContext {
  characters: Character[];
  current_location: string;
  key_items: string[];
  plot_points: string[];
}

export interface Character {
  name: string;
  role: string;
  status: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  target_language: string;
  language_level: string;
  narrative_context: NarrativeContext;
  is_completed: boolean;
  is_published: boolean;
  full_story?: string;
  created_at: string;
  updated_at: string;
}

export interface StoryPart {
  id: string;
  story_id: string;
  part_number: number;
  content: string;
  choices?: string[];
  selected_choice_index?: number | null; // Added
  user_custom_input?: string;
  correction?: string;
  vocabulary_highlight?: Record<string, string>;
  is_user_input: boolean;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  user_id: string;
  story_id?: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: "generate_start" | "continue_story";
  params: any;
  result?: any;
  error?: string;
  created_at: string;
}

// --- Component ---

export default function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Unwrap Params & Hooks
  const { id: storyId } = use(params);
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 2. State Management
  const [story, setStory] = useState<Story | null>(null);
  const [parts, setParts] = useState<StoryPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showEndStoryModal, setShowEndStoryModal] = useState(false);

  // The Brain
  const [narrativeContext, setNarrativeContext] = useState<
    NarrativeContext | {}
  >({});

  // 3. Initial Fetch
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          // Optional: handle unauthenticated state
          return;
        }

        // A. Fetch Story Metadata
        const { data: storyData, error: storyError } = await supabase
          .from("stories")
          .select("*")
          .eq("id", storyId)
          .single();

        if (storyError) throw storyError;

        // Redirect if already finished
        if (storyData.is_completed) {
          router.replace(`/stories/${storyId}/read`);
          return;
        }

        setStory(storyData);
        if (storyData.narrative_context) {
          setNarrativeContext(storyData.narrative_context);
        }

        // B. Fetch Story Parts
        const { data: partsData, error: partsError } = await supabase
          .from("story_parts")
          .select("*")
          .eq("story_id", storyId)
          .order("part_number", { ascending: true });

        if (partsError) throw partsError;
        setParts(partsData || []);
      } catch (err) {
        console.error("Failed to load story:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [storyId, supabase, router]);

  // 4. Realtime Subscriptions
  useEffect(() => {
    // GUARD CLAUSE: Wait for story to load before setting up subscriptions
    // This prevents the "Cannot read properties of null (reading 'user_id')" error
    if (!story) return;

    // A. Subscribe to JOB updates (Status)
    const jobChannel = supabase
      .channel(`jobs-filter-${storyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `user_id=eq.${story.user_id}`,
        },
        (payload) => {
          const job = payload.new as GenerationJob;
          if (job.params?.story_id !== storyId) return;

          if (job.status === "failed") {
            setGenerating(false);
            alert(`Generation failed: ${job.error || "Unknown error"}`);
          }
        },
      )
      .subscribe();

    // B. Subscribe to STORY PART inserts (Content) AND updates
    const contentChannel = supabase
      .channel(`parts-filter-${storyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "story_parts",
          filter: `story_id=eq.${storyId}`,
        },
        (payload) => {
          const newPart = payload.new as StoryPart;
          setParts((prev) => {
            // Prevent duplicates in React Strict Mode
            if (prev.find((p) => p.id === newPart.id)) return prev;
            return [...prev, newPart];
          });
          setGenerating(false);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "story_parts",
          filter: `story_id=eq.${storyId}`,
        },
        (payload) => {
          const updatedPart = payload.new as StoryPart;
          setParts((prev) =>
            prev.map((p) => (p.id === updatedPart.id ? updatedPart : p)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(contentChannel);
    };
  }, [storyId, supabase, story]); // Added 'story' dependency

  // 5. Scroll to Bottom
  useEffect(() => {
    if (parts.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [parts, generating]);

  // 6. Action Handlers

  const handleTurn = async (
    text: string,
    type: "custom" | "ai" = "custom",
    index?: number,
  ) => {
    if (generating) return;
    setGenerating(true);
    setCustomInput("");

    // --- OPTIMISTIC UPDATE ---
    // Update the local state immediately to show the selection
    setParts((prev) => {
      if (prev.length === 0) return prev;
      const lastPart = prev[prev.length - 1];
      const updatedLastPart = {
        ...lastPart,
        selected_choice_index: index ?? null,
        user_custom_input: type === "custom" ? text : undefined,
      };
      return [...prev.slice(0, -1), updatedLastPart];
    });
    // -------------------------

    // Optimistic Scroll
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Simple context summary (last 20k chars)
      const sortedParts = [...parts].sort(
        (a, b) => a.part_number - b.part_number,
      );
      const fullText = sortedParts.map((p) => p.content).join("\n\n");
      const contextSummary =
        fullText.length > 20000 ? "..." + fullText.slice(-20000) : fullText;

      const { error } = await supabase.from("jobs").insert({
        user_id: user?.id,
        type: "continue_story",
        params: {
          story_id: storyId,
          type: type,
          user_direction: type === "custom" ? text : null,
          selected_choice_index: index, // Added
          context_summary: contextSummary,
          narrative_context: narrativeContext,
        },
        status: "pending",
      });

      if (error) throw error;
    } catch (err) {
      console.error("Failed to queue turn:", err);
      // Revert optimistic update if failed (basic implementation)
      // Ideally we'd rollback to previous state, but we'll just alert for now.
      alert("Something went wrong. Please try again.");
      setGenerating(false);
      if (type === "custom") setCustomInput(text);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await supabase.from("stories").delete().eq("id", storyId);
      router.push("/stories");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete story.");
    }
  };

  const handleComplete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to save.");
        return;
      }

      const sortedParts = [...parts].sort(
        (a, b) => a.part_number - b.part_number,
      );
      const fullStoryContent = sortedParts.map((p) => p.content).join("\n\n");

      const { error } = await supabase
        .from("stories")
        .update({
          is_completed: true,
          full_story: fullStoryContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", storyId);

      if (error) throw error;

      router.push(`/stories/${storyId}/read`);
    } catch (err) {
      console.error("Completion failed:", err);
      alert("Failed to save story.");
    }
  };

  // 7. Render
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-purple-600">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Story not found
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 md:px-8 max-w-4xl mx-auto">
      {/* A. Header */}
      <StoryHeader
        story={story}
        onDelete={handleDelete}
        onComplete={handleComplete}
        onEndStory={() => setShowEndStoryModal(true)}
      />

      {/* B. Content Stream */}
      <div className="space-y-8">
        {parts.map((part, index) => (
          <StoryPartItem
            key={part.id}
            part={part}
            // Only show choices if it's the LAST part
            isLast={index === parts.length - 1}
            isGenerating={generating}
            onChoiceSelect={(text, type, index) =>
              handleTurn(text, type, index)
            }
            onBranch={() => console.log("Branch", part.id)}
          />
        ))}

        {/* C. Loading Skeleton */}
        {generating && (
          <div className="animate-pulse flex gap-4 p-6 bg-white/50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {/* D. Finish Button (Conditional) */}
        {!story.is_completed && parts.length > 5 && !generating && (
          <div className="flex justify-center py-6 animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
            >
              <CheckCircle className="w-5 h-5" /> Save & Finish Story
            </button>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* F. End Story Modal */}
      {showEndStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1e1e2e] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Wrap it up?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This will generate a conclusion for your story without choices.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowEndStoryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowEndStoryModal(false);
                    await handleTurn(
                      "Write a creative and satisfying conclusion to this story. Tie up all loose ends. Do not provide any choices.",
                      "custom",
                    );
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg"
                >
                  Generate Ending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <GravityStarsBackground
        className="absolute z-0 inset-0 flex items-center justify-center rounded-xl"
        starsCount={100}
        glowIntensity={20}
        glowAnimation={"ease"}
        gravityStrength={75}
        color="#c5b0f7"
      /> */}
    </div>
  );
}
