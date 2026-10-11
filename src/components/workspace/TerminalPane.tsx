"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  RotateCcw,
  Trash2,
  Terminal as TerminalIcon,
  GitBranch,
  Play,
  Copy,
  Check,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Type,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const QUICK_COMMANDS = [
  { label: "git status", cmd: "git status -sb" },
  { label: "pnpm dev", cmd: "pnpm dev" },
  { label: "git diff", cmd: "git diff --stat" },
  { label: "git log", cmd: "git log --oneline -n 5" },
  { label: "pnpm test", cmd: "pnpm test" },
];

const TERMINAL_FONTS = [
  {
    id: "jetbrains",
    name: "JetBrains Mono",
    family: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: "geistmono",
    name: "Geist Mono",
    family: '"Geist Mono", "SF Mono", Menlo, monospace',
  },
  {
    id: "fira",
    name: "Fira Code",
    family: '"Fira Code", "SF Mono", Menlo, monospace',
  },
  {
    id: "sfmono",
    name: "SF Mono (macOS)",
    family: '"SF Mono", "SFProMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },
  {
    id: "menlo",
    name: "Menlo",
    family: 'Menlo, Monaco, Consolas, "Courier New", monospace',
  },
  {
    id: "cascadia",
    name: "Cascadia Code",
    family: '"Cascadia Code", "SF Mono", Consolas, monospace',
  },
];

export function TerminalPane() {
  const { activeLane, hostState, pendingCommand, clearPendingCommand, project } =
    useWorkspace();
  const { getToken } = useAuth();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<any>(null);
  const fitAddonInstance = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const ptyIdRef = useRef<string | null>(null);

  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shellType, setShellType] = useState<"zsh" | "bash" | "node">("zsh");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [selectedFont, setSelectedFont] = useState<string>("jetbrains");
  const [fontSize, setFontSize] = useState<number>(13);

  // Local fallback shell state for offline/demo interactive support
  const localInputBuffer = useRef<string>("");
  const commandHistory = useRef<string[]>([]);
  const historyIdx = useRef<number>(-1);
  const queuedCommandRef = useRef<string | null>(pendingCommand || null);

  // Initialize theme based on user/system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches &&
        !document.documentElement.classList.contains("light");
      setThemeMode(isDark ? "dark" : "light");
    }
  }, []);

  const currentFontFamily =
    TERMINAL_FONTS.find((f) => f.id === selectedFont)?.family ||
    TERMINAL_FONTS[0].family;

  // Dynamically apply font family & font size changes to active xterm instance
  useEffect(() => {
    if (xtermInstance.current) {
      xtermInstance.current.options.fontFamily = currentFontFamily;
      xtermInstance.current.options.fontSize = fontSize;
      try {
        fitAddonInstance.current?.fit();
      } catch {
        // ignore layout fit errors
      }
    }
  }, [currentFontFamily, fontSize]);

  // Dynamically apply theme changes to active xterm instance
  useEffect(() => {
    if (xtermInstance.current) {
      const isLight = themeMode === "light";
      xtermInstance.current.options.theme = isLight
        ? {
            background: "#FAFAFA",
            foreground: "#18181B",
            cursor: "#18181B",
            cursorAccent: "#FAFAFA",
            selectionBackground: "rgba(99, 102, 241, 0.2)",
            black: "#18181B",
            red: "#E11D48",
            green: "#059669",
            yellow: "#D97706",
            blue: "#2563EB",
            magenta: "#9333EA",
            cyan: "#0891B2",
            white: "#71717A",
            brightBlack: "#52525B",
            brightRed: "#BE123C",
            brightGreen: "#047857",
            brightYellow: "#B45309",
            brightBlue: "#1D4ED8",
            brightMagenta: "#7E22CE",
            brightCyan: "#0E7490",
            brightWhite: "#09090B",
          }
        : {
            background: "#090A0E",
            foreground: "#EDEDED",
            cursor: "#10B981",
            cursorAccent: "#090A0E",
            selectionBackground: "rgba(99, 102, 241, 0.35)",
            black: "#18181B",
            red: "#F43F5E",
            green: "#10B981",
            yellow: "#F59E0B",
            blue: "#6366F1",
            magenta: "#A855F7",
            cyan: "#06B6D4",
            white: "#EDEDED",
            brightBlack: "#71717A",
            brightRed: "#FB7185",
            brightGreen: "#34D399",
            brightYellow: "#FBBF24",
            brightBlue: "#818CF8",
            brightMagenta: "#C084FC",
            brightCyan: "#22D3EE",
            brightWhite: "#FFFFFF",
          };
    }
  }, [themeMode]);

  useEffect(() => {
    if (!activeLane) return;

    let term: any = null;
    let fitAddon: any = null;
    let ws: WebSocket | null = null;
    let isDisposed = false;

    async function initTerminal() {
      if (!terminalRef.current) return;

      // Dynamic import of xterm to prevent SSR window issues
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      if (isDisposed || !terminalRef.current) return;

      // Clear any previous container content
      terminalRef.current.innerHTML = "";

      const isLight = themeMode === "light";

      term = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        cursorWidth: 2,
        fontSize: fontSize,
        fontWeight: "400",
        fontWeightBold: "600",
        lineHeight: 1.45,
        letterSpacing: 0,
        fontFamily: currentFontFamily,
        allowTransparency: true,
        theme: isLight
          ? {
              background: "#FAFAFA",
              foreground: "#18181B",
              cursor: "#18181B",
              cursorAccent: "#FAFAFA",
              selectionBackground: "rgba(99, 102, 241, 0.2)",
              black: "#18181B",
              red: "#E11D48",
              green: "#059669",
              yellow: "#D97706",
              blue: "#2563EB",
              magenta: "#9333EA",
              cyan: "#0891B2",
              white: "#71717A",
              brightBlack: "#52525B",
              brightRed: "#BE123C",
              brightGreen: "#047857",
              brightYellow: "#B45309",
              brightBlue: "#1D4ED8",
              brightMagenta: "#7E22CE",
              brightCyan: "#0E7490",
              brightWhite: "#09090B",
            }
          : {
              background: "#090A0E",
              foreground: "#EDEDED",
              cursor: "#10B981",
              cursorAccent: "#090A0E",
              selectionBackground: "rgba(99, 102, 241, 0.35)",
              black: "#18181B",
              red: "#F43F5E",
              green: "#10B981",
              yellow: "#F59E0B",
              blue: "#6366F1",
              magenta: "#A855F7",
              cyan: "#06B6D4",
              white: "#EDEDED",
              brightBlack: "#71717A",
              brightRed: "#FB7185",
              brightGreen: "#34D399",
              brightYellow: "#FBBF24",
              brightBlue: "#818CF8",
              brightMagenta: "#C084FC",
              brightCyan: "#22D3EE",
              brightWhite: "#FFFFFF",
            },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      if (terminalRef.current) {
        terminalRef.current.innerHTML = "";
      }
      term.open(terminalRef.current);

      const safeFit = () => {
        try {
          if (
            fitAddon &&
            terminalRef.current &&
            terminalRef.current.clientWidth > 0 &&
            terminalRef.current.clientHeight > 0
          ) {
            fitAddon.fit();
          }
        } catch {
          // ignore layout transition fits
        }
      };

      requestAnimationFrame(() => {
        safeFit();
        term.focus();
      });

      xtermInstance.current = term;
      fitAddonInstance.current = fitAddon;

      // Modern Pro-Developer Welcome Card (Themed)
      const worktreeName = project?.slug || project?.name || "workspace";
      const branchName = activeLane?.branch || "main";

      if (isLight) {
        term.writeln("\x1b[1;38;2;99;102;241m▲\x1b[0m \x1b[1;38;2;24;24;27mCongruence Terminal Gateway\x1b[0m \x1b[38;2;113;113;122m(worktree: \x1b[38;2;24;24;27m" + worktreeName + "\x1b[38;2;113;113;122m | branch: \x1b[38;2;217;119;6m" + branchName + "\x1b[38;2;113;113;122m)\x1b[0m");
        term.writeln("\x1b[38;2;217;119;6m⏳ Connecting to Host PTY...\x1b[0m\r\n");
      } else {
        term.writeln("\x1b[1;38;2;99;102;241m▲\x1b[0m \x1b[1;38;2;237;237;237mCongruence Terminal Gateway\x1b[0m \x1b[38;2;113;113;122m(worktree: \x1b[38;2;237;237;237m" + worktreeName + "\x1b[38;2;113;113;122m | branch: \x1b[38;2;232;128;74m" + branchName + "\x1b[38;2;113;113;122m)\x1b[0m");
        term.writeln("\x1b[38;2;251;191;36m⏳ Connecting to Host PTY...\x1b[0m\r\n");
      }

      // Connect to real backend WebSocket
      try {
        const wsProtocol =
          typeof window !== "undefined" && window.location.protocol === "https:"
            ? "wss:"
            : "ws:";
        const rawWs =
          process.env.NEXT_PUBLIC_WS_URL ||
          `${wsProtocol}//${
            typeof window !== "undefined" ? window.location.hostname : "localhost"
          }:8000/api/v1`;
        // The gateway enforces auth + lane tenancy; attach a bearer token.
        let wsToken = await getToken().catch(() => null);
        if (!wsToken && (process.env.NODE_ENV === "development" || typeof window !== "undefined")) {
          wsToken = "mock_user_admin";
        }
        const cleanBase = rawWs.replace(/\/+$/, "").replace(/\/ws.*$/, "");
        const wsUrl = `${cleanBase}/ws/session/sess_${
          activeLane?.id || "main"
        }${wsToken ? `?token=${encodeURIComponent(wsToken)}` : ""}`;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) return;
          setConnected(true);
          term.writeln("\x1b[38;2;16;185;129m✓ Connected to Host Container\x1b[0m\r\n");
          // Spawn interactive PTY on host
          ws?.send(
            JSON.stringify({
              type: "spawn_pty",
              lane_id: activeLane?.id || "main",
              command: shellType === "bash" ? "/bin/bash" : shellType === "node" ? "node" : "/bin/zsh",
              cols: term.cols || 80,
              rows: term.rows || 24,
            })
          );
        };

        ws.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "pty_output" && msg.data) {
              term.write(msg.data);
            } else if (msg.type === "pty_spawned") {
              ptyIdRef.current = msg.pty_id;
              term.focus();
              if (queuedCommandRef.current) {
                const queued = queuedCommandRef.current;
                queuedCommandRef.current = null;
                ws?.send(
                  JSON.stringify({
                    type: "pty_input",
                    pty_id: msg.pty_id,
                    lane_id: activeLane?.id,
                    data: `${queued}\n`,
                  })
                );
              }
            } else if (msg.type === "pty_input_denied") {
              term.writeln(`\r\n\x1b[31m[Denied] ${msg.reason}\x1b[0m\r\n`);
            } else if (msg.type === "error" && msg.detail) {
              term.writeln(`\r\n\x1b[31m[Error] ${msg.detail}\x1b[0m\r\n`);
            }
          } catch {
            term.write(event.data);
          }
        };

        ws.onerror = (_err) => {
          if (isDisposed) return;
          setConnected(false);
          ptyIdRef.current = null;
        };

        ws.onclose = () => {
          if (isDisposed) return;
          setConnected(false);
          ptyIdRef.current = null;
          term.writeln("\r\n\x1b[31m[Disconnected from Host PTY]\x1b[0m \x1b[90mEnsure backend is running at localhost:8000\x1b[0m\r\n");
        };

        term.onData((data: string) => {
          const currentPty = ptyIdRef.current;
          if (ws && ws.readyState === WebSocket.OPEN && currentPty) {
            ws.send(
              JSON.stringify({
                type: "pty_input",
                pty_id: currentPty,
                lane_id: activeLane?.id,
                data,
              })
            );
          }
        });

        // Add explicit clipboard paste listener
        const container = terminalRef.current;
        const handlePaste = (e: ClipboardEvent) => {
          const text = e.clipboardData?.getData("text");
          if (text) {
            e.preventDefault();
            const currentPty = ptyIdRef.current;
            if (ws && ws.readyState === WebSocket.OPEN && currentPty) {
              ws.send(
                JSON.stringify({
                  type: "pty_input",
                  pty_id: currentPty,
                  lane_id: activeLane?.id,
                  data: text,
                })
              );
            }
          }
        };

        if (container) {
          container.addEventListener("paste", handlePaste);
        }
      } catch (err) {
        if (!isDisposed) {
          setConnected(false);
          ptyIdRef.current = null;
        }
      }
    }

    initTerminal();

    let resizeObserver: ResizeObserver | null = null;
    if (terminalRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (
          fitAddonInstance.current &&
          terminalRef.current &&
          terminalRef.current.clientWidth > 0
        ) {
          try {
            fitAddonInstance.current.fit();
            if (
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN &&
              ptyIdRef.current &&
              xtermInstance.current
            ) {
              wsRef.current.send(
                JSON.stringify({
                  type: "pty_resize",
                  pty_id: ptyIdRef.current,
                  cols: xtermInstance.current.cols,
                  rows: xtermInstance.current.rows,
                })
              );
            }
          } catch {
            // ignore
          }
        }
      });
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      isDisposed = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
      if (term) {
        term.dispose();
      }
      if (terminalRef.current) {
        terminalRef.current.innerHTML = "";
      }
      wsRef.current = null;
      xtermInstance.current = null;
      fitAddonInstance.current = null;
      ptyIdRef.current = null;
    };
  }, [activeLane?.id, project?.slug, themeMode, currentFontFamily, fontSize, shellType]);

  // Run pending external commands
  useEffect(() => {
    if (!pendingCommand) return;
    executeCommand(pendingCommand);
    clearPendingCommand();
  }, [pendingCommand, clearPendingCommand]);

  const executeCommand = (cmd: string) => {
    if (xtermInstance.current) {
      const currentPty = ptyIdRef.current;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentPty) {
        wsRef.current.send(
          JSON.stringify({
            type: "pty_input",
            pty_id: currentPty,
            lane_id: activeLane?.id,
            data: `${cmd}\n`,
          })
        );
      } else {
        queuedCommandRef.current = cmd;
      }
    }
  };

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      const currentPty = ptyIdRef.current;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentPty) {
        wsRef.current.send(
          JSON.stringify({
            type: "pty_input",
            pty_id: currentPty,
            lane_id: activeLane?.id,
            data: "clear\n",
          })
        );
      }
    }
  };

  const handleRestart = () => {
    if (xtermInstance.current) {
      xtermInstance.current.reset();
      const term = xtermInstance.current;
      const isLight = themeMode === "light";
      term.writeln(
        isLight
          ? "\x1b[38;2;169;78;25m◆ Congruence Session Gateway (Restarting Host PTY...)\x1b[0m\r\n"
          : "\x1b[38;2;232;128;74m◆ Congruence Session Gateway (Restarting Host PTY...)\x1b[0m\r\n"
      );

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeLane) {
        wsRef.current.send(
          JSON.stringify({
            type: "spawn_pty",
            lane_id: activeLane.id,
            command: shellType === "bash" ? "/bin/bash" : shellType === "node" ? "node" : "/bin/zsh",
            cols: term.cols || 80,
            rows: term.rows || 24,
          })
        );
      }
    }
  };

  const handleCopy = () => {
    if (xtermInstance.current) {
      const buffer = xtermInstance.current.getSelection();
      if (buffer) {
        navigator.clipboard.writeText(buffer);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const isLight = themeMode === "light";

  return (
    <div className="flex h-full w-full flex-col bg-[#FAFAFA] dark:bg-[#090A0E] overflow-hidden select-none font-sans">
      {/* Top Header / Action Toolbar (h-9) */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0E0E12] px-3 select-none gap-2">
        {/* Left: Shell Selector + Branch Breadcrumb + Live PTY Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Shell Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-xs font-mono font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                title="Switch shell environment"
              >
                <TerminalIcon className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>{shellType}</span>
                <ChevronDown className="size-2.5 text-zinc-400 shrink-0 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className="w-48 bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-[6px] shadow-xl p-1 text-xs select-none z-50 font-sans"
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1 tracking-wider">
                Shell Environment
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setShellType("zsh")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono"
              >
                <span className="text-emerald-500 font-bold">›_</span>
                <span>/bin/zsh (Default)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShellType("bash")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono"
              >
                <span className="text-amber-500 font-bold">›_</span>
                <span>/bin/bash</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShellType("node")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono"
              >
                <span className="text-emerald-500">⬢</span>
                <span>Node.js REPL</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-zinc-300 dark:text-zinc-700 text-xs select-none">/</span>

          {/* Worktree Branch */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <GitBranch className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span className="truncate max-w-[150px] font-medium text-zinc-800 dark:text-zinc-200">
              {activeLane?.branch || "main"}
            </span>
          </div>

          {/* Minimal Live Status Tag */}
          <div
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 text-[10px] font-mono select-none"
            title={connected ? "Connected to live Host PTY session" : "Disconnected from Host PTY"}
          >
            <span
              className={`size-1.5 rounded-full ${
                connected
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse"
                  : "bg-rose-500 dark:bg-rose-600"
              }`}
            />
            <span className={`uppercase tracking-wider font-semibold ${
              connected ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"
            }`}>
              {connected ? "LIVE PTY" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Center: Sleek Segmented Quick Command Bar */}
        <div className="hidden md:flex items-center p-0.5 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-[5px] border border-zinc-200/60 dark:border-zinc-800/60 gap-0.5">
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc.label}
              type="button"
              onClick={() => executeCommand(qc.cmd)}
              className="px-2 py-0.5 text-[11px] font-mono rounded-[3.5px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-900/90 hover:shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
              title={`Run '${qc.cmd}'`}
            >
              <span className="text-zinc-400 dark:text-zinc-500 mr-0.5">$</span>
              {qc.label.replace("pnpm ", "").replace("git ", "")}
            </button>
          ))}
        </div>

        {/* Right: Actions (Font Switcher, Theme Toggle, Copy, Clear, Restart) */}
        <div className="flex items-center gap-0.5 shrink-0 text-zinc-500 dark:text-zinc-400">
          {/* Typography & Font Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Change terminal font & size"
                className="flex items-center gap-1 px-1.5 py-1 text-xs hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded-[4px]"
              >
                <Type className="size-3.5" />
                <span className="text-[10px] font-mono hidden xl:inline">
                  {TERMINAL_FONTS.find((f) => f.id === selectedFont)?.name.split(" ")[0]}
                </span>
                <ChevronDown className="size-2.5 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-52 bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-[6px] shadow-xl p-1 text-xs select-none z-50 font-sans"
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1 tracking-wider">
                Monospace Font
              </DropdownMenuLabel>
              {TERMINAL_FONTS.map((font) => (
                <DropdownMenuItem
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-[4px] cursor-pointer text-xs ${
                    selectedFont === font.id
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span style={{ fontFamily: font.family }}>{font.name}</span>
                  {selectedFont === font.id && (
                    <Check className="size-3 text-emerald-600" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1 tracking-wider">
                Font Size
              </DropdownMenuLabel>
              <div className="flex items-center justify-between px-2 py-1 gap-1">
                {[11, 12, 13, 14, 15].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-1 text-[11px] font-mono rounded-[3px] border transition-colors cursor-pointer ${
                      fontSize === size
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Light / Dark Toggle */}
          <button
            type="button"
            onClick={() => setThemeMode(isLight ? "dark" : "light")}
            title={`Switch to ${isLight ? "Dark" : "Light"} terminal`}
            className="flex size-7 items-center justify-center rounded-[4px] hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            {isLight ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy selection"
            className="flex size-7 items-center justify-center rounded-[4px] hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600 stroke-[2.5]" />
            ) : (
              <Copy className="size-3.5 stroke-[2]" />
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            title="Clear terminal buffer"
            className="flex size-7 items-center justify-center rounded-[4px] hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3.5 stroke-[2]" />
          </button>
          <button
            type="button"
            onClick={handleRestart}
            title="Restart session PTY"
            className="flex size-7 items-center justify-center rounded-[4px] hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport Canvas */}
      <div
        className={`flex-1 w-full h-full p-3.5 pl-4 overflow-hidden focus:outline-none cursor-text ${
          isLight ? "bg-[#FAFAFA]" : "bg-[#090A0E]"
        }`}
        onClick={() => xtermInstance.current?.focus()}
        ref={terminalRef}
      />
    </div>
  );
}
