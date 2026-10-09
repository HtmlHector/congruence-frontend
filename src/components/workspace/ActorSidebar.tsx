"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode2,
  FileJson,
  FileImage,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Check,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Shield,
  Clock,
  PanelRightClose,
  MoreVertical,
  Eye,
  Lock,
  Layers,
  Sparkles,
  FilePlus,
  FolderPlus,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  children?: FileNode[];
}

interface GitFileStatus {
  path: string;
  status: string;
}

interface GitCommitItem {
  hash: string;
  message: string;
  author: string;
  relativeTime: string;
}

interface GitData {
  branch: string;
  branches: string[];
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: GitFileStatus[];
  commits: GitCommitItem[];
  stats: {
    insertions: number;
    deletions: number;
    totalChanged: number;
  };
}

export function ActorSidebar() {
  const {
    actors,
    activeLane,
    projectId,
    project,
    grantControl,
    revokeControl,
    currentLease,
    toggleAllowWatchers,
    activityEvents,
    setIsIntegrationsOpen,
    actorSidebarCollapsed,
    toggleActorSidebar,
    openFileTab,
  } = useWorkspace();

  // Sidebar Mode Tab: "files" | "git" | "actors"
  const [activeMode, setActiveMode] = useState<"files" | "git" | "actors">("files");

  // Files State
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src", "src/components", "src/app"]));
  const [searchFileQuery, setSearchFileQuery] = useState("");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // New file / folder creation modals/inline
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [targetParentFolder, setTargetParentFolder] = useState("");

  // Git State
  const [gitData, setGitData] = useState<GitData | null>(null);
  const [isLoadingGit, setIsLoadingGit] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);

  // Actors State
  const [selectedActorId, setSelectedActorId] = useState<string>("");

  useEffect(() => {
    if (actors.length > 0 && !selectedActorId) {
      setSelectedActorId(actors[0].id);
    }
  }, [actors, selectedActorId]);

  // Load File Tree
  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const q = new URLSearchParams();
      if (projectId) q.set("projectId", projectId);
      if (activeLane?.id) q.set("laneId", activeLane.id);

      const res = await fetch(`/api/files?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tree) setFileTree(data.tree);
      }
    } catch (err) {
      console.warn("Failed to load file tree:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectId, activeLane?.id]);

  // Load Git Status
  const loadGit = useCallback(async () => {
    setIsLoadingGit(true);
    try {
      const q = new URLSearchParams();
      if (projectId) q.set("projectId", projectId);
      if (activeLane?.id) q.set("laneId", activeLane.id);

      const res = await fetch(`/api/git?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGitData(data);
      }
    } catch (err) {
      console.warn("Failed to load git status:", err);
    } finally {
      setIsLoadingGit(false);
    }
  }, [projectId, activeLane?.id]);

  useEffect(() => {
    loadFiles();
    loadGit();
  }, [loadFiles, loadGit]);

  // Read File Content
  const handleReadFile = async (path: string) => {
    setSelectedFilePath(path);
    setIsLoadingContent(true);
    try {
      const q = new URLSearchParams({ path });
      if (projectId) q.set("projectId", projectId);
      if (activeLane?.id) q.set("laneId", activeLane.id);

      const res = await fetch(`/api/files?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content || "");
      }
    } catch {
      toast.error(`Could not read file: ${path}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Toggle Folder Open
  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) next.delete(folderPath);
      else next.add(folderPath);
      return next;
    });
  };

  // Create File / Folder
  const handleCreateNewItem = async (type: "file" | "directory") => {
    if (!newItemName.trim()) {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      return;
    }

    const cleanPath = targetParentFolder
      ? `${targetParentFolder}/${newItemName.trim()}`
      : newItemName.trim();

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: cleanPath, type, content: "", projectId, laneId: activeLane?.id }),
      });
      if (res.ok) {
        toast.success(`Created ${type === "directory" ? "folder" : "file"}: ${cleanPath}`);
        setNewItemName("");
        setIsCreatingFile(false);
        setIsCreatingFolder(false);
        loadFiles();
        loadGit();
        if (type === "file") handleReadFile(cleanPath);
      } else {
        toast.error("Failed to create item");
      }
    } catch {
      toast.error("Failed to create item");
    }
  };

  // Delete File / Folder
  const handleDeleteItem = async (relPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${relPath}?`)) return;

    try {
      const q = new URLSearchParams({ path: relPath });
      if (projectId) q.set("projectId", projectId);
      if (activeLane?.id) q.set("laneId", activeLane.id);

      const res = await fetch(`/api/files?${q.toString()}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Deleted ${relPath}`);
        if (selectedFilePath === relPath) {
          setSelectedFilePath(null);
          setFileContent(null);
        }
        loadFiles();
        loadGit();
      }
    } catch {
      toast.error(`Could not delete ${relPath}`);
    }
  };

  // Git Actions
  const handleGitAction = async (action: "stage" | "unstage" | "discard", file?: string) => {
    try {
      const res = await fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, file, projectId, laneId: activeLane?.id }),
      });
      if (res.ok) {
        toast.success(action === "stage" ? `Staged ${file || "all changes"}` : `Unstaged ${file || "all"}`);
        loadGit();
      }
    } catch {
      toast.error(`Failed to ${action}`);
    }
  };

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) {
      toast.error("Please provide a commit message");
      return;
    }
    setIsCommitting(true);
    try {
      const res = await fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "commit", message: commitMessage.trim(), projectId, laneId: activeLane?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Changes committed successfully");
        setCommitMessage("");
        loadGit();
      } else {
        toast.error(data.error || "Git commit failed (stage changes first)");
      }
    } catch {
      toast.error("Failed to commit changes");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    try {
      const res = await fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", branch: branchName, projectId, laneId: activeLane?.id }),
      });
      if (res.ok) {
        toast.success(`Switched to branch: ${branchName}`);
        loadGit();
        loadFiles();
      } else {
        toast.error(`Could not switch branch`);
      }
    } catch {
      toast.error(`Could not switch branch`);
    }
  };

  // File Icon Helper
  const renderFileIcon = (fileName: string, isDir = false, isOpen = false) => {
    if (isDir) {
      return isOpen ? (
        <FolderOpen className="size-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
      ) : (
        <Folder className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
      );
    }
    const ext = fileName.split(".").pop()?.toLowerCase();
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
      case "md":
      case "mdx":
        return <FileText className="size-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />;
      case "svg":
      case "png":
      case "jpg":
      case "webp":
        return <FileImage className="size-3.5 text-rose-500 dark:text-rose-400 shrink-0" />;
      default:
        return <File className="size-3.5 text-zinc-400 shrink-0" />;
    }
  };

  // Recursive Tree Renderer
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isDir = node.type === "directory";
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFilePath === node.path;

      // Filter search
      if (searchFileQuery.trim()) {
        const query = searchFileQuery.toLowerCase();
        const matchesSelf = node.name.toLowerCase().includes(query);
        const matchesChild = isDir && JSON.stringify(node.children || []).toLowerCase().includes(query);
        if (!matchesSelf && !matchesChild) return null;
      }

      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => (isDir ? toggleFolder(node.path) : openFileTab(node.path))}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`group flex items-center justify-between h-6.5 pr-2 text-xs transition-all duration-100 cursor-pointer rounded-[3.5px] ${
              isSelected
                ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-950 dark:text-white font-medium shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100"
            }`}
            title={node.path}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isDir ? (
                <span className="text-zinc-400 dark:text-zinc-500 size-3.5 flex items-center justify-center shrink-0">
                  <ChevronRight
                    className={cn(
                      "size-3.5 transition-transform duration-150 ease-[var(--ease-out)]",
                      isExpanded && "rotate-90 text-zinc-600 dark:text-zinc-300"
                    )}
                  />
                </span>
              ) : (
                <span className="size-3.5 shrink-0" />
              )}
              {renderFileIcon(node.name, isDir, isExpanded)}
              <span className={`truncate text-xs ${isDir ? "font-medium text-zinc-900 dark:text-zinc-100" : "font-normal"}`}>
                {node.name}
              </span>
            </div>

            {/* Quick Actions on Hover */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity duration-150">
              {isDir && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTargetParentFolder(node.path);
                    setIsCreatingFile(true);
                  }}
                  title="New file in folder"
                  className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-[2px] transition-colors"
                >
                  <FilePlus className="size-3" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleDeleteItem(node.path, e)}
                title="Delete"
                className="p-0.5 hover:bg-rose-500/15 text-zinc-400 hover:text-rose-500 rounded-[2px] transition-colors"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>

          {isDir && isExpanded && node.children && renderTree(node.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-l border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0E0E12] text-xs select-none transition-[width,min-width,max-width,opacity] duration-200 ease-[var(--ease-out)] z-20 font-sans overflow-hidden",
        actorSidebarCollapsed
          ? "w-0 min-w-0 max-w-0 border-l-0 opacity-0 pointer-events-none"
          : "w-[280px] min-w-[280px] max-w-[280px] opacity-100"
      )}
    >
      {/* 1. TOP HEADER & THREE-WAY TAB SWITCHER */}
      <div className="h-10 px-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-[#0E0E12] shrink-0">
        <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-800/60 p-0.5 rounded-[3.5px] text-xs">
          <button
            type="button"
            onClick={() => setActiveMode("files")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] font-medium transition-all duration-140 ease-[var(--ease-out)] active:scale-[0.98] cursor-pointer",
              activeMode === "files"
                ? "bg-white dark:bg-[#18181D] text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Folder className="size-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Files</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode("git");
              loadGit();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] font-medium transition-all duration-140 ease-[var(--ease-out)] active:scale-[0.98] cursor-pointer",
              activeMode === "git"
                ? "bg-white dark:bg-[#18181D] text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <GitBranch className="size-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Git</span>
            {gitData && gitData.stats.totalChanged > 0 && (
              <span className="text-[10px] px-1 py-0.2 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold rounded-[2px]">
                {gitData.stats.totalChanged}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("actors")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] font-medium transition-all duration-140 ease-[var(--ease-out)] active:scale-[0.98] cursor-pointer",
              activeMode === "actors"
                ? "bg-white dark:bg-[#18181D] text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Users className="size-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Leases</span>
          </button>
        </div>

        <button
          type="button"
          onClick={toggleActorSidebar}
          title="Close sidebar (⌘J)"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-all duration-140 ease-[var(--ease-out)] active:scale-[0.96] cursor-pointer rounded-[3.5px]"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FILE EXPLORER & MANAGER                                          */}
      {/* ========================================================================= */}
      {activeMode === "files" && (
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0A0A0C]">
          {/* File Search & Creation Toolbar */}
          <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-1.5 bg-zinc-50/50 dark:bg-[#0E0E12]">
            <div className="relative flex-1 min-w-0">
              <Search className="size-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchFileQuery}
                onChange={(e) => setSearchFileQuery(e.target.value)}
                className="w-full h-7 pl-6.5 pr-2 bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 text-xs font-normal focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[3.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTargetParentFolder("");
                  setIsCreatingFile(true);
                }}
                title="New file"
                className="p-1.5 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-[3.5px] transition-colors cursor-pointer"
              >
                <FilePlus className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetParentFolder("");
                  setIsCreatingFolder(true);
                }}
                title="New folder"
                className="p-1.5 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-[3.5px] transition-colors cursor-pointer"
              >
                <FolderPlus className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={loadFiles}
                title="Refresh tree"
                className="p-1.5 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-[3.5px] transition-colors cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${isLoadingFiles ? "animate-spin text-emerald-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Inline New File / Folder Input */}
          {(isCreatingFile || isCreatingFolder) && (
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-amber-500/5 flex items-center gap-1.5">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {isCreatingFile ? "File:" : "Folder:"}
              </span>
              <input
                type="text"
                autoFocus
                placeholder={isCreatingFile ? "e.g. src/lib/auth.ts" : "e.g. src/components"}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNewItem(isCreatingFile ? "file" : "directory");
                  if (e.key === "Escape") {
                    setIsCreatingFile(false);
                    setIsCreatingFolder(false);
                  }
                }}
                className="flex-1 h-6.5 px-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded-[3.5px] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCreateNewItem(isCreatingFile ? "file" : "directory")}
                className="px-2.5 h-6.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-[3.5px] cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFile(false);
                  setIsCreatingFolder(false);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* File Tree List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {fileTree.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                {isLoadingFiles ? "Indexing project tree..." : "No files detected"}
              </div>
            ) : (
              renderTree(fileTree)
            )}
          </div>

          {/* Quick File Preview Footer (if file selected) */}
          {selectedFilePath && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-[#101014] text-xs shrink-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[190px]">
                  {selectedFilePath.split("/").pop()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilePath(null);
                    setFileContent(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer p-0.5"
                >
                  <X className="size-3" />
                </button>
              </div>
              <div className="text-[11px] text-zinc-400 truncate">{selectedFilePath}</div>
              {fileContent !== null && (
                <div className="max-h-32 overflow-y-auto p-2 bg-white dark:bg-[#0A0A0C] border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 whitespace-pre scrollbar-thin select-text rounded-[3.5px]">
                  {isLoadingContent ? "Loading content..." : fileContent.slice(0, 1000)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: GIT SOURCE CONTROL MANAGER                                        */}
      {/* ========================================================================= */}
      {activeMode === "git" && (
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0A0A0C]">
          {/* Git Branch Selector & Diff Stats */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0E0E12] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold truncate">
                <GitBranch className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{gitData?.branch || "main"}</span>
              </div>
              <button
                type="button"
                onClick={loadGit}
                title="Refresh Git status"
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-[3.5px] transition-colors cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${isLoadingGit ? "animate-spin text-emerald-500" : ""}`} />
              </button>
            </div>

            {/* Quick Diff Stats */}
            {gitData && (
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{gitData.stats.insertions}</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-{gitData.stats.deletions}</span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-zinc-500 dark:text-zinc-400">{gitData.stats.totalChanged} changed files</span>
              </div>
            )}
          </div>

          {/* Commit Box */}
          <form onSubmit={handleCommit} className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101015] space-y-2">
            <textarea
              rows={2}
              placeholder="Commit message (e.g. fix: update auth middleware)..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleCommit(e);
              }}
              className="w-full p-2 bg-zinc-50 dark:bg-[#0A0A0C] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 rounded-[3.5px] resize-none"
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={isCommitting || !commitMessage.trim()}
                className="flex-1 h-7 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold rounded-[3.5px] hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <GitCommit className="size-3.5" />
                <span>Commit</span>
              </button>
              <button
                type="button"
                onClick={() => handleGitAction("stage")}
                className="px-2.5 h-7 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-[3.5px] transition-colors cursor-pointer"
                title="Stage all modified files"
              >
                Stage All
              </button>
            </div>
          </form>

          {/* Changes Lists */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin">
            {/* Staged Changes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-medium px-1">
                <span>Staged Changes ({gitData?.staged.length || 0})</span>
                {gitData && gitData.staged.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleGitAction("unstage")}
                    className="hover:underline text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Unstage All
                  </button>
                )}
              </div>
              {gitData?.staged.length === 0 ? (
                <div className="text-xs text-zinc-400 px-1 py-1">No staged changes</div>
              ) : (
                gitData?.staged.map((f) => (
                  <div
                    key={f.path}
                    className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors"
                  >
                    <div onClick={() => openFileTab(f.path)} className="flex items-center gap-2 min-w-0 cursor-pointer">
                      <span className="text-emerald-500 font-semibold text-xs">{f.status}</span>
                      <span className="truncate text-zinc-800 dark:text-zinc-200 text-xs hover:underline">{f.path}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGitAction("unstage", f.path)}
                      title="Unstage file"
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Working Tree Changes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-medium px-1">
                <span>Changes ({((gitData?.unstaged.length || 0) + (gitData?.untracked.length || 0))})</span>
              </div>
              {[...(gitData?.unstaged || []), ...(gitData?.untracked || [])].length === 0 ? (
                <div className="text-xs text-zinc-400 px-1 py-1">Working tree clean</div>
              ) : (
                [...(gitData?.unstaged || []), ...(gitData?.untracked || [])].map((f) => (
                  <div
                    key={f.path}
                    className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors group"
                  >
                    <div onClick={() => openFileTab(f.path)} className="flex items-center gap-2 min-w-0 cursor-pointer">
                      <span
                        className={`font-semibold text-xs ${
                          f.status === "M" ? "text-amber-500" : f.status === "U" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {f.status}
                      </span>
                      <span className="truncate text-zinc-800 dark:text-zinc-200 text-xs hover:underline">{f.path}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleGitAction("stage", f.path)}
                        title="Stage file"
                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 rounded-[3.5px] cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGitAction("discard", f.path)}
                        title="Discard changes"
                        className="p-1 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 rounded-[3.5px] cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Commits Log */}
            <div className="space-y-1.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium px-1">
                Recent Commits
              </div>
              {gitData?.commits.map((c) => (
                <div key={c.hash} className="px-2 py-1.5 text-xs space-y-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-[3.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[160px]">
                      {c.message}
                    </span>
                    <span className="text-zinc-400 text-[10px]">{c.hash}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] flex items-center justify-between">
                    <span>{c.author}</span>
                    <span>{c.relativeTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: WORKSPACE ACTORS & WRITE LEASE MANAGEMENT                        */}
      {/* ========================================================================= */}
      {activeMode === "actors" && (
        <div className="flex flex-1 flex-col overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-[#0A0A0C] scrollbar-thin">
          {/* Active Actors */}
          <div className="p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Connected Agents & Peers</span>
              <button
                type="button"
                onClick={() => setIsIntegrationsOpen(true)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Keys ↗
              </button>
            </div>

            <div className="space-y-1.5">
              {actors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between p-2 rounded-[3.5px] bg-zinc-50 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-[3.5px] text-xs font-semibold ${
                        actor.actor_type === "human"
                          ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {actor.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {actor.display_name}
                      </div>
                      <div className="truncate text-[11px] text-zinc-400">{actor.role}</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                    {actor.presence}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lane Write Lease Controls */}
          <div className="p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Lane Write Lease</span>
              <Shield className="size-3.5 text-amber-500" />
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Current writer:{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                {currentLease?.id && !currentLease.is_revoked
                  ? `${actors.find((a) => a.id === currentLease.actor_id)?.display_name ?? "Unknown actor"} (granted write)`
                  : "Owner (default)"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 block">Target Actor</label>
              <select
                value={selectedActorId}
                onChange={(e) => setSelectedActorId(e.target.value)}
                className="w-full rounded-[3.5px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                {actors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.display_name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Watching is default. Write lease gives terminal command execution privileges on this worktree.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => selectedActorId && grantControl(selectedActorId)}
                className="flex-1 h-7.5 flex items-center justify-center rounded-[3.5px] bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Grant Write
              </button>
              <button
                type="button"
                onClick={revokeControl}
                className="h-7.5 px-3 flex items-center justify-center rounded-[3.5px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
              >
                Revoke
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Recent Activity</span>
              <Clock className="size-3.5 text-zinc-400" />
            </div>
            <div className="space-y-1.5">
              {activityEvents.map((e) => (
                <div key={e.id} className="text-xs space-y-0.5">
                  <div className="text-zinc-800 dark:text-zinc-200">{e.text}</div>
                  <div className="text-[10px] text-zinc-400">{e.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
