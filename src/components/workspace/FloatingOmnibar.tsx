"use client";

import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ArrowUp,
  Sparkles,
  Paperclip,
  GitBranch,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function FloatingOmnibar() {
  const { submitPrompt } = useWorkspace();
  const [promptText, setPromptText] = useState("");
  const [harness, setHarness] = useState("Claude");
  const [model, setModel] = useState("claude-3-7-sonnet");
  const [effort, setEffort] = useState("Default effort");
  const [isHarnessOpen, setIsHarnessOpen] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;
    submitPrompt(promptText.trim(), harness, model, effort);
    setPromptText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Container with top inset border highlight matching superset.sh */}
      <div className="relative rounded-[var(--radius-omnibar)] border border-[var(--border)] bg-[var(--surface-omnibar)] p-3 shadow-[var(--shadow-omnibar)] transition-all focus-within:border-[var(--border-strong)]">
        {/* Text Area */}
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Upgrade a dependency and fix what breaks..."
          rows={2}
          className="w-full resize-none bg-transparent font-sans text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none leading-relaxed"
        />

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/40 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attach context button */}
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] hover:bg-[var(--wash-strong)] hover:text-[var(--foreground)] transition-colors"
              title="Attach context or files"
            >
              <Plus className="size-3.5" />
            </button>

            {/* Harness selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHarnessOpen(!isHarnessOpen)}
                className="flex h-6 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-primary)] border border-[var(--border)] px-2 text-[11px] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
              >
                {/* Claude orange starburst glyph */}
                {harness === "Claude" && (
                  <span className="size-2 rounded-full bg-[var(--accent-claude)]" />
                )}
                {harness === "Codex" && (
                  <span className="size-2 rounded-full bg-[var(--accent-codex)]" />
                )}
                {harness === "OpenCode" && (
                  <span className="size-2 rounded-full bg-[var(--accent-opencode)]" />
                )}
                <span className="font-medium">{harness}</span>
                <ChevronDown className="size-2.5 text-[var(--muted-foreground)]" />
              </button>

              {isHarnessOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-36 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-dropdown)] z-30">
                  {["Claude", "Codex", "OpenCode", "Aider"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setHarness(item);
                        setIsHarnessOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[var(--foreground)] hover:bg-[var(--wash)]"
                    >
                      <span className="text-[11px]">{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Pill */}
            <div className="hidden sm:flex h-6 items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--surface-primary)] border border-[var(--border)] px-2 text-[11px] text-[var(--muted-foreground)]">
              <span>{model}</span>
              <ChevronDown className="size-2.5" />
            </div>

            {/* Effort Pill */}
            <div className="hidden md:flex h-6 items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--surface-primary)] border border-[var(--border)] px-2 text-[11px] text-[var(--muted-foreground)]">
              <span>{effort}</span>
              <ChevronDown className="size-2.5" />
            </div>
          </div>

          {/* Right Action Icons & Submit */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              className="hidden sm:flex size-6 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Worktree target"
            >
              <GitBranch className="size-3" />
            </button>

            <button
              type="button"
              className="hidden sm:flex size-6 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Attach files"
            >
              <Paperclip className="size-3" />
            </button>

            {/* Submit Arrow Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!promptText.trim()}
              className="flex size-6 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--primary-hover)] transition-all shadow-sm"
              title="Dispatch task"
            >
              <ArrowUp className="size-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
