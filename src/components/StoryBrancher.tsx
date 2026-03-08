"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Split, ArrowRight, X, CheckCircle2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { InputError } from "@/components/ui/InputError";

interface StoryBrancherProps {
  onBranch: (instruction?: string) => void;
  choices?: string[];
  index?: number;
  selectedChoiceIndex?: number | null;
  userCustomInput?: string;
}

export default function StoryBrancher({
  onBranch,
  choices = [],
  index,
  selectedChoiceIndex = null,
  userCustomInput = "",
}: StoryBrancherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [instruction, setInstruction] = useState(
    selectedChoiceIndex == null && userCustomInput ? userCustomInput : "",
  );
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schema for custom input
  const branchInputSchema = z
    .string()
    .min(3, "Input is too short (minimum 3 characters).")
    .max(500, "Input is too long (maximum 500 characters).");

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsExpanded(false);
    setShowComingSoon(false);
    setInstruction(
      selectedChoiceIndex == null && userCustomInput ? userCustomInput : "",
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    // Validate input
    const validationResult = branchInputSchema.safeParse(instruction);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setError(null);
    setShowComingSoon(true);
  };

  const handleChoiceClick = (choice: string) => {
    setShowComingSoon(true);
  };

  return (
    <div className="relative group w-full my-2">
      {/* The "Ghost" Divider / Hover Area */}
      {/* EXPANDED HOVER AREA: -left-16 to -right-16 ensures the mouse doesn't leave the trigger zone easily */}
      <div
        className={`
                    absolute -left-4 -right-4 md:-left-16 md:-right-16 -top-4 bottom-4 z-10 flex items-center justify-center cursor-pointer 
                    ${isExpanded ? "pointer-events-none" : ""}
                `}
        onClick={handleExpand}
      >
        {/* The Visible Line on Hover - Triggered by parent group hover */}
        <div
          className={`w-full mx-4 md:mx-16 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-transform duration-500 ease-out 
                    ${isExpanded ? "opacity-0" : "scale-x-0 group-hover:scale-x-100 opacity-50 group-hover:opacity-100"}
                `}
        />

        {/* Floating Icon - Visible on group hover - Positioned relative to the line center */}
        <div
          className={`
                    absolute bg-card shadow-lg border border-purple-500/20 p-2 rounded-full text-purple-600 dark:text-purple-400 
                    transition-all duration-300 delay-75 transform left-1/2 -translate-x-1/2
                    ${isExpanded ? "opacity-0 scale-0" : "scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"}
                `}
        >
          <Split className="w-4 h-4" />
        </div>
      </div>

      {/* The Expanded "Director's Panel" */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative bg-card rounded-2xl border border-purple-500/20 shadow-xs py-6 px-4 md:px-8 m-1">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <Split className="w-5 h-5 text-purple-600" />
                    Explore an Alternate Path
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Redirect the story from this point. This will create a new
                    timeline.
                  </p>
                </div>

                {/* Choices Grid */}
                {choices && choices.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                    {choices.map((choice, i) => {
                      const isSelected = selectedChoiceIndex === i;
                      return (
                        <button
                          key={i}
                          onClick={() => handleChoiceClick(choice)}
                          className={cn(
                            "text-left p-4 text-sm rounded-xl transition-all group/choice relative overflow-hidden",
                            isSelected
                              ? "bg-purple-100 dark:bg-purple-900/40 border border-purple-400 dark:border-purple-500 shadow-sm shadow-purple-500/10"
                              : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-500/30",
                          )}
                        >
                          <span
                            className={cn(
                              "font-medium line-clamp-2 transition-colors relative z-10 pr-6",
                              isSelected
                                ? "text-purple-900 dark:text-purple-100"
                                : "text-gray-700 dark:text-gray-300 group-hover/choice:text-purple-700 dark:group-hover/choice:text-purple-300",
                            )}
                          >
                            "{choice}"
                          </span>
                          {isSelected && (
                            <div className="absolute top-3 right-3 z-10">
                              <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="relative group mt-6">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 transition duration-500"></div>
                  <div className="relative flex flex-col md:flex-row gap-2 bg-card p-1 rounded-xl">
                    <input
                      value={instruction}
                      onChange={(e) => {
                        setInstruction(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Write your own direction..."
                      className={`flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 border rounded-xl ${
                        error ? "border-red-500" : "border-transparent"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!instruction.trim()}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                    >
                      Branch <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-center md:text-left md:px-2">
                    <InputError message={error || undefined} />
                  </div>
                </form>

                {/* Coming Soon Overlay */}
                <AnimatePresence>
                  {showComingSoon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/40 dark:bg-background/60 backdrop-blur-sm rounded-2xl"
                    >
                      <div className="bg-white dark:bg-card border border-purple-200 dark:border-purple-500/20 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowComingSoon(false)}
                          className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Rocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Branching Soon!
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Creating alternate timelines from past decisions will
                          be available in the upcoming Update inshallah. Stay
                          tuned!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
