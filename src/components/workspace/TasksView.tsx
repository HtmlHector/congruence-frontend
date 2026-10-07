"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Bot,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  GitBranch,
  Filter,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "in_progress" | "in_review" | "done";
  assignedAgent: "claude-code" | "codex" | "pair-lane" | "unassigned";
  laneBranch: string;
  priority: "high" | "medium" | "low";
}

export function TasksView() {
  const { setMode, executeTerminalCommand, switchLane } = useWorkspace();
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "task-101",
      title: "Fix Next.js 15 route handler streaming error",
      description: "Ensure Server-Sent Events headers disable response buffering in production.",
      status: "in_progress",
      assignedAgent: "claude-code",
      laneBranch: "fix/route-streaming",
      priority: "high",
    },
    {
      id: "task-102",
      title: "Implement AES-256-GCM Vault Key Rotation",
      description: "Add scheduled PBKDF2 salt rotation and encrypted export for tenant keys.",
      status: "in_review",
      assignedAgent: "codex",
      laneBranch: "feature/vault-rotation",
      priority: "medium",
    },
    {
      id: "task-103",
      title: "Playwright E2E test coverage for terminal resizing",
      description: "Verify xterm.js fit addon maintains row/col sync over WebSocket PTY payload.",
      status: "backlog",
      assignedAgent: "claude-code",
      laneBranch: "test/pty-resize",
      priority: "medium",
    },
    {
      id: "task-104",
      title: "Remove unneeded console telemetry in local runner",
      description: "Clean up debug logs from WebSocket frame handler.",
      status: "done",
      assignedAgent: "pair-lane",
      laneBranch: "main",
      priority: "low",
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: "Added from task backlog",
      status: "backlog",
      assignedAgent: "claude-code",
      laneBranch: "feature/new-task",
      priority: "medium",
    };
    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setIsAdding(false);
  };

  const dispatchTaskToAgent = (task: TaskItem) => {
    setMode("deck");
    executeTerminalCommand(`claude --prompt "Task: ${task.title}. ${task.description}"`);
  };

  const columns = [
    { key: "backlog", label: "Backlog", count: tasks.filter((t) => t.status === "backlog").length },
    { key: "in_progress", label: "In Progress", count: tasks.filter((t) => t.status === "in_progress").length },
    { key: "in_review", label: "In Review", count: tasks.filter((t) => t.status === "in_review").length },
    { key: "done", label: "Completed", count: tasks.filter((t) => t.status === "done").length },
  ] as const;

  return (
    <div className="flex h-full w-full flex-col bg-[var(--surface-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-6 bg-[var(--surface-sidebar)]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--accent-claude)]">
            <CheckSquare className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              Task Backlog & Agent Dispatch
              <span className="rounded-full bg-[var(--surface-secondary)] px-2 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] border border-[var(--border)]">
                {tasks.length} items
              </span>
            </h1>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Assign issues to autonomous Claude Code or OpenAI Codex worktrees.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all"
        >
          <Plus className="size-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* New Task Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="border-b border-[var(--border)] bg-[var(--surface-secondary)] p-4 flex gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Describe what the agent should implement or fix..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:outline-none focus:border-[var(--accent-claude)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent-claude)] px-4 py-1.5 text-xs font-medium text-black hover:opacity-90 transition-opacity"
          >
            Create Task
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="rounded-lg bg-[var(--surface-tertiary)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Kanban Board View */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="grid grid-cols-4 gap-4 h-full min-w-[900px]">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-sidebar)]/60 overflow-hidden"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5 bg-[var(--surface-sidebar)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]">{col.label}</span>
                    <span className="rounded-full bg-[var(--surface-tertiary)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)]">
                      {col.count}
                    </span>
                  </div>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-[11px] text-[var(--subtle-foreground)]">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] p-3 transition-all hover:border-[var(--border-strong)] hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-medium text-[var(--foreground)] leading-snug">
                            {task.title}
                          </h4>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                          {task.description}
                        </p>

                        {/* Metadata Footer */}
                        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/50 pt-2 text-[10px]">
                          <div className="flex items-center gap-1.5 font-mono text-[var(--accent-claude)]">
                            <Bot className="size-3" />
                            <span>{task.assignedAgent}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => dispatchTaskToAgent(task)}
                            title="Dispatch to Agent Terminal"
                            className="flex items-center gap-1 rounded bg-[var(--surface-secondary)] px-2 py-0.5 text-[10px] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
                          >
                            <Play className="size-2.5 fill-current text-emerald-400" />
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
