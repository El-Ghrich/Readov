"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { LogOut, User as UserIcon, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";

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

  // Show Footer only on public pages (logic moved here from FooterWrapper effectively)
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

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src={
                  theme === "light" ? "/logo_purple.png" : "/img/logo_white.png"
                }
                alt="Readov"
                className="h-8"
              />
            </Link>
          </div>

          <div className="flex items-center md:ml-6 space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* On public pages, we show simple user info or link to dashboard */}
                <Link
                  href="/stories"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium mr-2"
                >
                  Dashboard
                </Link>

                <div className="flex items-center gap-4">
                  <span className="hidden md:inline text-sm text-gray-400">
                    {user.email}
                  </span>
                  <form action="/auth/signout" method="post">
                    <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium transition-all border border-red-500/20">
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
