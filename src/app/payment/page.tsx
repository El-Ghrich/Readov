"use client";

import { useState } from "react";
import { Check, Star, Zap, X, Sparkles, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
  const [showModal, setShowModal] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "3 Stories per day",
        "Basic AI Model (Gemini Pro)",
        "Standard Generation Speed",
        "Community Access",
      ],
      cta: "Current Plan",
      active: true,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "/month",
      features: [
        "Unlimited Stories",
        "Advanced AI (Mistral & Claude)",
        "Instant Generation Speed",
        "AI Image Generation",
        "Priority 24/7 Support",
        "Custom UI Themes",
      ],
      cta: "Upgrade Now",
      highlight: true,
    },
  ];

  const handleUpgrade = () => {
    setShowModal(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full dark:bg-purple-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full dark:bg-indigo-900/10" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
            Elevate Your <span className="text-purple-600">Imagination</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Unlock the full potential of Readov with our Premium plan. Generate
            unlimited stories with advanced AI architectures and visualize your
            worlds with stunning AI imagery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-8 rounded-4xl border transition-all duration-300 flex flex-col group",
                plan.highlight
                  ? "bg-white/80 dark:bg-card/40 border-purple-500/50 shadow-2xl dark:shadow-[0_0_50px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20 scale-[1.02]"
                  : "bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-purple-500/30",
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black px-6 py-1.5 rounded-full flex items-center gap-2 shadow-xl ring-2 ring-white/20">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  THE DIRECTOR&apos;S CHOICE
                </div>
              )}

              <div className="mb-8 text-center sm:text-left">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {plan.name} Plan
                </span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-2">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 font-medium">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1 text-left">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium group/item"
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        plan.highlight
                          ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500",
                      )}
                    >
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.highlight ? handleUpgrade : undefined}
                disabled={plan.active}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-sm tracking-wide transition-all duration-300",
                  plan.active
                    ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-[1.03] active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none",
                  plan.highlight && !plan.active
                    ? "bg-purple-600 dark:bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 dark:shadow-purple-900/20"
                    : "",
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-gray-500 dark:text-gray-500 font-medium">
          Secure payments handled by Stripe. Cancel your membership at any time.
        </p>
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#100f24] rounded-4xl border border-gray-200 dark:border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)] overflow-hidden scale-in-center">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-8 sm:p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-purple-50 dark:ring-purple-900/10">
                <Rocket className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-bounce" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Premium is{" "}
                  <span className="text-purple-600">Launching Soon!</span>
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    We&apos;re currently putting the final touches on our pro
                    features to ensure you get the absolute best AI storytelling
                    experience.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    <Sparkles className="w-4 h-4" />
                    Estimated Launch: April 2026
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl space-y-4 text-left">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  What you&apos;ll get:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Unlimited Flow",
                    "Claude 3.5",
                    "Mistral Large",
                    "FLUX Vision",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      <Check className="w-4 h-4 text-green-500" /> {f}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-5 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 dark:shadow-none active:scale-95"
              >
                I&apos;ll be waiting!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
