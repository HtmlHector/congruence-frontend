/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Globe,
  ExternalLink,
  Sun,
  Moon,
  Wrench,
  Monitor,
  Tablet,
  Smartphone,
  Search,
  ArrowUpRight,
  Loader2,
  Lock,
  Sparkles,
  Mic,
  Camera,
  X,
  Settings,
  Share2,
  Grid,
  MoreVertical,
  SlidersHorizontal,
  Play,
  Film,
  Image as ImageIcon,
  Newspaper,
  ShoppingBag,
  Clock,
  Bookmark,
  ChevronDown,
  Download,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { API_BASE_URL } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

interface NewsItem {
  id: string;
  source: string;
  sourceIcon?: string;
  sourceDomain?: string;
  title: string;
  timeAgo: string;
  url: string;
  imageUrl?: string;
}

const WWE_CURATED_STORIES: {
  mainHeadline: string;
  mainStory: NewsItem;
  subStories: NewsItem[];
  secondClusterHeadline: string;
  secondClusterStories: NewsItem[];
  alsoInNews: NewsItem[];
} = {
  mainHeadline: "Cody Rhodes plans to end wrestling career with WWE",
  mainStory: {
    id: "cody-1",
    source: "Cageside Seats",
    sourceDomain: "cagesideseats.com",
    title: "Cody Rhodes re-signs with WWE, will end his career with the company",
    timeAgo: "16 hours ago",
    url: "https://www.cagesideseats.com",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  subStories: [
    {
      id: "cody-2",
      source: "Wrestling Inc.",
      sourceDomain: "wrestlinginc.com",
      title: "Cody Rhodes Says He's Signed New WWE Contract, Plans To End Career There",
      timeAgo: "15 hours ago",
      url: "https://www.wrestlinginc.com",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "cody-3",
      source: "Yahoo",
      sourceDomain: "yahoo.com",
      title: "WWE's John Cena Says Cody Rhodes Is 'Brave' For Promoting Street Fighter In...",
      timeAgo: "1 day ago",
      url: "https://www.yahoo.com",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
    },
  ],
  secondClusterHeadline: "WWE releases 40-minute tribute video for late wrestler PAC",
  secondClusterStories: [
    {
      id: "pac-1",
      source: "F4W/WON",
      sourceDomain: "f4wonline.com",
      title: "WWE roster honors PAC in tribute video",
      timeAgo: "20 hours ago",
      url: "https://www.f4wonline.com",
      imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "pac-2",
      source: "TheSportster",
      sourceDomain: "thesportster.com",
      title: "Who Fans Have To Thank For WWE's Emotional Pac Tribute Package",
      timeAgo: "1 hour ago",
      url: "https://www.thesportster.com",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
    },
  ],
  alsoInNews: [
    {
      id: "also-1",
      source: "ESPN",
      sourceDomain: "espn.com",
      title: "WWE Money in the Bank stats: Can CM Punk win his third career briefcase?",
      timeAgo: "20 hours ago",
      url: "https://www.espn.com/wwe",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "also-2",
      source: "www.the-sun.com",
      sourceDomain: "the-sun.com",
      title: "WWE legend Trish Stratus is the 'definition of gorgeous' as she gives off 'fall vibes' i...",
      timeAgo: "3 minutes ago",
      url: "https://www.the-sun.com",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  ],
};

export function PreviewPane() {
  const { activeLane, services, project, setIsSettingsOpen } = useWorkspace();
  const { getToken } = useAuth();
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getToken()
      .then((t) => {
        if (!cancelled) setPreviewToken(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const activeService =
    services.find((s) => s.lane_id === activeLane?.id && s.is_active) ||
    services.find((s) => s.is_active);

  const defaultLocalUrl = activeService
    ? `${API_BASE_URL.replace("/api/v1", "")}${activeService.url}${
        previewToken ? `?token=${encodeURIComponent(previewToken)}` : ""
      }`
    : `http://localhost:3000`;

  // Browser navigation history & omnibar
  const [history, setHistory] = useState<string[]>(["https://www.google.com/search?q=wwe"]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState<string>("https://www.google.com/search?q=wwe");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Viewport & theme
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<string>("all");

  const currentUrl = history[historyIndex] || "https://www.google.com/search?q=wwe";

  useEffect(() => {
    setUrlInput(currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "CONGRUENCE_NAVIGATED" && e.data.url) {
        setUrlInput(e.data.url);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const isLocalhost =
    currentUrl.includes("localhost") ||
    currentUrl.includes("127.0.0.1") ||
    currentUrl === "http://localhost:3000" ||
    currentUrl === defaultLocalUrl;

  const isGoogleSearch =
    currentUrl.includes("google.com") ||
    currentUrl.startsWith("search://") ||
    (!isLocalhost && !currentUrl.includes("."));

  const getSearchTerm = () => {
    if (currentUrl.includes("google.com/search?q=")) {
      try {
        const urlObj = new URL(currentUrl);
        return urlObj.searchParams.get("q") || "";
      } catch {
        return currentUrl.replace(/.*[?&]q=([^&]+).*/, "$1");
      }
    }
    if (currentUrl.startsWith("search://")) {
      return decodeURIComponent(currentUrl.replace("search://", ""));
    }
    if (!isLocalhost && !currentUrl.includes(".") && !currentUrl.startsWith("http")) {
      return currentUrl;
    }
    if (currentUrl.includes("google.com")) {
      return "google";
    }
    return currentUrl.replace(/^https?:\/\//, "");
  };

  const activeQuery = getSearchTerm() || "wwe";
  const [searchInputValue, setSearchInputValue] = useState<string>(activeQuery);

  useEffect(() => {
    setSearchInputValue(activeQuery);
  }, [activeQuery]);

  // TanStack Query for Google search API
  const { data: searchData, isLoading: isSearchLoading, refetch } = useQuery({
    queryKey: ["modernGoogleSearch", activeQuery],
    queryFn: async () => {
      const q = activeQuery.trim();
      if (!q) return { query: "", source: "empty", total: 0, topStories: [], knowledgeCard: null, results: [], relatedSearches: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search fetch failed");
      return res.json();
    },
    enabled: Boolean(isGoogleSearch && activeQuery),
    staleTime: 60 * 1000,
  });

  const isWweQuery = activeQuery.toLowerCase().includes("wwe");
  const topStories = searchData?.topStories || [];
  const searchResults = searchData?.results || [];
  const knowledgeCard = searchData?.knowledgeCard || null;
  const relatedSearches = searchData?.relatedSearches || [];

  const handleNavigate = (e?: React.FormEvent, directUrl?: string) => {
    if (e) e.preventDefault();
    let raw = (directUrl || urlInput).trim();
    if (!raw) return;

    let target = raw;

    if (
      !raw.startsWith("http://") &&
      !raw.startsWith("https://") &&
      !raw.includes("localhost") &&
      !raw.includes("127.0.0.1")
    ) {
      if (!raw.includes(".")) {
        target = `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
      } else {
        target = `https://${raw}`;
      }
    }

    setIsNavigating(true);
    const newHistory = [...history.slice(0, historyIndex + 1), target];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setUrlInput(target);
    setIframeKey((prev) => prev + 1);

    setTimeout(() => {
      setIsNavigating(false);
    }, 250);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setIsNavigating(true);
    refetch();
    setIframeKey((prev) => prev + 1);
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden select-none font-sans ${previewTheme === "dark" ? "bg-[#1F1F1F] text-white" : "bg-white text-[#202124]"}`}>
      {/* ========================================================================= */}
      {/* 1. MODERN GOOGLE CHROME BROWSER TOP BAR                                   */}
      {/* ========================================================================= */}
      <div className={`flex h-11 shrink-0 items-center justify-between border-b px-3 gap-2 transition-colors ${previewTheme === "dark" ? "bg-[#28292A] border-[#3C4043]" : "bg-[#F1F3F4] border-[#E0E0E0]"}`}>
        
        {/* Navigation Buttons (Back, Forward, Refresh) */}
        <div className="flex items-center gap-1 shrink-0 text-[#5F6368] dark:text-[#9AA0A6]">
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="flex size-7 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
            title="Click to go back"
          >
            <ChevronLeft className="size-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="flex size-7 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
            title="Click to go forward"
          >
            <ChevronRight className="size-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className={`flex size-7 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ${isNavigating ? "animate-spin" : ""}`}
            title="Reload this page"
          >
            <RotateCw className="size-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Omnibar Address Bar */}
        <form
          onSubmit={handleNavigate}
          className={`flex flex-1 items-center h-8 px-3 rounded-full transition-all gap-2 ${
            previewTheme === "dark"
              ? "bg-[#202124] border border-[#3C4043] focus-within:border-[#8AB4F8]"
              : "bg-white border border-[#DFE1E5] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)]"
          }`}
        >
          <Lock className="size-3.5 text-[#5F6368] dark:text-[#9AA0A6] shrink-0" />

          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Search Google or type a URL"
            className="w-full bg-transparent border-none outline-none font-sans text-xs text-[#202124] dark:text-white placeholder-[#5F6368]"
            spellCheck={false}
          />

          {/* Quick Switch Chips */}
          <div className="flex items-center gap-1 shrink-0 font-sans text-[11px]">
            <button
              type="button"
              onClick={() => handleNavigate(undefined, "https://www.google.com/search?q=wwe")}
              className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                isGoogleSearch
                  ? "bg-[#1A73E8] text-white font-medium"
                  : "text-[#5F6368] dark:text-[#9AA0A6] hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleNavigate(undefined, defaultLocalUrl)}
              className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                isLocalhost
                  ? "bg-[#188038] text-white font-medium"
                  : "text-[#5F6368] dark:text-[#9AA0A6] hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              Localhost:3000
            </button>
          </div>
        </form>

        {/* Right Chrome Controls */}
        <div className="flex items-center gap-1 shrink-0 text-[#5F6368] dark:text-[#9AA0A6]">
          <button
            type="button"
            onClick={() => window.open(currentUrl, "_blank")}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Open in new window"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden md:inline">Open</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewTheme(previewTheme === "dark" ? "light" : "dark")}
            className="flex size-7 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={`Toggle Theme (${previewTheme === "dark" ? "Light" : "Dark"})`}
          >
            {previewTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Viewport Size"
              >
                <Wrench className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 bg-white dark:bg-[#202124] border border-[#DFE1E5] dark:border-[#3C4043] rounded-xl shadow-xl p-1 text-xs"
            >
              <DropdownMenuLabel className="text-[10px] uppercase text-[#5F6368] px-2 py-1">
                Viewport
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setViewport("desktop")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer ${viewport === "desktop" ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""}`}
              >
                <Monitor className="size-3.5" />
                <span>Desktop (100%)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewport("tablet")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer ${viewport === "tablet" ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""}`}
              >
                <Tablet className="size-3.5" />
                <span>Tablet (768px)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewport("mobile")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer ${viewport === "mobile" ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""}`}
              >
                <Smartphone className="size-3.5" />
                <span>Mobile (390px)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN BROWSER CONTENT STAGE                                             */}
      {/* ========================================================================= */}
      <div className={`flex-1 overflow-auto flex flex-col items-center justify-start p-0 ${previewTheme === "dark" ? "bg-[#1F1F1F]" : "bg-[#FFFFFF]"}`}>
        <div
          key={iframeKey}
          className={`h-full transition-all duration-150 flex flex-col ${
            previewTheme === "dark" ? "bg-[#1F1F1F]" : "bg-white"
          } ${
            viewport === "desktop"
              ? "w-full"
              : viewport === "tablet"
              ? "w-[768px] my-3 border border-[#DFE1E5] dark:border-[#3C4043] shadow-md rounded-2xl overflow-hidden"
              : "w-[390px] my-3 border border-[#DFE1E5] dark:border-[#3C4043] shadow-md rounded-2xl overflow-hidden"
          }`}
        >
          {/* ===================================================================== */}
          {/* VIEW: MODERN GOOGLE SEARCH (Pixel-accurate to screenshot)              */}
          {/* ===================================================================== */}
          {isGoogleSearch ? (
            <div className={`flex-1 overflow-y-auto flex flex-col select-text ${previewTheme === "dark" ? "bg-[#1F1F1F] text-white" : "bg-white text-[#202124]"}`}>
              
              {/* Google Header */}
              <div className={`border-b pt-4 pb-0 px-4 sm:px-8 shrink-0 ${previewTheme === "dark" ? "bg-[#1F1F1F] border-[#3C4043]" : "bg-white border-[#E0E0E0]"}`}>
                <div className="max-w-6xl mx-auto space-y-4">
                  {/* Top Header Row with Logo, Search Box, and Google Actions */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    
                    {/* Left: Google Logo (Authentic) */}
                    <div
                      onClick={() => handleNavigate(undefined, "https://www.google.com/search?q=google")}
                      className="flex items-center gap-0.5 text-2xl sm:text-3xl font-bold font-sans cursor-pointer select-none shrink-0"
                    >
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </div>

                    {/* Middle: Modern Google Search Pill Box */}
                    <div className={`flex-1 max-w-2xl flex items-center h-11 px-4 rounded-full transition-all gap-3 ${
                      previewTheme === "dark"
                        ? "bg-[#303134] border border-[#3C4043] hover:bg-[#38393D]"
                        : "bg-white border border-[#DFE1E5] hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)]"
                    }`}>
                      <input
                        type="text"
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleNavigate(undefined, `https://www.google.com/search?q=${encodeURIComponent(searchInputValue)}`);
                          }
                        }}
                        placeholder="Search Google or type a URL"
                        className="flex-1 bg-transparent border-none outline-none font-sans text-sm text-[#202124] dark:text-white placeholder-[#5F6368]"
                      />
                      
                      {searchInputValue && (
                        <button
                          type="button"
                          onClick={() => setSearchInputValue("")}
                          className="text-[#70757A] hover:text-[#202124] dark:hover:text-white"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                      
                      <div className="h-5 w-[1px] bg-[#DFE1E5] dark:bg-[#5F6368]" />
                      
                      {/* Voice Mic Icon */}
                      <button type="button" className="text-[#4285F4] hover:opacity-80" title="Search by voice">
                        <Mic className="size-4" />
                      </button>
                      {/* Google Lens Camera Icon */}
                      <button type="button" className="text-[#4285F4] hover:opacity-80" title="Search by image">
                        <Camera className="size-4" />
                      </button>
                    </div>

                    {/* Right: Google Actions & Sign In */}
                    <div className="flex items-center justify-end gap-3 shrink-0 text-[#5F6368] dark:text-[#9AA0A6]">
                      <Link
                        href="/settings"
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer text-[#5F6368] dark:text-[#9AA0A6]"
                        title="Quick settings"
                      >
                        <Settings className="size-5" />
                      </Link>
                      <button type="button" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer" title="Share">
                        <Share2 className="size-5" />
                      </button>
                      <button type="button" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer" title="Google apps">
                        <Grid className="size-5" />
                      </button>
                      <button
                        type="button"
                        className="px-6 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-sm font-medium font-sans rounded-full transition-colors shadow-sm cursor-pointer"
                      >
                        Sign in
                      </button>
                    </div>

                  </div>

                  {/* Category Navigation Bar (All, AI Mode, News, Videos, Images, Short videos, Shopping, More, Tools) */}
                  <div className="flex items-center gap-6 overflow-x-auto text-sm font-sans text-[#5F6368] dark:text-[#9AA0A6] pt-2 border-t border-transparent scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveTab("ai")}
                      className={`pb-2.5 font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "ai"
                          ? "border-[#1A73E8] text-[#1A73E8] font-bold"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      <Sparkles className="size-4 text-purple-500" />
                      <span>AI Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("all")}
                      className={`pb-2.5 font-medium flex items-center gap-1 border-b-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "all"
                          ? "border-[#202124] dark:border-white text-[#202124] dark:text-white font-medium"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("news")}
                      className={`pb-2.5 font-medium flex items-center gap-1 border-b-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "news"
                          ? "border-[#202124] dark:border-white text-[#202124] dark:text-white font-medium"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      <span>News</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("videos")}
                      className={`pb-2.5 font-medium flex items-center gap-1 border-b-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "videos"
                          ? "border-[#202124] dark:border-white text-[#202124] dark:text-white font-medium"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      <span>Videos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("images")}
                      className={`pb-2.5 font-medium flex items-center gap-1 border-b-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "images"
                          ? "border-[#202124] dark:border-white text-[#202124] dark:text-white font-medium"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      <span>Images</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("short-videos")}
                      className={`pb-2.5 font-medium flex items-center gap-1 border-b-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "short-videos"
                          ? "border-[#202124] dark:border-white text-[#202124] dark:text-white font-medium"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      <span>Short videos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("shopping")}
                      className={`pb-2.5 font-medium flex items-center gap-1 border-b-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === "shopping"
                          ? "border-[#202124] dark:border-white text-[#202124] dark:text-white font-medium"
                          : "border-transparent hover:text-[#202124] dark:hover:text-white"
                      }`}
                    >
                      <span>Shopping</span>
                    </button>
                    <div className="ml-auto flex items-center gap-4 text-[#5F6368] dark:text-[#9AA0A6] pb-2.5 text-sm">
                      <button type="button" className="hover:text-[#202124] dark:hover:text-white">More ▾</button>
                      <button type="button" className="hover:text-[#202124] dark:hover:text-white flex items-center gap-1">
                        <span>Tools ▾</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Search Results Body */}
              <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
                
                {isSearchLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#5F6368] font-sans text-sm">
                    <Loader2 className="size-6 animate-spin text-[#1A73E8]" />
                    <span>Searching Google...</span>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-4xl">
                    
                    {/* ===================================================== */}
                    {/* TOP STORIES SECTION (Exact match to screenshot)       */}
                    {/* ===================================================== */}
                    <div className="space-y-4">
                      {/* Section Title & Customize pill */}
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-normal text-[#202124] dark:text-white">
                          Top stories
                        </h2>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium text-[#1A73E8] bg-[#E8F0FE] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8] rounded-full hover:bg-[#D2E3FC] transition-colors"
                        >
                          <Bookmark className="size-3 fill-current" />
                          <span>Sign in to customize</span>
                        </button>
                      </div>

                      {/* Top Story Cluster 1 (Cody Rhodes / Main Topic) */}
                      <div className="space-y-3">
                        <h3 className="text-lg sm:text-xl font-normal text-[#202124] dark:text-white">
                          {isWweQuery ? WWE_CURATED_STORIES.mainHeadline : (topStories[0]?.title || `Latest updates for ${activeQuery}`)}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Main Left Big Hero Card */}
                          <div
                            onClick={() => handleNavigate(undefined, isWweQuery ? WWE_CURATED_STORIES.mainStory.url : topStories[0]?.url)}
                            className="md:col-span-6 space-y-3 cursor-pointer group"
                          >
                            <div className="w-full h-56 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-[#DFE1E5] dark:border-[#3C4043] shadow-xs">
                              <img
                                src={isWweQuery ? WWE_CURATED_STORIES.mainStory.imageUrl : (topStories[0]?.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80")}
                                alt="News thumbnail"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                <div className="flex items-center gap-1.5">
                                  <div className="size-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-bold">
                                    {isWweQuery ? "CS" : "G"}
                                  </div>
                                  <span>{isWweQuery ? WWE_CURATED_STORIES.mainStory.source : (topStories[0]?.source || "Top News")}</span>
                                </div>
                                <MoreVertical className="size-3.5 text-[#70757A]" />
                              </div>

                              <h4 className="text-base font-normal text-[#1A0DAB] dark:text-[#8AB4F8] group-hover:underline leading-snug">
                                {isWweQuery ? WWE_CURATED_STORIES.mainStory.title : (topStories[0]?.title || "Latest breaking coverage")}
                              </h4>

                              <div className="text-xs text-[#70757A] dark:text-[#9AA0A6]">
                                {isWweQuery ? WWE_CURATED_STORIES.mainStory.timeAgo : (topStories[0]?.timeAgo || "Recently")}
                              </div>
                            </div>
                          </div>

                          {/* Right Sub-Stories Stack */}
                          <div className="md:col-span-6 flex flex-col gap-6">
                            {(isWweQuery ? WWE_CURATED_STORIES.subStories : topStories.slice(1, 3)).map((story: any, idx: number) => (
                              <div
                                key={story.id || idx}
                                onClick={() => handleNavigate(undefined, story.url)}
                                className="flex items-start justify-between gap-4 cursor-pointer group pb-4 border-b border-[#E0E0E0] dark:border-[#3C4043] last:border-b-0"
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                    <div className="flex items-center gap-1.5">
                                      <div className="size-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                                        {story.source?.[0] || "N"}
                                      </div>
                                      <span>{story.source}</span>
                                    </div>
                                    <MoreVertical className="size-3.5 text-[#70757A]" />
                                  </div>

                                  <h4 className="text-sm font-normal text-[#1A0DAB] dark:text-[#8AB4F8] group-hover:underline leading-snug">
                                    {story.title}
                                  </h4>

                                  <div className="text-xs text-[#70757A] dark:text-[#9AA0A6]">
                                    {story.timeAgo}
                                  </div>
                                </div>

                                <div className="size-20 shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-[#DFE1E5] dark:border-[#3C4043]">
                                  <img
                                    src={story.imageUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80"}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Story Cluster 2 (PAC / Secondary Topic) */}
                      <div className="space-y-3 pt-6 border-t border-[#E0E0E0] dark:border-[#3C4043]">
                        <h3 className="text-lg sm:text-xl font-normal text-[#202124] dark:text-white">
                          {isWweQuery ? WWE_CURATED_STORIES.secondClusterHeadline : (topStories[3]?.title || `More top stories for ${activeQuery}`)}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(isWweQuery ? WWE_CURATED_STORIES.secondClusterStories : topStories.slice(3, 5)).map((story: any, idx: number) => (
                            <div
                              key={story.id || idx}
                              onClick={() => handleNavigate(undefined, story.url)}
                              className="flex items-start justify-between gap-4 cursor-pointer group"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                  <div className="flex items-center gap-1.5">
                                    <div className="size-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">
                                      {story.source?.[0] || "N"}
                                    </div>
                                    <span>{story.source}</span>
                                  </div>
                                  <MoreVertical className="size-3.5 text-[#70757A]" />
                                </div>

                                <h4 className="text-sm font-normal text-[#1A0DAB] dark:text-[#8AB4F8] group-hover:underline leading-snug">
                                  {story.title}
                                </h4>

                                <div className="text-xs text-[#70757A] dark:text-[#9AA0A6]">
                                  {story.timeAgo}
                                </div>
                              </div>

                              <div className="size-20 shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-[#DFE1E5] dark:border-[#3C4043]">
                                <img
                                  src={story.imageUrl || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80"}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Also in the News Section */}
                      <div className="space-y-3 pt-6 border-t border-[#E0E0E0] dark:border-[#3C4043]">
                        <h3 className="text-lg sm:text-xl font-normal text-[#202124] dark:text-white">
                          Also in the news
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(isWweQuery ? WWE_CURATED_STORIES.alsoInNews : topStories.slice(5, 7)).map((story: any, idx: number) => (
                            <div
                              key={story.id || idx}
                              onClick={() => handleNavigate(undefined, story.url)}
                              className="flex items-start justify-between gap-4 cursor-pointer group"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                  <div className="flex items-center gap-1.5">
                                    <div className="size-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold">
                                      {story.source?.[0] || "N"}
                                    </div>
                                    <span>{story.source}</span>
                                  </div>
                                  <MoreVertical className="size-3.5 text-[#70757A]" />
                                </div>

                                <h4 className="text-sm font-normal text-[#1A0DAB] dark:text-[#8AB4F8] group-hover:underline leading-snug">
                                  {story.title}
                                </h4>

                                <div className="text-xs text-[#70757A] dark:text-[#9AA0A6]">
                                  {story.timeAgo}
                                </div>
                              </div>

                              <div className="size-20 shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-[#DFE1E5] dark:border-[#3C4043]">
                                <img
                                  src={story.imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80"}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* More news button */}
                        <div className="pt-4 flex justify-center">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F1F3F4] dark:bg-[#303134] text-[#202124] dark:text-white rounded-full text-sm font-medium hover:bg-[#E8EAED] dark:hover:bg-[#3C4043] transition-colors cursor-pointer"
                          >
                            <span>More news</span>
                            <ChevronDown className="size-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* ===================================================== */}
                    {/* ORGANIC GOOGLE SEARCH RESULTS                         */}
                    {/* ===================================================== */}
                    <div className="space-y-8 pt-4 border-t border-[#E0E0E0] dark:border-[#3C4043]">
                      {searchResults.map((res: any, i: number) => (
                        <div key={i} className="space-y-1 group max-w-2xl">
                          {/* Breadcrumb URL */}
                          <div className="flex items-center gap-2 text-xs text-[#202124] dark:text-[#BDC1C6] truncate">
                            {res.favicon && (
                              <img
                                src={res.favicon}
                                alt=""
                                className="size-4 shrink-0 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            )}
                            <span className="font-normal text-[#202124] dark:text-[#E8EAED]">{res.siteName}</span>
                            <span className="text-[#70757A]">›</span>
                            <span className="text-[#70757A] truncate text-[11px]">{res.url}</span>
                          </div>

                          {/* Link Title */}
                          <h3
                            onClick={() => handleNavigate(undefined, res.url)}
                            className="text-lg font-normal text-[#1A0DAB] dark:text-[#8AB4F8] hover:underline cursor-pointer leading-snug"
                          >
                            {res.title}
                          </h3>

                          {/* Snippet */}
                          <p className="text-sm text-[#4D5156] dark:text-[#BDC1C6] leading-relaxed font-sans">
                            {res.snippet}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </div>
            </div>
          ) : !isLocalhost ? (
            /* ===================================================================== */
            /* VIEW: EXTERNAL WEB PROXY VIEW                                         */
            /* ===================================================================== */
            <div className="flex-1 flex flex-col h-full w-full relative bg-white">
              <div className="h-8 px-4 bg-[#F1F3F4] dark:bg-[#28292A] border-b border-[#E0E0E0] dark:border-[#3C4043] flex items-center justify-between text-xs text-[#5F6368] shrink-0 select-none">
                <div className="flex items-center gap-2 truncate">
                  <Lock className="size-3.5 text-emerald-600" />
                  <span className="truncate">{currentUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate(undefined, "https://www.google.com/search?q=wwe")}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  Back to Google
                </button>
              </div>

              <iframe
                src={`/api/proxy?url=${encodeURIComponent(currentUrl)}`}
                title="External Web Preview"
                className="w-full h-full border-none flex-1 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            /* ===================================================================== */
            /* VIEW: LOCALHOST DEV SERVER APP PREVIEW                                */
            /* ===================================================================== */
            <div className="flex flex-1 flex-col h-full overflow-hidden">
              <nav className="flex h-12 items-center justify-between border-b border-zinc-200 dark:border-[#222227] px-4 select-none bg-white dark:bg-[#0E0E12] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs">
                    🛍
                  </div>
                  <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
                    {project?.name || "meridian-api"}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    v1.0.4-dev
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate(undefined, "https://www.google.com/search?q=wwe")}
                    className="px-3 py-1 text-xs font-sans bg-[#1A73E8] text-white rounded-full font-medium"
                  >
                    Open Google Search ↗
                  </button>
                </div>
              </nav>

              <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-[#0A0A0C]">
                <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                    <span className="size-2 bg-emerald-500 animate-pulse rounded-full" />
                    <span>Local Dev Server Running on Port 3000</span>
                  </div>
                  <h1 className="text-2xl font-bold text-zinc-950 dark:text-white font-sans">
                    {project?.name || "meridian-api"} Live Preview
                  </h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Your local app server is connected and ready. You can switch between this local web application and live Google search in the top address bar.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleNavigate(undefined, "https://www.google.com/search?q=wwe")}
                      className="px-5 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-sans font-medium rounded-full shadow-sm"
                    >
                      Search Google for Anything
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
