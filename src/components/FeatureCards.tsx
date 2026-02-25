"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { SpringOptions } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Target,
  Bot,
  Library,
  BookMarked,
  type LucideIcon,
} from "lucide-react";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  gradient: string; // Tailwind gradient classes for icon badge bg
  glow: string; // box-shadow color on hover
  accentFrom: string; // text gradient start
  accentTo: string; // text gradient end
}

const features: FeatureItem[] = [
  {
    icon: Sparkles,
    title: "Create Your Adventure",
    desc: "From Parisian mysteries to sci-fi thrillers, the choice is yours. Set the scene, make choices, and watch the AI generate the next chapter in your target language.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.45)",
    accentFrom: "#a78bfa",
    accentTo: "#7c3aed",
  },
  {
    icon: BookOpen,
    title: "Learn in Context",
    desc: "Forget random word lists. Click any unfamiliar word while reading to instantly translate it, and save it to your personal Grimoire to review later.",
    gradient: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.45)",
    accentFrom: "#f9a8d4",
    accentTo: "#be185d",
  },
  {
    icon: Target,
    title: "Perfectly Tailored to You",
    desc: "Whether you are an A2 beginner or a C1 advanced learner, the AI dynamically adjusts the vocabulary and grammar to match your reading level, keeping you challenged but never lost.",
    gradient: "from-sky-400 to-blue-600",
    glow: "rgba(56,189,248,0.45)",
    accentFrom: "#7dd3fc",
    accentTo: "#1d4ed8",
  },
  {
    icon: Bot,
    title: "Your AI Language Tutor",
    desc: "Want to type your own plot twist? Go for it! If you make a grammar mistake, our AI tutor gently corrects you before moving the story forward.",
    gradient: "from-orange-400 to-red-500",
    glow: "rgba(251,146,60,0.45)",
    accentFrom: "#fdba74",
    accentTo: "#dc2626",
  },
  {
    icon: BookMarked,
    title: "Distraction-Free Reading",
    desc: "Once you bring your story to a satisfying end, it compiles into a beautiful, continuous manuscript. Read, review, and enjoy what you've built.",
    gradient: "from-emerald-400 to-teal-600",
    glow: "rgba(52,211,153,0.45)",
    accentFrom: "#6ee7b7",
    accentTo: "#0f766e",
  },
  {
    icon: Library,
    title: "Community Library",
    desc: "Publish your finished stories for others to read, or browse the community library to practice your language skills with adventures created by other learners.",
    gradient: "from-amber-400 to-yellow-500",
    glow: "rgba(251,191,36,0.45)",
    accentFrom: "#fde68a",
    accentTo: "#b45309",
  },
];

const springConfig: SpringOptions = { damping: 28, stiffness: 120, mass: 1.5 };

function FeatureTiltedCard({ feature }: { feature: FeatureItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);
  const scale = useSpring(1, springConfig);
  const [hovered, setHovered] = useState(false);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -10);
    rotateY.set((offsetX / (rect.width / 2)) * 10);
  }

  function handleMouseEnter() {
    scale.set(1.04);
    setHovered(true);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  }

  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className="relative perspective-[900px] cursor-default"
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative transform-3d rounded-2xl h-full"
        style={{ rotateX, rotateY, scale }}
      >
        {/* Card body */}
        <div
          className="relative bg-card dark:bg-card/60 border border-border rounded-2xl p-7 h-full overflow-hidden transition-shadow duration-500"
          style={{
            boxShadow: hovered
              ? `0 20px 60px ${feature.glow}, 0 0 0 1px ${feature.glow}`
              : "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* Subtle gradient wash on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none"
            style={{
              opacity: hovered ? 0.06 : 0,
              background: `radial-gradient(ellipse at top left, ${feature.glow} 0%, transparent 70%)`,
            }}
          />

          {/* Icon badge — lifted in 3D */}
          <motion.div
            className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${feature.accentFrom}, ${feature.accentTo})`,
              transform: hovered ? "translateZ(28px)" : "translateZ(0px)",
              transition: "transform 0.35s ease",
              boxShadow: hovered ? `0 8px 24px ${feature.glow}` : "none",
            }}
          >
            <Icon className="w-7 h-7 text-white drop-shadow" />
          </motion.div>

          {/* Title */}
          <h3
            className="relative z-10 text-xl font-bold mb-2 transition-all duration-300"
            style={{
              background: hovered
                ? `linear-gradient(135deg, ${feature.accentFrom}, ${feature.accentTo})`
                : undefined,
              WebkitBackgroundClip: hovered ? "text" : undefined,
              WebkitTextFillColor: hovered ? "transparent" : undefined,
              color: hovered ? undefined : undefined,
            }}
          >
            <span className={hovered ? "" : "text-foreground"}>
              {feature.title}
            </span>
          </h3>

          {/* Description */}
          <p className="relative z-10 text-muted-foreground leading-relaxed text-sm">
            {feature.desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <FeatureTiltedCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}
