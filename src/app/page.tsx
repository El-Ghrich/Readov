import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Star,
  Target,
} from "lucide-react";
import SplitHero from "@/components/SplitHero";
import { QuillCursor } from "@/components/QuillCursor";
import FeatureCards from "@/components/FeatureCards";

export default function Home() {
  return (
    <div className="min-h-screen bg-background cursor-none custom-cursor-zone">
      <QuillCursor />
      {/* Hero Section */}
      <SplitHero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Story Generation Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to create amazing stories with AI
            </p>
          </div>

          <FeatureCards />
        </div>
      </section>

      {/* Origin Story Section */}
      <section id="origin-story" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
            {/* Left Column - Sticky Headline */}
            <div className="relative">
              <div className="lg:sticky lg:top-32">
                {/* Magical glowing blob behind text */}
                <div className="absolute -left-10 -top-10 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
                <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
                  Why we built <br />
                  <span className="text-gradient">ReadOV</span>
                </h2>
              </div>
            </div>

            {/* Right Column - The Card */}
            <div className="relative z-10">
              <div className="bg-card/30 backdrop-blur-md border border-border rounded-3xl p-8 md:p-10 shadow-lg">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  The story didn&apos;t start in a meeting room. It started on
                  our living room floor, with a six-year-old boy named Lopik.
                </p>

                <p className="text-muted-foreground mt-4 leading-relaxed">
                  One day, we were telling him a simple adventure story, and he
                  interrupted after every sentence:
                </p>

                <div className="border-l-4 border-primary pl-4 my-6 space-y-3 italic text-muted-foreground">
                  <p>&quot;Can the hero be a girl instead?&quot;</p>
                  <p>&quot;What if the monster is actually good?&quot;</p>
                  <p>&quot;Wait, what does that word mean?&quot;</p>
                </div>

                <p className="text-foreground font-semibold mt-4 leading-relaxed tracking-wide">
                  We laughed, but then it hit us. We were watching the most
                  powerful learning engine in the world at work: Contextual
                  Curiosity. Learning becomes magic when you let the learner sit
                  in the director&apos;s chair.
                </p>

                {/* Footer of the Card */}
                <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left Side: Avatars + Text */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-background shadow-sm" />
                      <div className="w-10 h-10 rounded-full bg-slate-400 dark:bg-slate-600 border-2 border-background shadow-sm" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground italic">
                      — The Founders
                    </span>
                  </div>

                  {/* Right Side: Button */}
                  <Link
                    href="/about"
                    className="group inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-foreground bg-secondary/50 hover:bg-secondary rounded-full transition-colors border border-border"
                  >
                    Read our full story
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="bg-card/50 backdrop-blur-3xl rounded-[2rem] p-12 md:p-20 text-center border border-primary/20 shadow-xl">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight max-w-4xl mx-auto">
                Ready to build a world and{" "}
                <span className="text-gradient">learn a language?</span>
              </h2>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join a growing community trading traditional textbooks for
                interactive storytelling.
              </p>

              <div className="pt-8 ">
                <Link
                  href="/create"
                  className="btn-primary  hover:bg-purple-500 px-12 py-6 text-xl flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Creating for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
