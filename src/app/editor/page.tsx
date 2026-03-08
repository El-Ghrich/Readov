"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Save, Loader2, Share2, X, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { storySaveSchema } from "@/lib/validations";
import { InputError } from "@/components/ui/InputError";
import { CustomSelect } from "@/components/ui/CustomSelect";

type StorySaveFormValues = z.infer<typeof storySaveSchema>;

// Fallback database from original app
const FALLBACK_WORDS: Record<
  string,
  { synonyms: string[]; antonyms: string[] }
> = {
  happy: {
    synonyms: ["joyful", "cheerful", "glad", "pleased"],
    antonyms: ["sad", "unhappy", "miserable"],
  },
  sad: {
    synonyms: ["unhappy", "sorrowful", "melancholy"],
    antonyms: ["happy", "joyful", "cheerful"],
  },
  big: {
    synonyms: ["large", "huge", "enormous"],
    antonyms: ["small", "tiny", "little"],
  },
  small: {
    synonyms: ["tiny", "little", "miniature"],
    antonyms: ["big", "large", "huge"],
  },
  good: {
    synonyms: ["excellent", "great", "wonderful"],
    antonyms: ["bad", "terrible", "awful"],
  },
  bad: {
    synonyms: ["terrible", "awful", "horrible"],
    antonyms: ["good", "excellent", "great"],
  },
  fast: {
    synonyms: ["quick", "rapid", "swift"],
    antonyms: ["slow", "sluggish", "gradual"],
  },
  slow: {
    synonyms: ["sluggish", "gradual", "leisurely"],
    antonyms: ["fast", "quick", "rapid"],
  },
  hot: {
    synonyms: ["warm", "heated", "burning"],
    antonyms: ["cold", "chilly", "freezing"],
  },
  cold: {
    synonyms: ["chilly", "freezing", "icy"],
    antonyms: ["hot", "warm", "heated"],
  },
  love: {
    synonyms: ["adore", "cherish", "treasure"],
    antonyms: ["hate", "despise", "loathe"],
  },
  hate: {
    synonyms: ["despise", "loathe", "detest"],
    antonyms: ["love", "adore", "cherish"],
  },
  beautiful: {
    synonyms: ["gorgeous", "stunning", "lovely"],
    antonyms: ["ugly", "hideous", "unsightly"],
  },
  ugly: {
    synonyms: ["hideous", "unsightly", "repulsive"],
    antonyms: ["beautiful", "gorgeous", "stunning"],
  },
};

type AnimatedWord = {
  id: number;
  text: string;
  type: "synonym" | "antonym";
  style: React.CSSProperties;
};

