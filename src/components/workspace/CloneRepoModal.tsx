"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Github,
  Loader2,
  Lock,
  Search,
  Star,
  Sparkles,
  ArrowRight,
  Terminal,
  RefreshCw,
  Copy,
  Plus,
  GitFork,
  ExternalLink,
  Check,
  FolderGit2,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api } from "@/lib/api";
import {
  useGithubStatusQuery,
  useGithubReposQuery,
  useConnectGithubPatMutation,
  useDisconnectGithubMutation,
} from "@/hooks/queries/useWorkspaceQueries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CloneRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RepositoryItem {
  id: string | number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  default_branch: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count?: number;
  updated_at?: string;
  isTemplate?: boolean;
  category: "personal" | "template" | "custom";
}

const STARTER_TEMPLATES: RepositoryItem[] = [
  {
    id: "tpl-meridian",
    name: "meridian-api",
    full_name: "congruence-ai/meridian-api",
    description: "Enterprise e-commerce microservices backend with FastAPI, Redis, and multi-tenant PostgreSQL.",
    html_url: "https://github.com/congruence-ai/meridian-api",
    clone_url: "https://github.com/congruence-ai/meridian-api.git",
    default_branch: "main",
    private: false,
    language: "Python",
    stargazers_count: 840,
    forks_count: 92,
    updated_at: "12m ago",
    isTemplate: true,
    category: "template",
  },
  {
    id: "tpl-nextjs",
    name: "next.js",
    full_name: "vercel/next.js",
    description: "The React Framework for the Web. Hybrid static & server rendering, TypeScript, and Turbopack.",
    html_url: "https://github.com/vercel/next.js",
    clone_url: "https://github.com/vercel/next.js.git",
    default_branch: "canary",
    private: false,
    language: "TypeScript",
    stargazers_count: 125400,
    forks_count: 26800,
    updated_at: "3m ago",
    isTemplate: true,
    category: "template",
  },
  {
    id: "tpl-shadcn",
    name: "ui",
    full_name: "shadcn/ui",
    description: "Accessible, customizable components built with Radix UI and Tailwind CSS.",
    html_url: "https://github.com/shadcn/ui",
    clone_url: "https://github.com/shadcn/ui.git",
    default_branch: "main",
    private: false,
    language: "TypeScript",
    stargazers_count: 78900,
    forks_count: 7300,
    updated_at: "18m ago",
    isTemplate: true,
    category: "template",
  },
  {
    id: "tpl-fastapi",
    name: "fastapi",
    full_name: "fastapi/fastapi",
    description: "High performance API framework for Python, ready for production AI & ML microservices.",
    html_url: "https://github.com/fastapi/fastapi",
    clone_url: "https://github.com/fastapi/fastapi.git",
    default_branch: "master",
    private: false,
    language: "Python",
    stargazers_count: 79500,
    forks_count: 6400,
    updated_at: "45m ago",
    isTemplate: true,
    category: "template",
  },
  {
    id: "tpl-anthropic",
    name: "anthropic-sdk-typescript",
    full_name: "anthropics/anthropic-sdk-typescript",
    description: "Official TypeScript and JavaScript client for Claude Code API with streaming & tool use.",
    html_url: "https://github.com/anthropics/anthropic-sdk-typescript",
    clone_url: "https://github.com/anthropics/anthropic-sdk-typescript.git",
    default_branch: "main",
    private: false,
    language: "TypeScript",
    stargazers_count: 3200,
    forks_count: 420,
    updated_at: "2h ago",
    isTemplate: true,
    category: "template",
  },
  {
    id: "tpl-prisma",
    name: "prisma",
    full_name: "prisma/prisma",
    description: "Next-generation ORM for Node.js & TypeScript with declarative schema modeling.",
    html_url: "https://github.com/prisma/prisma",
    clone_url: "https://github.com/prisma/prisma.git",
    default_branch: "main",
    private: false,
    language: "TypeScript",
    stargazers_count: 38400,
    forks_count: 1600,
    updated_at: "3h ago",
    isTemplate: true,
    category: "template",
  },
];

