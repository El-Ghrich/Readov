"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Quote } from "lucide-react";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import { useTheme } from "@/context/ThemeContext";

export default function OriginStorySection() {
  const { theme } = useTheme();
  return (
    // Hardcoded dark background base to ensure it stays dark globally
    <section
      id="origin-story"
      className="py-24 md:py-32 relative overflow-hidden bg-[#09090b]"
    >
      <div
        className={
          theme === "dark"
            ? "absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none"
            : "none"
        }
      />

      {/* ─── 2. BACKGROUNDS (FORCED DARK MODE) ─── */}
      <div className="absolute inset-0 opacity-100 pointer-events-none">
        {/* Force white stars so it looks good universally */}
        <StarsBackground
          speed={80}
          factor={0.03}
          starColor="#ffffff"
          pointerEvents={false}
        />
      </div>

      {/* Hardcoded radial glows for ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-5 relative lg:sticky lg:top-32 flex flex-col gap-10">
            {/* Headline */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Our Origin</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                <span className="text-white">Why we built</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  ReadOV
                </span>
              </h2>
              <p className="text-lg text-gray-400 mt-6 max-w-sm leading-relaxed">
                The story of how a six-year-old&apos;s curiosity inspired a
                completely new way to master languages.
              </p>
            </div>

            {/* Decorative abstract visual */}
            <div className="relative mt-4 h-48 w-full max-w-[320px] hidden md:block select-none">
              <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm rotate-6 shadow-sm" />

              <div className="absolute inset-0 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-xl -rotate-2 flex flex-col justify-center p-6">
                <Quote className="w-6 h-6 text-purple-500/40 mb-3" />
                <p className="text-sm font-medium text-white italic leading-relaxed">
                  &ldquo;What if the monster is actually good?&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                    The Spark
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN — Premium glass card ─── */}
          <div className="lg:col-span-7 relative">
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

              <div className="relative">
                <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed tracking-tight">
                  The story didn&apos;t start in a meeting room. It started on
                  our living room floor, with a six-year-old boy named Lopik.
                </p>

                <p className="text-base md:text-lg text-gray-400 mt-6 leading-relaxed">
                  One day, we were telling him a simple adventure story — and he
                  interrupted after every single sentence:
                </p>

                <div className="border-l-[3px] border-purple-500 pl-6 py-1 my-8 space-y-4">
                  <p className="text-lg italic text-gray-300 leading-relaxed">
                    &ldquo;Can the hero be a girl instead?&rdquo;
                  </p>
                  <p className="text-lg italic text-gray-300 leading-relaxed">
                    &ldquo;What if the monster is actually good?&rdquo;
                  </p>
                  <p className="text-lg italic text-gray-300 leading-relaxed">
                    &ldquo;Wait, what does that word mean?&rdquo;
                  </p>
                </div>

                <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                  We laughed — but then it hit us. We were watching the most
                  powerful learning engine in the world at work:{" "}
                  <span className="text-white font-semibold">
                    Contextual Curiosity
                  </span>
                  . Learning becomes magic when you let the learner sit in the
                  director&apos;s chair.
                </p>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 border-2 border-[#09090b] shadow-md" />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 border-2 border-[#09090b] shadow-md" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        The Founders
                      </p>
                      <p className="text-xs text-gray-400">
                        Brothers & Builders
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/about"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                  >
                    Read full story
                    <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
