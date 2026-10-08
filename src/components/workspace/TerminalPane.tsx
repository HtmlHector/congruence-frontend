"use client";

import React, { useEffect, useRef, useState } from "react";
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
  { label: "npm run dev", cmd: "npm run dev" },
  { label: "git log", cmd: "git log --oneline -n 5" },
  { label: "pnpm test", cmd: "pnpm test" },
];

const TERMINAL_FONTS = [
  {
    id: "sfmono",
    name: "SF Mono (macOS)",
    family: '"SF Mono", "SF Pro Mono", Menlo, Monaco, Consolas, monospace',
  },
  {
    id: "jetbrains",
    name: "JetBrains Mono",
    family: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  },
  {
    id: "geist",
    name: "Geist Mono",
    family: '"Geist Mono", "SF Mono", Menlo, monospace',
  },
  {
    id: "fira",
    name: "Fira Code",
    family: '"Fira Code", "SF Mono", Menlo, monospace',
  },
  {
    id: "menlo",
    name: "Menlo Classic",
    family: 'Menlo, Monaco, "Courier New", monospace',
  },
];

export function TerminalPane() {
  const { activeLane, hostState, pendingCommand, clearPendingCommand, project } =
    useWorkspace();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<any>(null);
  const fitAddonInstance = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const ptyIdRef = useRef<string | null>(null);

  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shellType, setShellType] = useState<"zsh" | "bash" | "node">("zsh");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [selectedFont, setSelectedFont] = useState<string>("sfmono");
  const [fontSize, setFontSize] = useState<number>(13);

  // Local fallback shell state for offline/demo interactive support
  const localInputBuffer = useRef<string>("");
  const commandHistory = useRef<string[]>([]);
  const historyIdx = useRef<number>(-1);

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
        lineHeight: 1.38,
        letterSpacing: 0,
        fontFamily: currentFontFamily,
        allowTransparency: true,
        theme: isLight
          ? {
              background: "#FFFFFF",
              foreground: "#18181B",
              cursor: "#18181B",
              cursorAccent: "#FFFFFF",
              selectionBackground: "rgba(169, 78, 25, 0.2)",
              black: "#18181B",
              red: "#DC2626",
              green: "#047857",
              yellow: "#B45309",
              blue: "#1D4ED8",
              magenta: "#7E22CE",
              cyan: "#0E7490",
              white: "#71717A",
              brightBlack: "#52525B",
              brightRed: "#B91C1C",
              brightGreen: "#15803D",
              brightYellow: "#92400E",
              brightBlue: "#1E40AF",
              brightMagenta: "#6B21A8",
              brightCyan: "#155E75",
              brightWhite: "#09090B",
            }
          : {
              background: "#08080A",
              foreground: "#EDEDED",
              cursor: "#10B981",
              cursorAccent: "#08080A",
              selectionBackground: "rgba(232, 128, 74, 0.35)",
              black: "#18181B",
              red: "#EF4444",
              green: "#10B981",
              yellow: "#F59E0B",
              blue: "#3B82F6",
              magenta: "#A855F7",
              cyan: "#06B6D4",
              white: "#EDEDED",
              brightBlack: "#71717A",
              brightRed: "#F87171",
              brightGreen: "#34D399",
              brightYellow: "#FBBF24",
              brightBlue: "#60A5FA",
              brightMagenta: "#C084FC",
              brightCyan: "#22D3EE",
              brightWhite: "#FFFFFF",
            },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

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
      });

      xtermInstance.current = term;
      fitAddonInstance.current = fitAddon;

      // Print High-Fidelity Gateway Banner (Themed)
      if (isLight) {
        term.writeln("\x1b[38;2;169;78;25m┌─────────────────────────────────────────────────────────────┐\x1b[0m");
        term.writeln("\x1b[38;2;169;78;25m│\x1b[0m  \x1b[1;38;2;24;24;27mCONGRUENCE SESSION GATEWAY\x1b[0m \x1b[38;2;4;120;87m● HOST ONLINE\x1b[0m                   \x1b[38;2;169;78;25m│\x1b[0m");
        term.writeln(
          `\x1b[38;2;169;78;25m│\x1b[0m  \x1b[38;2;113;113;122mWorktree:\x1b[0m \x1b[38;2;24;24;27m${project?.slug || "ecommerce-test-app"}\x1b[0m  \x1b[38;2;113;113;122mBranch:\x1b[0m \x1b[38;2;4;120;87m${activeLane?.branch || "main"}\x1b[0m     \x1b[38;2;169;78;25m│\x1b[0m`
        );
        term.writeln("\x1b[38;2;169;78;25m│\x1b[0m  \x1b[38;2;113;113;122mType \x1b[38;2;180;83;9m'help'\x1b[38;2;113;113;122m or click quick chips to dispatch commands     \x1b[38;2;169;78;25m│\x1b[0m");
        term.writeln("\x1b[38;2;169;78;25m└─────────────────────────────────────────────────────────────┘\x1b[0m\r\n");
      } else {
        term.writeln("\x1b[38;2;232;128;74m┌─────────────────────────────────────────────────────────────┐\x1b[0m");
        term.writeln("\x1b[38;2;232;128;74m│\x1b[0m  \x1b[1;38;2;255;255;255mCONGRUENCE SESSION GATEWAY\x1b[0m \x1b[38;2;16;185;129m● HOST ONLINE\x1b[0m                   \x1b[38;2;232;128;74m│\x1b[0m");
        term.writeln(
          `\x1b[38;2;232;128;74m│\x1b[0m  \x1b[90mWorktree:\x1b[0m \x1b[38;2;237;237;237m${project?.slug || "ecommerce-test-app"}\x1b[0m  \x1b[90mBranch:\x1b[0m \x1b[38;2;16;185;129m${activeLane?.branch || "main"}\x1b[0m     \x1b[38;2;232;128;74m│\x1b[0m`
        );
        term.writeln("\x1b[38;2;232;128;74m│\x1b[0m  \x1b[90mType \x1b[38;2;251;191;36m'help'\x1b[90m or click quick chips to dispatch commands     \x1b[38;2;232;128;74m│\x1b[0m");
        term.writeln("\x1b[38;2;232;128;74m└─────────────────────────────────────────────────────────────┘\x1b[0m\r\n");
      }

      const promptStr = isLight
        ? `\x1b[1;38;2;4;120;87m➜\x1b[0m \x1b[1;38;2;29;78;216m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[38;2;113;113;122mon\x1b[0m \x1b[38;2;169;78;25mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;24;24;27m$\x1b[0m `
        : `\x1b[1;38;2;16;185;129m➜\x1b[0m \x1b[1;38;2;96;165;250m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[90mon\x1b[0m \x1b[38;2;232;128;74mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;255;255;255m$\x1b[0m `;

      const printPrompt = () => {
        term.write(promptStr);
      };

      printPrompt();

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
        const cleanBase = rawWs.replace(/\/+$/, "").replace(/\/ws.*$/, "");
        const wsUrl = `${cleanBase}/ws/session/sess_${activeLane?.id || "main"}`;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) return;
          setConnected(true);
          // Spawn interactive PTY on host
          ws?.send(
            JSON.stringify({
              type: "spawn_pty",
              lane_id: activeLane?.id || "main",
              command: "/bin/zsh",
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
            } else if (msg.type === "pty_input_denied") {
              term.writeln(`\r\n\x1b[31m[Denied] ${msg.reason}\x1b[0m\r\n`);
            }
          } catch {
            term.write(event.data);
          }
        };

        ws.onerror = (_err) => {
          setConnected(false);
        };

        ws.onclose = () => {
          if (isDisposed) return;
          setConnected(false);
        };

        term.onData((data: string) => {
          const currentPty = ptyIdRef.current;
          // If real backend PTY is active, forward bytes
          if (ws && ws.readyState === WebSocket.OPEN && currentPty) {
            ws.send(
              JSON.stringify({
                type: "pty_input",
                pty_id: currentPty,
                lane_id: activeLane?.id,
                data,
              })
            );
            return;
          }

          // Fallback interactive mock shell implementation
          if (data === "\r") {
            // Enter key
            const input = localInputBuffer.current.trim();
            term.writeln("");
            if (input) {
              commandHistory.current.push(input);
              historyIdx.current = commandHistory.current.length;
              handleLocalCommand(input, term, printPrompt);
            } else {
              printPrompt();
            }
            localInputBuffer.current = "";
          } else if (data === "\u007F") {
            // Backspace
            if (localInputBuffer.current.length > 0) {
              localInputBuffer.current = localInputBuffer.current.slice(0, -1);
              term.write("\b \b");
            }
          } else if (data === "\u001b[A") {
            // Up Arrow (History)
            if (historyIdx.current > 0) {
              historyIdx.current--;
              const cmd = commandHistory.current[historyIdx.current] || "";
              while (localInputBuffer.current.length > 0) {
                term.write("\b \b");
                localInputBuffer.current = localInputBuffer.current.slice(0, -1);
              }
              localInputBuffer.current = cmd;
              term.write(cmd);
            }
          } else if (data === "\u001b[B") {
            // Down Arrow (History)
            if (historyIdx.current < commandHistory.current.length - 1) {
              historyIdx.current++;
              const cmd = commandHistory.current[historyIdx.current] || "";
              while (localInputBuffer.current.length > 0) {
                term.write("\b \b");
                localInputBuffer.current = localInputBuffer.current.slice(0, -1);
              }
              localInputBuffer.current = cmd;
              term.write(cmd);
            } else {
              historyIdx.current = commandHistory.current.length;
              while (localInputBuffer.current.length > 0) {
                term.write("\b \b");
                localInputBuffer.current = localInputBuffer.current.slice(0, -1);
              }
            }
          } else if (data >= " " && data <= "~") {
            localInputBuffer.current += data;
            term.write(data);
          }
        });
      } catch (err) {
        setConnected(false);
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
        ws.close();
      }
      if (term) {
        term.dispose();
      }
      wsRef.current = null;
      xtermInstance.current = null;
      fitAddonInstance.current = null;
      ptyIdRef.current = null;
    };
  }, [activeLane?.id, project?.slug, themeMode, currentFontFamily, fontSize]);

  // Handle local simulated command execution
  const handleLocalCommand = (cmd: string, term: any, printPrompt: () => void) => {
    const parts = cmd.split(" ");
    const bin = parts[0];
    const isLight = themeMode === "light";

    if (bin === "help") {
      term.writeln(
        isLight
          ? "\x1b[1;38;2;24;24;27mCongruence Developer Shell Commands:\x1b[0m"
          : "\x1b[1;38;2;255;255;255mCongruence Developer Shell Commands:\x1b[0m"
      );
      term.writeln(
        isLight
          ? "  \x1b[38;2;4;120;87mgit status\x1b[0m     - Show branch status and modified files\r\n" +
              "  \x1b[38;2;4;120;87mnpm run dev\x1b[0m    - Start local Turbopack development server on :3000\r\n" +
              "  \x1b[38;2;4;120;87mpnpm test\x1b[0m      - Run Playwright and unit test suites\r\n" +
              "  \x1b[38;2;4;120;87mls / pwd\x1b[0m       - Inspect files in worktree workspace\r\n" +
              "  \x1b[38;2;4;120;87mclear\x1b[0m          - Clear current terminal screen"
          : "  \x1b[38;2;16;185;129mgit status\x1b[0m     - Show branch status and modified files\r\n" +
              "  \x1b[38;2;16;185;129mnpm run dev\x1b[0m    - Start local Turbopack development server on :3000\r\n" +
              "  \x1b[38;2;16;185;129mpnpm test\x1b[0m      - Run Playwright and unit test suites\r\n" +
              "  \x1b[38;2;16;185;129mls / pwd\x1b[0m       - Inspect files in worktree workspace\r\n" +
              "  \x1b[38;2;16;185;129mclear\x1b[0m          - Clear current terminal screen"
      );
    } else if (bin === "clear") {
      term.clear();
    } else if (bin === "pwd") {
      term.writeln(`/Users/admin/congruence-worktrees/${project?.slug || "ecommerce-test-app"}`);
    } else if (bin === "ls") {
      term.writeln("src/  public/  docs/  package.json  next.config.ts  design.md  README.md");
    } else if (cmd.startsWith("git status")) {
      term.writeln(
        isLight
          ? `## \x1b[38;2;4;120;87m${activeLane?.branch || "main"}\x1b[0m...origin/${activeLane?.branch || "main"}`
          : `## \x1b[38;2;16;185;129m${activeLane?.branch || "main"}\x1b[0m...origin/${activeLane?.branch || "main"}`
      );
      term.writeln(" M src/components/workspace/PreviewPane.tsx");
      term.writeln(" M src/components/workspace/TerminalPane.tsx");
      term.writeln(" M package.json");
    } else if (cmd.startsWith("npm run dev")) {
      term.writeln(
        isLight
          ? "\x1b[38;2;29;78;216m▲ Next.js 15.2.0 (Turbopack)\x1b[0m"
          : "\x1b[38;2;96;165;250m▲ Next.js 15.2.0 (Turbopack)\x1b[0m"
      );
      term.writeln("  - Local:        \x1b[4;38;2;37;99;235mhttp://localhost:3000\x1b[0m");
      term.writeln("  - Network:      \x1b[4;38;2;37;99;235mhttps://preview.congruence.dev\x1b[0m");
      term.writeln("  - Environments: .env.local");
      term.writeln(
        isLight
          ? "\x1b[38;2;4;120;87m✓ Ready in 210ms\x1b[0m"
          : "\x1b[38;2;16;185;129m✓ Ready in 210ms\x1b[0m"
      );
    } else if (cmd.startsWith("git log")) {
      term.writeln(
        isLight
          ? "\x1b[38;2;180;83;9m05b82c9\x1b[0m feat: redesign preview chrome with zero-rounding"
          : "\x1b[38;2;251;191;36m05b82c9\x1b[0m feat: redesign preview chrome with zero-rounding"
      );
      term.writeln(
        isLight
          ? "\x1b[38;2;180;83;9m4fa1d8e\x1b[0m feat: add multi-tab pane groups and drag-to-split"
          : "\x1b[38;2;251;191;36m4fa1d8e\x1b[0m feat: add multi-tab pane groups and drag-to-split"
      );
      term.writeln(
        isLight
          ? "\x1b[38;2;180;83;9m83a91c2\x1b[0m fix: center agent chat message bubbles and remove top line"
          : "\x1b[38;2;251;191;36m83a91c2\x1b[0m fix: center agent chat message bubbles and remove top line"
      );
    } else if (cmd.startsWith("pnpm test")) {
      term.writeln("Running 14 tests using 4 workers...");
      term.writeln(
        isLight
          ? "  \x1b[38;2;4;120;87m✓\x1b[0m [chromium] › e2e/workspace.spec.ts:14:5 › workspace loads (240ms)"
          : "  \x1b[38;2;16;185;129m✓\x1b[0m [chromium] › e2e/workspace.spec.ts:14:5 › workspace loads (240ms)"
      );
      term.writeln(
        isLight
          ? "  \x1b[38;2;4;120;87m✓\x1b[0m [chromium] › e2e/panes.spec.ts:28:5 › split drag drop (310ms)"
          : "  \x1b[38;2;16;185;129m✓\x1b[0m [chromium] › e2e/panes.spec.ts:28:5 › split drag drop (310ms)"
      );
      term.writeln(
        isLight
          ? "\x1b[38;2;4;120;87m14 passed (1.8s)\x1b[0m"
          : "\x1b[38;2;16;185;129m14 passed (1.8s)\x1b[0m"
      );
    } else {
      term.writeln(`Executed: ${cmd}`);
    }
    printPrompt();
  };

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
        const term = xtermInstance.current;
        term.writeln(cmd);
        const isLight = themeMode === "light";
        const promptStr = isLight
          ? `\x1b[1;38;2;4;120;87m➜\x1b[0m \x1b[1;38;2;29;78;216m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[38;2;113;113;122mon\x1b[0m \x1b[38;2;169;78;25mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;24;24;27m$\x1b[0m `
          : `\x1b[1;38;2;16;185;129m➜\x1b[0m \x1b[1;38;2;96;165;250m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[90mon\x1b[0m \x1b[38;2;232;128;74mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;255;255;255m$\x1b[0m `;
        handleLocalCommand(cmd, term, () => term.write(promptStr));
      }
    }
  };

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      const isLight = themeMode === "light";
      const promptStr = isLight
        ? `\x1b[1;38;2;4;120;87m➜\x1b[0m \x1b[1;38;2;29;78;216m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[38;2;113;113;122mon\x1b[0m \x1b[38;2;169;78;25mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;24;24;27m$\x1b[0m `
        : `\x1b[1;38;2;16;185;129m➜\x1b[0m \x1b[1;38;2;96;165;250m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[90mon\x1b[0m \x1b[38;2;232;128;74mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;255;255;255m$\x1b[0m `;
      xtermInstance.current.write(promptStr);
    }
  };

  const handleRestart = () => {
    if (xtermInstance.current) {
      xtermInstance.current.reset();
      const term = xtermInstance.current;
      const isLight = themeMode === "light";
      term.writeln(
        isLight
          ? "\x1b[38;2;169;78;25m◆ Congruence Session Gateway (Restarted)\x1b[0m\r\n"
          : "\x1b[38;2;232;128;74m◆ Congruence Session Gateway (Restarted)\x1b[0m\r\n"
      );
      const promptStr = isLight
        ? `\x1b[1;38;2;4;120;87m➜\x1b[0m \x1b[1;38;2;29;78;216m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[38;2;113;113;122mon\x1b[0m \x1b[38;2;169;78;25mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;24;24;27m$\x1b[0m `
        : `\x1b[1;38;2;16;185;129m➜\x1b[0m \x1b[1;38;2;96;165;250m${project?.slug || "ecommerce-test-app"}\x1b[0m \x1b[90mon\x1b[0m \x1b[38;2;232;128;74mgit:(${activeLane?.branch || "main"})\x1b[0m \x1b[1;38;2;255;255;255m$\x1b[0m `;
      term.write(promptStr);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeLane) {
        wsRef.current.send(
          JSON.stringify({
            type: "spawn_pty",
            lane_id: activeLane.id,
            command: "/bin/zsh",
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
    <div
      className={`flex h-full w-full flex-1 flex-col overflow-hidden rounded-[3.5px] select-none ${
        isLight ? "bg-white text-zinc-900" : "bg-[#08080A] text-[#EDEDED]"
      }`}
    >
      {/* Top Precision Terminal Toolbar (36px) */}
      <div
        className={`flex h-9 shrink-0 items-center justify-between border-b px-3 gap-2 rounded-[3.5px] ${
          isLight
            ? "border-zinc-200 bg-[#FAFAFA]"
            : "border-[#222227] bg-[#0E0E12]"
        }`}
      >
        {/* Left: Shell Badge + Worktree Metadata */}
        <div className="flex items-center gap-2 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-mono transition-colors cursor-pointer rounded-[3.5px] ${
                  isLight
                    ? "bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-950"
                    : "bg-[#16161B] hover:bg-[#1E1E24] border-[#222227] text-zinc-300 hover:text-white"
                }`}
              >
                <TerminalIcon
                  className={`size-3 ${
                    isLight ? "text-emerald-600" : "text-emerald-400"
                  }`}
                />
                <span className="font-semibold">{shellType}</span>
                <ChevronDown className="size-2.5 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={`w-44 border rounded-[3.5px] shadow-xl p-1 text-xs select-none ${
                isLight
                  ? "bg-white border-zinc-200 text-zinc-800"
                  : "bg-[#141418] border-[#222227] text-zinc-300"
              }`}
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                Select Shell
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setShellType("zsh")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono"
              >
                <span className="text-emerald-600 font-bold">›_</span>
                <span>/bin/zsh (Default)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShellType("bash")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono"
              >
                <span className="text-amber-600 font-bold">›_</span>
                <span>/bin/bash</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShellType("node")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono"
              >
                <span className="text-emerald-600">⬢</span>
                <span>Node.js REPL</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <GitBranch className="size-3 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[120px] font-medium">
              {activeLane?.branch || "main"}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-mono rounded-[3.5px] ${
              isLight
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-[3.5px] ${
                connected
                  ? isLight
                    ? "bg-emerald-600 animate-pulse"
                    : "bg-emerald-400 animate-pulse"
                  : isLight
                  ? "bg-emerald-600"
                  : "bg-emerald-500"
              }`}
            />
            <span className="uppercase tracking-wider font-semibold">
              {connected ? "LIVE WS" : "ACTIVE LOCAL"}
            </span>
          </div>
        </div>

        {/* Center: Quick Command Action Chips */}
        <div className="hidden md:flex items-center gap-1.5">
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc.label}
              type="button"
              onClick={() => executeCommand(qc.cmd)}
              className={`px-2 py-0.5 border text-[10px] font-mono transition-colors cursor-pointer rounded-[3.5px] ${
                isLight
                  ? "bg-white hover:bg-zinc-100 border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900"
                  : "bg-[#141418] hover:bg-[#1C1C22] border-[#222227] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
              title={`Execute '${qc.cmd}'`}
            >
              {qc.label}
            </button>
          ))}
        </div>

        {/* Right: Actions (Font Switcher, Theme Toggle, Copy, Clear, Restart) */}
        <div
          className={`flex items-center gap-1 shrink-0 ${
            isLight ? "text-zinc-600" : "text-zinc-400"
          }`}
        >
          {/* Typography & Font Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Change terminal font & size"
                className={`flex items-center gap-1 px-1.5 py-1 text-xs transition-colors cursor-pointer rounded-[3.5px] ${
                  isLight
                    ? "hover:bg-zinc-200/80 text-zinc-700"
                    : "hover:bg-[#1E1E24] text-zinc-300"
                }`}
              >
                <Type className="size-3.5" />
                <span className="text-[10px] font-mono hidden xl:inline">
                  {TERMINAL_FONTS.find((f) => f.id === selectedFont)?.name.split(" ")[0]}
                </span>
                <ChevronDown className="size-2 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`w-52 border rounded-[3.5px] shadow-xl p-1 text-xs select-none ${
                isLight
                  ? "bg-white border-zinc-200 text-zinc-800"
                  : "bg-[#141418] border-[#222227] text-zinc-300"
              }`}
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                Monospace Font
              </DropdownMenuLabel>
              {TERMINAL_FONTS.map((font) => (
                <DropdownMenuItem
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer text-xs ${
                    selectedFont === font.id
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span style={{ fontFamily: font.family }}>{font.name}</span>
                  {selectedFont === font.id && (
                    <Check className="size-3 text-emerald-600" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                Font Size
              </DropdownMenuLabel>
              <div className="flex items-center justify-between px-2 py-1 gap-1">
                {[11, 12, 13, 14, 15].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-1 text-[11px] font-mono rounded-[3.5px] border transition-colors cursor-pointer ${
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
            className={`flex size-7 items-center justify-center rounded-[3.5px] transition-colors cursor-pointer ${
              isLight ? "hover:bg-zinc-200/80 text-zinc-700" : "hover:bg-[#1E1E24] text-zinc-300"
            }`}
          >
            {isLight ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy selection"
            className={`flex size-7 items-center justify-center rounded-[3.5px] transition-colors cursor-pointer ${
              isLight ? "hover:bg-zinc-200/80 text-zinc-700" : "hover:bg-[#1E1E24] text-zinc-300"
            }`}
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
            className={`flex size-7 items-center justify-center rounded-[3.5px] transition-colors cursor-pointer ${
              isLight ? "hover:bg-zinc-200/80 text-zinc-700" : "hover:bg-[#1E1E24] text-zinc-300"
            }`}
          >
            <Trash2 className="size-3.5 stroke-[2]" />
          </button>
          <button
            type="button"
            onClick={handleRestart}
            title="Restart session PTY"
            className={`flex size-7 items-center justify-center rounded-[3.5px] transition-colors cursor-pointer ${
              isLight ? "hover:bg-zinc-200/80 text-zinc-700" : "hover:bg-[#1E1E24] text-zinc-300"
            }`}
          >
            <RotateCcw className="size-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport Canvas */}
      <div
        className={`flex-1 w-full h-full p-3 overflow-hidden rounded-[3.5px] focus:outline-none ${
          isLight ? "bg-white" : "bg-[#08080A]"
        }`}
        ref={terminalRef}
      />
    </div>
  );
}
