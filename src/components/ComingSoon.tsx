"use client";
import { ArrowLeft, Sparkles, Clock, Bell, Mail, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { GravityStarsBackground } from "./animate-ui/components/backgrounds/gravity-stars";

interface ComingSoonProps {
  title?: string;
  description?: string;
  className?: string;
  estimatedDate?: string;
}

export default function ComingSoon({
  title = "Something Amazing is Coming",
  description = "We're crafting an experience that will transform the way you work. Get ready for something extraordinary.",
  className,
  estimatedDate = "Q2 2024",
}: ComingSoonProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer effect
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 2); // 2 months from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mouse move effect for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4 pt-10  relative overflow-hidden",
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Customized Hexagon Background */}
      <GravityStarsBackground
        className="absolute inset-0 flex items-center justify-center rounded-xl"
        starsCount={250}
        glowIntensity={40}
        glowAnimation={"spring"}
        gravityStrength={100}
      />

      {/* Gradient Orbs (overlay on top of hexagons for depth) */}
      <div
        className="absolute top-20 -left-20 w-96 h-96 bg-purple-300 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-50 animate-float z-10"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
        }}
      />
      <div
        className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-300 dark:bg-blue-600/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-50 animate-float-delayed z-10"
        style={{
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
        }}
      />

      {/* Main Content */}
      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-purple-200 dark:border-purple-500/20 shadow-lg animate-badge-float">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Launching {estimatedDate}
          </span>
        </div>

        {/* Main Title with Gradient */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
            {title}
          </span>
        </h1>

        {/* Description with Typing Effect */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={item.label}
              className="group relative p-4 bg-white/50 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-purple-100 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: <Clock className="w-6 h-6" />,
              title: "Lightning Fast",
              description: "Optimized for speed and performance",
            },
            {
              icon: <Sparkles className="w-6 h-6" />,
              title: "Beautiful Design",
              description: "Modern and intuitive interface",
            },
            {
              icon: <Bell className="w-6 h-6" />,
              title: "Smart Notifications",
              description: "Stay updated in real-time",
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-purple-100 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-white dark:bg-[#1a1a2e] rounded-lg shadow-xl">
              <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Get notified when we launch"
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-lg focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button className="m-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Notify Me</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to the dashboard
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        .animate-badge-float {
          animation: float 3s ease-in-out infinite;
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .dark .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #374151 1px, transparent 1px),
            linear-gradient(to bottom, #374151 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
