"use client";

import React from "react";
import { Star, Lightbulb, ArrowRight, Layers } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FloatingOmnibar } from "./FloatingOmnibar";
import { StatusBar } from "./StatusBar";

export function PromptHub() {
  const { setMode, submitPrompt, project } = useWorkspace();

  const starterChips = [
    { text: "Set up this project for Congruence", harness: "Claude" },
    { text: "Explain to me how this repository works", harness: "Claude" },
    { text: "Find and fix a small bug", harness: "Codex" },
  ];

  return (
    <div className="flex h-full flex-1 flex-col justify-between overflow-hidden bg-[var(--background)]">
      {/* Top Bar with Mode Switcher */}
      <div className="flex h-11 items-center justify-between px-6 border-b border-[var(--border)]/40 bg-[var(--surface-sidebar)]/50">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            <strong className="text-[var(--foreground)] font-medium">
              {project?.repo_full_name || "New Workspace"}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMode("deck")}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-1 font-sans text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all"
        >
          <Layers className="size-3 text-[var(--accent-claude)]" />
          <span>Open Execution Deck</span>
          <ArrowRight className="size-3" />
        </button>
      </div>

      {/* Center Hero Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center max-w-3xl mx-auto w-full">
        {/* Superset Monospace Bracket Glyph */}
        <div className="mb-6 flex size-12 items-center justify-center font-mono text-2xl font-bold tracking-tighter text-[var(--foreground)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-primary)] shadow-sm">
          &#123;&lt; &gt;&#125;
        </div>

        {/* Central Question */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[var(--foreground)] mb-6">
          What should we build next?
        </h2>

        {/* Star on GitHub Badge */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-10 inline-flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)] px-4 py-1.5 rounded bg-[var(--surface-primary)]"
        >
          <span className="text-[var(--subtle-foreground)]">+</span>
          <Star className="size-3 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
          <span>congruence.dev</span>
          <span className="text-[var(--subtle-foreground)]">+</span>
        </a>

        {/* Starter Prompt Suggestion Chips */}
        <div className="w-full max-w-md space-y-2 mb-8 text-left">
          {starterChips.map((chip) => (
            <button
              key={chip.text}
              type="button"
              onClick={() =>
                submitPrompt(chip.text, chip.harness, "claude-3-7-sonnet", "Default effort")
              }
              className="group flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)]/80 px-3 py-2 text-xs text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-all"
            >
              <Lightbulb className="size-3.5 text-[var(--accent-amber)]/80 shrink-0 group-hover:text-[var(--accent-amber)] transition-colors" />
              <span className="truncate">{chip.text}</span>
              <span className="ml-auto font-mono text-[10px] text-[var(--subtle-foreground)] group-hover:text-[var(--accent-claude)]">
                {chip.harness} →
              </span>
            </button>
          ))}
        </div>

        {/* Floating Omnibar */}
        <FloatingOmnibar />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}
