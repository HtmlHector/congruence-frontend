"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowUp,
  Plus,
  BarChart2,
  Cpu,
  Sliders,
  CheckCircle2,
  Clock,
  Terminal,
  FileCode,
  Info,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { TerminalPane } from "./TerminalPane";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  plan?: {
    id: string;
    label: string;
    status: "pending" | "in_progress" | "completed";
  }[];
  toolCalls?: {
    id: string;
    tool: string;
    params: string;
    output?: string;
    status: "running" | "done" | "error";
  }[];
  thinking?: string;
}

export function AgentChatPane() {
  const { project, activeLane, executeTerminalCommand, submitPrompt } = useWorkspace();
  const [viewMode, setViewMode] = useState<"chat" | "terminal">("chat");

  const [inputPrompt, setInputPrompt] = useState("");
  const [model, setModel] = useState("Opus 5");
  const [mode, setMode] = useState("Auto");
  const [specMode, setSpecMode] = useState(true);
  const [mcpCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_user_1",
      role: "user",
      content:
        "Migrate the auth service from REST to gRPC. Keep the REST endpoints working as a fallback.",
      timestamp: "10:42 AM",
    },
    {
      id: "msg_assistant_1",
      role: "assistant",
      content: "Let me start by exploring the current auth service structure.",
      timestamp: "10:42 AM",
      thinking: "Analyzing project structure, inspecting auth router, and locating endpoint definitions...",
      plan: [
        {
          id: "step_1",
          label: "Explore codebase structure",
          status: "completed",
        },
        {
          id: "step_2",
          label: "Audit auth middleware usage across the codebase",
          status: "in_progress",
        },
        {
          id: "step_3",
          label: "Define Protobuf contracts for Authentication and Token verification",
          status: "pending",
        },
        {
          id: "step_4",
          label: "Implement gRPC server stubs with backward-compatible REST fallbacks",
          status: "pending",
        },
      ],
      toolCalls: [
        {
          id: "tool_1",
          tool: "read_file",
          params: "src/routes/auth.py",
          output: "Successfully read 184 lines of route definitions.",
          status: "done",
        },
        {
          id: "tool_2",
          tool: "run_command",
          params: "find src/ -name '*auth*' -type f",
          output: "src/routes/auth.py\nsrc/middleware/auth.py\nsrc/services/auth_service.py",
          status: "done",
        },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputPrompt.trim() || isGenerating) return;

    const userText = inputPrompt.trim();
    setInputPrompt("");

    const newMsgId = `msg_user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    // Forward prompt to underlying workspace runner PTY
    executeTerminalCommand(`claude "${userText.replace(/"/g, '\\"')}"`);

    // Simulate structured streaming response matching Claude Code execution
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg_assistant_${Date.now()}`,
        role: "assistant",
        content: `I'm analyzing the request: "${userText}". Executing next actions on branch \`${activeLane?.branch || "claude/progress"}\`...`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        plan: [
          { id: "p1", label: "Inspect project files and configuration", status: "completed" },
          { id: "p2", label: `Apply updates for: ${userText.slice(0, 40)}...`, status: "in_progress" },
        ],
        toolCalls: [
          {
            id: `tc_${Date.now()}`,
            tool: "execute_worktree_task",
            params: `branch: ${activeLane?.branch || "main"}`,
            status: "done",
            output: "Executing live task in isolated git worktree.",
          },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0A0A0C] text-[#EDEDED] font-sans antialiased select-text">
      {/* Top Header Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#202024] bg-[#0E0E12] px-4">
        {/* Left: Task Title & Project Badge */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="truncate text-xs font-semibold text-[#F4F4F5]">
            {messages[0]?.content
              ? messages[0].content.slice(0, 45) + (messages[0].content.length > 45 ? "..." : "")
              : "Agent Workspace"}
          </span>
          <span className="hidden sm:inline text-xs font-mono text-[#71717A]">
            {project?.repo_full_name || project?.name || "acme-productions"}
          </span>
          <button
            type="button"
            className="text-[#71717A] hover:text-[#D4D4D8] p-0.5 rounded transition-colors"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>

        {/* Right: Info button & View switcher */}
        <div className="flex items-center gap-2">
          {/* Toggle between Structured Chat and Raw PTY */}
          <div className="flex items-center rounded-md bg-[#18181B] p-0.5 border border-[#27272A] text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("chat")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                viewMode === "chat"
                  ? "bg-[#27272A] text-[#F4F4F5] shadow-xs"
                  : "text-[#71717A] hover:text-[#D4D4D8]"
              }`}
            >
              <Sparkles className="size-3 text-[var(--accent-claude)]" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("terminal")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-colors ${
                viewMode === "terminal"
                  ? "bg-[#27272A] text-[#F4F4F5] shadow-xs"
                  : "text-[#71717A] hover:text-[#D4D4D8]"
              }`}
            >
              <Terminal className="size-3" />
              <span>PTY</span>
            </button>
          </div>

          <button
            type="button"
            className="text-[#71717A] hover:text-[#D4D4D8] p-1 rounded transition-colors"
            title="Session Info"
          >
            <Info className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Either Terminal Pane or Structured Chat Canvas */}
      {viewMode === "terminal" ? (
        <div className="flex-1 w-full h-full overflow-hidden">
          <TerminalPane />
        </div>
      ) : (
        <>
          {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3 max-w-4xl mx-auto">
            {/* User Message Box */}
            {msg.role === "user" && (
              <div className="rounded-xl border border-[#26262B] bg-[#16161B] px-4 py-3 text-sm text-[#F4F4F5] shadow-xs leading-relaxed">
                {msg.content}
              </div>
            )}

            {/* Assistant Message */}
            {msg.role === "assistant" && (
              <div className="space-y-4 pt-1">
                {/* Assistant Text */}
                <div className="text-sm text-[#E4E4E7] leading-relaxed font-normal">
                  {msg.content}
                </div>

                {/* Structured Plan Checklist (Matching Reference Screenshot) */}
                {msg.plan && msg.plan.length > 0 && (
                  <div className="space-y-2 py-1 pl-1">
                    {msg.plan.map((item) => (
                      <div key={item.id} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`size-2 rounded-full mt-1.5 shrink-0 ${
                            item.status === "completed"
                              ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                              : item.status === "in_progress"
                              ? "bg-[var(--accent-claude)] animate-pulse shadow-[0_0_6px_rgba(232,128,74,0.6)]"
                              : "bg-[#52525B]"
                          }`}
                        />
                        <span
                          className={`${
                            item.status === "completed"
                              ? "text-[#A1A1AA] line-through decoration-[#52525B]"
                              : item.status === "in_progress"
                              ? "text-[#F4F4F5] font-medium"
                              : "text-[#71717A]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tool Calls & Executions */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {msg.toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="rounded-lg border border-[#222227] bg-[#111115] px-3 py-2 text-xs font-mono text-[#A1A1AA]"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                          <span className="flex items-center gap-1.5 text-[var(--accent-claude)]">
                            <Zap className="size-3" />
                            {tc.tool}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400">
                            {tc.status}
                          </span>
                        </div>
                        <div className="mt-1 text-[#D4D4D8] truncate">{tc.params}</div>
                        {tc.output && (
                          <div className="mt-1.5 pt-1.5 border-t border-[#1C1C22] text-[11px] text-[#71717A] max-h-24 overflow-y-auto whitespace-pre-wrap">
                            {tc.output}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-[#71717A] max-w-4xl mx-auto pl-1">
            <span className="size-2 rounded-full bg-[var(--accent-claude)] animate-ping" />
            <span>Agent thinking & executing worktree tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Floating Control Dock (Exact match to Reference Screenshot) */}
      <div className="p-4 bg-[#0A0A0C] border-t border-[#1E1E22]">
        <div className="max-w-4xl mx-auto rounded-xl border border-[#27272A] bg-[#121216] p-3 shadow-2xl focus-within:border-[var(--accent-claude)] transition-colors">
          {/* Multiline Input Box */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full resize-none bg-transparent text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-hidden leading-relaxed"
          />

          {/* Bottom Dock Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E1E24] mt-2">
            {/* Left Control Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Plus Button */}
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#3F3F46] transition-colors"
                title="Attach context or files"
              >
                <Plus className="size-3.5" />
              </button>

              {/* Model Pill (e.g. Opus 5 with signal bars) */}
              <button
                type="button"
                onClick={() =>
                  setModel((m) =>
                    m === "Opus 5"
                      ? "Claude 3.7 Sonnet"
                      : m === "Claude 3.7 Sonnet"
                      ? "GPT-4o"
                      : "Opus 5"
                  )
                }
                className="flex items-center gap-1.5 rounded-md border border-[#27272A] bg-[#18181B] px-2.5 py-1 text-xs text-[#D4D4D8] hover:border-[#3F3F46] transition-colors font-mono"
              >
                <BarChart2 className="size-3 text-[var(--accent-claude)]" />
                <span>{model}</span>
                <ChevronDown className="size-2.5 text-[#71717A]" />
              </button>

              {/* Mode Pill (e.g. Auto with signal bars) */}
              <button
                type="button"
                onClick={() =>
                  setMode((m) => (m === "Auto" ? "Plan & Review" : "Auto"))
                }
                className="flex items-center gap-1.5 rounded-md border border-[#27272A] bg-[#18181B] px-2.5 py-1 text-xs text-[#D4D4D8] hover:border-[#3F3F46] transition-colors font-mono"
              >
                <Sliders className="size-3 text-[#10B981]" />
                <span>{mode}</span>
                <ChevronDown className="size-2.5 text-[#71717A]" />
              </button>

              {/* Spec Mode Pill */}
              <button
                type="button"
                onClick={() => setSpecMode((s) => !s)}
                className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors font-mono ${
                  specMode
                    ? "border-[rgba(232,128,74,0.4)] bg-[rgba(232,128,74,0.1)] text-[var(--accent-claude)]"
                    : "border-[#27272A] bg-[#18181B] text-[#71717A] hover:text-[#D4D4D8]"
                }`}
              >
                <span>Spec Mode</span>
              </button>

              {/* MCP Badge Indicator */}
              <div className="flex items-center gap-1.5 rounded-md border border-[#27272A] bg-[#18181B] px-2.5 py-1 text-xs font-mono text-[#D4D4D8]">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>MCP [{mcpCount}]</span>
              </div>
            </div>

            {/* Right Submit Button (Orange Up-Arrow) */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputPrompt.trim() && !isGenerating}
              className={`flex size-7 items-center justify-center rounded-md transition-all ${
                inputPrompt.trim()
                  ? "bg-[var(--accent-claude)] text-white hover:opacity-90 shadow-md cursor-pointer"
                  : "bg-[#27272A] text-[#52525B] cursor-not-allowed"
              }`}
              title="Submit prompt (Enter)"
            >
              <ArrowUp className="size-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
