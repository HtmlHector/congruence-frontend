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

  const [connected, setConnected] = useState(false);
  const [ptyId, setPtyId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLane) return;

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

      // Header
      term.writeln("\x1b[38;2;232;128;74m◆ Congruence Session Gateway\x1b[0m");
      term.writeln(
        `\x1b[90mLane: \x1b[37m${activeLane?.name || "main"}\x1b[90m | Branch: \x1b[37m${activeLane?.branch || "main"}\x1b[0m\r\n`
      );

      // Connect to real backend WebSocket
      try {
        const wsUrl = `${WS_BASE_URL}/ws/session/sess_${activeLane?.id || "main"}`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          // Spawn PTY on backend
          ws?.send(
            JSON.stringify({
              type: "spawn_pty",
              lane_id: activeLane?.id,
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
            } else if (msg.type === "pty_input_denied") {
              term.writeln(`\r\n\x1b[31m[Denied] ${msg.reason}\x1b[0m\r\n`);
            }
          } catch {
            term.write(event.data);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          term.writeln("\r\n\x1b[90m[Disconnected from session gateway · Reconnecting...]\x1b[0m\r\n");
        };

        term.onData((data: string) => {
          if (ws && ws.readyState === WebSocket.OPEN && ptyId) {
            ws.send(
              JSON.stringify({
                type: "pty_input",
                pty_id: ptyId,
                lane_id: activeLane?.id,
                data,
              })
            );
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
        if (
          wsRef.current &&
          wsRef.current.readyState === WebSocket.OPEN &&
          ptyId &&
          xtermInstance.current
        ) {
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
  }, [activeLane?.id]);

  // Execute external commands directly in real PTY
  useEffect(() => {
    if (!pendingCommand || !xtermInstance.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && ptyId) {
      wsRef.current.send(
        JSON.stringify({
          type: "pty_input",
          pty_id: ptyId,
          lane_id: activeLane?.id,
          data: `${pendingCommand}\n`,
        })
      );
    }
    clearPendingCommand();
  }, [pendingCommand, activeLane?.id, clearPendingCommand, ptyId]);

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
            cols: xtermInstance.current.cols,
            rows: xtermInstance.current.rows,
          })
        );
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-[var(--terminal-bg)] text-xs font-mono select-text">
      {/* Terminal Top Bar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-primary)] px-3 text-[11px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-[var(--accent-claude)]" />
          <span className="font-medium text-[var(--foreground)]">
            PTY · {activeLane?.name || "main"}
          </span>
          <span className="text-[10px] text-[var(--subtle-foreground)] border-l border-[var(--border)] pl-2">
            worktree: {activeLane?.branch || "main"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
            <span
              className={`size-1.5 rounded-full ${
                connected ? "bg-[var(--status-awake)]" : "bg-rose-500"
              }`}
            />
            {connected ? "Gateway Live" : "Connecting..."}
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
              Terminal state and files preserved on persistent disk. Wake host to resume interactive CLI session.
            </p>
          </div>
        )}

        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
}
