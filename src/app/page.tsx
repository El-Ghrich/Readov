"use client";

import dynamic from "next/dynamic";
import CTASection from "@/components/CTASection";
import SplitHero from "@/components/SplitHero";

const QuillCursor = dynamic(
  () => import("@/components/QuillCursor").then((mod) => mod.QuillCursor),
  { ssr: false },
);
const FeatureCards = dynamic(() => import("@/components/FeatureCards"));
const OriginStorySection = dynamic(
  () => import("@/components/OriginStorySection"),
);

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background cursor-none custom-cursor-zone">
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

      <OriginStorySection />

      <CTASection />
    </div>
  );
}
