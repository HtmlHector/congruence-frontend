"use client";

import { useEffect, useRef, useState } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { SerializeAddon } from "@xterm/addon-serialize";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

import "@/features/terminals/components/devbox-terminal.css";
import { readSnapshot, writeSnapshot } from "@/features/terminals/lib/terminal-snapshot";
import { apiClient } from "@/lib/api";

interface ShellTicket {
  ticket: string;
  ws_url: string;
  expires_in: number;
}

type Status = "connecting" | "open" | "closed" | "error";

// Enough scrollback to recognise where you left off, small enough to keep a few
// tabs in localStorage.
const SNAPSHOT_SCROLLBACK = 500;

const THEME = {
  background: "#FFFFFF",
  foreground: "#1F1F1F",
  cursor: "#1F1F1F",
  selectionBackground: "#DBE2EC",
  black: "#1F1F1F",
  brightBlack: "#6B6F76",
  red: "#B4322A",
  brightRed: "#D14338",
  green: "#2F7A3E",
  brightGreen: "#3B9149",
  yellow: "#8A6100",
  brightYellow: "#A67600",
  blue: "#2B5FD9",
  brightBlue: "#1D4ED8",
  magenta: "#7A3DB8",
  brightMagenta: "#8B4BCF",
  cyan: "#0E7490",
  brightCyan: "#0891B2",
  white: "#6B6F76",
  brightWhite: "#1F1F1F",
};

function wsBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  const origin = configured || window.location.origin;
  return origin.replace(/^http/, "ws");
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const response = "response" in error ? (error as { response?: { data?: unknown } }).response : undefined;
    const body =
      ("body" in error ? (error as { body?: unknown }).body : undefined) ??
      response?.data;

    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
      if (detail && typeof detail === "object" && "message" in detail) {
        return String((detail as { message?: unknown }).message);
      }
    }
    if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
  }
  return "Could not open a shell in this devbox";
}

