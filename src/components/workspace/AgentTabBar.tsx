"use client";

import React, { useState } from "react";
import {
  Plus,
  GitBranch,
  X,
  SquareTerminal,
  Bot,
  Sparkles,
  Eye,
  FileCode,
  Zap,
} from "lucide-react";
import { ClaudeIcon, AnthropicIcon, OpenAIIcon, AntigravityIcon } from "@/components/ui/brand-icons";
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
    activeTab,
    setActiveTab,
    services,
    diff,
    tabOrders,
    setLaneTabOrder,
  } = useWorkspace();

  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [modalDefaultHarness, setModalDefaultHarness] = useState<"Claude" | "Codex" | "Pair">("Claude");

  // Drag and drop state
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dropSide, setDropSide] = useState<"left" | "right" | null>(null);

  const laneChats = chats.filter((c) => c.laneId === activeLaneId);
  const filesChanged = diff?.files_changed ?? 0;
  const isDevRunning = services.some(
    (s) => (s.lane_id === activeLaneId || !s.lane_id) && s.is_active
  );

  const handleCreateChatInLane = (harness: "Claude" | "Codex" | "Antigravity" | "Shell") => {
    if (!activeLaneId) return;
    const title = `${harness} Chat ${laneChats.length + 1}`;
    createChat(activeLaneId, harness, title);
    setActiveTab("terminal");
  };

  const openCustomModal = (harness: "Claude" | "Codex" | "Pair") => {
    setModalDefaultHarness(harness);
    setIsNewAgentModalOpen(true);
  };

  // Build unified ordered tab list
  const laneKey = activeLaneId || "default";
  const rawOrder = tabOrders[laneKey] || [];
  const chatIds = laneChats.map((c) => c.id);
  const allCurrentIds = [...chatIds, "preview", "changes"];

  const validOrder = rawOrder.filter((id) => allCurrentIds.includes(id));
  allCurrentIds.forEach((id) => {
    if (!validOrder.includes(id)) {
      if (id === "preview" || id === "changes") {
        validOrder.push(id);
      } else {
        const specialIdx = validOrder.findIndex((x) => x === "preview" || x === "changes");
        if (specialIdx !== -1) {
          validOrder.splice(specialIdx, 0, id);
        } else {
          validOrder.push(id);
        }
      }
    }
  });

  type TabItem =
    | { type: "chat"; id: string; chat: WorktreeChat }
    | { type: "preview"; id: "preview" }
    | { type: "changes"; id: "changes" };

  const orderedTabs: TabItem[] = validOrder
    .map((id) => {
      if (id === "preview") return { type: "preview" as const, id: "preview" };
      if (id === "changes") return { type: "changes" as const, id: "changes" };
      const chat = laneChats.find((c) => c.id === id);
      if (chat) return { type: "chat" as const, id: chat.id, chat };
      return null;
    })
    .filter(Boolean) as TabItem[];

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, id: string, tabItem?: TabItem) => {
    setDraggedTabId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    if (tabItem) {
      const payload = {
        id: tabItem.id,
        tabType: tabItem.type,
        chatId: tabItem.type === "chat" ? tabItem.chat.id : undefined,
      };
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedTabId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const side = e.clientX < midX ? "left" : "right";
    setDragOverTabId(targetId);
    setDropSide(side);
  };

  const handleDragLeave = (_e: React.DragEvent, targetId: string) => {
    if (dragOverTabId === targetId) {
      setDragOverTabId(null);
      setDropSide(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetId) {
      setDraggedTabId(null);
      setDragOverTabId(null);
      setDropSide(null);
      return;
    }

    const orderWithoutDragged = validOrder.filter((id) => id !== draggedTabId);
    const targetIdx = orderWithoutDragged.indexOf(targetId);
    const insertIdx = dropSide === "right" ? targetIdx + 1 : targetIdx;

    const newOrder = [
      ...orderWithoutDragged.slice(0, insertIdx),
      draggedTabId,
      ...orderWithoutDragged.slice(insertIdx),
    ];

    if (activeLaneId) {
      setLaneTabOrder(activeLaneId, newOrder);
    }

    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropSide(null);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropSide(null);
  };

  return (
    <>
      <div className="flex h-full items-center min-w-0 flex-1 overflow-x-auto scrollbar-none select-none">
        {/* Reorganizable & Draggable Tabs */}
        <div className="flex h-full items-center min-w-0">
          {orderedTabs.map((item, idx) => {
            const isDragging = draggedTabId === item.id;
            const isOverLeft = dragOverTabId === item.id && dropSide === "left" && draggedTabId !== item.id;
            const isOverRight = dragOverTabId === item.id && dropSide === "right" && draggedTabId !== item.id;

            if (item.type === "chat") {
              const { chat } = item;
              const isActive = chat.id === activeChatId && activeTab === "terminal";
              const isClaude = chat.harness === "Claude";
              const isCodex = chat.harness === "Codex";
              const isAntigravity = chat.harness === "Antigravity";
              const chatTitle = chat.title || `Chat ${idx + 1}`;

              return (
                <div
                  key={chat.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, chat.id, item)}
                  onDragOver={(e) => handleDragOver(e, chat.id)}
                  onDragLeave={(e) => handleDragLeave(e, chat.id)}
                  onDrop={(e) => handleDrop(e, chat.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    switchChat(chat.id);
                    setActiveTab("terminal");
                  }}
                  className={`group relative flex h-full items-center gap-2 px-3 border-r border-zinc-200 dark:border-[#222227] transition-all cursor-grab active:cursor-grabbing min-w-[105px] max-w-[175px] shrink-0 select-none ${
                    isDragging
                      ? "opacity-40 bg-zinc-200/60 dark:bg-zinc-800/60 border-dashed border-zinc-400 dark:border-zinc-600"
                      : isActive
                      ? "bg-white dark:bg-[#141418] text-zinc-950 dark:text-zinc-100 font-medium"
                      : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-[#16161c] hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title={`${chatTitle} (${chat.harness})`}
                >
                  {/* Drop Insert Indicators */}
                  {isOverLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 z-30 pointer-events-none" />
                  )}
                  {isOverRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-500 z-30 pointer-events-none" />
                  )}

                  {/* Active Top Accent Line */}
                  {isActive && !isDragging && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-zinc-950 dark:bg-zinc-100 pointer-events-none" />
                  )}

                  {/* Left Harness Icon */}
                  <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                    {isClaude ? (
                      <ClaudeIcon className="size-3.5 text-[var(--accent-claude)]" />
                    ) : isCodex ? (
                      <OpenAIIcon className="size-3.5 text-[var(--status-awake)]" />
                    ) : isAntigravity ? (
                      <AntigravityIcon className="size-3.5 text-indigo-500 dark:text-indigo-400" />
                    ) : (
                      <div className="flex items-center justify-center size-3.5 rounded-[3px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans text-[10px] font-semibold">
                        ›_
                      </div>
                    )}
                  </div>

                  {/* Tab Title */}
                  <span className="truncate text-xs font-normal tracking-tight pointer-events-none">
                    {chatTitle}
                  </span>

                  {/* Live Agent Execution State Badge */}
                  {chat.state === "thinking" && (
                    <span
                      className="flex size-3.5 items-center justify-center text-purple-500 animate-spin shrink-0 pointer-events-none"
                      title="Agent is thinking..."
                    >
                      <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                      </svg>
                    </span>
                  )}
                  {chat.state === "working" && (
                    <span
                      className="flex size-3.5 items-center justify-center text-emerald-500 animate-pulse shrink-0 pointer-events-none"
                      title={`Running tool: ${chat.activeTool || "in worktree"}`}
                    >
                      <Zap className="size-3 fill-current text-emerald-500" />
                    </span>
                  )}
                  {chat.state === "awaiting_input" && (
                    <span
                      className="flex size-4 items-center justify-center bg-amber-500 text-black font-semibold text-[9px] rounded-[3.5px] animate-bounce shrink-0 shadow-xs px-0.5 pointer-events-none"
                      title="Agent needs your input or confirmation"
                    >
                      ?
                    </span>
                  )}
                  {chat.state === "completed" && (
                    <span
                      className="flex size-3 items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 pointer-events-none"
                      title="Task completed"
                    >
                      ✓
                    </span>
                  )}
                  {chat.state === "error" && (
                    <span
                      className="flex size-3.5 items-center justify-center text-red-500 shrink-0 pointer-events-none"
                      title="Agent run failed — see the chat for details"
                    >
                      <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                    </span>
                  )}

                  {/* Close 'x' Button */}
                  {laneChats.length > 1 && (
                    <button
                      type="button"
                      draggable={false}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => closeChat(chat.id, e)}
                      className={`ml-auto rounded-[3.5px] p-0.5 transition-all cursor-pointer ${
                        isActive
                          ? "opacity-60 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300"
                          : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                      title="Close chat"
                    >
                      <X className="size-3 stroke-[2.2]" />
                    </button>
                  )}
                </div>
              );
            }

            if (item.type === "preview") {
              const isActive = activeTab === "preview";
              return (
                <div
                  key="preview"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "preview", item)}
                  onDragOver={(e) => handleDragOver(e, "preview")}
                  onDragLeave={(e) => handleDragLeave(e, "preview")}
                  onDrop={(e) => handleDrop(e, "preview")}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveTab("preview")}
                  className={`group relative flex h-full items-center gap-2 px-3 border-r border-zinc-200 dark:border-[#222227] transition-all cursor-grab active:cursor-grabbing min-w-[105px] shrink-0 select-none ${
                    isDragging
                      ? "opacity-40 bg-zinc-200/60 dark:bg-zinc-800/60 border-dashed border-zinc-400 dark:border-zinc-600"
                      : isActive
                      ? "bg-white dark:bg-[#141418] text-zinc-950 dark:text-zinc-100 font-medium"
                      : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-[#16161c] hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title="Live Web Preview"
                >
                  {/* Drop Insert Indicators */}
                  {isOverLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 z-30 pointer-events-none" />
                  )}
                  {isOverRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-500 z-30 pointer-events-none" />
                  )}

                  {/* Active Top Accent Line */}
                  {isActive && !isDragging && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-zinc-950 dark:bg-zinc-100 pointer-events-none" />
                  )}
                  <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                    <Eye className="size-3.5 text-emerald-500" />
                  </div>
                  <span className="truncate text-xs font-normal tracking-tight pointer-events-none">
                    Preview
                  </span>
                  {isDevRunning && (
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 pointer-events-none" />
                  )}
                </div>
              );
            }

            if (item.type === "changes") {
              const isActive = activeTab === "changes";
              return (
                <div
                  key="changes"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "changes", item)}
                  onDragOver={(e) => handleDragOver(e, "changes")}
                  onDragLeave={(e) => handleDragLeave(e, "changes")}
                  onDrop={(e) => handleDrop(e, "changes")}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveTab("changes")}
                  className={`group relative flex h-full items-center gap-2 px-3 border-r border-zinc-200 dark:border-[#222227] transition-all cursor-grab active:cursor-grabbing min-w-[105px] shrink-0 select-none ${
                    isDragging
                      ? "opacity-40 bg-zinc-200/60 dark:bg-zinc-800/60 border-dashed border-zinc-400 dark:border-zinc-600"
                      : isActive
                      ? "bg-white dark:bg-[#141418] text-zinc-950 dark:text-zinc-100 font-medium"
                      : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-[#16161c] hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title="Git Changes & Diff"
                >
                  {/* Drop Insert Indicators */}
                  {isOverLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 z-30 pointer-events-none" />
                  )}
                  {isOverRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-500 z-30 pointer-events-none" />
                  )}

                  {/* Active Top Accent Line */}
                  {isActive && !isDragging && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-zinc-950 dark:bg-zinc-100 pointer-events-none" />
                  )}
                  <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                    <FileCode className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <span className="truncate text-xs font-normal tracking-tight pointer-events-none">
                    Changes
                  </span>
                  {filesChanged > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-[3.5px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold pointer-events-none">
                      {filesChanged}
                    </span>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* "+" New Chat / Terminal Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-full px-2.5 items-center justify-center border-r border-zinc-200 dark:border-[#222227] text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer shrink-0"
              title="Add chat or task in this worktree"
            >
              <Plus className="size-3.5 stroke-[2]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-64 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-xl p-1 text-xs select-none rounded-[3.5px]"
          >
            <DropdownMenuLabel className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1">
              <span>New Chat in Worktree</span>
              <span className="text-[10px] font-sans font-medium text-emerald-600 dark:text-emerald-400">{activeLane?.branch || "main"}</span>
            </DropdownMenuLabel>

            {/* Claude Code Chat */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Claude")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-[3.5px] bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40">
                  <ClaudeIcon className="size-3.5 text-[var(--accent-claude)]" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Claude Code</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Anthropic CLI agent lane
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-sans text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Quick
              </span>
            </DropdownMenuItem>

            {/* OpenAI Codex Chat */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Codex")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-[3.5px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <OpenAIIcon className="size-3.5 text-[var(--status-awake)]" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">OpenAI Codex</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Reasoning & backend lane
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-sans text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Quick
              </span>
            </DropdownMenuItem>

            {/* Antigravity Chat */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Antigravity")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-[3.5px] bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
                  <AntigravityIcon className="size-3.5 text-indigo-500 dark:text-indigo-400" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Antigravity</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Google DeepMind agent
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-sans text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Quick
              </span>
            </DropdownMenuItem>

            {/* Terminal Shell */}
            <DropdownMenuItem
              onClick={() => handleCreateChatInLane("Shell")}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-[3.5px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <SquareTerminal className="size-3.5 text-zinc-700 dark:text-zinc-300" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Pair Shell</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Personal human worktree
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-sans text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + PTY
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

            {/* Custom Prompt Modal */}
            <DropdownMenuItem
              onClick={() => openCustomModal("Claude")}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--accent-claude)] font-medium"
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
