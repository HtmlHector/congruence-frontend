"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Building2, Sparkles, Check, ArrowRight } from "lucide-react";

interface NewWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewWorkspaceModal({ open, onOpenChange }: NewWorkspaceModalProps) {
  const { createTenant, currentTenant } = useWorkspace();
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<"Free" | "Pro" | "Enterprise">("Pro");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createTenant(name.trim(), plan);
      onOpenChange(false);
      setName("");
    } catch (err) {
      console.error("Failed to create tenant:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold rounded-[3.5px]">
              <Building2 className="size-4" />
            </div>
            <DialogTitle className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Create New Workspace
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Each workspace provides dedicated isolated worktrees, agent runners, and microVM instances.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Labs, Meridian Corp, Stealth AI"
              required
              autoFocus
              className="h-9 w-full px-3 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181D] text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors rounded-[3.5px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Tier & Environment Plan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Free", "Pro", "Enterprise"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`flex flex-col items-center justify-center p-2.5 border text-xs transition-colors cursor-pointer rounded-[3.5px] ${
                    plan === p
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span>{p}</span>
                  <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    {p === "Free" ? "1 MicroVM" : p === "Pro" ? "4 MicroVMs" : "Unlimited"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-[3.5px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer rounded-[3.5px] disabled:opacity-50"
            >
              <span>Create Workspace</span>
              <ArrowRight className="size-3" />
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
