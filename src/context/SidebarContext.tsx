"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";

// useLayoutEffect fires synchronously BEFORE the browser paints,
// preventing any visual flash. useEffect fires AFTER paint (causes the flash).
// On the server, useLayoutEffect doesn't exist, so we fall back to useEffect
// (server never paints, so it doesn't matter there).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMounted: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // This runs BEFORE the browser paints — no more flash.
  // The server renders isCollapsed=false. The client corrects it here before
  // any pixel is shown, so the user sees the right layout from the first paint.
  useIsomorphicLayoutEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
    setIsMounted(true);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", String(newState));
      // Keep the CSS data attribute in sync so html[data-sidebar] CSS rules
      // always match the React state (no mismatch after toggling)
      if (newState) {
        document.documentElement.setAttribute("data-sidebar", "collapsed");
      } else {
        document.documentElement.removeAttribute("data-sidebar");
      }
      return newState;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, isMounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
