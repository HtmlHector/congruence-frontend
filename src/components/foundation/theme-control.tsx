"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

import { useFoundationTheme, type ThemeMode } from "./theme-provider";

const options: Array<{
  id: ThemeMode;
  label: string;
  icon: typeof Sun;
}> = [
  { id: "light", label: "Light theme", icon: Sun },
  { id: "dark", label: "Dark theme", icon: Moon },
  { id: "system", label: "System theme", icon: Monitor },
];

export function ThemeControl({ className }: { className?: string }) {
  const { mode, setMode } = useFoundationTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-fd-md bg-foundation-sunken p-0.5 lg:flex-row",
        className,
      )}
    >
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-pressed={mode === id}
          title={label}
          onClick={() => setMode(id)}
          className={cn(
            "grid size-7 cursor-pointer place-items-center rounded-[5px] transition-colors duration-150 ease-fd focus-visible:foundation-focus",
            mode === id
              ? "bg-foundation-surface text-foundation-ink shadow-[inset_0_0_0_1px_var(--foundation-line)]"
              : "text-foundation-ink-tertiary hover:text-foundation-ink",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
