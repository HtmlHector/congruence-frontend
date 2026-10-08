"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Square,
  Terminal,
  Eye,
  FileCode,
  FileCode2,
  FileJson,
  FileText,
  FileImage,
  File,
  Sparkles,
  PanelRight,
  Columns2,
  Rows2,
  X,
  ArrowLeftRight,
  ChevronDown,
  GripVertical,
  GripHorizontal,
  Plus,
  Zap,
  GitBranch,
  SquareTerminal,
  ArrowRightToLine,
  XSquare,
  Trash2,
  Copy,
} from "lucide-react";
import {
  AnthropicIcon,
  OpenAIIcon,
  ClaudeIcon,
  AntigravityIcon,
} from "@/components/ui/brand-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { useWorkspace, WorktreeChat } from "@/context/WorkspaceContext";
import { PreviewPane } from "./PreviewPane";
import { TerminalPane } from "./TerminalPane";
import { AgentChatPane } from "./AgentChatPane";
import { ChangesPane } from "./ChangesPane";
import { FileEditorPane } from "./FileEditorPane";

interface TabItemInfo {
  id: string;
  type: "chat" | "preview" | "changes" | "file";
  title: string;
  filePath?: string;
  chat?: WorktreeChat;
}

function renderTabIcon(tab: TabItemInfo) {
  if (tab.type === "preview") {
    return <Eye className="size-3.5 text-emerald-500 shrink-0" />;
  }
  if (tab.type === "changes") {
    return <FileCode className="size-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />;
  }
  if (tab.type === "file") {
    const raw = tab.filePath || tab.title || tab.id || "";
    const ext = raw.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "tsx":
      case "jsx":
        return <FileCode2 className="size-3.5 text-sky-500 dark:text-sky-400 shrink-0" />;
      case "ts":
      case "js":
      case "mjs":
      case "cjs":
        return <FileCode2 className="size-3.5 text-amber-500 dark:text-amber-400 shrink-0" />;
      case "json":
        return <FileJson className="size-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />;
      case "yaml":
      case "yml":
        return <FileText className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "md":
      case "mdx":
      case "markdown":
      case "txt":
        return <FileText className="size-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />;
      case "html":
      case "htm":
        return <FileCode className="size-3.5 text-rose-500 dark:text-rose-400 shrink-0" />;
      case "css":
      case "scss":
      case "less":
        return <FileCode className="size-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />;
      case "svg":
      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
      case "gif":
      case "ico":
        return <FileImage className="size-3.5 text-rose-500 dark:text-rose-400 shrink-0" />;
      case "sh":
      case "bash":
      case "zsh":
        return <Terminal className="size-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />;
      default:
        return <File className="size-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />;
    }
  }

  const isClaude = tab.chat?.harness === "Claude";
  const isCodex = tab.chat?.harness === "Codex";
  const isAntigravity = tab.chat?.harness === "Antigravity";

  if (isClaude) return <ClaudeIcon className="size-3.5 text-[var(--accent-claude)] shrink-0" />;
  if (isCodex) return <OpenAIIcon className="size-3.5 text-[var(--status-awake)] shrink-0" />;
  if (isAntigravity) return <AntigravityIcon className="size-3.5 text-indigo-500 shrink-0" />;

  return (
    <div className="flex items-center justify-center size-3.5 rounded-[3px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans text-[10px] font-semibold shrink-0">
      ›_
    </div>
  );
}

