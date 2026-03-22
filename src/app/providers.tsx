"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    // Use your local proxy to bypass ad-blockers
    api_host: "/ph",
    // Use the modern 2026 standard
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",

    person_profiles: "identified_only",
    capture_pageview: false,

    // Useful for debugging during your launch
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.debug();
    },
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
