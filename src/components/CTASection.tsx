"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section id="get-started" className="py-32 md:py-48 relative overflow-hidden flex items-center justify-center">
      
      {/* ─── BACKGROUND LIGHTING & TEXTURE ─── */}
      {/* Subtle top fade to blend with previous section */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      
      {/* The "Portal" Glow - Anchored to the bottom center */}
      <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-purple-500/40 rounded-full multip blur-[80px] z-0 pointer-events-none" />

      {/* Optional: A very subtle grid overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />

      {/* ─── CONTENT ─── */}
      <div className="max-w-5xl mx-auto px-4 relative z-20 text-center">
        
        {/* Floating badge */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span>Your adventure awaits</span>
        </div>

        <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tight mx-auto leading-[1.1] mb-6">
          Ready to build a world and{" "}
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-600 bg-clip-text text-transparent">
            learn a language?
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
          Join a growing community trading traditional textbooks for interactive storytelling.
        </p>

        {/* The Hero Button */}
        <div className="flex justify-center items-center">
          <Link
            href="/create"
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-primary text-primary-foreground font-bold text-lg md:text-xl overflow-hidden shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.7)] hover:scale-[1.02] transition-all duration-300"
          >
            {/* Button inner shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            
            <Sparkles className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Start Creating for Free</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-muted-foreground font-medium">
          No credit card required. Start playing instantly.
        </p>
      </div>
    </section>
  );
}