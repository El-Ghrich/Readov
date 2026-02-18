// components/story/StoryPartItem.tsx
import {
  User,
  Bot,
  AlertTriangle,
  GitFork,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import StoryChoices from "@/components/StoryChoices"; // Ensure this exists
import { useState } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a standard cn utility, or use template literals

type StoryPartProps = {
  part: any;
  isLast: boolean;
  isGenerating: boolean;
  onChoiceSelect: (text: string) => void;
  onBranch: () => void;
};

export function StoryPartItem({
  part,
  isLast,
  isGenerating,
  onChoiceSelect,
  onBranch,
}: StoryPartProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const isSelected = (choice: string) => {
    return part.selected_choice === choice || part.user_custom_input === choice;
  };
  return (
    <div className="space-y-6 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Tutor Feedback */}
      {part.correction && (
        <div className="mx-auto max-w-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-3 rounded-lg flex items-start gap-3 text-sm text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block mb-1">Tutor Feedback:</span>
            {part.correction}
          </div>
        </div>
      )}

      {/* 2. Main Story Bubble */}
      <div className="bg-white dark:bg-transparent dark:glass-dark p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
            {part.is_user_input ? (
              <User className="w-3 h-3 text-purple-600" />
            ) : (
              <Bot className="w-3 h-3 text-blue-600" />
            )}
            Part {part.part_number}
          </div>
          <button
            onClick={onBranch}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-purple-100 text-purple-600 rounded flex items-center gap-1 text-xs font-bold"
          >
            <GitFork className="w-3.5 h-3.5" /> Branch
          </button>
        </div>

        {/* Story Text */}
        <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-800 dark:text-gray-200">
          {part.content}
        </div>

        {/* -------------------------------------------------- */}
        {/* SECTION 3: The Director's Chair (Past Options)     */}
        {/* -------------------------------------------------- */}
        {!isLast &&
          part.suggested_choices &&
          part.suggested_choices.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs uppercase tracking-wider">
                    Decision Log
                  </span>
                  {/* Show what they picked in the collapsed view */}
                  {!isHistoryOpen && (
                    <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-xs truncate max-w-[200px]">
                      {part.selected_choice ||
                        part.user_custom_input ||
                        "Custom Input"}
                    </span>
                  )}
                </div>
                {isHistoryOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Collapsible Content */}
              {isHistoryOpen && (
                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {part.suggested_choices.map((choice: string, idx: number) => {
                    const active = isSelected(choice);
                    return (
                      <div
                        key={idx}
                        className={`
                        p-3 rounded-lg text-sm border flex items-center justify-between
                        ${
                          active
                            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                            : "bg-gray-50 border-gray-100 text-gray-500 dark:bg-white/5 dark:border-white/5 dark:text-gray-500"
                        }
                      `}
                      >
                        <span>{choice}</span>
                        {active && <Check className="w-4 h-4" />}
                      </div>
                    );
                  })}
                  {/* Handle case where they typed something custom that wasn't an option */}
                  {!part.suggested_choices.includes(part.selected_choice) &&
                    part.selected_choice && (
                      <div className="p-3 rounded-lg text-sm border bg-purple-50 border-purple-200 text-purple-800 flex items-center justify-between">
                        <span>Custom: {part.selected_choice}</span>
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
      </div>

      {/* -------------------------------------------------- */}
      {/* SECTION 4: Active Choices (Only if Last Part)      */}
      {/* -------------------------------------------------- */}
      {isLast &&
        part.suggested_choices &&
        part.suggested_choices.length > 0 && (
          <div className="mt-4">
            <StoryChoices
              choices={part.suggested_choices}
              onSelect={onChoiceSelect}
              isLoading={isGenerating}
              disabled={isGenerating}
            />
          </div>
        )}
    </div>
  );
}
