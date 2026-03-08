"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={cn("space-y-1.5 w-full relative", className)}
      ref={containerRef}
    >
      {label && (
        <label className="text-sm font-semibold text-muted-foreground ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 bg-muted/30 border rounded-xl text-left transition-all duration-200",
            isOpen
              ? "border-primary ring-2 ring-primary/20 shadow-lg"
              : "border-border hover:border-border/80 shadow-sm",
            error ? "border-red-500" : "",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <span
            className={cn(
              "block truncate transition-colors",
              selectedOption ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-300",
              isOpen ? "rotate-180 text-primary" : "",
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              role="listbox"
              className="absolute z-50 w-full overflow-hidden bg-white/95 dark:bg-card/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-h-64 overflow-y-auto custom-scrollbar"
            >
              <div className="p-2 space-y-1">
                {options.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer group relative overflow-hidden",
                      value === option.value
                        ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(78,69,227,0.3)]"
                        : "text-foreground hover:bg-primary/5 hover:translate-x-1",
                    )}
                  >
                    <span className="relative z-10">{option.label}</span>
                    {value === option.value ? (
                      <Check className="w-4 h-4 relative z-10 animate-in zoom-in duration-300" />
                    ) : (
                      <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-40 -rotate-90 transition-all duration-300" />
                    )}

                    {/* Subtle hover background glow */}
                    {value !== option.value && (
                      <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                  </li>
                ))}
                {options.length === 0 && (
                  <li className="px-4 py-3 text-sm text-center text-muted-foreground italic">
                    No options available
                  </li>
                )}
              </div>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-red-500 ml-1 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
