"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe,
  Home,
  Loader2,
  Maximize2,
  Monitor,
  RotateCw,
  Search,
  Smartphone,
  Tablet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

type ViewportMode = "responsive" | "desktop" | "tablet" | "mobile";
type NavigationMode = "home" | "local" | "web";

interface BrowserPreviewProps {
  projectId: string;
  initialPort?: number | null;
  initialPath?: string;
  className?: string;
}

interface TicketResponse {
  ticket: string;
  preview_base_url: string;
  expires_in: number;
}

interface PingResponse {
  live: boolean;
  port: number;
}

function parseNavigationInput(input: string): {
  mode: NavigationMode;
  port?: number;
  localPath?: string;
  webUrl?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { mode: "home" };
  }

  // 1. Direct port input, e.g. "3000", ":3000", "3000/api"
  const portMatch = trimmed.match(/^:?([0-9]{1,5})(\/.*)?$/);
  if (portMatch) {
    const port = parseInt(portMatch[1], 10);
    if (port > 0 && port <= 65535) {
      return {
        mode: "local",
        port,
        localPath: portMatch[2] || "/",
      };
    }
  }

  // 2. localhost input, e.g. "localhost:3000" or "http://localhost:3000/dashboard"
  const localhostMatch = trimmed.match(/^(?:https?:\/\/)?localhost:([0-9]{1,5})(\/.*)?$/i);
  if (localhostMatch) {
    const port = parseInt(localhostMatch[1], 10);
    if (port > 0 && port <= 65535) {
      return {
        mode: "local",
        port,
        localPath: localhostMatch[2] || "/",
      };
    }
  }

  // 3. Full URL, e.g. "https://...", "http://..." or domain name "github.com", "example.com"
  const isUrl =
    /^https?:\/\//i.test(trimmed) ||
    (!trimmed.includes(" ") && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(trimmed));

  if (isUrl) {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return {
      mode: "web",
      webUrl: normalized,
    };
  }

  // 4. Default search query. DuckDuckGo's HTML endpoint is static markup, so it
  // can be proxied into the frame; google.com answers embedded traffic with a
  // CAPTCHA page that renders as a blank frame.
  return {
    mode: "web",
    webUrl: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`,
  };
}

export function BrowserPreview({
  projectId,
  initialPort = null,
  initialPath = "/",
  className,
}: BrowserPreviewProps) {
  const [addressInput, setAddressInput] = useState<string>(
    initialPort ? `localhost:${initialPort}${initialPath && initialPath !== "/" ? initialPath : ""}` : "",
  );
  const [mode, setMode] = useState<NavigationMode>(initialPort ? "local" : "home");
  const [activePort, setActivePort] = useState<number | null>(initialPort);
  const [activeLocalPath, setActiveLocalPath] = useState<string>(initialPath || "/");
  const [activeWebUrl, setActiveWebUrl] = useState<string | null>(null);

  const [viewportMode, setViewportMode] = useState<ViewportMode>("responsive");
  const [ticket, setTicket] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [isServerLive, setIsServerLive] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mint preview ticket on mount / projectId change
  useEffect(() => {
    let cancelled = false;
    setTicketLoading(true);

    async function fetchTicket() {
      try {
        const response = await apiClient.get<TicketResponse>(
          `/api/v1/projects/${projectId}/preview-ticket`,
        );
        if (!cancelled) {
          setTicket(response.data.ticket);
        }
      } catch (err) {
        console.error("Failed to mint preview ticket:", err);
      } finally {
        if (!cancelled) {
          setTicketLoading(false);
        }
      }
    }

    fetchTicket();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // The proxied page posts the URL it navigated to (link click, form submit) so
  // the address bar tracks the page without reloading the frame.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; url?: string } | null;
      if (!data || data.type !== "congruence:preview-navigate") return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (typeof data.url !== "string" || !/^https?:\/\//.test(data.url)) return;
      setAddressInput(data.url);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Ping the server to check if it's listening in local mode
  const checkPortLive = useCallback(
    async (port: number, currentTicket: string) => {
      setIsChecking(true);
      try {
        const response = await apiClient.get<PingResponse>(
          `/api/v1/projects/${projectId}/preview/${port}/ping`,
          {
            params: { ticket: currentTicket },
          },
        );
        return response.data.live;
      } catch {
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    [projectId],
  );

  // Poll port status when activePort is set and in local mode
  useEffect(() => {
    if (mode !== "local" || !activePort || !ticket) {
      setIsServerLive(null);
      return;
    }

    let isSubscribed = true;

    async function poll() {
      if (!ticket) return;
      const live = await checkPortLive(activePort!, ticket);
      if (!isSubscribed) return;

      setIsServerLive(live);

      // If not live, poll again in 2 seconds
      if (!live) {
        pollTimerRef.current = setTimeout(poll, 2000);
      }
    }

    poll();

    return () => {
      isSubscribed = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [mode, activePort, ticket, checkPortLive, reloadKey]);

  function navigateTo(input: string) {
    const result = parseNavigationInput(input);
    setAddressInput(input);
    setMode(result.mode);

    if (result.mode === "local") {
      setActivePort(result.port || null);
      setActiveLocalPath(result.localPath || "/");
      setActiveWebUrl(null);
      setIsServerLive(null);
    } else if (result.mode === "web") {
      setActiveWebUrl(result.webUrl || null);
      setActivePort(null);
      setIsServerLive(null);
    } else {
      setActivePort(null);
      setActiveWebUrl(null);
      setIsServerLive(null);
    }
  }

  function handleNavigate(e: FormEvent) {
    e.preventDefault();
    navigateTo(addressInput);
  }

  function handleQuickPort(p: number) {
    navigateTo(String(p));
  }

  function handleWebHome() {
    navigateTo("duckduckgo.com");
  }

  function handleHome() {
    setAddressInput("");
    setMode("home");
    setActivePort(null);
    setActiveWebUrl(null);
  }

  function handleReload() {
    setReloadKey((k) => k + 1);
  }

  function handleIframeBack() {
    try {
      iframeRef.current?.contentWindow?.history.back();
    } catch {
      // Cross-origin restriction fallback
    }
  }

  function handleIframeForward() {
    try {
      iframeRef.current?.contentWindow?.history.forward();
    } catch {
      // Cross-origin restriction fallback
    }
  }

  // Construct iframe URL
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
  let previewUrl = "";

  if (mode === "local" && activePort && ticket) {
    const normalizedPath = activeLocalPath.startsWith("/") ? activeLocalPath : `/${activeLocalPath}`;
    previewUrl = `${apiBase}/api/v1/projects/${projectId}/preview/${activePort}${normalizedPath}?ticket=${encodeURIComponent(ticket)}`;
  } else if (mode === "web" && activeWebUrl) {
    // Always through the external proxy: it strips the frame-blocking headers and
    // keeps link clicks inside the panel.
    if (ticket) {
      previewUrl = `${apiBase}/api/v1/projects/${projectId}/preview/external?url=${encodeURIComponent(activeWebUrl)}&ticket=${encodeURIComponent(ticket)}`;
    }
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-foundation-bg text-foundation-ink",
        className,
      )}
      data-testid="browser-preview"
    >
      {/* ── Browser Toolbar ────────────────────────────────────────── */}
      <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-foundation-line bg-foundation-surface px-3 py-1">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Home"
            title="Start page"
            onClick={handleHome}
          >
            <Home className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Back"
            title="Back"
            onClick={handleIframeBack}
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Forward"
            title="Forward"
            onClick={handleIframeForward}
          >
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Reload"
            title="Reload"
            onClick={handleReload}
          >
            <RotateCw
              className={cn("size-3.5", isChecking && "animate-spin")}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Address Bar Form */}
        <form
          onSubmit={handleNavigate}
          className="flex max-w-xl flex-1 items-center gap-1.5"
        >
          <div className="flex flex-1 items-center rounded-fd-sm border border-foundation-line bg-foundation-bg px-2 py-0.5 text-xs focus-within:border-foundation-line-strong">
            {mode === "local" ? (
              <span className="mr-1.5 rounded-fd-xs bg-foundation-sunken px-1 font-mono text-[10px] text-foundation-ink-secondary">
                local
              </span>
            ) : mode === "web" ? (
              <span className="mr-1.5 rounded-fd-xs bg-foundation-sunken px-1 font-mono text-[10px] text-foundation-ink-secondary">
                web
              </span>
            ) : (
              <Search className="mr-1.5 size-3 text-foundation-ink-tertiary" aria-hidden="true" />
            )}
            <input
              type="text"
              placeholder="Search the web, or enter URL / port (e.g. 3000, example.com)..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="flex-1 bg-transparent font-mono text-[11px] text-foundation-ink focus:outline-none"
              aria-label="Search or URL"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="xs"
            className="h-6 px-2 text-[11px]"
          >
            Go
          </Button>
        </form>

        {/* Viewport Switcher & External Tab */}
        <div className="flex items-center gap-1">
          <div className="flex items-center rounded-fd-sm border border-foundation-line bg-foundation-bg p-0.5">
            <Button
              variant={viewportMode === "responsive" ? "secondary" : "ghost"}
              size="icon-xs"
              className="h-5 w-5"
              title="Responsive Viewport (100%)"
              onClick={() => setViewportMode("responsive")}
            >
              <Maximize2 className="size-3" aria-hidden="true" />
            </Button>
            <Button
              variant={viewportMode === "desktop" ? "secondary" : "ghost"}
              size="icon-xs"
              className="h-5 w-5"
              title="Desktop Viewport (1280px)"
              onClick={() => setViewportMode("desktop")}
            >
              <Monitor className="size-3" aria-hidden="true" />
            </Button>
            <Button
              variant={viewportMode === "tablet" ? "secondary" : "ghost"}
              size="icon-xs"
              className="h-5 w-5"
              title="Tablet Viewport (768px)"
              onClick={() => setViewportMode("tablet")}
            >
              <Tablet className="size-3" aria-hidden="true" />
            </Button>
            <Button
              variant={viewportMode === "mobile" ? "secondary" : "ghost"}
              size="icon-xs"
              className="h-5 w-5"
              title="Mobile Viewport (375px)"
              onClick={() => setViewportMode("mobile")}
            >
              <Smartphone className="size-3" aria-hidden="true" />
            </Button>
          </div>

          {(activeWebUrl || (mode === "local" && previewUrl)) && (
            <a
              href={activeWebUrl || previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in new window"
              className="inline-flex h-6 w-6 items-center justify-center rounded-fd-xs text-foundation-ink-secondary hover:bg-foundation-sunken hover:text-foundation-ink"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </header>

      {/* ── Viewport Stage ─────────────────────────────────────────── */}
      <main
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-auto",
          mode === "home" || (mode === "local" && isServerLive === false) || ticketLoading
            ? "bg-foundation-sunken p-4"
            : viewportMode === "responsive"
              ? "h-full w-full p-0 bg-white"
              : "bg-foundation-sunken p-4",
        )}
      >
        {/* State 1: Ticket Loading */}
        {ticketLoading ? (
          <div className="flex items-center gap-2 text-xs text-foundation-ink-secondary">
            <Loader2 className="size-4 animate-spin text-foundation-ink-tertiary" aria-hidden="true" />
            Connecting to preview gateway…
          </div>
        ) : mode === "home" ? (
          /* State 2: Home / Start Page */
          <div className="mx-auto w-full max-w-lg rounded-fd-md border border-foundation-line bg-foundation-surface p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <Globe className="size-6 text-foundation-ink-secondary" aria-hidden="true" />
              <span className="text-xl font-semibold tracking-tight text-foundation-ink">Browser</span>
            </div>
            <p className="text-xs text-foundation-ink-secondary">
              Browse the web, search, or view your local devbox websites.
            </p>

            {/* Quick search input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNavigate(e);
              }}
              className="mt-5 flex items-center gap-2"
            >
              <div className="flex flex-1 items-center rounded-fd-md border border-foundation-line bg-foundation-bg px-3 py-2 text-xs shadow-xs focus-within:border-foundation-line-strong">
                <Search className="mr-2 size-3.5 text-foundation-ink-tertiary" />
                <input
                  type="text"
                  placeholder="Search the web or type a URL..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-foundation-ink focus:outline-none"
                  autoFocus
                />
              </div>
              <Button type="submit" variant="default" size="sm" className="h-9 px-4">
                Search
              </Button>
            </form>

            {/* Quick shortcuts */}
            <div className="mt-6 border-t border-foundation-line pt-4">
              <p className="text-[11px] font-medium text-foundation-ink-tertiary">Quick links</p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleWebHome}
                  className="inline-flex items-center gap-1.5 rounded-fd-sm border border-foundation-line bg-foundation-bg px-2.5 py-1 text-xs text-foundation-ink-secondary hover:border-foundation-line-strong hover:text-foundation-ink"
                >
                  <Globe className="size-3 text-foundation-ink-tertiary" />
                  DuckDuckGo
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("github.com")}
                  className="inline-flex items-center gap-1.5 rounded-fd-sm border border-foundation-line bg-foundation-bg px-2.5 py-1 text-xs text-foundation-ink-secondary hover:border-foundation-line-strong hover:text-foundation-ink"
                >
                  <Globe className="size-3 text-foundation-ink-tertiary" />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("developer.mozilla.org")}
                  className="inline-flex items-center gap-1.5 rounded-fd-sm border border-foundation-line bg-foundation-bg px-2.5 py-1 text-xs text-foundation-ink-secondary hover:border-foundation-line-strong hover:text-foundation-ink"
                >
                  <Globe className="size-3 text-foundation-ink-tertiary" />
                  MDN Docs
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[11px] text-foundation-ink-tertiary">Local ports:</span>
                {[3000, 5173, 8000, 8080].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleQuickPort(p)}
                    className="rounded-fd-xs border border-foundation-line bg-foundation-bg px-2 py-0.5 font-mono text-[11px] text-foundation-ink-secondary hover:border-foundation-line-strong hover:text-foundation-ink"
                  >
                    :{p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : mode === "local" && isServerLive === false ? (
          /* State 3: Standby / Server Not Running on Port */
          <div className="mx-auto max-w-md rounded-fd-lg border border-foundation-line bg-foundation-surface p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-fd-sm bg-foundation-warning/10 text-foundation-warning">
                <AlertCircle className="size-4" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foundation-ink">
                    No server on port {activePort}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-foundation-line bg-foundation-bg px-2 py-0.5 font-mono text-[10px] text-foundation-ink-secondary">
                    <span className="size-1.5 animate-pulse rounded-full bg-foundation-warning" />
                    Auto-reconnecting
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-foundation-ink-secondary">
                  Start your web server inside a terminal tab to view it live here:
                </p>

                {/* Helpful snippets */}
                <div className="mt-3 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between rounded-fd-xs border border-foundation-line bg-foundation-sunken px-2 py-1">
                    <span className="text-foundation-ink">pnpm dev</span>
                    <span className="text-[10px] text-foundation-ink-tertiary">Vite / Next</span>
                  </div>
                  <div className="flex items-center justify-between rounded-fd-xs border border-foundation-line bg-foundation-sunken px-2 py-1">
                    <span className="text-foundation-ink">python -m uvicorn main:app --reload --port {activePort}</span>
                    <span className="text-[10px] text-foundation-ink-tertiary">Python</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleReload}
                    className="text-xs"
                  >
                    <RotateCw className="size-3" aria-hidden="true" />
                    Check again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State 4: Live Iframe Viewport (Local or Web) */
          <div
            className={cn(
              "h-full bg-white transition-all duration-150",
              viewportMode === "responsive"
                ? "w-full border-0 rounded-none shadow-none"
                : "overflow-hidden rounded-fd-sm border border-foundation-line shadow-sm",
              viewportMode === "desktop" && "w-[1280px] max-w-full",
              viewportMode === "tablet" && "w-[768px] max-w-full",
              viewportMode === "mobile" && "w-[375px] max-w-full",
            )}
          >
            <iframe
              ref={iframeRef}
              key={`${mode}-${activePort || activeWebUrl}-${reloadKey}`}
              src={previewUrl}
              title={mode === "local" ? `Devbox Preview :${activePort}` : `Web Browser: ${activeWebUrl}`}
              className="h-full w-full border-0 bg-white block"
              sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
            />
          </div>
        )}
      </main>
    </div>
  );
}