function PaneGroupView({
  groupId,
  showGlobalActions = false,
}: {
  groupId: "primary" | "secondary";
  showGlobalActions?: boolean;
}) {
  const {
    activeLane,
    chats,
    diff,
    services,
    hostState,
    actorSidebarCollapsed,
    toggleActorSidebar,
    toggleDevServer,
    splitState,
    openSplitWithTab,
    closeSplit,
    toggleSplitDirection,
    swapSplitPanes,
    paneGroups,
    setGroupActiveTab,
    setGroupAgentView,
    closeTabInGroup,
    closeTabsToTheRight,
    closeOtherTabs,
    closeAllTabs,
    reorderGroupTabs,
    moveTabBetweenGroups,
    createChatInGroup,
    addTabToGroup,
  } = useWorkspace();

  const group = paneGroups[groupId];
  const laneChats = chats.filter((c) => c.laneId === activeLane?.id);
  const filesChanged = diff?.files_changed ?? 0;
  const isDevRunning = services.some(
    (s) => (s.lane_id === activeLane?.id || !s.lane_id) && s.is_active
  );

  // Tab dragging state within this group's tab bar
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dropSide, setDropSide] = useState<"left" | "right" | null>(null);

  // Canvas edge drop zones state
  const [canvasDragZone, setCanvasDragZone] = useState<
    "left" | "right" | "top" | "bottom" | "center" | null
  >(null);

  const paneContainerRef = useRef<HTMLDivElement>(null);
  const tabStripRef = useRef<HTMLDivElement>(null);

  // Allow users to use their mouse scroll wheel to scroll horizontally between tabs
  useEffect(() => {
    const el = tabStripRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Resolve all tabs in this group strictly from group.tabIds
  const resolvedTabs: TabItemInfo[] = group.tabIds
    .map((tabId) => {
      if (tabId === "preview") {
        return { id: "preview", type: "preview" as const, title: "Preview" };
      }
      if (tabId === "changes") {
        return { id: "changes", type: "changes" as const, title: "Changes" };
      }
      if (tabId.startsWith("file:") || tabId.includes("/")) {
        const filePath = tabId.startsWith("file:") ? tabId.slice(5) : tabId;
        const fileName = filePath.split("/").pop() || filePath;
        return {
          id: tabId,
          type: "file" as const,
          title: fileName,
          filePath,
        };
      }
      const chat = chats.find((c) => c.id === tabId);
      if (chat) {
        return {
          id: chat.id,
          type: "chat" as const,
          title: chat.title || chat.harness,
          chat,
        };
      }
      return null;
    })
    .filter(Boolean) as TabItemInfo[];

  const activeTabItem =
    resolvedTabs.find((t) => t.id === group.activeTabId) || resolvedTabs[0];
  const activeChat = activeTabItem?.chat;
  const isAgentChat = Boolean(activeChat && activeChat.harness !== "Shell");

  // Tab bar drag handlers
  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tabId);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ tabId, sourceGroupId: groupId })
    );
  };

  const handleTabDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedTabId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const side = e.clientX < midX ? "left" : "right";
    setDragOverTabId(targetId);
    setDropSide(side);
  };

  const handleTabDragLeave = (_e: React.DragEvent, targetId: string) => {
    if (dragOverTabId === targetId) {
      setDragOverTabId(null);
      setDropSide(null);
    }
  };

  const handleTabDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    let sourceGroupId = groupId;
    let droppedTabId = draggedTabId;

    const jsonStr = e.dataTransfer.getData("application/json");
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.tabId) droppedTabId = parsed.tabId;
        if (parsed.sourceGroupId) sourceGroupId = parsed.sourceGroupId;
      } catch {}
    }

    if (!droppedTabId) {
      setDraggedTabId(null);
      setDragOverTabId(null);
      setDropSide(null);
      return;
    }

    if (sourceGroupId === groupId) {
      // Reorder within this group
      const filtered = group.tabIds.filter((id) => id !== droppedTabId);
      const targetIdx = filtered.indexOf(targetId);
      const insertIdx = dropSide === "right" ? targetIdx + 1 : targetIdx;
      const newOrder = [
        ...filtered.slice(0, insertIdx),
        droppedTabId,
        ...filtered.slice(insertIdx),
      ];
      reorderGroupTabs(groupId, newOrder);
    } else {
      // Move between groups
      const targetIdx = group.tabIds.indexOf(targetId);
      const insertIdx = dropSide === "right" ? targetIdx + 1 : targetIdx;
      moveTabBetweenGroups(sourceGroupId, groupId, droppedTabId, insertIdx);
    }

    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropSide(null);
  };

  const handleTabDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropSide(null);
  };

  // Canvas edge drop zones handlers
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!paneContainerRef.current) return;

    const rect = paneContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (x > 0.7) {
      setCanvasDragZone("right");
    } else if (x < 0.3) {
      setCanvasDragZone("left");
    } else if (y > 0.7) {
      setCanvasDragZone("bottom");
    } else if (y < 0.3) {
      setCanvasDragZone("top");
    } else {
      setCanvasDragZone("center");
    }
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (!paneContainerRef.current?.contains(e.relatedTarget as Node)) {
      setCanvasDragZone(null);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const zone = canvasDragZone;
    setCanvasDragZone(null);

    let droppedTabId = e.dataTransfer.getData("text/plain");
    const jsonStr = e.dataTransfer.getData("application/json");
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.tabId) droppedTabId = parsed.tabId;
      } catch {}
    }

    if (!droppedTabId) return;

    if (zone === "right") {
      openSplitWithTab(droppedTabId, "vertical", "right");
    } else if (zone === "left") {
      openSplitWithTab(droppedTabId, "vertical", "left");
    } else if (zone === "bottom") {
      openSplitWithTab(droppedTabId, "horizontal", "bottom");
    } else if (zone === "top") {
      openSplitWithTab(droppedTabId, "horizontal", "top");
    } else if (zone === "center") {
      addTabToGroup(groupId, droppedTabId);
      setGroupActiveTab(groupId, droppedTabId);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#0A0A0C] min-w-0">
      {/* Pane Group Tab Bar Header */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0B0B0E] pl-0 pr-2 select-none gap-2 overflow-hidden">
        {/* Left: Tab list and '+' button */}
        <div
          ref={tabStripRef}
          className="flex h-full items-center min-w-0 flex-1 overflow-x-auto scrollbar-none scroll-smooth"
        >
          {/* Render All Tabs In This Group */}
          <div className="flex h-full items-center min-w-0">
            {resolvedTabs.map((tab, tabIdx) => {
              const isActive = tab.id === group.activeTabId;
              const isDragging = draggedTabId === tab.id;
              const isOverLeft =
                dragOverTabId === tab.id &&
                dropSide === "left" &&
                draggedTabId !== tab.id;
              const isOverRight =
                dragOverTabId === tab.id &&
                dropSide === "right" &&
                draggedTabId !== tab.id;

              return (
                <ContextMenu key={tab.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      data-tab-id={tab.id}
                      draggable
                      onDragStart={(e) => handleTabDragStart(e, tab.id)}
                      onDragOver={(e) => handleTabDragOver(e, tab.id)}
                      onDragLeave={(e) => handleTabDragLeave(e, tab.id)}
                      onDrop={(e) => handleTabDrop(e, tab.id)}
                      onDragEnd={handleTabDragEnd}
                      onClick={() => setGroupActiveTab(groupId, tab.id)}
                      className={`group relative flex h-full items-center gap-2 px-3 border-r border-zinc-200 dark:border-[#222227] transition-all cursor-grab active:cursor-grabbing min-w-[105px] max-w-[175px] shrink-0 select-none ${
                        isDragging
                          ? "opacity-40 bg-zinc-200/60 dark:bg-zinc-800/60 border-dashed border-zinc-400 dark:border-zinc-600"
                          : isActive
                          ? "bg-white dark:bg-[#141418] text-zinc-950 dark:text-zinc-100 font-medium"
                          : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-[#16161c] hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                      title={tab.title}
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

                      {/* Tab Left Icon */}
                      <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                        {renderTabIcon(tab)}
                      </div>

                      {/* Tab Title */}
                      <span className="truncate text-xs font-normal tracking-tight pointer-events-none">
                        {tab.title}
                      </span>

                      {/* Status Badges */}
                      {tab.type === "preview" && isDevRunning && (
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 pointer-events-none" />
                      )}
                      {tab.type === "changes" && filesChanged > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-[3.5px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold pointer-events-none">
                          {filesChanged}
                        </span>
                      )}
                      {tab.chat?.state === "thinking" && (
                        <span
                          className="flex size-3.5 items-center justify-center text-purple-500 animate-spin shrink-0 pointer-events-none"
                          title="Agent thinking..."
                        >
                          <svg
                            className="size-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              strokeDasharray="32"
                              strokeDashoffset="12"
                            />
                          </svg>
                        </span>
                      )}
                      {tab.chat?.state === "working" && (
                        <span
                          className="flex size-3.5 items-center justify-center text-emerald-500 animate-pulse shrink-0 pointer-events-none"
                          title={`Running: ${tab.chat.activeTool || "tool"}`}
                        >
                          <Zap className="size-3 fill-current text-emerald-500" />
                        </span>
                      )}
                      {tab.chat?.state === "completed" && (
                        <span
                          className="flex size-3 items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 pointer-events-none"
                          title="Completed"
                        >
                          ✓
                        </span>
                      )}

                      {/* Close 'x' button */}
                      {resolvedTabs.length > 1 && (
                        <button
                          type="button"
                          draggable={false}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTabInGroup(groupId, tab.id);
                          }}
                          className={`ml-auto rounded-[3.5px] p-0.5 transition-all cursor-pointer ${
                            isActive
                              ? "opacity-60 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300"
                              : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                          }`}
                          title="Close tab"
                        >
                          <X className="size-3 stroke-[2.2]" />
                        </button>
                      )}
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-60 bg-white/95 dark:bg-[#121216]/95 border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] shadow-2xl p-1 text-xs">
                    <ContextMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{tab.title}</span>
                      <span className="text-[9px] uppercase px-1 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-[2px]">
                        {tab.type}
                      </span>
                    </ContextMenuLabel>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      onSelect={() => closeTabInGroup(groupId, tab.id)}
                      onClick={() => closeTabInGroup(groupId, tab.id)}
                      className="gap-2 cursor-pointer"
                    >
                      <X className="size-3.5 text-zinc-500" />
                      <span>Close Tab</span>
                      <ContextMenuShortcut>⌘W</ContextMenuShortcut>
                    </ContextMenuItem>

                    <ContextMenuItem
                      disabled={tabIdx >= resolvedTabs.length - 1}
                      onSelect={() => closeTabsToTheRight(groupId, tab.id)}
                      onClick={() => closeTabsToTheRight(groupId, tab.id)}
                      className="gap-2 cursor-pointer"
                    >
                      <ArrowRightToLine className="size-3.5 text-zinc-500" />
                      <span>Close Tabs to the Right</span>
                    </ContextMenuItem>

                    <ContextMenuItem
                      disabled={resolvedTabs.length <= 1}
                      onSelect={() => closeOtherTabs(groupId, tab.id)}
                      onClick={() => closeOtherTabs(groupId, tab.id)}
                      className="gap-2 cursor-pointer"
                    >
                      <XSquare className="size-3.5 text-zinc-500" />
                      <span>Close Other Tabs</span>
                    </ContextMenuItem>

                    <ContextMenuItem
                      onSelect={() => closeAllTabs(groupId)}
                      onClick={() => closeAllTabs(groupId)}
                      className="gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="size-3.5 shrink-0" />
                      <span>Close All Tabs</span>
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      onSelect={() => openSplitWithTab(tab.id, "vertical", "right")}
                      onClick={() => openSplitWithTab(tab.id, "vertical", "right")}
                      className="gap-2 cursor-pointer"
                    >
                      <Columns2 className="size-3.5 text-zinc-500" />
                      <span>Split Tab Right</span>
                      <ContextMenuShortcut>⌘\</ContextMenuShortcut>
                    </ContextMenuItem>

                    <ContextMenuItem
                      onSelect={() => openSplitWithTab(tab.id, "horizontal", "bottom")}
                      onClick={() => openSplitWithTab(tab.id, "horizontal", "bottom")}
                      className="gap-2 cursor-pointer"
                    >
                      <Rows2 className="size-3.5 text-zinc-500" />
                      <span>Split Tab Down</span>
                      <ContextMenuShortcut>⌘⇧\</ContextMenuShortcut>
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      onSelect={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(tab.title);
                          toast.success(`Copied "${tab.title}" to clipboard`);
                        }
                      }}
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(tab.title);
                          toast.success(`Copied "${tab.title}" to clipboard`);
                        }
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <Copy className="size-3.5 text-zinc-500" />
                      <span>Copy Tab Title</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>

          {/* '+' Button: Add tab directly to THIS group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-full px-2.5 items-center justify-center border-r border-zinc-200 dark:border-[#222227] text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer shrink-0"
                title="Add tab in this group"
              >
                <Plus className="size-3.5 stroke-[2]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] shadow-xl p-1 text-xs select-none"
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                New Tab in Group
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => createChatInGroup(groupId, "Claude")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ClaudeIcon className="size-3.5 text-[var(--accent-claude)]" />
                <span>Claude Code</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => createChatInGroup(groupId, "Codex")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <OpenAIIcon className="size-3.5 text-[var(--status-awake)]" />
                <span>OpenAI Codex</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => createChatInGroup(groupId, "Antigravity")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <AntigravityIcon className="size-3.5 text-indigo-500" />
                <span>Antigravity</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => createChatInGroup(groupId, "Shell")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <SquareTerminal className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                <span>Pair Shell</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />
              <DropdownMenuItem
                onClick={() => {
                  addTabToGroup(groupId, "preview");
                  setGroupActiveTab(groupId, "preview");
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Eye className="size-3.5 text-emerald-500" />
                <span>Preview</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  addTabToGroup(groupId, "changes");
                  setGroupActiveTab(groupId, "changes");
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <FileCode className="size-3.5 text-zinc-500" />
                <span>Changes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Actions on Pane Tab Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Chat / PTY switch */}
          {activeTabItem?.type === "chat" && isAgentChat && (
            <div className="flex items-center rounded-[3.5px] bg-zinc-200/60 dark:bg-zinc-800/80 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setGroupAgentView(groupId, "chat")}
                className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                  group.agentView === "chat" || !group.agentView
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setGroupAgentView(groupId, "pty")}
                className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                  group.agentView === "pty"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                PTY
              </button>
            </div>
          )}

          {/* Global Dev Server Action Button (when in single view or primary group) */}
          {showGlobalActions && (
            <button
              type="button"
              onClick={toggleDevServer}
              disabled={hostState === "asleep"}
              className={`flex items-center gap-1.5 rounded-[3.5px] border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                isDevRunning
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-xs"
                  : "bg-white dark:bg-[#16161b] border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs hover:text-zinc-900 dark:hover:text-white"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isDevRunning ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Square className="size-2.5 fill-current text-emerald-600 dark:text-emerald-400" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <Play className="size-2.5 fill-current text-zinc-500 dark:text-zinc-400" />
                  <span>Run dev</span>
                </>
              )}
            </button>
          )}

          {/* Split controls dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Split View"
                className={`p-1.5 rounded-[3.5px] border transition-colors cursor-pointer ${
                  splitState.isSplit
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Columns2 className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] shadow-xl p-1 text-xs select-none"
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                Split Layout
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  openSplitWithTab(
                    group.activeTabId === "preview" ? "changes" : "preview",
                    "vertical",
                    "right"
                  )
                }
                className="flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <Columns2 className="size-3.5 text-emerald-500" />
                  <span>Split Right</span>
                </div>
                <span className="text-[10px] font-sans font-medium text-zinc-400">⌘\</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  openSplitWithTab(group.activeTabId, "horizontal", "bottom")
                }
                className="flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <Rows2 className="size-3.5 text-purple-500" />
                  <span>Split Down</span>
                </div>
              </DropdownMenuItem>
              {splitState.isSplit && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />
                  <DropdownMenuItem
                    onClick={toggleSplitDirection}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <ArrowLeftRight className="size-3.5" />
                    <span>Toggle Vertical / Horizontal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={swapSplitPanes}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <ArrowLeftRight className="size-3.5" />
                    <span>Swap Panes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={closeSplit}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                  >
                    <X className="size-3.5" />
                    <span>Close Split View</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close Group (when split) */}
          {splitState.isSplit && (
            <button
              type="button"
              onClick={closeSplit}
              title="Close Pane Group"
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-[3.5px] cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}

          {/* Toggle Inspector (⌘J) */}
          {showGlobalActions && (
            <button
              type="button"
              onClick={toggleActorSidebar}
              title={
                actorSidebarCollapsed
                  ? "Expand Inspector (⌘J)"
                  : "Collapse Inspector (⌘J)"
              }
              className={`p-1.5 rounded-[3.5px] border transition-colors cursor-pointer ${
                !actorSidebarCollapsed
                  ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <PanelRight className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area in This Group */}
      <div
        ref={paneContainerRef}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
        className="relative flex-1 overflow-hidden min-h-0 min-w-0 flex flex-col h-full w-full"
      >
        {/* Dynamic Drag Drop Overlays */}
        {canvasDragZone && (
          <div className="absolute inset-0 z-50 pointer-events-none flex select-none">
            {canvasDragZone === "right" && (
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-500/15 dark:bg-emerald-500/25 border-2 border-emerald-500 flex items-center justify-center backdrop-blur-[2px] transition-all">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold shadow-lg rounded-[3.5px]">
                  <Columns2 className="size-4 text-emerald-400" />
                  <span>SPLIT RIGHT</span>
                </div>
              </div>
            )}
            {canvasDragZone === "left" && (
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-emerald-500/15 dark:bg-emerald-500/25 border-2 border-emerald-500 flex items-center justify-center backdrop-blur-[2px] transition-all">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold shadow-lg rounded-[3.5px]">
                  <Columns2 className="size-4 text-emerald-400" />
                  <span>SPLIT LEFT</span>
                </div>
              </div>
            )}
            {canvasDragZone === "bottom" && (
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-emerald-500/15 dark:bg-emerald-500/25 border-2 border-emerald-500 flex items-center justify-center backdrop-blur-[2px] transition-all">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold shadow-lg rounded-[3.5px]">
                  <Rows2 className="size-4 text-emerald-400" />
                  <span>SPLIT DOWN</span>
                </div>
              </div>
            )}
            {canvasDragZone === "top" && (
              <div className="absolute top-0 inset-x-0 h-1/2 bg-emerald-500/15 dark:bg-emerald-500/25 border-2 border-emerald-500 flex items-center justify-center backdrop-blur-[2px] transition-all">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold shadow-lg rounded-[3.5px]">
                  <Rows2 className="size-4 text-emerald-400" />
                  <span>SPLIT UP</span>
                </div>
              </div>
            )}
            {canvasDragZone === "center" && (
              <div className="absolute inset-4 bg-zinc-500/10 border border-dashed border-zinc-400 dark:border-zinc-600 flex items-center justify-center backdrop-blur-[1px]">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-semibold rounded-[3.5px]">
                  <span>OPEN IN THIS GROUP</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Component Render (all open tabs kept alive in background to prevent killing streams) */}
        {resolvedTabs.map((tab) => {
          const isActive = tab.id === activeTabItem?.id;
          const isAgent = tab.type === "chat" && tab.chat?.harness && tab.chat.harness !== "Shell";

          return (
            <div
              key={tab.id}
              className={`h-full w-full ${isActive ? "flex flex-col flex-1" : "hidden"}`}
              style={{ display: isActive ? undefined : "none" }}
            >
              {tab.type === "preview" && <PreviewPane />}
              {tab.type === "changes" && <ChangesPane />}
              {tab.type === "file" && (
                <FileEditorPane filePath={tab.filePath || tab.id.replace(/^file:/, "")} />
              )}
              {tab.type === "chat" &&
                (isAgent ? (
                  group.agentView === "pty" ? (
                    <TerminalPane />
                  ) : (
                    <AgentChatPane chatIdOverride={tab.chat?.id} />
                  )
                ) : (
                  <TerminalPane />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CenterCanvas() {
  const { splitState, setSplitRatio, openSplitWithTab, closeSplit } =
    useWorkspace();

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize handler
  const startResizing = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let ratio = 50;
      if (splitState.direction === "vertical") {
        ratio = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        ratio = ((e.clientY - rect.top) / rect.height) * 100;
      }
      setSplitRatio(Math.max(20, Math.min(80, ratio)));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing, splitState.direction, setSplitRatio]);

  // Keyboard shortcut ⌘\ for split view toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        if (splitState.isSplit) {
          closeSplit();
        } else {
          openSplitWithTab("preview", "vertical", "right");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [splitState.isSplit, closeSplit, openSplitWithTab]);

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-1 overflow-hidden bg-[var(--background)] min-w-0"
    >
      {splitState.isSplit ? (
        <div
          className={`flex h-full w-full overflow-hidden ${
            splitState.direction === "vertical" ? "flex-row" : "flex-col"
          }`}
        >
          {/* Primary Pane Group */}
          <div
            style={{
              [splitState.direction === "vertical" ? "width" : "height"]: `${splitState.ratio}%`,
            }}
            className="flex flex-col min-h-0 min-w-0 overflow-hidden"
          >
            <PaneGroupView groupId="primary" showGlobalActions={false} />
          </div>

          {/* Resizable Divider */}
          <div
            onPointerDown={startResizing}
            className={`group shrink-0 relative select-none z-20 transition-colors ${
              splitState.direction === "vertical"
                ? "w-1 hover:w-1.5 cursor-col-resize bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 active:bg-emerald-500"
                : "h-1 hover:h-1.5 cursor-row-resize bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 active:bg-emerald-500"
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {splitState.direction === "vertical" ? (
                <GripVertical className="size-3 text-white" />
              ) : (
                <GripHorizontal className="size-3 text-white" />
              )}
            </div>
          </div>

          {/* Secondary Pane Group */}
          <div
            style={{
              [splitState.direction === "vertical" ? "width" : "height"]: `${
                100 - splitState.ratio
              }%`,
            }}
            className="flex flex-col min-h-0 min-w-0 overflow-hidden"
          >
            <PaneGroupView groupId="secondary" showGlobalActions={true} />
          </div>
        </div>
      ) : (
        <PaneGroupView groupId="primary" showGlobalActions={true} />
      )}
    </div>
  );
}
