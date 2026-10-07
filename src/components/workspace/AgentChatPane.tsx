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
  Check,
  Server,
  FileText,
  GitBranch,
  Key,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { TerminalPane } from "./TerminalPane";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { AnthropicIcon, OpenAIIcon } from "@/components/ui/brand-icons";

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

const AVAILABLE_MODELS = [
  {
    group: "Anthropic (Claude Code)",
    models: [
      { id: "Claude 3.7 Sonnet (Thinking)", name: "Claude 3.7 Sonnet (Thinking)", desc: "Deep reasoning & hybrid thinking" },
      { id: "Claude 3.7 Sonnet", name: "Claude 3.7 Sonnet", desc: "Fast frontier coding & planning" },
      { id: "Claude 3.5 Sonnet", name: "Claude 3.5 Sonnet", desc: "Stable production standard" },
      { id: "Claude 3.5 Haiku", name: "Claude 3.5 Haiku", desc: "Ultra-fast lightweight edits" },
      { id: "Claude 3 Opus", name: "Claude 3 Opus", desc: "Complex domain analysis" },
    ],
  },
  {
    group: "OpenAI / Codex",
    models: [
      { id: "GPT-4o", name: "GPT-4o", desc: "Multimodal frontier model" },
      { id: "o3-mini", name: "o3-mini", desc: "High-speed reasoning model" },
      { id: "o1", name: "o1", desc: "Deep reasoning for complex math & code" },
      { id: "GPT-4.5 Preview", name: "GPT-4.5 Preview", desc: "Largest world-knowledge model" },
    ],
  },
  {
    group: "Google DeepMind",
    models: [
      { id: "Gemini 2.0 Flash", name: "Gemini 2.0 Flash", desc: "Low-latency large context" },
      { id: "Gemini 2.0 Pro", name: "Gemini 2.0 Pro", desc: "State-of-the-art coding & reasoning" },
    ],
  },
  {
    group: "Open / Local",
    models: [
      { id: "DeepSeek R1", name: "DeepSeek R1", desc: "Open-weights reasoning" },
      { id: "Qwen 2.5 Coder 32B", name: "Qwen 2.5 Coder 32B", desc: "Specialized code generation" },
    ],
  },
];

const MCP_SERVERS = [
  { name: "github", status: "Active", desc: "Repository, branches, and PR creation" },
  { name: "filesystem", status: "Active", desc: "Direct file read, edit, and search in worktree" },
  { name: "postgres", status: "Active", desc: "Schema inspection & test database migrations" },
  { name: "brave-search", status: "Active", desc: "Live web documentation and API search" },
  { name: "memory", status: "Active", desc: "Persistent project knowledge & context graph" },
  { name: "puppeteer", status: "Active", desc: "Headless preview verification & visual tests" },
  { name: "sentry", status: "Active", desc: "Error monitoring and trace debugging" },
];