export function DevboxTerminal({
  projectId,
  worktreeId,
  sessionId,
  launchCommand,
  launched = false,
  onLaunched,
}: {
  projectId: string;
  // The shell opens in this checkout, so two worktrees never share a working dir.
  worktreeId: string;
  // Stable per tab: the shell reattaches to the same tmux session on reconnect.
  sessionId: string;
  // Typed into the shell once, so an agent tab opens on the agent itself.
  launchCommand?: string;
  launched?: boolean;
  onLaunched?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const launchRef = useRef({ launchCommand, launched, onLaunched });
  useEffect(() => {
    launchRef.current = { launchCommand, launched, onLaunched };
  });
  const [status, setStatus] = useState<Status>("connecting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      fontSize: 12.5,
      lineHeight: 1.25,
      letterSpacing: 0,
      scrollback: 5000,
      theme: THEME,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    const serialize = new SerializeAddon();
    term.loadAddon(serialize);
    term.open(host);
    termRef.current = term;

    const saveSnapshot = () => {
      try {
        writeSnapshot(
          worktreeId,
          sessionId,
          serialize.serialize({
            scrollback: SNAPSHOT_SCROLLBACK,
            excludeModes: true,
          }),
        );
      } catch {
        // Serialization is best-effort; the next reload just starts blank.
      }
    };
    // A reload or navigation tears the page down without unmounting in every
    // browser path, so snapshot on the event that precedes it. `beforeunload` is
    // deliberately avoided: registering it opts the page out of the back/forward
    // cache, which would make coming back to this tab slow.
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") saveSnapshot();
    };
    window.addEventListener("pagehide", saveSnapshot);
    document.addEventListener("visibilitychange", handleVisibility);

    // Paste has to go through term.paste() so bracketed paste and multi-line
    // text survive, and the native paste event is the one path that never needs
    // clipboard permission. Handle it on the container so it works even when
    // xterm's hidden textarea is not the focused node.
    let sawNativePaste = false;
    const handlePaste = (event: ClipboardEvent) => {
      // Hidden tabs keep their terminal mounted; only the visible one may claim
      // a paste that was targeted elsewhere on the page.
      if (host.offsetParent === null) return;

      const target = event.target instanceof Element ? event.target : null;
      const inTerminal = target ? host.contains(target) : false;
      const otherField = target?.closest(
        "input, textarea, [contenteditable='true']",
      );
      if (!inTerminal && otherField) return;

      const focused = document.activeElement;
      if (!inTerminal && !(focused instanceof Node && host.contains(focused))) {
        return;
      }

      const text = event.clipboardData?.getData("text/plain");
      if (!text) return;
      sawNativePaste = true;
      event.preventDefault();
      event.stopPropagation();
      term.paste(text);
    };
    document.addEventListener("paste", handlePaste, true);

    // Cmd/Ctrl+V is left to the browser: it fires the paste event above. If that
    // event never arrives (focus outside the textarea), fall back to reading the
    // clipboard directly once the keypress has had time to convert.
    term.attachCustomKeyEventHandler((event) => {
      if (event.type !== "keydown") return true;
      const isPaste =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v";
      if (!isPaste) return true;

      sawNativePaste = false;
      window.setTimeout(() => {
        if (sawNativePaste) return;
        const clipboard = navigator.clipboard;
        const readClipboard = clipboard?.readText?.bind(clipboard);
        if (!readClipboard) return;
        void readClipboard()
          .then((text) => {
            if (text) term.paste(text);
          })
          .catch(() => {
            // Clipboard permission denied; the browser path is all we have.
          });
      }, 120);
      return true;
    });
    try {
      fit.fit();
    } catch {
      // Container has no measurable size yet; the ResizeObserver retries.
    }

    // Paint what this tab last showed before the socket is back, so coming back
    // to the page looks like the terminal never left. Written after the fit so
    // the preview wraps at the real width; tmux's repaint replaces it on attach.
    const preview = readSnapshot(worktreeId, sessionId);
    if (preview) term.write(preview);

    let socket: WebSocket | null = null;
    let disposed = false;
    const encoder = new TextEncoder();

    const sendControl = (payload: Record<string, unknown>) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    };

    term.onData((data) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(encoder.encode(data));
    });
    // Resizing the PTY makes readline redraw the prompt, which reads as a flash.
    // The shell already starts at the ticket's cols/rows, so only forward real changes.
    let sentSize = "";
    term.onResize(({ cols, rows }) => {
      const size = `${cols}x${rows}`;
      if (size === sentSize) return;
      sentSize = size;
      sendControl({ type: "resize", cols, rows });
    });

    // Agent tabs type their CLI into the fresh shell. Wait until the shell has
    // painted so the text lands at a prompt instead of being lost on attach.
    let launchSent = false;
    let launchTimer: number | null = null;
    let sawOutput = false;
    const sendLaunch = () => {
      const current = launchRef.current;
      if (launchSent || current.launched || !current.launchCommand) return;
      if (socket?.readyState !== WebSocket.OPEN) return;
      launchSent = true;
      socket.send(encoder.encode(`${current.launchCommand}\r`));
      current.onLaunched?.();
    };
    const scheduleLaunch = (delay: number) => {
      const current = launchRef.current;
      if (launchSent || launchTimer !== null || current.launched) return;
      if (!current.launchCommand) return;
      launchTimer = window.setTimeout(() => {
        launchTimer = null;
        sendLaunch();
      }, delay);
    };

    const connect = async () => {
      setStatus("connecting");
      setError(null);
      try {
        const { data } = await apiClient.post<ShellTicket>(
          `/api/v1/projects/${projectId}/shell-ticket`,
          {
            worktree_id: worktreeId,
            session: sessionId,
            cols: term.cols,
            rows: term.rows,
          },
        );
        if (disposed) return;

        // The PTY starts at the size carried by the ticket; treat that as synced.
        sentSize = `${term.cols}x${term.rows}`;
        socket = new WebSocket(
          `${wsBase()}${data.ws_url}?ticket=${encodeURIComponent(data.ticket)}`,
        );
        socket.binaryType = "arraybuffer";

        socket.onopen = () => {
          setStatus("open");
          try {
            fit.fit();
          } catch {
            // ignore
          }
          term.focus();
          scheduleLaunch(2500);
        };
        socket.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            term.write(new Uint8Array(event.data));
          } else if (typeof event.data === "string") {
            term.write(event.data);
          }
          if (!sawOutput) {
            sawOutput = true;
            if (launchTimer !== null) {
              window.clearTimeout(launchTimer);
              launchTimer = null;
            }
            scheduleLaunch(900);
          }
        };
        socket.onerror = () => setStatus("error");
        socket.onclose = () => {
          if (!disposed) setStatus((current) => (current === "error" ? current : "closed"));
        };
      } catch (err) {
        if (disposed) return;
        setError(errorMessage(err));
        setStatus("error");
      }
    };

    void connect();

    const observer = new ResizeObserver(() => {
      if (host.clientWidth === 0 || host.clientHeight === 0) return;
      try {
        fit.fit();
      } catch {
        // ignore transient layout states
      }
    });
    observer.observe(host);

    return () => {
      disposed = true;
      if (launchTimer !== null) window.clearTimeout(launchTimer);
      observer.disconnect();
      document.removeEventListener("paste", handlePaste, true);
      window.removeEventListener("pagehide", saveSnapshot);
      document.removeEventListener("visibilitychange", handleVisibility);
      socket?.close();
      term.dispose();
    };
  }, [projectId, worktreeId, sessionId]);

  return (
    <div
      className="devbox-terminal relative h-full w-full overflow-hidden"
      style={{ backgroundColor: THEME.background }}
      onMouseDown={() => termRef.current?.focus()}
    >
      <div ref={hostRef} className="h-full w-full" />
      {(error || status === "closed") && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 px-3 py-1 text-[11px] font-mono text-foundation-ink-tertiary">
          {error ? (
            <span className="text-foundation-danger">{error}</span>
          ) : (
            <span>Shell closed</span>
          )}
        </div>
      )}
    </div>
  );
}
