"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { LogOut, User as UserIcon, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { useState, useEffect } from "react";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/support",
];

export default function AppLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Show sidebar if authenticated AND not on a public page
  const showSidebar = !!user && !isPublic;

  // Show Navbar only on public pages
  const showNavbar = isPublic;

  // Show Footer only on public pages
  const showFooter = isPublic;

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar user={user} />}

      {showSidebar && <Sidebar user={user} />}

      <main
        className={`flex-grow transition-all duration-300 ${showSidebar ? (isCollapsed ? "md:pl-20 pt-0" : "md:pl-64 pt-6") : "pt"}`}
      >
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

function Navbar({ user }: { user: User | null }) {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div
        className={`flex items-center justify-between gap-8 px-4 py-2.5 rounded-full
          transition-all duration-500
          w-full max-w-2xl
          ${
            isScrolled
              ? // After 800px - glass look adapted to theme
                theme === "dark"
                ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                : "bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg"
              : // Before 800px - always dark mode style with glass effect
                "bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          }
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
        >
          <img
            src={
              !isScrolled
                ? "/img/logo_white.png"
                : theme === "light"
                  ? "/logo_purple.png"
                  : "/img/logo_white.png"
            }
            alt="Readov"
            className="h-6 pl-0.5"
          />
        </Link>

        {/* Nav Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            /* Authenticated: just a clean Dashboard button */
            <Link
              href="/stories"
              className={`px-5 py-2 rounded-full text-sm font-semibold
                transition-all duration-200
                ${
                  !isScrolled
                    ? "bg-white/20 hover:bg-white/30 text-white shadow-none"
                    : theme === "dark"
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_16px_rgba(147,51,234,0.4)] hover:shadow-[0_0_24px_rgba(147,51,234,0.6)]"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_16px_rgba(147,51,234,0.4)] hover:shadow-[0_0_24px_rgba(147,51,234,0.6)]"
                }
              `}
            >
              Dashboard
            </Link>
          ) : (
            /* Unauthenticated: Sign In + Sign Up */
            <>
              <Link
                href="/login"
                className={`px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${
                    !isScrolled
                      ? "text-white/90 hover:text-white hover:bg-white/20"
                      : theme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                  }
                `}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`px-5 py-2 rounded-full text-sm font-semibold
                  transition-all duration-200
                  ${
                    !isScrolled
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-none"
                      : theme === "dark"
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_16px_rgba(147,51,234,0.35)] hover:shadow-[0_0_24px_rgba(147,51,234,0.55)]"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_16px_rgba(147,51,234,0.35)] hover:shadow-[0_0_24px_rgba(147,51,234,0.55)]"
                  }
                `}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full
              transition-colors duration-200
              ${
                !isScrolled
                  ? "text-white/90 hover:text-white hover:bg-white/20"
                  : theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
              }
            `}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