export function AgentChatPane() {
  const { project, activeLane, executeTerminalCommand, submitPrompt, setIsIntegrationsOpen } = useWorkspace();
  const [viewMode, setViewMode] = useState<"chat" | "terminal">("chat");

  const [inputPrompt, setInputPrompt] = useState("");
  const [model, setModel] = useState("Claude 3.7 Sonnet (Thinking)");
  const [mode, setMode] = useState("Auto");
  const [specMode, setSpecMode] = useState(true);
  const [mcpCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

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

    // Forward prompt to underlying workspace runner PTY where Claude Code runs
    executeTerminalCommand(`claude "${userText.replace(/"/g, '\\"')}"\r`);

    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white text-zinc-900 font-sans antialiased select-text overflow-hidden">
      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin bg-white">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-12">
                <div className="size-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[var(--accent-claude)] mb-4 shadow-xs">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1">
                  Claude Code Connected
                </h3>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  Working in isolated git worktree on branch{" "}
                  <code className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-zinc-800 border border-zinc-200">
                    {activeLane?.branch || "claude/progress"}
                  </code>
                  . Changes remain isolated until published to GitHub.
                </p>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    "Inspect repository architecture & routes",
                    "Run test suite and fix broken tests",
                    "Add new feature endpoint",
                    "Switch to live PTY terminal",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (suggestion === "Switch to live PTY terminal") {
                          setViewMode("terminal");
                        } else {
                          setInputPrompt(suggestion);
                          textareaRef.current?.focus();
                        }
                      }}
                      className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 hover:border-zinc-300 text-xs text-zinc-700 transition-all text-left shadow-2xs group"
                    >
                      <span className="group-hover:text-zinc-900 font-medium">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-3 max-w-4xl mx-auto">
                  {/* User Message Box */}
                  {msg.role === "user" && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 shadow-xs leading-relaxed">
                      {msg.content}
                    </div>
                  )}

                  {/* Assistant Message */}
                  {msg.role === "assistant" && (
                    <div className="space-y-4 pt-1">
                      {/* Assistant Text */}
                      <div className="text-sm text-zinc-800 leading-relaxed font-normal">
                        {msg.content}
                      </div>

                      {/* Structured Plan Checklist */}
                      {msg.plan && msg.plan.length > 0 && (
                        <div className="space-y-2 py-1 pl-1">
                          {msg.plan.map((item) => (
                            <div key={item.id} className="flex items-start gap-2.5 text-sm">
                              <span
                                className={`size-2 rounded-full mt-1.5 shrink-0 ${
                                  item.status === "completed"
                                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                                    : item.status === "in_progress"
                                    ? "bg-[var(--accent-claude)] animate-pulse shadow-[0_0_6px_rgba(232,128,74,0.6)]"
                                    : "bg-zinc-300"
                                }`}
                              />
                              <span
                                className={`${
                                  item.status === "completed"
                                    ? "text-zinc-400 line-through decoration-zinc-300"
                                    : item.status === "in_progress"
                                    ? "text-zinc-900 font-medium"
                                    : "text-zinc-500"
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
                              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-700 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                <span className="flex items-center gap-1.5 text-[var(--accent-claude)] font-medium">
                                  <Zap className="size-3" />
                                  {tc.tool}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">
                                  {tc.status}
                                </span>
                              </div>
                              <div className="mt-1 text-zinc-800 truncate">{tc.params}</div>
                              {tc.output && (
                                <div className="mt-1.5 pt-1.5 border-t border-zinc-200 text-[11px] text-zinc-600 max-h-24 overflow-y-auto whitespace-pre-wrap">
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
              ))
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 max-w-4xl mx-auto pl-1">
                <span className="size-2 rounded-full bg-[var(--accent-claude)] animate-ping" />
                <span>Claude Code executing on branch {activeLane?.branch || "claude/progress"}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Floating Control Dock */}
          <div className="p-4 bg-[var(--surface-primary)] border-t border-[var(--border)]">
            <div className="max-w-4xl mx-auto rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-3 shadow-xs focus-within:border-[var(--border-strong)] transition-colors">
              {/* Multiline Input Box */}
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                className="w-full resize-none bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-hidden leading-relaxed"
              />

              {/* Unified Bottom Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] mt-2">
                {/* Left Control Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Plus Context Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-primary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--wash)] transition-colors cursor-pointer"
                        title="Add context, files, or keys"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-56 bg-[var(--surface-card)] border border-[var(--border)] shadow-lg text-xs">
                      <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">
                        Add Context
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setInputPrompt((prev) => prev + " @file:src/");
                          textareaRef.current?.focus();
                        }}
                        className="cursor-pointer gap-2 py-1.5 text-[var(--foreground)] hover:bg-[var(--wash)]"
                      >
                        <FileCode className="size-3.5 text-[var(--muted-foreground)]" />
                        <span>Attach File or Directory</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setInputPrompt((prev) => prev + " Check recent git diff on branch.");
                          textareaRef.current?.focus();
                        }}
                        className="cursor-pointer gap-2 py-1.5 text-[var(--foreground)] hover:bg-[var(--wash)]"
                      >
                        <GitBranch className="size-3.5 text-[var(--muted-foreground)]" />
                        <span>Reference Git Diff</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setInputPrompt((prev) => prev + " Follow schema in spec.md");
                          textareaRef.current?.focus();
                        }}
                        className="cursor-pointer gap-2 py-1.5 text-[var(--foreground)] hover:bg-[var(--wash)]"
                      >
                        <FileText className="size-3.5 text-[var(--muted-foreground)]" />
                        <span>Attach Spec Document</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[var(--border)]" />
                      <DropdownMenuItem
                        onClick={() => setIsIntegrationsOpen(true)}
                        className="cursor-pointer gap-2 py-1.5 text-[var(--accent-claude)] hover:bg-[var(--wash)]"
                      >
                        <Key className="size-3.5" />
                        <span>Manage Vault & API Keys</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Model Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-primary)] px-2.5 py-1 text-xs text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--wash)] transition-colors font-mono cursor-pointer"
                      >
                        {model.toLowerCase().includes("claude") || model.toLowerCase().includes("opus") || model.toLowerCase().includes("sonnet") || model.toLowerCase().includes("haiku") ? (
                          <AnthropicIcon className="size-3 text-[var(--accent-claude)] shrink-0" />
                        ) : (
                          <OpenAIIcon className="size-3 text-[var(--status-awake)] shrink-0" />
                        )}
                        <span className="font-medium text-[11px]">{model.replace(" (Thinking)", "")}</span>
                        <ChevronDown className="size-2.5 text-[var(--muted-foreground)]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-72 bg-[var(--surface-card)] border border-[var(--border)] shadow-xl max-h-96 overflow-y-auto p-1.5 text-xs">
                      {AVAILABLE_MODELS.map((group, gIdx) => (
                        <DropdownMenuGroup key={group.group}>
                          {gIdx > 0 && <DropdownMenuSeparator className="bg-[var(--border)] my-1" />}
                          <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">
                            {group.group.includes("Anthropic") ? (
                              <AnthropicIcon className="size-3 text-[var(--accent-claude)]" />
                            ) : group.group.includes("OpenAI") ? (
                              <OpenAIIcon className="size-3 text-[var(--status-awake)]" />
                            ) : null}
                            <span>{group.group}</span>
                          </DropdownMenuLabel>
                          {group.models.map((m) => {
                            const isSelected = model === m.name;
                            const isClaude = m.name.toLowerCase().includes("claude") || m.name.toLowerCase().includes("opus") || m.name.toLowerCase().includes("sonnet") || m.name.toLowerCase().includes("haiku");
                            return (
                              <DropdownMenuItem
                                key={m.id}
                                onClick={() => setModel(m.name)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-[var(--wash-strong)] text-[var(--accent-claude)] font-medium"
                                    : "text-[var(--foreground)] hover:bg-[var(--wash)]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isClaude ? (
                                    <AnthropicIcon className="size-3.5 text-[var(--accent-claude)] shrink-0" />
                                  ) : (
                                    <OpenAIIcon className="size-3.5 text-[var(--status-awake)] shrink-0" />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-xs">{m.name}</span>
                                    <span className="text-[10px] text-[var(--muted-foreground)]">{m.desc}</span>
                                  </div>
                                </div>
                                {isSelected && <Check className="size-3.5 text-[var(--accent-claude)] shrink-0 ml-2" />}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuGroup>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mode Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-primary)] px-2.5 py-1 text-xs text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--wash)] transition-colors font-mono cursor-pointer"
                      >
                        <Sliders className="size-3 text-[var(--status-awake)]" />
                        <span className="text-[11px]">{mode}</span>
                        <ChevronDown className="size-2.5 text-[var(--muted-foreground)]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-56 bg-[var(--surface-card)] border border-[var(--border)] shadow-lg text-xs p-1">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">
                        Execution Mode
                      </DropdownMenuLabel>
                      {[
                        { id: "Auto", desc: "Runs tools autonomously in worktree" },
                        { id: "Plan & Review", desc: "Requires approval before writing" },
                        { id: "Interactive Pair", desc: "Step-by-step collaborative shell" },
                        { id: "Read-Only Audit", desc: "Inspect without mutating files" },
                      ].map((md) => (
                        <DropdownMenuItem
                          key={md.id}
                          onClick={() => setMode(md.id)}
                          className={`flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md ${
                            mode === md.id
                              ? "bg-[var(--wash-strong)] font-medium text-[var(--foreground)]"
                              : "text-[var(--foreground)] hover:bg-[var(--wash)]"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{md.id}</span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">{md.desc}</span>
                          </div>
                          {mode === md.id && <Check className="size-3.5 text-[var(--foreground)]" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Spec Mode Pill */}
                  <button
                    type="button"
                    onClick={() => setSpecMode((s) => !s)}
                    className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] transition-colors font-mono cursor-pointer ${
                      specMode
                        ? "border-[rgba(232,128,74,0.4)] bg-[var(--accent-claude-subtle)] text-[var(--accent-claude)] font-medium"
                        : "border-[var(--border)] bg-[var(--surface-primary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)]"
                    }`}
                  >
                    <span>Spec Mode</span>
                  </button>

                  {/* MCP Badge Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-primary)] px-2.5 py-1 text-[11px] font-mono text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--wash)] transition-colors cursor-pointer"
                      >
                        <span className="size-1.5 rounded-full bg-[var(--status-awake)]" />
                        <span>MCP {mcpCount}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" side="top" className="w-72 bg-[var(--surface-card)] border border-[var(--border)] shadow-xl p-3 text-xs">
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-2">
                        <div className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                          <Server className="size-3.5 text-[var(--status-awake)]" />
                          <span>Connected MCP Servers ({MCP_SERVERS.length})</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--wash)] text-[var(--status-awake)] font-mono">
                          Live
                        </span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {MCP_SERVERS.map((srv) => (
                          <div key={srv.name} className="flex items-start justify-between p-1.5 rounded-md bg-[var(--surface-primary)] border border-[var(--border-subtle)]">
                            <div>
                              <div className="font-mono text-[var(--foreground)] font-medium">{srv.name}</div>
                              <div className="text-[10px] text-[var(--muted-foreground)]">{srv.desc}</div>
                            </div>
                            <span className="size-1.5 rounded-full bg-[var(--status-awake)] mt-1 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Right Action Group: Help + Submit */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIntegrationsOpen(true)}
                    title="Help & Key Shortcuts"
                    className="flex size-7 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors cursor-pointer"
                  >
                    <Info className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputPrompt.trim() && !isGenerating}
                    className={`flex size-7 items-center justify-center rounded-md transition-all ${
                      inputPrompt.trim()
                        ? "bg-[var(--accent-claude)] text-white hover:opacity-90 shadow-xs cursor-pointer"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
                    }`}
                    title="Submit prompt (Enter)"
                  >
                    <ArrowUp className="size-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