export default function EditorPage() {
  const [title, setTitle] = useState("Untitled Story");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [animatedWords, setAnimatedWords] = useState<AnimatedWord[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "default" | "success" | "danger";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "default",
    onConfirm: () => {},
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StorySaveFormValues>({
    resolver: zodResolver(storySaveSchema as any),
    defaultValues: {
      title: "Untitled Story",
      genre: "General",
      language: "English",
      goal: "",
      lesson: "",
      isPublic: false,
    },
  });

  // Keep title input in sync with form data
  const formTitle = watch("title");
  useEffect(() => {
    setTitle(formTitle);
  }, [formTitle]);

  const processedWords = useRef(new Set<string>());
  const wordIdCounter = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  // Animation Logic
  const createAnimatedWord = (
    word: string,
    type: "synonym" | "antonym",
    index: number,
    total: number,
  ) => {
    const id = ++wordIdCounter.current;

    const margin = 15;
    let startX = 50;
    let startY = 50;

    if (type === "synonym") {
      // Top/Left
      const positions = [
        { x: margin, y: margin },
        { x: 50, y: margin },
        { x: 85, y: margin },
        { x: margin, y: 30 },
      ];
      const pos = positions[index % positions.length];
      startX = pos.x;
      startY = pos.y;
    } else {
      // Bottom/Right
      const positions = [
        { x: 85, y: 70 },
        { x: 50, y: 85 },
        { x: margin, y: 85 },
        { x: 85, y: 50 },
      ];
      const pos = positions[index % positions.length];
      startX = pos.x;
      startY = pos.y;
    }

    // Random variations
    const endX = startX + (Math.random() - 0.5) * 20;
    const endY = startY + (Math.random() - 0.5) * 15;
    const rotation = (Math.random() - 0.5) * 20;

    const style: React.CSSProperties = {
      left: `${startX}%`,
      top: `${startY}%`,
      transform: `rotate(${rotation}deg)`,
      opacity: 0,
      animation: `float-in-out 3s ease-in-out forwards`, // define keyframes globally
    } as any;

    setAnimatedWords((prev) => [...prev, { id, text: word, type, style }]);

    // Remove after animation
    setTimeout(() => {
      setAnimatedWords((prev) => prev.filter((w) => w.id !== id));
    }, 3000);
  };

  const getWords = async (word: string) => {
    try {
      // API
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      );
      if (response.ok) {
        const data = await response.json();
        const synonyms = new Set<string>();
        const antonyms = new Set<string>();

        data.forEach((entry: any) => {
          entry.meanings?.forEach((meaning: any) => {
            // Meaning level
            meaning.synonyms?.forEach(
              (s: string) =>
                s.toLowerCase() !== word.toLowerCase() && synonyms.add(s),
            );
            meaning.antonyms?.forEach(
              (a: string) =>
                a.toLowerCase() !== word.toLowerCase() && antonyms.add(a),
            );

            // Definition level
            meaning.definitions?.forEach((def: any) => {
              def.synonyms?.forEach(
                (s: string) =>
                  s.toLowerCase() !== word.toLowerCase() && synonyms.add(s),
              );
              def.antonyms?.forEach(
                (a: string) =>
                  a.toLowerCase() !== word.toLowerCase() && antonyms.add(a),
              );
            });
          });
        });

        if (synonyms.size > 0 || antonyms.size > 0) {
          return {
            synonyms: Array.from(synonyms).slice(0, 4),
            antonyms: Array.from(antonyms).slice(0, 4),
          };
        }
      }
    } catch (e) {
      /* ignore */
    }

    // Fallback
    const fb = FALLBACK_WORDS[word.toLowerCase()];
    return fb || { synonyms: [], antonyms: [] };
  };

  const processInput = async (currentText: string) => {
    const cleanedText = currentText.replace(/\s{2,}/g, " ");
    const words = cleanedText.trim().split(" ");

    // Only process if ends with space
    if (
      currentText.endsWith(" ") &&
      !currentText.endsWith("  ") &&
      words.length > 0
    ) {
      const lastWord = words[words.length - 1].replace(/[^\w]/g, "");
      if (lastWord.length < 2) return;
      if (processedWords.current.has(lastWord.toLowerCase())) return;

      processedWords.current.add(lastWord.toLowerCase());
      setTimeout(
        () => processedWords.current.delete(lastWord.toLowerCase()),
        3000,
      );

      const { synonyms, antonyms } = await getWords(lastWord);

      synonyms.forEach((s, i) =>
        setTimeout(
          () => createAnimatedWord(s, "synonym", i, synonyms.length),
          i * 200,
        ),
      );
      antonyms.forEach((a, i) =>
        setTimeout(
          () => createAnimatedWord(a, "antonym", i, antonyms.length),
          synonyms.length * 200 + i * 200,
        ),
      );
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => processInput(val), 200);
  };

  const onSubmit = async (data: StorySaveFormValues) => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: data.title || "Untitled Story",
          genre: data.genre,
          language: data.language,
          goal: data.goal,
          lesson: data.lesson,
          full_story: text,
          is_completed: true,
          is_published: data.isPublic,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Insert into story_parts for compatibility with Reader
      const { error: partError } = await supabase.from("story_parts").insert({
        story_id: storyData.id,
        part_number: 1,
        content: text,
        is_user_input: true,
      });

      if (partError) throw partError;

      setShowSaveModal(false);
      setModalState({
        isOpen: true,
        title: "Success!",
        message: "Story saved successfully!",
        type: "success",
        onConfirm: () => {
          setModalState((s) => ({ ...s, isOpen: false }));
          router.push("/stories");
        },
      });
      showToast("Story saved successfully!", "success");
    } catch (err: any) {
      setModalState({
        isOpen: true,
        title: "Error",
        message: err.message,
        type: "danger",
        onConfirm: () => setModalState((s) => ({ ...s, isOpen: false })),
      });
      showToast("Failed to save story.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes float-in-out {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.1) translateY(-10px);
          }
          80% {
            opacity: 1;
            transform: scale(1) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) translateY(-40px);
          }
        }
      `}</style>

      <div className="max-w-4xl w-full grow flex flex-col bg-white/80 dark:bg-card/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setValue("title", e.target.value);
            }}
            className="bg-transparent text-3xl font-black text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 w-full tracking-tight"
            placeholder="Story Title..."
          />
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative p-8">
          <textarea
            value={text}
            onChange={handleInput}
            className="w-full h-full bg-transparent text-xl text-gray-800 dark:text-gray-200 resize-none focus:outline-none leading-relaxed custom-scrollbar placeholder-gray-400 dark:placeholder-gray-600 font-medium"
            placeholder="Start typing any word and add a space to see the magic..."
            spellCheck={false}
          />

          {/* Animated Words Layer */}
          <div className="absolute inset-0 pointer-events-none p-6 overflow-hidden">
            {animatedWords.map((word) => (
              <div
                key={word.id}
                className={`absolute px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm border ${
                  word.type === "synonym"
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
                style={word.style}
              >
                {word.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Legend */}
        <div className="p-6 bg-gray-50/50 dark:bg-black/40 border-t border-gray-100 dark:border-white/5 flex gap-8 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Synonyms
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            Antonyms
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_30px_100px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.6)] animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Save Story
              </h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <Controller
                  name="genre"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label="Genre"
                      options={[
                        "General",
                        "Fantasy",
                        "Sci-Fi",
                        "Romance",
                        "Horror",
                        "Custom",
                      ].map((g) => ({ value: g, label: g }))}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.genre?.message}
                    />
                  )}
                />

                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label="Language"
                      options={["English", "Spanish", "French", "German"].map(
                        (l) => ({ value: l, label: l }),
                      )}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.language?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                  Goal (Optional)
                </label>
                <input
                  type="text"
                  {...register("goal")}
                  placeholder="e.g. Learn new vocabulary"
                  className={`w-full bg-gray-50 dark:bg-black/20 border rounded-2xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500 outline-none transition-all ${
                    errors.goal
                      ? "border-red-500"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                />
                <InputError message={errors.goal?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                  Lesson (Optional)
                </label>
                <input
                  type="text"
                  {...register("lesson")}
                  placeholder="e.g. Past tense"
                  className={`w-full bg-gray-50 dark:bg-black/20 border rounded-2xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500 outline-none transition-all ${
                    errors.lesson
                      ? "border-red-500"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                />
                <InputError message={errors.lesson?.message} />
              </div>

              <div
                className="flex flex-col gap-4 py-4 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                onClick={() => setValue("isPublic", !watch("isPublic"))}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-6 rounded-full p-1 transition-colors relative ${watch("isPublic") ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${watch("isPublic") ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Publish to Community
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      Public Access
                    </span>
                  </div>
                </div>
                {/* Title error message rendering inside form if title failed validation */}
                <InputError message={errors.title?.message} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 mt-4 shadow-xl shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Saving Adventure..." : "Save to Library"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={modalState.onConfirm}
        title={modalState.title}
        type={modalState.type}
      >
        <div className="space-y-6">
          <p className="text-gray-300">{modalState.message}</p>
          <button
            onClick={modalState.onConfirm}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
          >
            Okay
          </button>
        </div>
      </Modal>
    </div>
  );
}
