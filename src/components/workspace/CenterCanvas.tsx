"use client";

import React, { useState } from "react";
import { Play, Square, Terminal, Eye, FileCode, Sparkles } from "lucide-react";
import { AnthropicIcon, OpenAIIcon } from "@/components/ui/brand-icons";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PreviewPane } from "./PreviewPane";
import { TerminalPane } from "./TerminalPane";
import { AgentChatPane } from "./AgentChatPane";
import { ChangesPane } from "./ChangesPane";

export function CenterCanvas() {
  const {
    project,
    activeLane,
    activeTab,
    setActiveTab,
    toggleDevServer,
    services,
    diff,
    hostState,
  } = useWorkspace();

  const [agentView, setAgentView] = useState<"chat" | "pty">("chat");

  const isDevRunning = services.some(
    (s) => (s.lane_id === activeLane?.id || !s.lane_id) && s.is_active
  );

  const filesChanged = diff?.files_changed ?? 0;
  const isAgentLane = Boolean(activeLane && !activeLane.is_pair_lane);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      {/* Single Consolidated Sleek Header Bar (38px height) */}
      <header className="flex h-9.5 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-primary)] px-3.5 select-none">
        {/* Left: Active Lane, Branch, and Repository */}
        <div className="flex items-center gap-2 min-w-0">
          {activeLane && (
            <>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] font-mono text-[9px] font-bold ${
                  activeLane.is_pair_lane
                    ? "bg-[var(--wash)] text-[var(--foreground)]"
                    : activeLane.name.toLowerCase().includes("claude")
                    ? "bg-[var(--accent-claude-subtle)] text-[var(--accent-claude)] border border-[rgba(232,128,74,0.25)]"
                    : "bg-[var(--accent-codex-subtle)] text-[var(--accent-codex)] border border-[rgba(16,185,129,0.25)]"
                }`}
              >
                {activeLane.is_pair_lane ? (
                  "P"
                ) : activeLane.name.toLowerCase().includes("claude") ? (
                  <AnthropicIcon className="size-3 text-[var(--accent-claude)]" />
                ) : (
                  <OpenAIIcon className="size-3 text-[var(--accent-codex)]" />
                )}
              </span>
              <span className="font-semibold text-xs text-zinc-900 truncate">
                {activeLane.name}
              </span>
              <span className="rounded bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 shrink-0">
                {activeLane.branch}
              </span>
              <span className="hidden md:inline text-[11px] font-mono text-zinc-400 truncate">
                {project?.repo_full_name || project?.name}
              </span>
            </>
          )}
        </div>

        {/* Right: Tab Switcher & Run Dev Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Main Workspace Tabs */}
          <div className="flex items-center rounded-md bg-zinc-100 p-0.5 border border-zinc-200 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white text-zinc-900 font-medium shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Eye className="size-3" />
              <span>Preview</span>
            </button>

            {isAgentLane ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("terminal");
                    setAgentView("chat");
                  }}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    activeTab === "terminal" && agentView === "chat"
                      ? "bg-white text-zinc-900 font-medium shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Sparkles className="size-3 text-[var(--accent-claude)]" />
                  <span>Agent Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("terminal");
                    setAgentView("pty");
                  }}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    activeTab === "terminal" && agentView === "pty"
                      ? "bg-white text-zinc-900 font-medium shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Terminal className="size-3" />
                  <span>PTY</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                  activeTab === "terminal"
                    ? "bg-white text-zinc-900 font-medium shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Terminal className="size-3" />
                <span>Terminal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("changes")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                activeTab === "changes"
                  ? "bg-white text-zinc-900 font-medium shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <FileCode className="size-3" />
              <span>Changes</span>
              <span
                className={`font-mono text-[9px] px-1 rounded ${
                  filesChanged > 0
                    ? "bg-emerald-100 text-emerald-800 font-bold"
                    : "text-zinc-400"
                }`}
              >
                {filesChanged}
              </span>
            </button>
          </div>

          {/* Run Dev Server Action Button */}
          <button
            type="button"
            onClick={toggleDevServer}
            disabled={hostState === "asleep"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-xs font-medium transition-all cursor-pointer ${
              isDevRunning
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
            } disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs`}
          >
            {isDevRunning ? (
              <>
                <Square className="size-2.5 fill-current text-emerald-600" />
                <span>Running</span>
              </>
            ) : (
              <>
                <Play className="size-2.5 fill-current" />
                <span>Run dev</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Full-Height Main Tab View Canvas */}
      <main className="flex-1 overflow-hidden bg-white flex flex-col h-full w-full">
        {activeTab === "preview" && <PreviewPane />}
        {activeTab === "terminal" &&
          (isAgentLane ? (
            agentView === "chat" ? <AgentChatPane /> : <TerminalPane />
          ) : (
            <TerminalPane />
          ))}
        {activeTab === "changes" && <ChangesPane />}
      </main>
    </div>
  );
}
