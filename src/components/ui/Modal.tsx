"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: "default" | "success" | "danger";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = "default",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-4xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
        <div
          className={`p-6 border-b border-border flex justify-between items-center ${
            type === "success"
              ? "bg-green-500/10"
              : type === "danger"
                ? "bg-red-500/10"
                : "bg-muted/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {type === "success" && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {type === "danger" && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
