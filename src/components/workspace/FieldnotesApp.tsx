"use client";

import React from "react";
import { Check } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function FieldnotesApp() {
  const { activeLane, toggleTaskCompletion } = useWorkspace();

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 sm:p-10 font-sans text-[var(--foreground)] bg-[var(--surface-primary)] select-none">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full border border-[var(--foreground)]" />
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-[var(--foreground)]">
              Fieldnotes
            </span>
          </div>
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
            Sample App
          </span>
        </div>

        <div className="pt-2">
          <span className="font-mono text-[11px] text-[var(--muted-foreground)] block mb-1">
            A LITTLE ROOM TO MAKE THINGS.
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[var(--foreground)]">
            Good ideas start here.
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] font-normal mt-1">
            A quiet workspace for your next small project.
          </p>
        </div>

        {/* Task List */}
        <div className="space-y-2.5 pt-4">
          {activeLane.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskCompletion(task.id)}
              className="group flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)]/50 px-3.5 py-2.5 text-xs transition-all hover:border-[var(--border-strong)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                    task.completed
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : "border-[var(--muted-foreground)] group-hover:border-[var(--foreground)]"
                  }`}
                >
                  {task.completed && <Check className="size-3 stroke-[3]" />}
                </div>
                <span
                  className={`${
                    task.completed
                      ? "text-[var(--muted-foreground)] line-through"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {task.text}
                </span>
              </div>

              {task.statusLabel && (
                <span className="font-mono text-[10px] text-[var(--subtle-foreground)]">
                  {task.statusLabel}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes Metadata */}
      <div className="flex items-center justify-between border-t border-[var(--border)]/60 pt-4 text-[10px] font-mono text-[var(--muted-foreground)]">
        <span>Keep it simple. Keep it moving.</span>
        <span>{String(activeLane.tasks.length).padStart(2, "0")} notes</span>
      </div>
    </div>
  );
}
