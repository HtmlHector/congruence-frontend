"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowUp,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  Terminal,
  FileCode,
  Info,
  ChevronDown,
  Zap,
  Check,
  Server,
  FileText,
  GitBranch,
  Key,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
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
    ],
  },
  {
    group: "OpenAI / Codex",
    models: [
      { id: "GPT-4o", name: "GPT-4o", desc: "Multimodal frontier model" },
      { id: "o3-mini", name: "o3-mini", desc: "High-speed reasoning model" },
      { id: "o1", name: "o1", desc: "Deep reasoning for complex math & code" },
    ],
  },
  {
    group: "Google DeepMind",
    models: [
      { id: "Gemini 2.0 Flash", name: "Gemini 2.0 Flash", desc: "Low-latency large context" },
      { id: "Gemini 2.0 Pro", name: "Gemini 2.0 Pro", desc: "State-of-the-art reasoning" },
    ],
  },
];

const MCP_SERVERS = [
  { name: "github", status: "Active", desc: "Repository, branches, and PR creation" },
  { name: "filesystem", status: "Active", desc: "Direct file read, edit, and search in worktree" },
  { name: "postgres", status: "Active", desc: "Schema inspection & test database migrations" },
  { name: "brave-search", status: "Active", desc: "Live web documentation and API search" },
  { name: "memory", status: "Active", desc: "Persistent project knowledge graph" },
  { name: "puppeteer", status: "Active", desc: "Headless preview verification & visual tests" },
  { name: "sentry", status: "Active", desc: "Error monitoring and trace debugging" },
];

