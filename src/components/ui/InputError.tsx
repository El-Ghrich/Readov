import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface InputErrorProps {
  message?: string;
  className?: string;
}

export function InputError({ message, className }: InputErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 mt-1.5 text-sm font-medium text-red-500 dark:text-red-400 animate-in fade-in slide-in-from-top-1",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
