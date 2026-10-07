"use client";

import React, { useState } from "react";
import { Play, Square, Terminal, Eye, FileCode, Sparkles, PanelRight } from "lucide-react";
import { AnthropicIcon, OpenAIIcon } from "@/components/ui/brand-icons";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PreviewPane } from "./PreviewPane";
import { TerminalPane } from "./TerminalPane";
import { AgentChatPane } from "./AgentChatPane";
import { ChangesPane } from "./ChangesPane";
import { AgentTabBar } from "./AgentTabBar";

export function CenterCanvas() {
  const {
    activeLane,
    activeTab,
    setActiveTab,
    toggleDevServer,
    services,
    diff,
    chats,
    activeChatId,
    hostState,
    actorSidebarCollapsed,
    toggleActorSidebar,
  } = useWorkspace();

  const [agentView, setAgentView] = useState<"chat" | "pty">("chat");

  const isDevRunning = services.some(
    (s) => (s.lane_id === activeLane?.id || !s.lane_id) && s.is_active
  );

  const filesChanged = diff?.files_changed ?? 0;
  const activeChat = chats.find((c) => c.id === activeChatId);
  const isAgentChatSession = Boolean(activeChat && activeChat.harness !== "Shell");

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      {/* Sleek IDE Header Bar with Flush Agent Tab Bar (36px height) */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0E0E12] pl-0 pr-2.5 sm:pr-3 select-none gap-3">
        {/* Left: Worktree Tabs (Chats & Terminals within active worktree) */}
        <AgentTabBar />

        {/* Right: Tab Switcher & Run Dev Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Main Workspace Tabs */}
          <div className="flex items-center rounded-none bg-zinc-100 p-0.5 border border-zinc-200 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white text-zinc-900 font-medium shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Eye className="size-3" />
              <span>Preview</span>
            </button>

            {isAgentChatSession ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("terminal");
                    setAgentView("chat");
                  }}
                  className={`flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs transition-colors cursor-pointer ${
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
                  className={`flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs transition-colors cursor-pointer ${
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
                className={`flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs transition-colors cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                activeTab === "changes"
                  ? "bg-white text-zinc-900 font-medium shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <FileCode className="size-3" />
              <span>Changes</span>
              <span
                className={`font-mono text-[9px] px-1 rounded-none ${
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
            className={`flex items-center gap-1.5 rounded-none border px-2.5 py-1 font-sans text-xs font-medium transition-all cursor-pointer ${
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

          {/* Toggle Right Inspector / Actor Sidebar */}
          <button
            type="button"
            onClick={toggleActorSidebar}
            title={actorSidebarCollapsed ? "Expand Inspector (⌘J)" : "Collapse Inspector (⌘J)"}
            className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
              !actorSidebarCollapsed
                ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <PanelRight className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Full-Height Main Tab View Canvas */}
      <main className="flex-1 overflow-hidden bg-white flex flex-col h-full w-full">
        {activeTab === "preview" && <PreviewPane />}
        {activeTab === "terminal" &&
          (isAgentChatSession ? (
            agentView === "chat" ? <AgentChatPane /> : <TerminalPane />
          ) : (
            <TerminalPane />
          ))}
        {activeTab === "changes" && <ChangesPane />}
      </main>
    </div>
  );
}
