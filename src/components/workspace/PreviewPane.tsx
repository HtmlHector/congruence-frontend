"use client";

import React, { useState } from "react";
import {
  Globe,
  RefreshCcw,
  Lock,
  ExternalLink,
  Terminal,
  Play,
  ShoppingCart,
  Star,
  Check,
  Package,
  Layers,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { API_BASE_URL } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  imageBg: string;
  description: string;
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Congruence Obsidian Mechanical Keyboard",
    category: "Hardware",
    price: 189.0,
    rating: 4.9,
    imageBg: "from-zinc-800 to-zinc-950",
    description: "Machined aluminum frame, custom silent tactile switches, USB-C/Bluetooth.",
  },
  {
    id: "prod-2",
    name: "Developer MicroVM NVMe Enclosure",
    category: "Storage",
    price: 69.0,
    rating: 4.8,
    imageBg: "from-emerald-900/60 to-zinc-950",
    description: "40Gbps Thunderbolt 4 transfer speeds with active passive heat dissipation.",
  },
  {
    id: "prod-3",
    name: "Anthropic Claude Code Amber Desk Mat",
    category: "Accessories",
    price: 34.0,
    rating: 5.0,
    imageBg: "from-amber-900/50 to-zinc-950",
    description: "Hydrophobic micro-weave surface with stitched anti-fraying edge.",
  },
  {
    id: "prod-4",
    name: "Zero-Collision Multi-Agent Hoodie",
    category: "Apparel",
    price: 85.0,
    rating: 4.7,
    imageBg: "from-indigo-950 to-zinc-950",
    description: "480 GSM French terry cotton with embroidered Git branch insignia.",
  },
];

export function PreviewPane() {
  const { activeLane, services, toggleDevServer, project } = useWorkspace();
  const [iframeKey, setIframeKey] = useState(0);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartCount, setCartCount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Find active service for this lane, or fallback to first active service
  const activeService =
    services.find((s) => s.lane_id === activeLane?.id && s.is_active) ||
    services.find((s) => s.is_active);

  const isLive = Boolean(activeService?.is_active);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const previewUrl = activeService
    ? `${API_BASE_URL.replace("/api/v1", "")}${activeService.url}`
    : `https://${project?.slug || "ecommerce-test-app"}.preview.congruence.dev`;

  const handleAddToCart = (id: string) => {
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    setCartCount((prev) => prev + 1);
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0C]">
      {/* Header Browser Chrome */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 bg-[#F4F4F6] dark:bg-[#0E0E12] select-none gap-2">
        {/* Left: Padlock + URL Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md bg-white dark:bg-[#16161B] border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1 text-xs">
          <Lock className="size-3 text-emerald-500 shrink-0" />
          <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate">
            {previewUrl.replace("http://localhost:8000", "https://preview.congruence.dev")}
          </span>
        </div>

        {/* Center Viewport Switcher */}
        <div className="hidden sm:flex items-center rounded-md bg-zinc-200/60 dark:bg-zinc-800/60 p-0.5 text-zinc-500">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-1 rounded transition-colors ${
              viewport === "desktop" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs" : "hover:text-zinc-900"
            }`}
            title="Desktop view"
          >
            <Monitor className="size-3.5" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-1 rounded transition-colors ${
              viewport === "tablet" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs" : "hover:text-zinc-900"
            }`}
            title="Tablet view"
          >
            <Tablet className="size-3.5" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`p-1 rounded transition-colors ${
              viewport === "mobile" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs" : "hover:text-zinc-900"
            }`}
            title="Mobile view"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`hidden md:inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
              isLive
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <span className={`size-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
            {isLive ? "Live HTTPS Service · Port 3000" : "Dev Server Idle"}
          </span>

          <button
            onClick={handleRefresh}
            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Reload Preview"
          >
            <RefreshCcw className="size-3.5" />
          </button>

          {!isLive && (
            <button
              onClick={toggleDevServer}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[11px] font-medium rounded hover:opacity-90 transition-opacity"
            >
              <Play className="size-3 fill-current" />
              <span>Run dev</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Canvas Frame */}
      <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-[#060608] flex justify-center p-0 sm:p-2">
        <div
          className={`h-full transition-all duration-200 bg-white dark:bg-[#0E0E12] flex flex-col border border-zinc-200 dark:border-zinc-800/80 shadow-md ${
            viewport === "desktop"
              ? "w-full rounded-none sm:rounded-md"
              : viewport === "tablet"
              ? "w-[768px] rounded-lg"
              : "w-[390px] rounded-2xl my-2"
          }`}
        >
          {/* Live App Top Navbar */}
          <nav className="flex h-13 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 px-4 select-none">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs">
                🛍
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                {project?.name || "ecommerce-test-app"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                v1.0.4-dev
              </span>
            </div>

            {/* Live Search & Cart */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-md px-2.5 py-1 text-xs border border-zinc-200/80 dark:border-zinc-700/60">
                <Search className="size-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 w-28"
                />
              </div>

              <div className="relative flex items-center justify-center size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <ShoppingCart className="size-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-[9px]">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </nav>

          {/* Live App Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 select-none border-b border-zinc-800">
            <div className="max-w-xl space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Live Worktree Preview: {activeLane?.branch || "main"}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Next-Gen Developer Hardware & Merch
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                Running live on port 3000 inside the Congruence isolated microVM runner. Changes made by Claude or Codex reflect here in real-time.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#121216]/50 select-none overflow-x-auto">
            {["All", "Hardware", "Storage", "Accessories", "Apparel"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isAdded = addedItems[product.id];
                return (
                  <div
                    key={product.id}
                    className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#121216] overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-xs"
                  >
                    {/* Product Image Area */}
                    <div className={`h-36 bg-gradient-to-br ${product.imageBg} flex items-center justify-center p-4 relative`}>
                      <Package className="size-10 text-white/40 group-hover:scale-105 transition-transform" />
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        <Star className="size-2.5 fill-amber-300" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Product Content */}
                    <div className="flex flex-1 flex-col p-4 justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                          {product.category}
                        </span>
                        <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Price + Action */}
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          ${product.price.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="size-3 stroke-[2.5]" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="size-3" />
                              <span>Add to cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live App Footer */}
          <footer className="flex h-9 items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 px-4 text-[10px] text-zinc-400 bg-zinc-50 dark:bg-[#0E0E12] select-none">
            <span>Powered by Next.js 15 & Tailwind CSS</span>
            <span className="font-mono">Port 3000 · HTTPS Private · Congruence Proxy</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
