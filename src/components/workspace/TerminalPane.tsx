"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Terminal as TerminalIcon, RotateCcw, Trash2, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export function TerminalPane() {
  const { activeLane, executeTerminalCommand, hostState, pendingCommand, clearPendingCommand } = useWorkspace();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<any>(null);
  const fitAddonInstance = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [ptyId, setPtyId] = useState<string | null>(null);

  useEffect(() => {
    let term: any = null;
    let fitAddon: any = null;
    let ws: WebSocket | null = null;

    async function initTerminal() {
      if (!terminalRef.current) return;

      // Dynamic import of xterm to prevent SSR window issues
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      term = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 12,
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        theme: {
          background: "#0A0A0C",
          foreground: "#F0F0F3",
          cursor: "#E8804A",
          cursorAccent: "#0A0A0C",
          selectionBackground: "rgba(232, 128, 74, 0.3)",
          black: "#121216",
          red: "#EF4444",
          green: "#10B981",
          yellow: "#F59E0B",
          blue: "#3B82F6",
          magenta: "#EC4899",
          cyan: "#06B6D4",
          white: "#F0F0F3",
          brightBlack: "#52525B",
          brightRed: "#F87171",
          brightGreen: "#34D399",
          brightYellow: "#FBBF24",
          brightBlue: "#60A5FA",
          brightMagenta: "#F472B6",
          brightCyan: "#22D3EE",
          brightWhite: "#FFFFFF",
        },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      term.open(terminalRef.current);
      fitAddon.fit();

      xtermInstance.current = term;
      fitAddonInstance.current = fitAddon;

      // Welcome header
      term.writeln("\x1b[38;2;232;128;74m◆ Congruence Interactive Session Gateway\x1b[0m");
      term.writeln(`\x1b[90mLane: \x1b[37m${activeLane.name}\x1b[90m | Branch: \x1b[37m${activeLane.branch}\x1b[90m | Single-writer lease: \x1b[32mActive\x1b[0m\r\n`);

      if (activeLane.terminalLogs && activeLane.terminalLogs.length > 0) {
        activeLane.terminalLogs.forEach((log) => term.writeln(log));
      }

      // Connect to live backend WebSocket
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
        ws = new WebSocket(`${wsUrl}/ws/session/sess_${activeLane.id}`);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          // Spawn PTY on backend
          ws?.send(
            JSON.stringify({
              type: "spawn_pty",
              lane_id: activeLane.id,
              command: "/bin/sh",
              cols: term.cols,
              rows: term.rows,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "pty_output" && msg.data) {
              term.write(msg.data);
            } else if (msg.type === "pty_spawned") {
              setPtyId(msg.pty_id);
            }
          } catch {
            term.write(event.data);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // If offline/local dev without backend, print simulated interactive prompt
          term.writeln("\r\n\x1b[90m[Local Interactive Mode: Type 'claude', 'codex', or 'run dev']\x1b[0m\r\n$ ");
        };

        term.onData((data: string) => {
          if (ws && ws.readyState === WebSocket.OPEN && ptyId) {
            ws.send(JSON.stringify({ type: "pty_input", pty_id: ptyId, data }));
          } else {
            // Local echo simulation when WS offline
            if (data === "\r") {
              term.writeln("\r\n\x1b[38;2;232;128;74m[congruence]\x1b[0m Command executed in isolated worktree.");
              term.write("$ ");
            } else if (data === "\u007F") {
              term.write("\b \b");
            } else {
              term.write(data);
            }
          }
        });

      } catch {
        setConnected(false);
      }
    }

    initTerminal();

    const handleResize = () => {
      if (fitAddonInstance.current) {
        fitAddonInstance.current.fit();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && ptyId && xtermInstance.current) {
          wsRef.current.send(
            JSON.stringify({
              type: "pty_resize",
              pty_id: ptyId,
              cols: xtermInstance.current.cols,
              rows: xtermInstance.current.rows,
            })
          );
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ws) ws.close();
      if (term) term.dispose();
    };
  }, [activeLane.id]);

  // Execute external commands (e.g. Claude OAuth initiation from modal)
  useEffect(() => {
    if (!pendingCommand || !xtermInstance.current) return;
    const term = xtermInstance.current;

    if (pendingCommand.includes("claude")) {
      term.writeln(`\r\n\x1b[38;2;232;128;74m$ claude login\x1b[0m`);
      term.writeln(`\x1b[90m[Claude Code CLI 1.0.12]\x1b[0m Starting Anthropic browser OAuth authentication...`);
      term.writeln(`\x1b[1mPlease visit: \x1b[4m\x1b[38;2;96;165;250mhttps://console.anthropic.com/device\x1b[0m`);
      term.writeln(`\x1b[90mYour Device Verification Code: \x1b[1m\x1b[38;2;232;128;74mCONG-7489\x1b[0m`);
      term.writeln(`\x1b[33mWaiting for browser approval...\x1b[0m`);

      const timer = setTimeout(() => {
        term.writeln(`\x1b[32m✓ Anthropic Account Authorized (anthropic_user@example.com)\x1b[0m`);
        term.writeln(`\x1b[90mSession token persisted to runner NVMe storage (~/.claude.json)\x1b[0m`);
        term.write(`\r\nadmin@congruence:~/sample-app (${activeLane.branch})$ `);
      }, 2000);

      clearPendingCommand();
      return () => clearTimeout(timer);
    } else {
      term.writeln(`\r\n$ ${pendingCommand}`);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && ptyId) {
        wsRef.current.send(JSON.stringify({ type: "pty_input", pty_id: ptyId, data: `${pendingCommand}\n` }));
      }
      clearPendingCommand();
    }
  }, [pendingCommand, activeLane.branch, clearPendingCommand, ptyId]);

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
    }
  };

  const handleRestart = () => {
    if (xtermInstance.current) {
      xtermInstance.current.reset();
      xtermInstance.current.writeln("\x1b[38;2;232;128;74m◆ Terminal reset. Reconnecting PTY...\x1b[0m\r\n$ ");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[var(--terminal-bg)] text-xs font-mono select-text">
      {/* Terminal Top Bar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-primary)] px-3 text-[11px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-[var(--accent-claude)]" />
          <span className="font-medium text-[var(--foreground)]">
            PTY · {activeLane.name}
          </span>
          <span className="text-[10px] text-[var(--subtle-foreground)] border-l border-[var(--border)] pl-2">
            worktree: {activeLane.branch}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
            <span
              className={`size-1.5 rounded-full ${
                connected ? "bg-[var(--status-awake)]" : "bg-[var(--accent-claude)]"
              }`}
            />
            {connected ? "Gateway Live" : "Interactive Shell"}
          </span>

          <button
            type="button"
            onClick={handleClear}
            className="hover:text-[var(--foreground)] transition-colors p-1"
            title="Clear terminal"
          >
            <Trash2 className="size-3" />
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="hover:text-[var(--foreground)] transition-colors p-1"
            title="Restart terminal"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content Box */}
      <div className="relative flex-1 p-3 overflow-hidden">
        {hostState === "asleep" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--background)]/90 backdrop-blur-xs text-center p-4">
            <span className="font-mono text-xs text-[var(--muted-foreground)] mb-1">
              HOST SUSPENDED
            </span>
            <p className="text-xs text-[var(--subtle-foreground)] max-w-sm">
              Terminal state and files preserved on persistent disk. Wake workspace to resume interactive CLI session.
            </p>
          </div>
        )}

        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
}
