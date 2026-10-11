"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Square,
  ChevronDown,
  Plus,
  Trash2,
  Terminal,
  Sparkles,
  RotateCcw,
  Star,
  Check,
  Zap,
  Code2,
  GitBranch,
  CornerDownLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/context/WorkspaceContext";

export interface CustomCommand {
  id: string;
  name: string;
  command: string;
  badge?: string;
  isPrimary?: boolean;
}

const DEFAULT_COMMANDS: CustomCommand[] = [
  { id: "dev", name: "pnpm dev", command: "pnpm dev", badge: "dev server", isPrimary: true },
  { id: "build", name: "pnpm build", command: "pnpm build", badge: "production" },
  { id: "test", name: "pnpm test", command: "pnpm test", badge: "test suite" },
  { id: "lint", name: "pnpm lint", command: "pnpm lint", badge: "typecheck" },
  { id: "git-status", name: "git status", command: "git status -sb", badge: "status" },
  { id: "git-diff", name: "git diff", command: "git diff --stat", badge: "diff" },
  { id: "git-log", name: "git log", command: "git log --oneline -n 5", badge: "log" },
];

export function CommandStation() {
  const {
    hostState,
    services,
    toggleDevServer,
    executeTerminalCommand,
    activeLane,
    setMode,
  } = useWorkspace();

  const isDevRunning = (services || []).some(
    (s) => (s.lane_id === activeLane?.id || !s.lane_id) && s.is_active
  );

  const [commands, setCommands] = useState<CustomCommand[]>(() => {
    if (typeof window === "undefined") return DEFAULT_COMMANDS;
    try {
      const saved = localStorage.getItem("congruence_custom_commands");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COMMANDS;
  });

  const [primaryCommandId, setPrimaryCommandId] = useState<string>(() => {
    if (typeof window === "undefined") return "dev";
    try {
      const saved = localStorage.getItem("congruence_primary_command_id");
      if (saved) return saved;
    } catch {}
    return "dev";
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCmd, setNewCmd] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("congruence_custom_commands", JSON.stringify(commands));
    } catch {}
  }, [commands]);

  useEffect(() => {
    try {
      localStorage.setItem("congruence_primary_command_id", primaryCommandId);
    } catch {}
  }, [primaryCommandId]);

  const activePrimary =
    commands.find((c) => c.id === primaryCommandId) || commands[0] || DEFAULT_COMMANDS[0];

  const handleRunCommand = (cmd: CustomCommand) => {
    if (cmd.id === "dev" || cmd.command === "pnpm dev") {
      toggleDevServer();
    } else {
      setMode("deck");
      executeTerminalCommand(cmd.command);
    }
  };

  const handleAddCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newCmd.trim()) return;

    const created: CustomCommand = {
      id: `custom-${Date.now()}`,
      name: newLabel.trim(),
      command: newCmd.trim(),
      badge: "custom",
    };

    setCommands((prev) => [...prev, created]);
    setNewLabel("");
    setNewCmd("");
    setIsAdding(false);
  };

  const handleDeleteCommand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommands((prev) => prev.filter((c) => c.id !== id));
    if (primaryCommandId === id) {
      setPrimaryCommandId("dev");
    }
  };

  const handleSetPrimary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrimaryCommandId(id);
  };

  const isPrimaryDev = activePrimary.id === "dev" || activePrimary.command === "pnpm dev";

  return (
    <div className="flex items-center select-none font-sans">
      <div className="flex items-center rounded-[4px] border border-zinc-200/90 dark:border-zinc-700/80 bg-white dark:bg-[#121216] shadow-2xs overflow-hidden h-6.5">
        {/* Left: Main Primary Execution Button */}
        <button
          type="button"
          onClick={() => handleRunCommand(activePrimary)}
          disabled={hostState === "asleep"}
          className={`flex items-center gap-1.5 px-2.5 h-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
            isPrimaryDev && isDevRunning
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-2xs"
              : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white active:scale-[0.98]"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          title={
            isPrimaryDev
              ? isDevRunning
                ? "Stop development server"
                : "Run dev server (pnpm dev)"
              : `Run '${activePrimary.command}' in terminal`
          }
        >
          {isPrimaryDev && isDevRunning ? (
            <>
              <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
              <Square className="size-2.5 fill-current text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Running: dev</span>
            </>
          ) : (
            <>
              <Play className="size-2.5 fill-current text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate max-w-[95px]">{activePrimary.name}</span>
            </>
          )}
        </button>

        {/* Separator */}
        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

        {/* Right: Command Station Menu Trigger */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center px-1.5 h-full text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Open Command Station"
            >
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-80 bg-white dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90 rounded-[8px] shadow-2xl p-0 text-xs select-none z-50 font-sans overflow-hidden"
          >
            {/* Clean Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50/70 dark:bg-[#16161c] border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Terminal className="size-3" />
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Command Station
                </span>
              </div>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono">
                <GitBranch className="size-2.5 text-emerald-500 shrink-0" />
                <span className="truncate max-w-[110px] font-medium">
                  {activeLane?.branch || "main"}
                </span>
              </div>
            </div>

            {/* Configured Command List */}
            <div className="p-1.5">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                Configured Commands
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-none px-0.5">
                {commands.map((cmd) => {
                  const isPrimary = cmd.id === primaryCommandId;
                  const isRunningDev =
                    (cmd.id === "dev" || cmd.command === "pnpm dev") && isDevRunning;

                  return (
                    <div
                      key={cmd.id}
                      onClick={() => {
                        handleRunCommand(cmd);
                        setMenuOpen(false);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-[5px] cursor-pointer text-xs transition-colors select-none ${
                        isRunningDev
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border ${
                            isRunningDev
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600"
                              : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/60 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
                          }`}
                        >
                          {isRunningDev ? (
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ) : (
                            <Play className="size-2.5 fill-current" />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {cmd.name}
                            </span>
                            {cmd.badge && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded-[2px] bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          {cmd.name !== cmd.command && (
                            <span className="text-[10px] font-mono text-zinc-400 truncate">
                              $ {cmd.command}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Pin as Primary */}
                        <button
                          type="button"
                          onClick={(e) => handleSetPrimary(cmd.id, e)}
                          title={isPrimary ? "Pinned as primary button" : "Pin to toolbar"}
                          className={`p-1 rounded-[3px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
                            isPrimary ? "text-amber-500 !opacity-100" : "text-zinc-400"
                          }`}
                        >
                          <Star className={`size-3 ${isPrimary ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>

                        {/* Delete (if custom) */}
                        {cmd.id.startsWith("custom-") && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCommand(cmd.id, e)}
                            title="Delete custom command"
                            className="p-1 rounded-[3px] hover:bg-rose-100 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Add Command Tray */}
            <div className="p-2 bg-zinc-50/60 dark:bg-[#101014] border-t border-zinc-200/80 dark:border-zinc-800/80">
              {isAdding ? (
                <form
                  onSubmit={handleAddCommand}
                  className="p-2 space-y-2 bg-white dark:bg-[#16161c] rounded-[5px] border border-zinc-200 dark:border-zinc-800 shadow-xs"
                >
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Add New Command
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Label (e.g. Docker Up)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-[3px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Command (e.g. docker compose up -d)"
                    value={newCmd}
                    onChange={(e) => setNewCmd(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono rounded-[3px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                  <div className="flex items-center justify-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-[3px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-[3px] shadow-2xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                    >
                      Save Command
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="flex w-full items-center justify-center gap-1.5 py-1.5 rounded-[4px] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5 stroke-[2.2]" />
                  <span>Add Custom Command…</span>
                </button>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
