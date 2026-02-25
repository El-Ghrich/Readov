// components/story/StoryPartItem.tsx
import {
  User,
  Bot,
  Lightbulb,
  GitFork,
  ChevronDown,
  ChevronUp,
  Check,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import StoryChoices from "@/components/StoryChoices";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { saveVocabulary } from "@/app/actions/vocabulary";

function VocabularyPill({
  word,
  translation,
  language,
  story_id,
  context_sentence,
}: {
  word: string;
  translation: string;
  language: string;
  story_id: string;
  context_sentence?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    const parsedStoryId = parseInt(story_id);
    const res = await saveVocabulary({
      word,
      translation,
      language,
      story_id: isNaN(parsedStoryId) ? undefined : parsedStoryId,
      context_sentence,
    });
    setSaving(false);
    if (res?.success) setSaved(true);
  };

  return (
    <div className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-white/10 rounded-full text-sm shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {word}
      </span>
      <span className="text-gray-400 dark:text-gray-500 mx-1">-</span>
      <span className="text-gray-600 dark:text-gray-300">{translation}</span>

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={cn(
          "ml-1 p-1 rounded-full transition-colors",
          saved
            ? "text-green-500 bg-green-50 dark:bg-green-500/20"
            : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-600/20",
          saving && "opacity-50 cursor-not-allowed",
        )}
        title={saved ? "Saved to Grimoire" : "Save to Grimoire"}
      >
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <PlusCircle className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

type StoryPartProps = {
  part: any;
  isLast: boolean;
  isGenerating: boolean;
  onChoiceSelect: (text: string, type: "ai" | "custom", index?: number) => void;
  onBranch: () => void;
  language: string;
};

export function StoryPartItem({
  part,
  isLast,
  isGenerating,
  onChoiceSelect,
  onBranch,
  language,
}: StoryPartProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);

  const isSelected = (choice: string, index: number) => {
    console.log(part.selected_choice_index);
    if (typeof part.selected_choice_index === "number") {
      return part.selected_choice_index === index;
    }
    // Fallback? If no index, maybe it was a custom input equal to the choice text
    return part.user_custom_input === choice;
  };
  return (
    <div className="space-y-6 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Tutor Feedback */}
      {part.correction && (
        <div className="mx-auto max-w-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-xl flex items-start gap-4 text-sm text-indigo-900 dark:text-indigo-200 shadow-sm transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="font-bold flex items-center gap-1.5 mb-1 text-indigo-700 dark:text-indigo-300 tracking-wide uppercase text-[11px]">
              Tutor Tip
            </span>
            <p className="leading-relaxed opacity-95">{part.correction}</p>
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

        {/* Vocabulary Highlight */}
        {part.vocabulary_highlight &&
          Object.keys(part.vocabulary_highlight).length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/20 transition-colors">
              <button
                onClick={() => setIsVocabOpen(!isVocabOpen)}
                className="w-full flex items-center justify-between text-left group"
              >
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                  <BookOpen className="w-4 h-4" /> Story Vocabulary
                </h4>
                {isVocabOpen ? (
                  <ChevronUp className="w-4 h-4 text-purple-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-purple-500" />
                )}
              </button>

              {isVocabOpen && (
                <div className="flex flex-wrap gap-2 mt-4 animate-in slide-in-from-top-2 duration-200">
                  {Object.entries(part.vocabulary_highlight).map(
                    ([word, definition]) => {
                      // Split by punctuation keeping the punctuation.
                      // Using a simple regex to match sentences safely including the first one.
                      const sentences = part.content.match(
                        /[^.!?]+[.!?]*/g,
                      ) || [part.content];

                      // Escape special characters in the word for regex
                      const escapedWord = word.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&",
                      );

                      // Case-insensitive regex with broad word boundaries
                      // \b handles ascii well, but for international characters we use a wider check or just \b with 'i' flag
                      const wordPattern = new RegExp(
                        `(^|\\P{L})${escapedWord}(\\P{L}|$)`,
                        "iu",
                      );

                      let context_sentence = sentences
                        .find((s: string) => wordPattern.test(s))
                        ?.trim();

                      // Fallback if the strict unicode regex didn't catch it (e.g. edge cases)
                      if (!context_sentence) {
                        context_sentence = sentences
                          .find((s: string) =>
                            s.toLowerCase().includes(word.toLowerCase()),
                          )
                          ?.trim();
                      }

                      return (
                        <VocabularyPill
                          key={word}
                          word={word}
                          translation={definition as string}
                          language={language}
                          story_id={part.story_id}
                          context_sentence={context_sentence}
                        />
                      );
                    },
                  )}
                </div>
              )}
            </div>
          )}

        {/* -------------------------------------------------- */}
        {/* SECTION 3: The Director's Chair (Past Options)     */}
        {/* -------------------------------------------------- */}
        {!isLast && part.choices && part.choices.length > 0 && (
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
                    {typeof part.selected_choice_index === "number" &&
                    part.choices?.[part.selected_choice_index]
                      ? part.choices[part.selected_choice_index]
                      : part.user_custom_input || "Custom Input"}
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
                {part.choices.map((choice: string, idx: number) => {
                  const active = isSelected(choice, idx);
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
                {part.user_custom_input && (
                  <div className="p-3 rounded-lg text-sm border bg-purple-50 dark:bg-white/20  border-purple-200 dark:border-white/5 text-purple-800 dark:text-purple-200 flex items-center justify-between">
                    <span>Custom: {part.user_custom_input}</span>
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
      {isLast && part.choices && part.choices.length > 0 && (
        <div className="mt-4">
          <StoryChoices
            choices={part.choices}
            onSelect={onChoiceSelect}
            isLoading={isGenerating}
            disabled={isGenerating}
          />
        </div>
      )}
    </div>
  );
}
