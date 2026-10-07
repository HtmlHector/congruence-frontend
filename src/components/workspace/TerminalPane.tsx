"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { RotateCcw, Trash2 } from "lucide-react";
import { WS_BASE_URL } from "@/lib/api";

export function TerminalPane() {
  const { activeLane, hostState, pendingCommand, clearPendingCommand } = useWorkspace();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<any>(null);
  const fitAddonInstance = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const ptyIdRef = useRef<string | null>(null);

  const [connected, setConnected] = useState(false);
  const [ptyId, setPtyId] = useState<string | null>(null);

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

      term = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 12,
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        theme: {
          background: "#FFFFFF",
          foreground: "#18181B",
          cursor: "#18181B",
          cursorAccent: "#FFFFFF",
          selectionBackground: "rgba(232, 128, 74, 0.25)",
          black: "#18181B",
          red: "#DC2626",
          green: "#16A34A",
          yellow: "#D97706",
          blue: "#2563EB",
          magenta: "#9333EA",
          cyan: "#0891B2",
          white: "#71717A",
          brightBlack: "#71717A",
          brightRed: "#EF4444",
          brightGreen: "#22C55E",
          brightYellow: "#F59E0B",
          brightBlue: "#3B82F6",
          brightMagenta: "#A855F7",
          brightCyan: "#06B6D4",
          brightWhite: "#09090B",
        },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      term.open(terminalRef.current);

      const safeFit = () => {
        try {
          if (fitAddon && terminalRef.current && terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
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

      // Header
      term.writeln("\x1b[38;2;232;128;74m◆ Congruence Session Gateway\x1b[0m");
      term.writeln(
        `\x1b[90mLane: \x1b[38;2;24;24;27m${activeLane?.name || "main"}\x1b[90m | Branch: \x1b[38;2;24;24;27m${activeLane?.branch || "main"}\x1b[0m\r\n`
      );

      // Connect to real backend WebSocket
      try {
        const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
        const rawWs = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/v1`;
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
              command: "/bin/sh",
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
              setPtyId(msg.pty_id);
              ptyIdRef.current = msg.pty_id;
            } else if (msg.type === "pty_input_denied") {
              term.writeln(`\r\n\x1b[31m[Denied] ${msg.reason}\x1b[0m\r\n`);
            }
          } catch {
            term.write(event.data);
          }
        };

        ws.onerror = (err) => {
          console.warn("PTY WebSocket encounter:", err);
        };

        ws.onclose = () => {
          if (isDisposed) return;
          setConnected(false);
          term.writeln("\r\n\x1b[90m[Session gateway closed]\x1b[0m\r\n");
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
      } catch (err) {
        console.error("Failed to connect PTY websocket:", err);
        setConnected(false);
      }
    }

    initTerminal();

    let resizeObserver: ResizeObserver | null = null;
    if (terminalRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (fitAddonInstance.current && terminalRef.current && terminalRef.current.clientWidth > 0) {
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
  }, [activeLane?.id]);

  // Execute external commands directly in real PTY
  useEffect(() => {
    if (!pendingCommand) return;
    const currentPty = ptyIdRef.current;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentPty) {
      wsRef.current.send(
        JSON.stringify({
          type: "pty_input",
          pty_id: currentPty,
          lane_id: activeLane?.id,
          data: `${pendingCommand}\n`,
        })
      );
    }
    clearPendingCommand();
  }, [pendingCommand, activeLane?.id, clearPendingCommand]);

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
    }
  };

  const handleRestart = () => {
    if (xtermInstance.current) {
      xtermInstance.current.reset();
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeLane) {
        wsRef.current.send(
          JSON.stringify({
            type: "spawn_pty",
            lane_id: activeLane.id,
            command: "/bin/sh",
            cols: xtermInstance.current.cols || 80,
            rows: xtermInstance.current.rows || 24,
          })
        );
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-white text-zinc-900 overflow-hidden">
      {/* Top Terminal Action Bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-primary)]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`size-2 rounded-full ${
              connected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
            }`}
          />
          <span className="text-[var(--foreground)] font-medium">
            PTY · {activeLane?.name || "Pair lane"}
          </span>
          <span className="text-[var(--muted-foreground)] text-[10px]">
            worktree: {activeLane?.branch || "main"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono ${
              connected ? "text-emerald-600 font-medium" : "text-amber-600"
            }`}
          >
            {connected ? "Connected" : "Connecting..."}
          </span>
          <button
            type="button"
            onClick={handleClear}
            title="Clear terminal"
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded hover:bg-[var(--surface-secondary)]"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRestart}
            title="Restart session PTY"
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded hover:bg-[var(--surface-secondary)]"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 w-full h-full p-3 overflow-hidden bg-white" ref={terminalRef} />
    </div>
  );
}
