import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested for typography
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PHProvider } from "@/app/providers";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://readov.com"),
  title: "Readov | Learn Languages Through AI Storytelling",
  description:
    "Ditch the flashcards. Master languages by directing interactive AI stories tailored to your exact proficiency level.",
  openGraph: {
    images: ["/og-image.jpg"],
  },
};

import { SidebarProvider } from "@/context/SidebarContext";

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground selection:bg-purple-500/30`}
      >
        <PHProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  if (localStorage.getItem('sidebar-collapsed') === 'true') {
                    document.documentElement.setAttribute('data-sidebar', 'collapsed');
                  }
                } catch (e) {}
              })();
            `,
            }}
          />
        <Analytics/>
          <ToastProvider>
            <ThemeProvider>
              <SidebarProvider>
                <AppLayout user={user}>{children}</AppLayout>
              </SidebarProvider>
            </ThemeProvider>
          </ToastProvider>
        </PHProvider>
      </body>
    </html>
  );
}
