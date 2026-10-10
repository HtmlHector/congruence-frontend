"use client";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  rightElement?: React.ReactNode;
}

/**
 * Standardized input for authentication forms — the same hand-rolled recipe as
 * every search/form input in the app (design.md "Form elements"): rounded-none,
 * bg-background, and a 1px inset focus ring instead of a border-color swap.
 */
export function AuthInput({
  label,
  error,
  rightElement,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label
        className="text-[12.5px] font-medium text-foreground/85 block"
      >
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          className={cn(
            "w-full h-[42px] px-3.5 bg-background border border-border rounded-md text-[13.5px] text-foreground placeholder:text-muted-foreground/45 outline-none",
            "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
            "hover:border-border-strong focus:border-foreground/40 focus:ring-2 focus:ring-foreground/5 focus:bg-background",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-destructive/60 focus:border-destructive focus:ring-destructive/10",
            className
          )}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-[12px] text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {error}
        </p>
      )}
    </div>
  );
}
