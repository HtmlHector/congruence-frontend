"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Github,
  Loader2,
  Lock,
  Globe,
  Search,
  Star,
  GitBranch,
  GitFork,
  ExternalLink,
  Check,
  Copy,
  FolderGit2,
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Code2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  KeyRound,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, GitHubRepoItem, GitHubStatusData } from "@/lib/api";
import {
  useGithubStatusQuery,
  useGithubReposQuery,
  useConnectGithubPatMutation,
  useDisconnectGithubMutation,
} from "@/hooks/queries/useWorkspaceQueries";
import { toast } from "sonner";

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
    description: "The React Framework for the Web. Hybrid static & server rendering, TypeScript support, and Turbopack.",
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
    description: "Beautifully designed components built with Radix UI and Tailwind CSS that you can copy and paste into your apps.",
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
    id: "tpl-tailwind",
    name: "tailwindcss",
    full_name: "tailwindlabs/tailwindcss",
    description: "A utility-first CSS framework for rapid UI development and zero-runtime stylesheet optimization.",
    html_url: "https://github.com/tailwindlabs/tailwindcss",
    clone_url: "https://github.com/tailwindlabs/tailwindcss.git",
    default_branch: "main",
    private: false,
    language: "Rust",
    stargazers_count: 83200,
    forks_count: 4200,
    updated_at: "1h ago",
    isTemplate: true,
    category: "template",
  },
  {
    id: "tpl-fastapi",
    name: "fastapi",
    full_name: "fastapi/fastapi",
    description: "FastAPI framework, high performance, easy to learn, fast to code, ready for production AI & ML APIs.",
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
    description: "Official TypeScript and JavaScript library for the Anthropic Claude API with streaming and tool calling.",
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
    description: "Next-generation ORM for Node.js & TypeScript with declarative schema modeling and type-safe migrations.",
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

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-emerald-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  HTML: "bg-rose-500",
  CSS: "bg-purple-500",
};

