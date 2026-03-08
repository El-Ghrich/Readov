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
  PenTool,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { storyCreateSchema } from "@/lib/validations";
import { InputError } from "@/components/ui/InputError";
import { CustomSelect } from "@/components/ui/CustomSelect";

type StoryCreateFormValues = z.infer<typeof storyCreateSchema>;

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
    id: "sci-fi",
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoryCreateFormValues>({
    resolver: zodResolver(storyCreateSchema),
    defaultValues: {
      targetLanguage: "English",
      genre: "fantasy",
      languageLevel: "1",
      goal: "",
      lesson: "",
      customPremise: "",
    },
  });

  // Keep these synced for the custom UI elements
  const currentGenre = watch("genre");
  const currentLevelIndex = parseInt(watch("languageLevel")) || 0;

  const onSubmit = async (data: StoryCreateFormValues) => {
    setLoading(true);
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
      const { data: jobData, error } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          type: "generate_start",
          params: {
            genre: data.genre,
            language: data.targetLanguage,
            goal: data.goal,
            lesson: data.lesson,
            premise: data.customPremise,
            level: DIFFICULTY_LEVELS[currentLevelIndex].value,
            level_label: DIFFICULTY_LEVELS[currentLevelIndex].label, // e.g., "A1"
          },
          status: "pending",
        })
        .select() // Select to return the ID
        .single();

      if (error) throw error;

      if (jobData) {
        setJobId(jobData.id);
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
    <div className="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8 flex justify-center relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl w-full space-y-8 bg-white/80 dark:bg-card/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="text-center space-y-5">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Create New Story
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Define the parameters for your next adventure. Choose your genre,
            set the difficulty, and let AI craft a unique tale.
          </p>
        </div>

        <form className="mt-14 space-y-12" onSubmit={handleSubmit(onSubmit)}>
          {/* Genre Selection */}
          <div className="space-y-5">
            <label className="block text-base font-bold text-gray-900 dark:text-gray-200">
              Choose Your Genre
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GENRES.map((genre) => (
                <div key={genre.id} className="relative group">
                  <input
                    type="radio"
                    id={`genre-${genre.id}`}
                    value={genre.id}
                    {...register("genre")}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={`genre-${genre.id}`}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer 
                                ${
                                  currentGenre === genre.id
                                    ? `${genre.border} ${genre.bg} bg-opacity-10 dark:bg-opacity-20 shadow-sm scale-[1.02]`
                                    : "border-gray-200/80 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-purple-300/50 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm"
                                }
                              `}
                  >
                    <genre.icon
                      className={`w-10 h-10 mb-3 transition-colors duration-300 ${currentGenre === genre.id ? genre.color : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}
                    />
                    <span
                      className={`font-semibold transition-colors duration-300 ${currentGenre === genre.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {genre.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <InputError message={errors.genre?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* Language */}
            <div className="space-y-3 group">
              <Controller
                name="targetLanguage"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Language"
                    options={LANGUAGES}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.targetLanguage?.message}
                    className="w-full"
                  />
                )}
              />
            </div>

            {/* Character Goal */}
            <div className="space-y-3 group">
              <label
                htmlFor="goal"
                className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-200"
              >
                <Target className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                Story Goal
                <span className="ml-2 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Optional
                </span>
              </label>
              <input
                type="text"
                id="goal"
                {...register("goal")}
                className={`block w-full px-5 py-4 rounded-2xl border bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-4 transition-all duration-300 ${
                  errors.goal
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:ring-purple-500/20 dark:focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400"
                }`}
                placeholder="e.g. Find the lost treasure"
              />
              <InputError message={errors.goal?.message} />
            </div>

            {/* Custom Premise */}
            <div className="space-y-3 md:col-span-2 group">
              <label
                htmlFor="customPremise"
                className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-200"
              >
                <PenTool className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                Custom Premise
                <span className="ml-2 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Optional
                </span>
              </label>
              <textarea
                id="customPremise"
                {...register("customPremise")}
                rows={2}
                className={`block w-full px-5 py-4 rounded-2xl border bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-4 transition-all duration-300 resize-none ${
                  errors.customPremise
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:ring-purple-500/20 dark:focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400"
                }`}
                placeholder="e.g. A detective in 1920s Paris looking for a stolen painting..."
              />
              <InputError message={errors.customPremise?.message} />
            </div>

            {/* Lesson */}
            <div className="space-y-3 group md:col-span-2">
              <label
                htmlFor="lesson"
                className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-200"
              >
                <BookOpen className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                Lesson / Theme
                <span className="ml-2 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Optional
                </span>
              </label>
              <input
                type="text"
                id="lesson"
                {...register("lesson")}
                className={`block w-full px-5 py-4 rounded-2xl border bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-4 transition-all duration-300 ${
                  errors.lesson
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:ring-purple-500/20 dark:focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400"
                }`}
                placeholder="e.g. Friendship, Courage, Betrayal"
              />
              <InputError message={errors.lesson?.message} />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-6 md:col-span-2 pt-2">
              <label
                htmlFor="languageLevel"
                className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-200"
              >
                <BarChart className="w-5 h-5 text-gray-400" />
                Proficiency Level (CEFR)
              </label>
              <div className="px-2">
                <input
                  type="range"
                  id="languageLevel"
                  min="0"
                  max="5"
                  step="1"
                  {...register("languageLevel")}
                  className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500 outline-none focus:ring-4 focus:ring-purple-500/20"
                />

                {/* Active Level Card - Enhanced */}
                <div className="mt-8 bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-700/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm animate-in fade-in duration-300">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center px-3 py-1 bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 font-black rounded-lg">
                        {DIFFICULTY_LEVELS[currentLevelIndex]?.label}
                      </span>
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {DIFFICULTY_LEVELS[currentLevelIndex]?.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {DIFFICULTY_LEVELS[currentLevelIndex]?.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-between px-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <span>Beginner (A1)</span>
                  <span>Mastery (C2)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-5 px-4 text-xl font-bold rounded-2xl text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_40px_-10px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.6)] focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.01] overflow-hidden"
            >
              {/* Button inner shine */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

              {loading ? (
                <span className="flex items-center gap-3 relative z-10">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Magic...
                </span>
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  Create Story
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