const LANGUAGE_DOT_COLORS: Record<string, string> = {
  TypeScript: "bg-sky-500",
  JavaScript: "bg-amber-400",
  Python: "bg-emerald-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  HTML: "bg-rose-500",
  CSS: "bg-purple-500",
};

export function CloneRepoModal({ open, onOpenChange }: CloneRepoModalProps) {
  const { setMode, switchProject, createProject } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterSource, setFilterSource] = useState<"all" | "personal" | "templates">("all");

  // GitHub Auth & Repos backed by TanStack Query
  const { data: ghStatus } = useGithubStatusQuery();
  const {
    data: rawRepos = [],
    isLoading: isReposLoading,
    isFetching: isReposFetching,
    refetch: refetchRepos,
  } = useGithubReposQuery({
    enabled: Boolean(ghStatus?.connected),
  });

  const connectPatMutation = useConnectGithubPatMutation();
  const disconnectGithubMutation = useDisconnectGithubMutation();

  const [isCloning, setIsCloning] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [showPatInput, setShowPatInput] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const personalRepos: RepositoryItem[] = useMemo(() => {
    if (!rawRepos || rawRepos.length === 0) return [];
    return rawRepos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      clone_url: r.clone_url || r.html_url,
      default_branch: r.default_branch || "main",
      private: r.private,
      language: (r as any).language || "TypeScript",
      stargazers_count: r.stargazers_count || 0,
      forks_count: (r as any).forks_count || 0,
      updated_at: "recently",
      isTemplate: false,
      category: "personal",
    }));
  }, [rawRepos]);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedIndex(0);
      setFilterSource("all");
      setShowPatInput(false);
      setPatToken("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleConnectGithub = async () => {
    try {
      const res = await api.getGithubConnectUrl();
      if (res.authorize_url) {
        window.location.href = res.authorize_url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate GitHub OAuth");
    }
  };

  const handleConnectPat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patToken.trim()) {
      toast.error("Please enter a valid GitHub Personal Access Token (e.g. ghp_...)");
      return;
    }
    try {
      const res = await connectPatMutation.mutateAsync(patToken.trim());
      setPatToken("");
      setShowPatInput(false);
      toast.success(`Connected GitHub account @${res.username}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect GitHub token");
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      await disconnectGithubMutation.mutateAsync();
      toast.success("Disconnected GitHub account");
    } catch (err: any) {
      toast.error("Failed to disconnect GitHub");
    }
  };

  // Filter and combine repos
  const allItems = useMemo(() => {
    let combined: RepositoryItem[] = [];

    if (ghStatus?.connected) {
      if (filterSource === "all") {
        combined = [...personalRepos, ...STARTER_TEMPLATES];
      } else if (filterSource === "personal") {
        combined = [...personalRepos];
      } else if (filterSource === "templates") {
        combined = [...STARTER_TEMPLATES];
      }
    } else {
      if (filterSource === "personal") {
        combined = [];
      } else {
        combined = [...STARTER_TEMPLATES];
      }
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length > 0) {
      const q = trimmedQuery.toLowerCase();
      const filtered = combined.filter(
        (item) =>
          item.full_name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.language && item.language.toLowerCase().includes(q))
      );

      // Check if user entered a custom Git URL
      const isUrl = trimmedQuery.startsWith("http") || trimmedQuery.includes("/") || trimmedQuery.endsWith(".git");
      if (isUrl && !filtered.some((i) => i.full_name.toLowerCase() === q)) {
        const repoName = trimmedQuery.split("/").pop()?.replace(/\.git$/, "") || "custom-repo";
        const customItem: RepositoryItem = {
          id: "custom-entry",
          name: repoName,
          full_name: trimmedQuery.replace(/^https?:\/\/github\.com\//, ""),
          description: `Direct repository at ${trimmedQuery}`,
          html_url: trimmedQuery.startsWith("http") ? trimmedQuery : `https://github.com/${trimmedQuery}`,
          clone_url: trimmedQuery.startsWith("http") ? trimmedQuery : `https://github.com/${trimmedQuery}.git`,
          default_branch: "main",
          private: false,
          language: "Git",
          stargazers_count: 0,
          category: "custom",
        };
        return [customItem, ...filtered];
      }

      return filtered;
    }

    return combined;
  }, [filterSource, personalRepos, searchQuery, ghStatus?.connected]);

  // Adjust selection bounds
  useEffect(() => {
    if (selectedIndex >= allItems.length) {
      setSelectedIndex(Math.max(0, allItems.length - 1));
    }
  }, [allItems.length, selectedIndex]);

  const selectedRepo: RepositoryItem | undefined = allItems[selectedIndex];

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === "Enter" && selectedRepo) {
      e.preventDefault();
      handleCloneSelected(selectedRepo);
    }
  };

  const handleCloneSelected = async (repo: RepositoryItem) => {
    if (!repo) return;
    setIsCloning(true);

    try {
      const cloneUrl = repo.clone_url || repo.html_url;
      const created = await createProject(repo.name, cloneUrl, repo.full_name);

      setIsCloning(false);
      onOpenChange(false);
      setMode("deck");
      if (created?.id) {
        await switchProject(created.id);
      }
      toast.success(`Project ${repo.full_name} opened.`);
    } catch (err: any) {
      setIsCloning(false);
      toast.error(err.message || "Failed to clone repository");
    }
  };

  const handleCopyCloneUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Clone URL copied");
  };

  const accountDisplay = ghStatus?.connected && ghStatus?.username
    ? ghStatus.username
    : "GitHub";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Soft, low-contrast backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 dark:bg-black/45 backdrop-blur-[1.5px] data-[state=open]:animate-dialog-overlay-in data-[state=closed]:animate-dialog-overlay-out" />
        
        <Dialog.Content
          onKeyDown={handleKeyDown}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-primary)] text-[var(--foreground)] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18),0_32px_72px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.06] dark:ring-white/[0.04] focus:outline-none data-[state=open]:animate-dialog-content-in data-[state=closed]:animate-dialog-content-out flex flex-col max-h-[80vh] overflow-hidden font-sans select-none"
        >
          {/* Top Integrated Controls: Account Selector + Search Omnibar */}
          <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-primary)] shrink-0">
            <div className="flex items-center gap-2">
              {/* Account / Source Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-9 min-w-[140px] max-w-[190px] px-3 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-secondary)]/40 hover:bg-[var(--surface-secondary)] text-[var(--foreground)] flex items-center justify-between gap-2.5 text-xs font-normal outline-none transition-colors cursor-pointer shrink-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Github className="size-3.5 text-[var(--foreground)] shrink-0" />
                      <span className="truncate text-xs font-normal">
                        {accountDisplay}
                      </span>
                    </div>
                    <ChevronDown className="size-3.5 text-[var(--muted-foreground)]/80 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56 rounded-[3.5px]">
                  {ghStatus?.connected ? (
                    <>
                      <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted-foreground)]">
                        GitHub Account
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setFilterSource("all")}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Github className="size-3.5" />
                          <span className="font-medium">@{ghStatus.username}</span>
                        </div>
                        {filterSource === "all" && <Check className="size-3.5 text-emerald-500" />}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted-foreground)]">
                        View Filter
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setFilterSource("personal")}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="size-3.5 text-[var(--muted-foreground)]" />
                          <span>Your Repositories</span>
                        </div>
                        {filterSource === "personal" && <Check className="size-3.5 text-emerald-500" />}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setFilterSource("templates")}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-3.5 text-amber-500" />
                          <span>Starter Kits</span>
                        </div>
                        {filterSource === "templates" && <Check className="size-3.5 text-amber-500" />}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => refetchRepos()}
                        disabled={isReposFetching}
                        className="flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <RefreshCw className={cn("size-3.5", isReposFetching && "animate-spin text-emerald-500")} />
                        <span>Sync Repositories</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={handleDisconnectGithub}
                        className="flex items-center gap-2 text-xs text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        <LogOut className="size-3.5" />
                        <span>Disconnect Account</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted-foreground)]">
                        Authentication
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={handleConnectGithub}
                        className="flex items-center gap-2 text-xs cursor-pointer font-medium"
                      >
                        <Github className="size-3.5" />
                        <span>Connect with GitHub</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowPatInput(true)}
                        className="flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <Terminal className="size-3.5" />
                        <span>Use Personal Access Token</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Omnibar Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="size-3.5 absolute left-3 text-[var(--muted-foreground)]/70 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="w-full h-9 pl-8 pr-7 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-secondary)]/40 hover:bg-[var(--surface-secondary)] focus:bg-[var(--surface-secondary)] focus:border-[var(--border-strong)] text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedIndex(0);
                    }}
                    className="absolute right-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* PAT Token Input Form if opened */}
            {showPatInput && !ghStatus?.connected && (
              <form onSubmit={handleConnectPat} className="mt-2.5 p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[3.5px] flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Paste GitHub Personal Access Token (ghp_...)"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  className="flex-1 h-7 px-2 bg-[var(--surface-primary)] border border-[var(--border)] rounded-[3.5px] text-xs text-[var(--foreground)] outline-none font-mono placeholder:text-[var(--subtle-foreground)]"
                />
                <button
                  type="submit"
                  disabled={connectPatMutation.isPending || !patToken.trim()}
                  className="h-7 px-3 bg-[var(--foreground)] text-[var(--background)] text-xs font-medium rounded-[3.5px] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {connectPatMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPatInput(false)}
                  className="h-7 px-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Repositories Stream Body */}
          <div
            ref={listRef}
            className="flex-1 min-h-[300px] max-h-[420px] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5"
          >
            {/* Unauthenticated State Notice banner (compact & non-blocking) */}
            {!ghStatus?.connected && !searchQuery.trim() && !showPatInput && (
              <div className="mb-2 p-2.5 rounded-[3.5px] bg-[var(--surface-secondary)]/50 border border-[var(--border)] text-left flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Github className="size-4 text-[var(--foreground)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)]">
                      Connect GitHub for private & public repositories
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleConnectGithub}
                    className="px-2.5 py-1 bg-[var(--foreground)] text-[var(--background)] text-[11px] font-medium rounded-[3.5px] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Authorize
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPatInput(true)}
                    className="px-2 py-1 text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-[3.5px] hover:bg-[var(--wash)] transition-colors cursor-pointer"
                  >
                    PAT
                  </button>
                </div>
              </div>
            )}

            {/* List Results */}
            {isReposLoading && personalRepos.length === 0 && Boolean(ghStatus?.connected) ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--muted-foreground)] my-auto space-y-2">
                <Loader2 className="size-4 text-[var(--foreground)] animate-spin" />
                <p className="text-xs text-[var(--muted-foreground)]">Fetching repositories…</p>
              </div>
            ) : allItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--muted-foreground)] my-auto space-y-1">
                <p className="text-xs font-medium text-[var(--foreground)]">No matching repositories found</p>
                <p className="text-[11px] text-[var(--subtle-foreground)]">
                  Type a repository name or paste a complete Git URL to clone directly.
                </p>
              </div>
            ) : (
              allItems.map((repo, idx) => {
                const isSelected = idx === selectedIndex;
                const dotColor = LANGUAGE_DOT_COLORS[repo.language || "TypeScript"] || "bg-zinc-400";
                const parts = repo.full_name.split("/");
                const owner = parts.length > 1 ? parts[0] : "";
                const repoName = parts.length > 1 ? parts.slice(1).join("/") : repo.name;

                return (
                  <div
                    key={repo.id}
                    data-index={idx}
                    onClick={() => setSelectedIndex(idx)}
                    onDoubleClick={() => handleCloneSelected(repo)}
                    className={cn(
                      "group relative flex items-center justify-between gap-3 px-3 py-2 cursor-pointer text-xs rounded-[3.5px] transition-colors outline-none",
                      isSelected
                        ? "bg-[var(--surface-secondary)] text-[var(--foreground)]"
                        : "text-[var(--foreground)] hover:bg-[var(--wash)]"
                    )}
                  >
                    {/* Left Details */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-[3.5px] text-[var(--muted-foreground)]/80">
                        {repo.isTemplate ? (
                          <Sparkles className="size-3.5 text-amber-500" />
                        ) : repo.private ? (
                          <Lock className="size-3.5 text-zinc-400" />
                        ) : repo.category === "custom" ? (
                          <Terminal className="size-3.5 text-purple-400" />
                        ) : (
                          <FolderGit2 className="size-3.5 text-[var(--muted-foreground)]/70" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate text-xs">
                            {owner && (
                              <span className="text-[var(--muted-foreground)]/70 font-normal mr-0.5">
                                {owner} /
                              </span>
                            )}
                            <span className="font-medium text-[var(--foreground)]">
                              {repoName}
                            </span>
                          </span>

                          {repo.isTemplate && (
                            <span className="shrink-0 px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-[2px]">
                              Starter
                            </span>
                          )}
                          {repo.private && (
                            <span className="shrink-0 px-1.5 py-0.2 bg-[var(--wash-strong)] border border-[var(--border-subtle)] text-[var(--subtle-foreground)] text-[10px] font-medium rounded-[2px]">
                              Private
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="truncate text-[11px] text-[var(--muted-foreground)]/70 mt-0.5">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Meta & Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                      {repo.language && (
                        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]/70">
                          <span className={cn("size-1.5 rounded-full", dotColor)} />
                          <span className="font-normal">{repo.language}</span>
                        </div>
                      )}

                      {repo.stargazers_count > 0 && (
                        <div className="hidden sm:flex items-center gap-1 text-[var(--muted-foreground)]/70">
                          <Star className="size-3 text-amber-500 fill-amber-500/20" />
                          <span>
                            {repo.stargazers_count > 999
                              ? `${(repo.stargazers_count / 1000).toFixed(1)}k`
                              : repo.stargazers_count}
                          </span>
                        </div>
                      )}

                      {/* Quick Actions (Reveal on Hover / Selection to prevent 10 stacked buttons) */}
                      <div className={cn(
                        "flex items-center gap-1 transition-opacity duration-100 ml-1",
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCloneUrl(repo.clone_url || repo.html_url);
                          }}
                          title="Copy Git URL"
                          className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors rounded-[3.5px] cursor-pointer"
                        >
                          <Copy className="size-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneSelected(repo);
                          }}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[3.5px] transition-all cursor-pointer shadow-xs",
                            isSelected
                              ? "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
                              : "bg-[var(--surface-secondary)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] border border-[var(--border)]"
                          )}
                        >
                          {isCloning && isSelected ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <>
                              <span>Open</span>
                              <ArrowRight className="size-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Minimal Keyboard Navigation Footer */}
          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-primary)] px-3.5 py-2 text-[11px] text-[var(--muted-foreground)] shrink-0 font-mono">
            <div>
              {allItems.length} {allItems.length === 1 ? "source" : "sources"}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--surface-secondary)] text-[var(--foreground)] rounded-[2px] text-[10px] border border-[var(--border)]">↑↓</kbd>
                <span>Navigate</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--surface-secondary)] text-[var(--foreground)] rounded-[2px] text-[10px] border border-[var(--border)]">↵</kbd>
                <span>Open</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--surface-secondary)] text-[var(--foreground)] rounded-[2px] text-[10px] border border-[var(--border)]">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
