import { useState, useRef, useEffect } from "react";
import { CheckCircle, Trash2, Edit3, Save, X, Loader2 } from "lucide-react";
import { storyTitleSchema } from "@/lib/validations";
import { InputError } from "@/components/ui/InputError";

type StoryHeaderProps = {
  story: any;
  isEndingGenerated?: boolean;
  onDelete: () => void;
  onComplete: () => void;
  onEndStory: () => void;
  onTitleChange?: (newTitle: string) => Promise<void>;
};

export function StoryHeader({
  story,
  isEndingGenerated = false,
  onDelete,
  onComplete,
  onEndStory,
  onTitleChange,
}: StoryHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(story.title);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(story.title);
  }, [story.title]);

  const handleSave = async () => {
    if (editedTitle.trim() === "" || editedTitle === story.title) {
      setIsEditing(false);
      setError(null);
      return;
    }

    // Validate title using Zod schema
    const validationResult = storyTitleSchema.safeParse({ title: editedTitle });
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      if (onTitleChange) {
        await onTitleChange(editedTitle);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save title:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(story.title);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="mb-8 flex justify-between items-start">
      <div className="flex-1 mr-4">
        {isEditing ? (
          <div className="mb-2">
            <div className="flex items-center gap-2 group">
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => {
                  setEditedTitle(e.target.value);
                  if (error) setError(null); // Clear error on typing
                }}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className={`text-3xl font-bold bg-transparent border-b-2 outline-none w-full transition-colors ${
                  error
                    ? "border-red-500 text-red-500"
                    : "border-purple-500 text-gray-900 dark:text-white focus:border-purple-600"
                }`}
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Save Title"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <InputError message={error || undefined} />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2 group">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {story.title}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all"
              title="Edit Title"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded">
            {story.genre}
          </span>
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded">
            {story.language}
          </span>
          {story.language_level && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
              {story.language_level}
            </span>
          )}
          {story.is_completed && (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Completed
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!story.is_completed && !isEndingGenerated && (
          <button
            onClick={onEndStory}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-500/10 rounded-full text-sm font-medium transition-colors"
          >
            End Story
          </button>
        )}
        {!story.is_completed && (
          <button
            onClick={onComplete}
            className="p-2 hover:bg-gray-200 rounded-full dark:hover:bg-purple-900/25 text-green-600"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 hover:bg-gray-200 rounded-full dark:hover:bg-purple-900/25 text-red-600"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