export function CloneRepoModal({ open, onOpenChange }: CloneRepoModalProps) {
  const { setMode, switchProject, createProject } = useWorkspace();
  const [activeCategory, setActiveCategory] = useState<"all" | "personal" | "templates">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // GitHub Auth & Repos backed by TanStack Query & LocalStorage sync persister
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
  const [copiedUrl, setCopiedUrl] = useState(false);
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

  const isInitialLoading = Boolean(ghStatus?.connected) && isReposLoading && personalRepos.length === 0;

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedIndex(0);
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
      toast.error("Please enter a valid GitHub token (e.g. ghp_... or github_pat_...)");
      return;
    }
    try {
      const res = await connectPatMutation.mutateAsync(patToken.trim());
      setPatToken("");
      setShowPatInput(false);
      toast.success(`Connected GitHub account @${res.username}`);
      setActiveCategory("personal");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect GitHub Personal Access Token");
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

  // Combine repos based on category and search query
  const allItems = useMemo(() => {
    let combined: RepositoryItem[] = [];

    if (!ghStatus?.connected && activeCategory !== "templates" && searchQuery.trim().length === 0) {
      return [];
    }

    if (activeCategory === "all") {
      combined = ghStatus?.connected ? [...personalRepos, ...STARTER_TEMPLATES] : [...STARTER_TEMPLATES];
    } else if (activeCategory === "personal") {
      combined = [...personalRepos];
    } else if (activeCategory === "templates") {
      combined = [...STARTER_TEMPLATES];
    }

    // Check if user entered a custom Git URL
    const isUrl = searchQuery.trim().startsWith("http") || searchQuery.trim().includes("/");
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const filtered = combined.filter(
        (item) =>
          item.full_name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.language && item.language.toLowerCase().includes(q))
      );

      // If typed query looks like a custom repo URL or owner/repo not yet matched
      if (isUrl && !filtered.some((i) => i.full_name.toLowerCase() === q)) {
        const repoName = searchQuery.trim().split("/").pop()?.replace(/\.git$/, "") || "custom-repo";
        const customItem: RepositoryItem = {
          id: "custom-entry",
          name: repoName,
          full_name: searchQuery.trim().replace(/^https?:\/\/github\.com\//, ""),
          description: `Direct Git repository at ${searchQuery.trim()}`,
          html_url: searchQuery.trim().startsWith("http")
            ? searchQuery.trim()
            : `https://github.com/${searchQuery.trim()}`,
          clone_url: searchQuery.trim().startsWith("http")
            ? searchQuery.trim()
            : `https://github.com/${searchQuery.trim()}.git`,
          default_branch: "main",
          private: false,
          language: "Git",
          stargazers_count: 1,
          category: "custom",
        };
        return [customItem, ...filtered];
      }

      return filtered;
    }

    return combined;
  }, [activeCategory, personalRepos, searchQuery]);

  // Adjust selection bounds
  useEffect(() => {
    if (selectedIndex >= allItems.length) {
      setSelectedIndex(Math.max(0, allItems.length - 1));
    }
  }, [allItems.length, selectedIndex]);

  const selectedRepo: RepositoryItem | undefined = allItems[selectedIndex];

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
      toast.success(`Project ${repo.full_name} loaded into workspace.`);
    } catch (err: any) {
      setIsCloning(false);
      toast.error(err.message || "Failed to clone repository");
    }
  };

  const handleCopyCloneUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success("Clone URL copied to clipboard");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          onKeyDown={handleKeyDown}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-[3.5px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E12] shadow-2xl focus:outline-none animate-in zoom-in-95 flex flex-col max-h-[85vh] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans"
        >
          {/* Search Omnibar Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E12] px-4 py-3.5 gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Search className="size-4.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search repositories, starter kits, or paste a Git URL..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100 outline-none border-none ring-0 font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedIndex(0);
                  }}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Header Right: Category Switcher + Account + Close */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Category Segmented Tabs */}
              <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-[3.5px] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 transition-all rounded-[3.5px] font-medium cursor-pointer ${
                    activeCategory === "all"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("personal");
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 transition-all rounded-[3.5px] font-medium cursor-pointer ${
                    activeCategory === "personal"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("templates");
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 transition-all rounded-[3.5px] font-medium cursor-pointer ${
                    activeCategory === "templates"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  Templates
                </button>
              </div>

              {/* GitHub Connected Badge */}
              {ghStatus?.connected ? (
                <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 rounded-[3.5px]">
                  <Github className="size-3.5 text-zinc-500" />
                  <span className="font-medium">@{ghStatus.username}</span>
                  <button
                    type="button"
                    onClick={handleDisconnectGithub}
                    title="Disconnect GitHub"
                    className="text-zinc-400 hover:text-rose-500 ml-1 p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGithub}
                  className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer rounded-[3.5px]"
                >
                  <Github className="size-3.5" />
                  <span>Connect GitHub</span>
                </button>
              )}

              {/* Sync Button */}
              {ghStatus?.connected && (
                <button
                  type="button"
                  onClick={() => refetchRepos()}
                  title="Sync Repositories"
                  disabled={isReposFetching}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded-[3.5px] disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${isReposFetching ? "animate-spin text-emerald-500" : ""}`} />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                title="Close"
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded-[3.5px]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Repository List Body */}
          <div
            ref={listRef}
            className="flex-1 min-h-[400px] max-h-[500px] overflow-y-auto scrollbar-thin bg-white dark:bg-[#0A0A0C] p-2 space-y-1 flex flex-col"
          >
            {!ghStatus?.connected && activeCategory !== "templates" && searchQuery.trim().length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center max-w-sm mx-auto my-auto">
                <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 mb-4 border border-zinc-200 dark:border-zinc-700">
                  <Github className="size-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Connect your GitHub account
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5 leading-relaxed">
                  Sign in to browse and import your personal and organization repositories into Congruence.
                </p>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleConnectGithub}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold rounded-[3.5px] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  >
                    <Github className="size-4" />
                    <span>Connect with GitHub</span>
                  </button>

                  {!showPatInput ? (
                    <button
                      type="button"
                      onClick={() => setShowPatInput(true)}
                      className="w-full py-1.5 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Use Personal Access Token
                    </button>
                  ) : (
                    <form onSubmit={handleConnectPat} className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-[#121218] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] text-left">
                      <label className="text-xs text-zinc-600 dark:text-zinc-400">
                        GitHub Token (<span className="text-zinc-900 dark:text-zinc-200 font-mono text-[11px]">ghp_...</span>)
                      </label>
                      <input
                        type="password"
                        placeholder="Paste your GitHub token..."
                        value={patToken}
                        onChange={(e) => setPatToken(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[3.5px] text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-500"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="submit"
                          disabled={connectPatMutation.isPending || !patToken.trim()}
                          className="flex-1 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-[3.5px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {connectPatMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                          <span>{connectPatMutation.isPending ? "Connecting..." : "Save Token"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPatInput(false);
                            setPatToken("");
                          }}
                          className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : isInitialLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 my-auto">
                <Loader2 className="size-5 text-zinc-400 animate-spin mb-2" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Loading repositories...</p>
              </div>
            ) : allItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 my-auto">
                <FolderGit2 className="size-8 text-zinc-300 dark:text-zinc-700 mb-2 stroke-1" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No repositories found</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  Try searching with another keyword or paste a Git clone URL.
                </p>
              </div>
            ) : (
              allItems.map((repo, idx) => {
                const isSelected = idx === selectedIndex;
                const dotColor = LANGUAGE_COLORS[repo.language || "TypeScript"] || "bg-zinc-400";
                const parts = repo.full_name.split("/");
                const owner = parts.length > 1 ? parts[0] : "";
                const repoName = parts.length > 1 ? parts.slice(1).join("/") : repo.name;

                return (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedIndex(idx)}
                    onDoubleClick={() => handleCloneSelected(repo)}
                    className={`group flex items-center justify-between gap-3.5 px-3 py-2.5 cursor-pointer text-xs transition-all duration-100 rounded-[3.5px] border ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-950 dark:text-white border-zinc-200 dark:border-zinc-700/80 shadow-xs"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-transparent"
                    }`}
                  >
                    {/* Left: Icon + Owner / Repo Name + Description */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-[3.5px] border border-zinc-200 dark:border-zinc-800 ${
                          repo.isTemplate
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : repo.category === "custom"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : repo.private
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {repo.isTemplate ? (
                          <Sparkles className="size-3.5" />
                        ) : repo.private ? (
                          <Lock className="size-3.5" />
                        ) : repo.category === "custom" ? (
                          <Terminal className="size-3.5" />
                        ) : (
                          <FolderGit2 className="size-3.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate text-xs">
                            {owner && (
                              <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-1">
                                {owner} /
                              </span>
                            )}
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {repoName}
                            </span>
                          </span>
                          {repo.isTemplate && (
                            <span className="shrink-0 px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-[2px]">
                              Starter Template
                            </span>
                          )}
                          {repo.private && (
                            <span className="shrink-0 px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-medium rounded-[2px]">
                              Private
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Metadata: Language + Stars + Default Branch + Action */}
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      {repo.language && (
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                          <span className={`size-1.5 rounded-full ${dotColor}`} />
                          <span className="font-normal">{repo.language}</span>
                        </div>
                      )}

                      {repo.stargazers_count > 0 && (
                        <div className="hidden sm:flex items-center gap-1 text-zinc-500">
                          <Star className="size-3 text-amber-500 fill-amber-500" />
                          <span>
                            {repo.stargazers_count > 999
                              ? `${(repo.stargazers_count / 1000).toFixed(1)}k`
                              : repo.stargazers_count}
                          </span>
                        </div>
                      )}

                      {/* Quick Action Button */}
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCloneUrl(repo.clone_url || repo.html_url);
                          }}
                          title="Copy Git URL"
                          className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors rounded-[3.5px] cursor-pointer"
                        >
                          <Copy className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneSelected(repo);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[3.5px] transition-all cursor-pointer ${
                            isSelected
                              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
                          }`}
                        >
                          <span>Open</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean Keyboard Shortcuts & Status Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0E0E12] px-4 py-2.5 text-xs text-zinc-500">
            <div className="text-zinc-500 dark:text-zinc-400 font-medium">
              {!ghStatus?.connected && activeCategory !== "templates" && searchQuery.trim().length === 0
                ? "GitHub not connected"
                : `${allItems.length} ${allItems.length === 1 ? "repository" : "repositories"} available`}
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-[3px] text-[10px] font-medium">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-[3px] text-[10px] font-medium">↓</kbd>
                <span className="ml-1">Navigate</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-[3px] text-[10px] font-medium">↵</kbd>
                <span className="ml-1">Open Project</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-[3px] text-[10px] font-medium">Esc</kbd>
                <span className="ml-1">Close</span>
              </span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
