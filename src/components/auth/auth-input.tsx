"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      error,
      hint,
      rightElement,
      leftElement,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-[12.5px] font-medium text-foreground/85 block"
          >
            {label}
          </label>
          {hint && (
            <span className="text-[11.5px] text-muted-foreground">{hint}</span>
          )}
        </div>

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground pointer-events-none">
              {leftElement}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            {...props}
            className={cn(
              "w-full h-[42px] px-3.5 bg-background border border-border rounded-md text-[13.5px] text-foreground placeholder:text-muted-foreground/45 outline-none",
              "transition-all duration-150 ease-out",
              "hover:border-foreground/30 focus:border-foreground/60 focus:ring-2 focus:ring-foreground/5",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftElement && "pl-9",
              rightElement && "pr-12",
              error && "border-destructive/60 focus:border-destructive focus:ring-destructive/10",
              className
            )}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
