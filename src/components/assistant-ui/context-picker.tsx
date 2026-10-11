"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  GitBranch,
  FileCode,
  Search,
  Sparkles,
  Paperclip,
  Check,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";

interface ContextPickerProps {
  onInsertContext: (text: string) => void;
}

export function ContextPicker({ onInsertContext }: ContextPickerProps) {
  const { project, activeLane, diff } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch project files when popover opens
  useEffect(() => {
    if (!open) return;
    const projId = project?.id || project?.slug;
    if (!projId) return;

    setLoading(true);
    fetch(`/api/files?projectId=${encodeURIComponent(projId)}&laneId=${encodeURIComponent(activeLane?.id || "")}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const flatPaths: string[] = [];
        const extract = (nodes: any[]) => {
          for (const node of nodes) {
            if (node.type === "file") {
              flatPaths.push(node.path || node.name);
            } else if (node.children) {
              extract(node.children);
            }
          }
        };
        extract(Array.isArray(data) ? data : []);
        setFiles(flatPaths);
        setLoading(false);
      })
      .catch(() => {
        // Fallback common files
        setFiles([
          "src/middleware.ts",
          "src/app/layout.tsx",
          "src/app/page.tsx",
          "package.json",
          "design.md",
          "README.md",
        ]);
        setLoading(false);
      });
  }, [open, project?.id, project?.slug, activeLane?.id]);

  const filteredFiles = files
    .filter((f) => !search || f.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 12);

  const handleSelectFile = (filePath: string) => {
    onInsertContext(`@${filePath} `);
    setOpen(false);
    setSearch("");
  };

  const handleAttachDiff = () => {
    const summary = diff?.files_changed !== undefined
      ? `[Context: Git Diff (${diff.files_changed} files changed, +${diff.insertions} -${diff.deletions})]\n`
      : `[Context: Active Branch Git Diff on ${activeLane?.branch || "main"}]\n`;
    onInsertContext(summary);
    setOpen(false);
  };

  const handleAttachSpec = () => {
    onInsertContext(`@design.md `);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Quick Git Diff Chip */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAttachDiff}
        className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
        title="Attach active worktree git diff"
      >
        <GitBranch className="size-3 text-muted-foreground" />
        <span className="hidden sm:inline">Diff</span>
      </Button>

      {/* Quick Spec Chip */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAttachSpec}
        className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
        title="Attach design.md specification"
      >
        <FileText className="size-3 text-muted-foreground" />
        <span className="hidden sm:inline">Spec</span>
      </Button>

      {/* @ Mention Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground"
            title="Attach file (@mention)"
          >
            <span>@</span>
            <span className="text-[10px] hidden md:inline">File</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72 p-2 shadow-lg">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2 mb-2 px-1">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files to attach (@)..."
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="size-4 p-0 text-muted-foreground"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
            {loading ? (
              <p className="p-3 text-center text-xs text-muted-foreground">Scanning project files...</p>
            ) : filteredFiles.length === 0 ? (
              <p className="p-3 text-center text-xs text-muted-foreground">No matching files found.</p>
            ) : (
              filteredFiles.map((file) => {
                const base = file.split("/").pop() || file;
                const dir = file.includes("/") ? file.substring(0, file.lastIndexOf("/")) : "";
                return (
                  <button
                    key={file}
                    type="button"
                    onClick={() => handleSelectFile(file)}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium text-foreground">{base}</span>
                      {dir && <span className="truncate text-[10px] text-muted-foreground font-mono">{dir}</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
