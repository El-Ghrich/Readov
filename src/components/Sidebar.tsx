"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import {
  Plus,
  History,
  List,
  Edit,
  Image as ImageIcon,
  SplitSquareHorizontal,
  CreditCard,
  X,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  Sliders,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Trophy,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";

export default function Sidebar({ user }: { user: User | null }) {
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, toggleCollapse, isMounted } = useSidebar();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle screen resize to detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Effective collapse state — never collapse on mobile
  const effectiveCollapsed = isMounted && isCollapsed && !isMobile;

  // Close profile menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "My Journey", href: "/stories", icon: History },
    { name: "Open Shelf", href: "/feed", icon: List },
    { name: "WordSmith", href: "/editor", icon: Edit },
    { name: "Vocabulary", href: "/vocabulary", icon: BookOpen },
    { name: "Vision Ink", href: "/vision-ink", icon: ImageIcon },
    { name: "Dual Verse", href: "/dual-verse", icon: SplitSquareHorizontal },
    { name: "Payment", href: "/payment", icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Menu Button - Adaptive Background */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 dark:bg-background/80 backdrop-blur-lg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm transition-opacity",
          isOpen && "opacity-0 pointer-events-none", // Hide when sidebar is open
        )}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "sidebar-panel fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out pt-6 flex flex-col",
          "bg-white dark:bg-background border-r border-gray-200 dark:border-border",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "w-64 md:w-auto", // Mobile width constant, desktop width from CSS
        )}
      >
        {/* Logo Area & Toggle */}
        <div
          className={cn(
            "mb-8 flex items-center transition-all duration-300 relative",
            !effectiveCollapsed
              ? "px-6 justify-between"
              : "justify-center px-0",
          )}
        >
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity block overflow-hidden"
          >
            <div
              className={cn(
                "transition-all duration-300 flex items-center justify-center",
                !effectiveCollapsed ? "w-auto" : "w-10 h-10",
              )}
            >
              {/* Light Mode Logo */}
              <img
                src={
                  effectiveCollapsed
                    ? "/Favicon-purple.png"
                    : "/logo_purple.png"
                }
                alt="Readov"
                className={cn(
                  "object-contain transition-all dark:hidden",
                  !effectiveCollapsed ? "h-8 md:h-9" : "h-8 w-8",
                )}
              />
              {/* Dark Mode Logo */}
              <img
                src={
                  effectiveCollapsed ? "/Favicon-white.png" : "/logo_white.png"
                }
                alt="Readov"
                className={cn(
                  "object-contain transition-all hidden dark:block",
                  !effectiveCollapsed ? "h-8 md:h-9" : "h-8 w-8",
                )}
              />
            </div>
          </Link>

          {/* Desktop Collapse Toggle (Moved to Top) */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors absolute",
              !effectiveCollapsed
                ? "relative ml-auto"
                : "-right-3 top-10 bg-white dark:bg-card border border-gray-200 dark:border-border shadow-sm z-50",
            )}
            title={effectiveCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {effectiveCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {/* Primary Action: New Story Button */}
          <Link
            href="/create"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center justify-center gap-2 w-full p-3 mb-6 rounded-xl text-white font-bold transition-all overflow-hidden",
              "bg-[#4e45e3] hover:bg-[#433bc0] shadow-[0_4px_12px_rgba(78,69,227,0.3)]",
              "hover:scale-[1.02] active:scale-95",
              effectiveCollapsed ? "aspect-square p-0" : "",
            )}
            title="New Story"
          >
            <Plus className="w-5 h-5 shrink-0" />
            {!effectiveCollapsed && (
              <span className="whitespace-nowrap">New Story</span>
            )}
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group font-medium overflow-hidden",
                    isActive
                      ? "bg-[#4e45e3]/10 dark:bg-[#6d7de8]/10 text-[#4e45e3] dark:text-[#6d7de8]"
                      : "text-gray-600 dark:text-[#a1a1b5] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
                    effectiveCollapsed ? "justify-center" : "",
                  )}
                  title={item.name}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors shrink-0",
                      isActive
                        ? "text-[#4e45e3] dark:text-[#6d7de8]"
                        : "text-gray-500 dark:text-[#64647a] group-hover:text-gray-900 dark:group-hover:text-white",
                    )}
                  />
                  {!effectiveCollapsed && (
                    <span className="whitespace-nowrap transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle Button (Inline) */}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#2d2d45]">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all duration-200 font-medium overflow-hidden",
                "text-gray-600 dark:text-[#a1a1b5] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
                effectiveCollapsed ? "justify-center" : "",
              )}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-amber-400 shrink-0 hidden dark:block" />
                <Moon className="w-5 h-5 text-[#4e45e3] shrink-0 dark:hidden" />
                {!effectiveCollapsed && (
                  <>
                    <span className="font-medium whitespace-nowrap hidden dark:inline">
                      Light Mode
                    </span>
                    <span className="font-medium whitespace-nowrap dark:hidden">
                      Dark Mode
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* User / Profile Section */}
        <div
          className="p-4 border-t border-gray-100 dark:border-[#2d2d45]"
          ref={profileMenuRef}
        >
          {user ? (
            <div className="relative">
              {/* Popover Menu */}
              {showProfileMenu && !effectiveCollapsed && (
                <div
                  className={cn(
                    "absolute bottom-full left-0 right-0 mb-3 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 border",
                    "bg-white/95 dark:bg-card/95 backdrop-blur-xl border-gray-100 dark:border-white/10",
                  )}
                >
                  <div className="p-1 space-y-0.5">
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                        "text-gray-700 dark:text-[#a1a1b5] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white",
                      )}
                    >
                      <UserIcon className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                        "text-gray-700 dark:text-[#a1a1b5] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white",
                      )}
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-border my-1" />
                    <form action="/auth/signout" method="post">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium">
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Popover Menu (Collapsed Mode) - Positioned differently */}
              {showProfileMenu && effectiveCollapsed && (
                <div
                  className={cn(
                    "absolute bottom-full left-10 ml-6 mb-[-10px] w-52 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200 z-50 border",
                    "bg-white/95 dark:bg-card/95 backdrop-blur-xl border-gray-100 dark:border-white/10",
                  )}
                >
                  <div className="p-1 space-y-0.5">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-[#2d2d45] mb-1">
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                        theme === "light"
                          ? "text-gray-700 hover:bg-gray-100 hover:text-black"
                          : "text-[#a1a1b5] hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <UserIcon className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                        theme === "light"
                          ? "text-gray-700 hover:bg-gray-100 hover:text-black"
                          : "text-[#a1a1b5] hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <form action="/auth/signout" method="post">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium">
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  "flex items-center gap-3 w-full px-2 py-2.5 transition-all rounded-xl border border-transparent overflow-hidden",
                  "hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/5 text-gray-700 dark:text-gray-200",
                  effectiveCollapsed ? "justify-center" : "",
                )}
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-[#4e45e3]/10 dark:bg-[#6d7de8]/20 flex items-center justify-center border border-[#4e45e3]/20 dark:border-[#6d7de8]/30 text-[#4e45e3] dark:text-[#6d7de8]">
                  <span className="text-sm font-bold">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                {!effectiveCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-[#64647a]">
                        Account
                      </p>
                    </div>
                    <Sliders className="w-4 h-4 text-gray-400 dark:text-[#64647a]" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {effectiveCollapsed ? (
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full h-10 rounded-lg bg-[#4e45e3] text-white hover:opacity-90"
                  title="Log In"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-center py-2.5 text-sm font-medium text-gray-600 dark:text-[#a1a1b5] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-center py-2.5 text-sm font-bold text-white bg-[#4e45e3] rounded-lg shadow-md hover:opacity-90 transition-transform active:scale-95"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 dark:bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
