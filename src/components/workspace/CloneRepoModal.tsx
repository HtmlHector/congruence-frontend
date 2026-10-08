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

  // GitHub Auth & Repos state
  const [ghStatus, setGhStatus] = useState<GitHubStatusData | null>(null);
  const [personalRepos, setPersonalRepos] = useState<RepositoryItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [isConnectingPat, setIsConnectingPat] = useState(false);
  const [showPatInput, setShowPatInput] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchGithubStatusAndRepos = async () => {
    try {
      const status = await api.getGithubStatus();
      setGhStatus(status);
      if (status.connected) {
        setIsLoadingRepos(true);
        try {
          const repoList = await api.getGithubRepos();
          const formatted: RepositoryItem[] = repoList.map((r) => ({
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
          setPersonalRepos(formatted);
        } catch (err: any) {
          console.error("Failed to fetch repos:", err);
        } finally {
          setIsLoadingRepos(false);
        }
      } else {
        setPersonalRepos([]);
        setActiveCategory("personal");
      }
    } catch (err: any) {
      console.error("Failed to load GitHub status:", err);
    }
  };

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedIndex(0);
      setShowPatInput(false);
      setPatToken("");
      fetchGithubStatusAndRepos();
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
    setIsConnectingPat(true);
    try {
      const res = await api.connectGithubPat(patToken.trim());
      setGhStatus({
        connected: true,
        username: res.username,
        avatar_url: res.avatar_url,
        github_user_id: res.github_user_id,
      });
      setPatToken("");
      setShowPatInput(false);
      toast.success(`Connected GitHub account @${res.username}`);
      await fetchGithubStatusAndRepos();
      setActiveCategory("personal");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect GitHub Personal Access Token");
    } finally {
      setIsConnectingPat(false);
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      await api.disconnectGithub();
      setGhStatus({ connected: false, username: null, avatar_url: null, github_user_id: null });
      setPersonalRepos([]);
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
          {/* Top Omnibar Search Header */}
          <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121218] px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search GitHub repositories, starter kits, or paste clone URL..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 outline-none border-none ring-0 font-medium"
              />
            </div>

            {/* Right Header Badges: Categories + GitHub Auth + Close */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {/* Category Pills */}
              <div className="hidden sm:flex items-center border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] bg-white dark:bg-[#0E0E12] p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setSelectedIndex(0);
                  }}
                  className={`px-2 py-0.5 transition-colors cursor-pointer rounded-[3.5px] ${
                    activeCategory === "all"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
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
                  className={`px-2 py-0.5 transition-colors cursor-pointer rounded-[3.5px] ${
                    activeCategory === "personal"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
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
                  className={`px-2 py-0.5 transition-colors cursor-pointer rounded-[3.5px] ${
                    activeCategory === "templates"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  Templates
                </button>
              </div>

              {/* GitHub Auth Status */}
              {ghStatus?.connected ? (
                <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Github className="size-3 text-zinc-500" />
                  <span className="truncate max-w-[80px]">@{ghStatus.username}</span>
                  <button
                    type="button"
                    onClick={handleDisconnectGithub}
                    title="Disconnect GitHub account"
                    className="text-zinc-400 hover:text-rose-500 text-[10px] ml-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGithub}
                  className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                >
                  <Github className="size-3" />
                  <span>Connect GitHub</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                title="Close (Esc)"
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded-[3.5px]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Master-Detail Body (2 Columns) */}
          <div className="grid sm:grid-cols-[1fr_320px] flex-1 min-h-[420px] max-h-[520px] overflow-hidden">
            {/* Left Column: Repository Master List */}
            <div
              ref={listRef}
              className="border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto scrollbar-thin divide-y divide-zinc-100 dark:divide-zinc-800/60 flex flex-col"
            >
              {!ghStatus?.connected && activeCategory !== "templates" && searchQuery.trim().length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-auto">
                  <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 mb-3 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    <Github className="size-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Connect GitHub to Access Repositories
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5 leading-relaxed">
                    Authorize Congruence with your GitHub account or paste a Personal Access Token to search, browse, and clone your repositories directly into your workspaces.
                  </p>

                  <div className="flex flex-col gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={handleConnectGithub}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Github className="size-4" />
                      <span>Connect with GitHub (OAuth)</span>
                    </button>

                    {!showPatInput ? (
                      <button
                        type="button"
                        onClick={() => setShowPatInput(true)}
                        className="w-full py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        Use Personal Access Token (PAT)
                      </button>
                    ) : (
                      <form onSubmit={handleConnectPat} className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-[#121218] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] text-left">
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          GitHub Token (<code className="font-mono text-[10px]">ghp_...</code> or <code className="font-mono text-[10px]">github_pat_...</code>)
                        </label>
                        <input
                          type="password"
                          placeholder="Paste GitHub access token..."
                          value={patToken}
                          onChange={(e) => setPatToken(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[3.5px] text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-500"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="submit"
                            disabled={isConnectingPat || !patToken.trim()}
                            className="flex-1 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-[3.5px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isConnectingPat ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                            <span>{isConnectingPat ? "Connecting..." : "Save Token"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPatInput(false);
                              setPatToken("");
                            }}
                            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ) : isLoadingRepos ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 my-auto">
                  <Loader2 className="size-6 text-zinc-400 animate-spin mb-2" />
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Loading GitHub repositories...</p>
                </div>
              ) : allItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 my-auto">
                  <FolderGit2 className="size-8 text-zinc-300 dark:text-zinc-700 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No repositories found</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Try searching for another keyword or type a custom Git clone URL.
                  </p>
                </div>
              ) : (
                allItems.map((repo, idx) => {
                  const isSelected = idx === selectedIndex;
                  const dotColor = LANGUAGE_COLORS[repo.language || "TypeScript"] || "bg-zinc-400";

                  return (
                    <div
                      key={repo.id}
                      onClick={() => {
                        setSelectedIndex(idx);
                      }}
                      onDoubleClick={() => handleCloneSelected(repo)}
                      className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer text-xs transition-colors rounded-[3.5px] border ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-950 dark:text-white border-zinc-300 dark:border-zinc-700 font-medium"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-transparent"
                      }`}
                    >
                      {/* Left: Icon + Name + Description */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center border border-zinc-200 dark:border-zinc-800 ${
                            repo.isTemplate
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : repo.category === "custom"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
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
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {repo.full_name}
                            </span>
                            {repo.isTemplate && (
                              <span className="shrink-0 px-1 py-0.2 bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-mono uppercase">
                                Template
                              </span>
                            )}
                          </div>
                          {repo.description && (
                            <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Language + Stars */}
                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-zinc-400">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span className={`size-1.5 rounded-full ${dotColor}`} />
                            <span className="text-zinc-500 dark:text-zinc-400">{repo.language}</span>
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
                        <ArrowRight
                          className={`size-3.5 transition-transform ${
                            isSelected
                              ? "opacity-100 translate-x-0.5 text-zinc-900 dark:text-zinc-100"
                              : "opacity-0 text-zinc-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Detail Preview Panel */}
            <div className="bg-zinc-50/50 dark:bg-[#121218] p-4 flex flex-col justify-between overflow-y-auto">
              {selectedRepo ? (
                <div className="space-y-4">
                  {/* Detail Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                          <Github className="size-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 break-all leading-tight">
                            {selectedRepo.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {selectedRepo.full_name.split("/")[0]}
                          </span>
                        </div>
                      </div>

                      <a
                        href={selectedRepo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        title="View on GitHub"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {selectedRepo.description || "No description provided for this repository."}
                    </p>
                  </div>

                  {/* Metadata Spec List */}
                  <div className="space-y-2 border-t border-b border-zinc-200 dark:border-zinc-800/80 py-3 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <GitBranch className="size-3 text-zinc-500" /> Default Branch
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedRepo.default_branch || "main"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Code2 className="size-3 text-zinc-500" /> Language
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedRepo.language || "TypeScript"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Star className="size-3 text-amber-500" /> Stars / Forks
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedRepo.stargazers_count > 999
                          ? `${(selectedRepo.stargazers_count / 1000).toFixed(1)}k`
                          : selectedRepo.stargazers_count}{" "}
                        / {selectedRepo.forks_count || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Cpu className="size-3 text-zinc-500" /> Host Isolation
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[10px]">
                        MicroVM NVMe
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Layers className="size-3 text-zinc-500" /> Worktree Leases
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[10px]">
                        Enabled
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      disabled={isCloning}
                      onClick={() => handleCloneSelected(selectedRepo)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 rounded-[3.5px] shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {isCloning ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FolderGit2 className="size-3.5" />
                        )}
                        <span>{isCloning ? "Cloning & Provisioning..." : "Open in Congruence"}</span>
                      </div>
                      <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-800 dark:bg-zinc-300 text-zinc-200 dark:text-zinc-800 rounded-[3.5px]">
                        ↵
                      </kbd>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCloneUrl(selectedRepo.clone_url)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-[3.5px]"
                    >
                      {copiedUrl ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>{copiedUrl ? "Copied Git URL" : "Copy Git Clone URL"}</span>
                    </button>
                  </div>
                </div>
              ) : !ghStatus?.connected && activeCategory !== "templates" && searchQuery.trim().length === 0 ? (
                <div className="flex flex-col justify-between h-full p-2 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-[3.5px] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <Github className="size-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                          GitHub Integration
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Workspace Repositories
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Connect your GitHub account or Personal Access Token to browse, clone, and manage repositories directly inside your workspaces.
                    </p>

                    <div className="space-y-2 border-t border-b border-zinc-200 dark:border-zinc-800/80 py-3 text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Lock className="size-3 text-zinc-500" /> Private Repos
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Supported</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <KeyRound className="size-3 text-zinc-500" /> OAuth or PAT
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Supported</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <GitBranch className="size-3 text-zinc-500" /> Git Worktrees
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[10px]">
                          Isolated Leases
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 text-center pb-1">
                    Select <span className="font-semibold text-zinc-700 dark:text-zinc-300">Templates</span> above to explore starter kits.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 p-4">
                  <p className="text-xs">Select a repository to preview details</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Keyboard Shortcuts Bar */}
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-[#0A0A0E] px-3.5 py-2 text-[11px] font-mono text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">↓</kbd>
                <span className="ml-1 text-zinc-400">Navigate</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">↵</kbd>
                <span className="ml-1 text-zinc-400">Open Project</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">ESC</kbd>
                <span className="ml-1 text-zinc-400">Close</span>
              </span>
            </div>

            <div className="text-zinc-400 font-medium">
              {!ghStatus?.connected && activeCategory !== "templates" && searchQuery.trim().length === 0
                ? "GitHub not connected"
                : `${allItems.length} ${allItems.length === 1 ? "repository" : "repositories"} available`}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
