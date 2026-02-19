"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import JobListener from "@/components/JobListener";
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Search,
  Heart,
  Rocket,
  Ghost,
  Compass,
  Languages,
  Target,
  BookOpen,
  BarChart,
} from "lucide-react";

const GENRES = [
  {
    id: "fantasy",
    name: "Fantasy",
    icon: Wand2,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/50",
  },
  {
    id: "mystery",
    name: "Mystery",
    icon: Search,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/50",
  },
  {
    id: "romance",
    name: "Romance",
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/50",
  },
  {
    id: "science_fiction",
    name: "Sci-Fi",
    icon: Rocket,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/50",
  },
  {
    id: "horror",
    name: "Horror",
    icon: Ghost,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/50",
  },
  {
    id: "adventure",
    name: "Adventure",
    icon: Compass,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/50",
  },
];

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Italian", label: "Italiano" },
  { value: "Portuguese", label: "Português" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
];

const DIFFICULTY_LEVELS = [
  {
    value: 1,
    label: "A1",
    name: "Beginner",
    description: "Simple words, short sentences.",
  },
  {
    value: 2,
    label: "A2",
    name: "Elementary",
    description: "Everyday topics, basic descriptions.",
  },
  {
    value: 3,
    label: "B1",
    name: "Intermediate",
    description: "Conversational, connected text.",
  },
  {
    value: 4,
    label: "B2",
    name: "Upper Int.",
    description: "Detailed text, abstract topics.",
  },
  {
    value: 5,
    label: "C1",
    name: "Advanced",
    description: "Complex, structured, fluent.",
  },
  {
    value: 6,
    label: "C2",
    name: "Mastery",
    description: "Sophisticated, nuanced, literary.",
  },
];

export default function CreateStory() {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("fantasy");
  const [difficultyIndex, setDifficultyIndex] = useState(0); // 0 to 5

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const language = formData.get("language") as string;
    const goal = formData.get("goal") as string;
    const lesson = formData.get("lesson") as string;

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Create job
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          type: "generate_start",
          params: {
            genre: selectedGenre,
            language,
            goal,
            lesson,
            level: DIFFICULTY_LEVELS[difficultyIndex].value,
            // @ts-ignore
            level_label: DIFFICULTY_LEVELS[difficultyIndex].label, // e.g., "A1"
          },
          status: "pending",
        })
        .select() // Select to return the ID
        .single();

      if (error) throw error;

      if (data) {
        setJobId(data.id);
      }
    } catch (error) {
      console.error("Error creating story job:", error);
      alert("Failed to start story generation");
      setLoading(false);
    }
  };

  if (jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <JobListener jobId={jobId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-4xl w-full space-y-8 bg-white dark:glass-dark p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-500/10 rounded-2xl mb-2">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create New Story
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Define the parameters for your next adventure. Choose your genre,
            set the difficulty, and let AI craft a unique tale.
          </p>
        </div>

        <form className="mt-12 space-y-12" onSubmit={handleSubmit}>
          {/* Genre Selection */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white">
              Choose Your Genre
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GENRES.map((genre) => (
                <div key={genre.id} className="relative">
                  <input
                    type="radio"
                    name="genre"
                    id={genre.id}
                    value={genre.id}
                    checked={selectedGenre === genre.id}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={genre.id}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer 
                                            ${
                                              selectedGenre === genre.id
                                                ? `${genre.border} ${genre.bg} bg-opacity-20`
                                                : "border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 hover:border-purple-300 dark:hover:border-white/20 hover:bg-purple-50 dark:hover:bg-white/5"
                                            }
                                        `}
                  >
                    <genre.icon
                      className={`w-10 h-10 mb-3 ${selectedGenre === genre.id ? genre.color : "text-gray-400 dark:text-gray-500"}`}
                    />
                    <span
                      className={`font-medium ${selectedGenre === genre.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {genre.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Language */}
            <div className="space-y-4">
              <label
                htmlFor="language"
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
              >
                <Languages className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Language
              </label>
              <div className="relative">
                <select
                  id="language"
                  name="language"
                  className="block w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none transition-all hover:bg-gray-100 dark:hover:bg-black/60"
                  defaultValue="English"
                >
                  {LANGUAGES.map((lang) => (
                    <option
                      key={lang.value}
                      value={lang.value}
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      {lang.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Character Goal */}
            <div className="space-y-4">
              <label
                htmlFor="goal"
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
              >
                <Target className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Story Goal{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                name="goal"
                id="goal"
                className="block w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-gray-100 dark:hover:bg-black/60"
                placeholder="e.g. Find the lost treasure"
              />
            </div>

            {/* Lesson */}
            <div className="space-y-4">
              <label
                htmlFor="lesson"
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
              >
                <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Lesson / Theme{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                name="lesson"
                id="lesson"
                className="block w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-gray-100 dark:hover:bg-black/60"
                placeholder="e.g. Friendship, Courage"
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-6">
              <label
                htmlFor="level"
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
              >
                <BarChart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Proficiency Level (CEFR)
              </label>
              <div className="px-2">
                <input
                  type="range"
                  id="level"
                  min="0"
                  max="5"
                  step="1"
                  value={difficultyIndex}
                  onChange={(e) => setDifficultyIndex(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500"
                />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Active Level Card */}
                  <div className="md:col-span-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {DIFFICULTY_LEVELS[difficultyIndex].label}
                        </span>
                        <span className="text-lg font-medium text-purple-900 dark:text-purple-100">
                          - {DIFFICULTY_LEVELS[difficultyIndex].name}
                        </span>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        {DIFFICULTY_LEVELS[difficultyIndex].description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between px-1 text-xs text-gray-400 font-mono uppercase">
                  <span>A1</span>
                  <span>C2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-5 px-4 text-lg font-bold rounded-xl text-white dark:text-black bg-black dark:bg-white hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  Starting Magic...
                </span>
              ) : (
                <>
                  Generate Story
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