export function AgentChatPane() {
  const { project, activeLane, executeTerminalCommand, submitPrompt, setIsIntegrationsOpen } = useWorkspace();

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
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

    executeTerminalCommand(`claude "${userText.replace(/"/g, '\\"')}"\r`);

    setTimeout(() => {
      setIsGenerating(false);
      // Generate a structured demo assistant response if this is first message
      if (messages.length === 0) {
        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          role: "assistant",
          content: `Inspected worktree environment on branch \`${activeLane?.branch || "claude/progress"}\`. Executing task with tool isolation and active write lease.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          plan: [
            { id: "p1", label: "Analyze project layout & dependencies", status: "completed" },
            { id: "p2", label: "Execute requested changes across worktree", status: "in_progress" },
            { id: "p3", label: "Verify type correctness & run dev server", status: "pending" },
          ],
          toolCalls: [
            {
              id: "tc1",
              tool: "filesystem.read_file",
              params: "src/app/workspace/page.tsx",
              output: "File loaded (98 lines).",
              status: "done",
            },
            {
              id: "tc2",
              tool: "github.get_diff",
              params: `branch: ${activeLane?.branch || "claude/progress"}`,
              output: "1 file changed, +12 -4 lines.",
              status: "done",
            },
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isClaude =
    activeLane?.name.toLowerCase().includes("claude") ||
    activeLane?.branch.toLowerCase().includes("claude");
  const isCodex =
    activeLane?.name.toLowerCase().includes("codex") ||
    activeLane?.branch.toLowerCase().includes("codex");

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-[#0A0A0C] text-zinc-900 dark:text-zinc-100 font-sans antialiased select-text overflow-hidden rounded-none">
      {/* Top Worktree Context Strip (Sharp Hairline) */}
      <div className="flex items-center justify-between h-7 px-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-[#FAFAFA] dark:bg-[#0E0E12] font-mono text-[10px] text-zinc-500 dark:text-zinc-400 select-none shrink-0 rounded-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-medium">
            <span className="size-1.5 bg-emerald-500 rounded-none" />
            <span>SESSION: {activeLane?.name || "Claude Code"}</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="truncate">
            BRANCH: <span className="text-zinc-800 dark:text-zinc-200">{activeLane?.branch || "claude/progress"}</span>
          </span>
          <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">|</span>
          <span className="hidden md:inline truncate">
            WORKTREE: <span className="text-zinc-700 dark:text-zinc-300">{project?.repo_full_name || "congruence"}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold rounded-none">
            WRITE LEASE ACTIVE
          </span>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin bg-white dark:bg-[#0A0A0C] flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center select-none py-2">
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-none">
                {isClaude ? (
                  <AnthropicIcon className="size-4 text-[var(--accent-claude)]" />
                ) : isCodex ? (
                  <OpenAIIcon className="size-4 text-[var(--status-awake)]" />
                ) : (
                  <Terminal className="size-4 text-zinc-900 dark:text-zinc-100" />
                )}
              </div>
              <h2 className="text-sm font-semibold tracking-tight uppercase font-mono text-zinc-900 dark:text-zinc-100">
                {isClaude ? "Claude Code CLI Connected" : isCodex ? "Codex Runner Connected" : "Agent Shell Connected"}
              </h2>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg mb-6 leading-relaxed font-mono">
              Working in isolated git worktree on branch <span className="text-zinc-900 dark:text-zinc-100 font-bold">[{activeLane?.branch || "claude/progress"}]</span>. Code edits, test runners, and process ports stay fully isolated.
            </p>

            {/* Sharp Command Matrix (No Rounding) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {[
                {
                  code: "[1]",
                  title: "Inspect repository architecture",
                  desc: "Scan route trees, packages, and components",
                  prompt: "Inspect the repository structure, route tree, and key component definitions.",
                },
                {
                  code: "[2]",
                  title: "Run test suite & fix breakages",
                  desc: "Execute tests in worktree PTY and repair errors",
                  prompt: "Run the test suite and fix any failing unit or integration tests.",
                },
                {
                  code: "[3]",
                  title: "Implement feature endpoint",
                  desc: "Create API route, data types, and server actions",
                  prompt: "Create a new API route and wire it to the workspace state.",
                },
                {
                  code: "[4]",
                  title: "Audit code diffs & types",
                  desc: "Inspect uncommitted changes on branch",
                  prompt: "Audit all modified files on this branch and check for type safety.",
                },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setInputPrompt(item.prompt);
                    textareaRef.current?.focus();
                  }}
                  className="flex flex-col items-start p-3 border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#121216] hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100/70 dark:hover:bg-[#16161c] transition-all text-left rounded-none group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 font-bold">
                      {item.code}
                    </span>
                    <ArrowRight className="size-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-0.5">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2 max-w-4xl mx-auto">
              {/* User Message Box (Sharp Geometric Left Accent) */}
              {msg.role === "user" && (
                <div className="border border-zinc-200 dark:border-zinc-800 border-l-2 border-l-zinc-900 dark:border-l-zinc-100 bg-[#F8F9FA] dark:bg-[#121216] p-3 text-xs text-zinc-900 dark:text-zinc-100 rounded-none leading-relaxed font-sans">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">[YOU]</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              )}

              {/* Assistant Message (Sharp Technical Stream) */}
              {msg.role === "assistant" && (
                <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E12] p-3.5 space-y-3 rounded-none">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 bg-emerald-500 rounded-none" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        [{isClaude ? "CLAUDE CODE" : "CODEX RUNNER"}]
                      </span>
                      <span className="text-[9px] text-zinc-400">· {model}</span>
                    </div>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Assistant Text */}
                  <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    {msg.content}
                  </div>

                  {/* Structured Plan Checklist (Sharp) */}
                  {msg.plan && msg.plan.length > 0 && (
                    <div className="border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#121216] p-2.5 space-y-1.5 rounded-none font-mono text-[11px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Execution Plan
                      </div>
                      {msg.plan.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold shrink-0">
                            {item.status === "completed" ? (
                              <span className="text-emerald-600">[✓]</span>
                            ) : item.status === "in_progress" ? (
                              <span className="text-orange-500">[⠋]</span>
                            ) : (
                              <span className="text-zinc-400">[ ]</span>
                            )}
                          </span>
                          <span
                            className={`${
                              item.status === "completed"
                                ? "text-zinc-400 line-through"
                                : item.status === "in_progress"
                                ? "text-zinc-900 dark:text-zinc-100 font-semibold"
                                : "text-zinc-500"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tool Calls (Sharp Terminal Box) */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="space-y-1 pt-1 font-mono">
                      {msg.toolCalls.map((tc) => (
                        <div
                          key={tc.id}
                          className="border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#121216] px-2.5 py-2 text-[11px] rounded-none"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold">
                              <Zap className="size-3 text-orange-500" />
                              {tc.tool}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold">
                              {tc.status}
                            </span>
                          </div>
                          <div className="mt-1 text-zinc-700 dark:text-zinc-300 truncate">
                            $ {tc.params}
                          </div>
                          {tc.output && (
                            <div className="mt-1 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 max-h-20 overflow-y-auto whitespace-pre-wrap">
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
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 max-w-4xl mx-auto pl-1">
            <span className="size-1.5 bg-orange-500 animate-ping rounded-none" />
            <span>Agent running tools on branch [{activeLane?.branch || "claude/progress"}]...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Docked Sharp Composer Dock (Clean Seamless Background, 0 Rounding) */}
      <div className="p-3.5 shrink-0 select-none bg-white dark:bg-[#0A0A0C] rounded-none">
        <div className="max-w-4xl mx-auto border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] rounded-none focus-within:border-zinc-950 dark:focus-within:border-zinc-200 transition-colors shadow-2xs">
          {/* Multiline Input Box */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Instruct agent (e.g. 'Refactor auth routes and run test suite')…"
            className="w-full resize-none bg-transparent p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden leading-relaxed font-sans rounded-none"
          />

          {/* Unified Bottom Sharp Action Toolbar */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] rounded-none">
            {/* Left Control Pills (Sharp) */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              {/* Plus Context Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 items-center gap-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 transition-colors cursor-pointer rounded-none font-mono"
                    title="Add context, files, or keys"
                  >
                    <Plus className="size-3" />
                    <span>Context</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs rounded-none p-1 font-sans">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 font-mono">
                    Add Context
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setInputPrompt((prev) => prev + " @file:src/");
                      textareaRef.current?.focus();
                    }}
                    className="cursor-pointer gap-2 py-1.5 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none"
                  >
                    <FileCode className="size-3.5 text-zinc-500" />
                    <span>Attach Directory / File</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setInputPrompt((prev) => prev + " Check recent git diff.");
                      textareaRef.current?.focus();
                    }}
                    className="cursor-pointer gap-2 py-1.5 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none"
                  >
                    <GitBranch className="size-3.5 text-zinc-500" />
                    <span>Reference Git Diff</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setInputPrompt((prev) => prev + " Follow schema in docs/design.md");
                      textareaRef.current?.focus();
                    }}
                    className="cursor-pointer gap-2 py-1.5 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none"
                  >
                    <FileText className="size-3.5 text-zinc-500" />
                    <span>Attach Design Spec</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800 my-1" />
                  <DropdownMenuItem
                    onClick={() => setIsIntegrationsOpen(true)}
                    className="cursor-pointer gap-2 py-1.5 text-orange-600 dark:text-orange-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none"
                  >
                    <Key className="size-3.5" />
                    <span>Vault API Keys</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Model Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 items-center gap-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-[11px] text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 transition-colors font-mono cursor-pointer rounded-none"
                  >
                    {isClaude ? (
                      <AnthropicIcon className="size-3 text-[var(--accent-claude)] shrink-0" />
                    ) : (
                      <OpenAIIcon className="size-3 text-[var(--status-awake)] shrink-0" />
                    )}
                    <span className="font-medium truncate max-w-[120px]">{model.replace(" (Thinking)", "")}</span>
                    <ChevronDown className="size-2.5 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-72 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-xl max-h-96 overflow-y-auto p-1 text-xs rounded-none font-sans">
                  {AVAILABLE_MODELS.map((group, gIdx) => (
                    <DropdownMenuGroup key={group.group}>
                      {gIdx > 0 && <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800 my-1" />}
                      <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 font-mono">
                        {group.group.includes("Anthropic") ? (
                          <AnthropicIcon className="size-3 text-[var(--accent-claude)]" />
                        ) : group.group.includes("OpenAI") ? (
                          <OpenAIIcon className="size-3 text-[var(--status-awake)]" />
                        ) : null}
                        <span>{group.group}</span>
                      </DropdownMenuLabel>
                      {group.models.map((m) => {
                        const isSelected = model === m.name;
                        const isClaudeModel = m.name.toLowerCase().includes("claude") || m.name.toLowerCase().includes("sonnet") || m.name.toLowerCase().includes("haiku");
                        return (
                          <DropdownMenuItem
                            key={m.id}
                            onClick={() => setModel(m.name)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-none cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-zinc-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 font-medium"
                                : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isClaudeModel ? (
                                <AnthropicIcon className="size-3 text-[var(--accent-claude)] shrink-0" />
                              ) : (
                                <OpenAIIcon className="size-3 text-[var(--status-awake)] shrink-0" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-xs">{m.name}</span>
                                <span className="text-[10px] text-zinc-400">{m.desc}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="size-3.5 text-orange-500 shrink-0 ml-2" />}
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
                    className="flex h-6 items-center gap-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-[11px] text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors font-mono cursor-pointer rounded-none"
                  >
                    <Sliders className="size-2.5 text-zinc-500" />
                    <span>Mode: {mode}</span>
                    <ChevronDown className="size-2.5 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs p-1 rounded-none font-sans">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 font-mono">
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
                      className={`flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-none ${
                        mode === md.id
                          ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{md.id}</span>
                        <span className="text-[10px] text-zinc-400">{md.desc}</span>
                      </div>
                      {mode === md.id && <Check className="size-3.5 text-zinc-900 dark:text-zinc-100" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Spec Mode Pill */}
              <button
                type="button"
                onClick={() => setSpecMode((s) => !s)}
                className={`flex h-6 items-center px-2 text-[10px] font-mono transition-colors cursor-pointer rounded-none uppercase tracking-wider ${
                  specMode
                    ? "border border-orange-400/60 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold"
                    : "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <span>Spec Mode</span>
              </button>

              {/* MCP Badge Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 items-center gap-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors cursor-pointer rounded-none"
                  >
                    <span className="size-1.5 bg-emerald-500 rounded-none" />
                    <span>MCP {mcpCount}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" side="top" className="w-72 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-xl p-3 text-xs rounded-none font-sans">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                      <Server className="size-3.5 text-emerald-500" />
                      <span>Connected MCP Servers ({MCP_SERVERS.length})</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-emerald-600 font-mono rounded-none">
                      Live
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {MCP_SERVERS.map((srv) => (
                      <div key={srv.name} className="flex items-start justify-between p-1.5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-none font-mono">
                        <div>
                          <div className="text-zinc-900 dark:text-zinc-100 font-medium text-[11px]">{srv.name}</div>
                          <div className="text-[10px] text-zinc-400 font-sans">{srv.desc}</div>
                        </div>
                        <span className="size-1.5 bg-emerald-500 mt-1 shrink-0 rounded-none" />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Right Action: Send Button (Sharp) */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[9px] text-zinc-400">
                [⇧⏎ line · ⏎ send]
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputPrompt.trim() && !isGenerating}
                className={`flex h-6 items-center gap-1 px-3 text-[11px] font-mono font-semibold transition-all rounded-none ${
                  inputPrompt.trim()
                    ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 shadow-2xs cursor-pointer"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 opacity-60 cursor-not-allowed"
                }`}
                title="Submit command (Enter)"
              >
                <span>SEND</span>
                <ArrowUp className="size-3 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
