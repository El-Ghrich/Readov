"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Share2, Globe, Check, Loader2, Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export default function StoryPublishButton({
  storyId,
  initialIsPublished,
  onStatusChange,
  variant = "default",
}: {
  storyId: number;
  initialIsPublished: boolean;
  onStatusChange?: (isPublished: boolean) => void;
  variant?: "default" | "large";
}) {
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const handlePublish = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("stories")
        .update({ is_published: true })
        .eq("id", storyId);

      if (error) throw error;

      setIsPublished(true);
      onStatusChange?.(true);
      showToast("Story published to Open Shelf!", "success");
    } catch (err) {
      console.error("Error publishing story:", err);
      showToast("Failed to publish story.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("stories")
        .update({ is_published: false })
        .eq("id", storyId);

      if (error) throw error;

      setIsPublished(false);
      onStatusChange?.(false);
      setShowModal(false);
      showToast("Story removed from public feed.", "info");
    } catch (err) {
      console.error("Error unpublishing story:", err);
      showToast("Failed to unpublish story.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isPublished) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "flex items-center justify-center gap-2 font-medium transition-colors",
            variant === "default"
              ? "text-green-600 dark:text-green-400 text-sm px-3 py-2 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20"
              : "px-8 py-3 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full font-bold shadow-lg hover:bg-green-100 dark:hover:bg-green-500/20",
          )}
          title="Click to unpublish"
        >
          <Globe className={variant === "default" ? "w-4 h-4" : "w-5 h-5"} />
          <span>
            {variant === "default" ? "Public" : "Published to Open Shelf"}
          </span>
        </button>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Unpublish Story?"
          type="danger"
        >
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to make this story private? It will be
              removed from the Open Shelf feed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-white/10"
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
                {loading ? "Processing..." : "Unpublish"}
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <button
      onClick={handlePublish}
      disabled={loading}
      className={cn(
        "flex items-center justify-center gap-2 font-medium transition-all",
        variant === "default"
          ? "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-sm border border-transparent hover:border-gray-200 dark:hover:border-white/10"
          : "px-8 py-3 bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-full font-bold border border-gray-200 dark:border-white/10",
      )}
      title="Publish to Open Shelf"
    >
      {loading ? (
        <Loader2
          className={cn(
            "animate-spin",
            variant === "default" ? "w-4 h-4" : "w-5 h-5",
          )}
        />
      ) : (
        <Share2 className={variant === "default" ? "w-4 h-4" : "w-5 h-5"} />
      )}
      <span>Publish{variant === "large" ? " Story" : ""}</span>
    </button>
  );
}
