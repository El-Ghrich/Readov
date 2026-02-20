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

      {/* Why Verse Section */}
      <section id="why" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              The "Why Verse"
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn curiosity into clarity. Our interactive 'WhyVerse' page helps
              learners understand the purpose behind every subject.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Interactive Demo */}
            <div className="flex-1 w-full">
              <div className="bg-card/30 backdrop-blur-md rounded-3xl p-8 border border-border shadow-lg max-w-lg mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                  <HelpCircle className="w-8 h-8 text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    Why Am I Learning This?
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      q: "Why do I need to learn math?",
                      a: "Math helps you solve everyday problems, manage money, and understand the world!",
                    },
                    {
                      q: "Why is history important?",
                      a: "History teaches us about the past so we can make better decisions for the future.",
                    },
                    {
                      q: "Why learn science?",
                      a: "Science explains how everything works and helps you become a problem solver!",
                    },
                  ].map((item, i) => (
                    <div key={i} className="group cursor-none">
                      <div className="p-4 bg-card/50 rounded-lg text-foreground font-medium group-hover:bg-primary/10 transition-colors flex justify-between items-center">
                        {item.q}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-2 transition-all">
                        <div className="p-4 text-muted-foreground text-sm bg-background/50 rounded-lg">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Why Features */}
            <div className="flex-1 space-y-8">
              {[
                {
                  icon: Target,
                  title: "Real-World Connections",
                  desc: "Discover how every subject connects to the world around us, turning abstract lessons into real-life meaning.",
                },
                {
                  icon: Lightbulb,
                  title: "Interactive Q&A",
                  desc: "Because every 'Why?' deserves an inspiring answer — instant, engaging, and designed to spark wonder.",
                },
                {
                  icon: Star,
                  title: "Motivation Booster",
                  desc: "Turns obligation into inspiration — so learners move from 'I have to' to 'I can't wait to.'",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
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
              <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
                Ready to tell <span className="text-gradient">your story?</span>
              </h2>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Stop reading stories. Start creating them.{" "}
                <br className="hidden md:block" />
                Join a community where imagination, AI, and learning meet.
              </p>

              <div className="pt-8 ">
                <Link
                  href="/create"
                  className="btn-primary  hover:bg-purple-500 px-12 py-6 text-xl flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Create Your Story Now
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
