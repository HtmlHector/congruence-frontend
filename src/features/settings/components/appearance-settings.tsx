"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";

import {
  useFoundationTheme,
  type ThemeMode,
} from "@/components/foundation/theme-provider";
import { SettingsPage, SettingsPanel } from "@/features/settings/components/settings-page";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    mode: "light",
    label: "Light",
    description: "Always use the light palette.",
    icon: Sun,
  },
  {
    mode: "dark",
    label: "Dark",
    description: "Always use the dark palette.",
    icon: Moon,
  },
  {
    mode: "system",
    label: "System",
    description: "Follow this device's setting.",
    icon: Monitor,
  },
];

export function AppearanceSettings() {
  const { mode, setMode } = useFoundationTheme();

  return (
    <SettingsPage
      title="Appearance"
      description="Choose how this interface looks on this device."
    >
      <SettingsPanel
        title="Theme"
        description="This choice is saved in this browser. Other workspace members keep their own."
      >
        <div
          role="group"
          aria-label="Theme"
          className="grid gap-3 py-4 sm:grid-cols-3"
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = mode === option.mode;

            return (
              <button
                key={option.mode}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setMode(option.mode)}
                className={cn(
                  "group flex cursor-pointer flex-col rounded-fd-lg border p-1.5 text-left transition-colors duration-150 ease-fd focus-visible:foundation-focus",
                  isSelected
                    ? "border-foundation-ink/70 bg-foundation-sunken/40"
                    : "border-foundation-line bg-foundation-surface hover:border-foundation-line-strong hover:bg-foundation-sunken/20",
                )}
              >
                <ThemePreview mode={option.mode} />

                <span className="mt-2.5 flex items-center justify-between gap-2 px-1">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-foundation-ink">
                    <Icon
                      className="size-3.5 text-foundation-ink-secondary"
                      aria-hidden="true"
                    />
                    {option.label}
                  </span>
                  {isSelected ? (
                    <Check
                      className="size-3.5 text-foundation-ink"
                      aria-hidden="true"
                    />
                  ) : null}
                </span>

                <span className="mt-0.5 px-1 pb-1 text-[11px] leading-4 text-foundation-ink-tertiary">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </SettingsPanel>
    </SettingsPage>
  );
}

function ThemePreview({ mode }: { mode: ThemeMode }) {
  if (mode === "system") {
    return (
      <span
        aria-hidden="true"
        className="grid h-24 grid-cols-2 overflow-hidden rounded-fd-md border border-foundation-line"
      >
        <MiniPreview scope="light" />
        <MiniPreview scope="dark" className="border-l border-foundation-line" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="block h-24 overflow-hidden rounded-fd-md border border-foundation-line"
    >
      <MiniPreview scope={mode} />
    </span>
  );
}

function MiniPreview({
  scope,
  className,
}: {
  scope: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-full flex-col justify-center gap-1.5 bg-foundation-bg px-3",
        scope === "dark" ? "foundation-theme-dark" : "foundation-theme-light",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-foundation-ink" />
        <span className="h-1.5 w-10 rounded-full bg-foundation-ink/60" />
      </span>
      <span className="h-1.5 w-16 rounded-full bg-foundation-line-strong/70" />
      <span className="h-4 w-12 rounded-fd-xs bg-foundation-ink" />
    </span>
  );
}
