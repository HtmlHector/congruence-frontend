"use client";

import React, { useState } from "react";
import {
  Plus,
  GitBranch,
  X,
  SquareTerminal,
  Bot,
  Sparkles,
} from "lucide-react";
import { AnthropicIcon, OpenAIIcon } from "@/components/ui/brand-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspace, WorktreeChat } from "@/context/WorkspaceContext";
import { NewAgentModal } from "./NewAgentModal";

export function AgentTabBar() {
  const {
    activeLane,
    activeLaneId,
    chats,
    activeChatId,
    switchChat,
    closeChat,
    createChat,
  } = useWorkspace();

  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [modalDefaultHarness, setModalDefaultHarness] = useState<"Claude" | "Codex" | "Pair">("Claude");

  const laneChats = chats.filter((c) => c.laneId === activeLaneId);

  const handleCreateChatInLane = (harness: "Claude" | "Codex" | "Antigravity" | "Shell") => {
    if (!activeLaneId) return;
    const title = `${harness} Chat ${laneChats.length + 1}`;
    createChat(activeLaneId, harness, title);
  };

  const openCustomModal = (harness: "Claude" | "Codex" | "Pair") => {
    setModalDefaultHarness(harness);
    setIsNewAgentModalOpen(true);
  };

  return (
    <>
      <div className="flex h-full items-center min-w-0 flex-1 overflow-x-auto scrollbar-none select-none">
        {/* Worktree Branch Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-[#121216] text-[11px] font-mono text-zinc-600 dark:text-zinc-400 shrink-0 select-none">
          <GitBranch className="size-3 text-emerald-500 shrink-0" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
            {activeLane?.branch || "main"}
          </span>
        </div>

        {/* Chats / Tasks inside this Worktree */}
        <div className="flex h-full items-center min-w-0">
          {laneChats.map((chat: WorktreeChat, idx: number) => {
            const isActive = chat.id === activeChatId;
            const isClaude = chat.harness === "Claude";
            const isCodex = chat.harness === "Codex";
            const isAntigravity = chat.harness === "Antigravity";

            const chatTitle = chat.title || `Chat ${idx + 1}`;

            return (
              <div
                key={chat.id}
                onClick={() => switchChat(chat.id)}
                className={`group relative flex h-full items-center gap-2 px-3 border-r border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer min-w-[110px] max-w-[200px] shrink-0 ${
                  isActive
                    ? "bg-white dark:bg-[#15151a] text-zinc-900 dark:text-zinc-100 font-medium"
                    : "bg-[#f5f5f7]/80 dark:bg-[#0e0e12] text-zinc-600 dark:text-zinc-400 hover:bg-[#eaecef] dark:hover:bg-[#16161c] hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title={`${chatTitle} (${chat.harness})`}
              >
                {/* Active Bottom Solid Line Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-zinc-950 dark:bg-zinc-100" />
                )}

                {/* Left Harness Icon */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isClaude ? (
                    <div className="flex items-center gap-1">
                      <span className="flex size-3.5 items-center justify-center text-[var(--accent-claude)]">
                        <AnthropicIcon className="size-3" />
                      </span>
                    </div>
                  ) : isCodex ? (
                    <div className="flex items-center gap-1">
                      <span className="flex size-3.5 items-center justify-center text-[var(--status-awake)]">
                        <OpenAIIcon className="size-3" />
                      </span>
                    </div>
                  ) : isAntigravity ? (
                    <div className="flex items-center gap-1">
                      <span className="flex size-3.5 items-center justify-center text-indigo-400">
                        <Bot className="size-3" />
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center size-3.5 rounded-[2px] bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-[9px] font-bold">
                      <span className="text-[10px] leading-none">›_</span>
                    </div>
                  )}
                </div>

                {/* Tab Title */}
                <span className="truncate text-[12px] font-normal tracking-tight">
                  {chatTitle}
                </span>

                {/* Close 'x' Button */}
                {laneChats.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => closeChat(chat.id, e)}
                    className={`ml-auto rounded p-0.5 transition-opacity cursor-pointer ${
                      isActive
                        ? "opacity-60 hover:opacity-100 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        : "opacity-0 group-hover:opacity-60 hover:!opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                    title="Close chat"
                  >
                    <X className="size-3 stroke-[2.5]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* "+" New Chat in this Worktree Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-full px-2.5 items-center justify-center border-r border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
              title="Add chat or task in this worktree"
            >
              <Plus className="size-3.5 stroke-[2]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-64 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-xl p-1 text-xs select-none rounded-lg"
          >
            <DropdownMenuLabel className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1">
              <span>New Chat in Worktree</span>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">{activeLane?.branch || "main"}</span>
            </DropdownMenuLabel>

            {/* Claude Code Chat */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Claude")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40">
                  <AnthropicIcon className="size-3 text-[var(--accent-claude)]" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Claude Code Chat</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Anthropic agent in this worktree
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Chat
              </span>
            </DropdownMenuItem>

            {/* OpenAI Codex Chat */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Codex")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <OpenAIIcon className="size-3 text-[var(--status-awake)]" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">OpenAI Codex Chat</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Codex agent in this worktree
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Chat
              </span>
            </DropdownMenuItem>

            {/* Antigravity Chat */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Antigravity")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
                  <Bot className="size-3 text-indigo-400" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Antigravity Chat</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Google DeepMind agent
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Chat
              </span>
            </DropdownMenuItem>

            {/* Terminal Shell */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Shell")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <SquareTerminal className="size-3 text-zinc-700 dark:text-zinc-300" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Terminal Shell</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Interactive bash/zsh session
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + PTY
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

            {/* Custom Prompt Modal */}
            <DropdownMenuItem
              onClick={() => openCustomModal("Claude")}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--accent-claude)] font-medium"
            >
              <Sparkles className="size-3.5" />
              <span>New Worktree Branch...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* New Agent Modal */}
      <NewAgentModal
        open={isNewAgentModalOpen}
        onOpenChange={setIsNewAgentModalOpen}
        defaultHarness={modalDefaultHarness}
      />
    </>
  );
}
