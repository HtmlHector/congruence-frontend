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
  Bot,
  Check,
} from "lucide-react";
import { AnthropicIcon, OpenAIIcon } from "@/components/ui/brand-icons";
import { useWorkspace } from "@/context/WorkspaceContext";

const HARNESS_MODELS: Record<string, string[]> = {
  Claude: [
    "Claude Sonnet 4.6 (Thinking)",
    "Claude Opus 4.6 (Thinking)",
    "Claude 3.7 Sonnet (Thinking)",
  ],
  Antigravity: [
    "Gemini 3.8 Flash (High)",
    "Gemini 3.1 Pro (High)",
    "Gemini 3.7 Flash (High)",
  ],
  Codex: [
    "o3-mini",
    "GPT-4o",
    "GPT-OSS 120B (Medium)",
  ],
};

export function FloatingOmnibar() {
  const { submitPrompt } = useWorkspace();
  const [promptText, setPromptText] = useState("");
  const [harness, setHarness] = useState("Claude");
  const [model, setModel] = useState("Claude Sonnet 4.6 (Thinking)");
  const [effort, setEffort] = useState("Default effort");
  const [isHarnessOpen, setIsHarnessOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);

  const handleSelectHarness = (newHarness: string) => {
    setHarness(newHarness);
    setIsHarnessOpen(false);
    const models = HARNESS_MODELS[newHarness] || HARNESS_MODELS.Claude;
    setModel(models[0]);
  };

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

  const currentModels = HARNESS_MODELS[harness] || HARNESS_MODELS.Claude;

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
                onClick={() => {
                  setIsHarnessOpen(!isHarnessOpen);
                  setIsModelOpen(false);
                }}
                className="flex h-6 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-primary)] border border-[var(--border)] px-2 text-[11px] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              >
                {harness === "Claude" && (
                  <AnthropicIcon className="size-3 text-[var(--accent-claude)]" />
                )}
                {harness === "Codex" && (
                  <OpenAIIcon className="size-3 text-[var(--accent-codex)]" />
                )}
                {harness === "Antigravity" && (
                  <Bot className="size-3 text-indigo-500" />
                )}
                <span className="font-medium">{harness}</span>
                <ChevronDown className="size-2.5 text-[var(--muted-foreground)]" />
              </button>

              {isHarnessOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-40 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-dropdown)] z-30">
                  {[
                    { id: "Claude", label: "Claude Code", icon: <AnthropicIcon className="size-3 text-[var(--accent-claude)]" /> },
                    { id: "Antigravity", label: "Antigravity", icon: <Bot className="size-3 text-indigo-500" /> },
                    { id: "Codex", label: "OpenAI Codex", icon: <OpenAIIcon className="size-3 text-[var(--accent-codex)]" /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectHarness(item.id)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer font-mono"
                    >
                      {item.icon}
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Pill & Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setIsModelOpen(!isModelOpen);
                  setIsHarnessOpen(false);
                }}
                className="flex h-6 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-primary)] border border-[var(--border)] px-2 text-[11px] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              >
                <span className="truncate max-w-[130px]">{model.replace(" (Thinking)", "")}</span>
                <ChevronDown className="size-2.5 text-[var(--muted-foreground)]" />
              </button>

              {isModelOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-56 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-dropdown)] z-30 font-mono">
                  <div className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-bold">
                    {harness} Models
                  </div>
                  {currentModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setModel(m);
                        setIsModelOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer"
                    >
                      <span className="text-[11px] truncate">{m}</span>
                      {model === m && <Check className="size-3 text-indigo-500 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
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
