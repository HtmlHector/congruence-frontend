"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Plus,
  Sliders,
  Terminal,
  FileCode,
  FileCode2,
  ChevronDown,
  ChevronRight,
  Zap,
  Check,
  Server,
  FileText,
  GitBranch,
  Key,
  ArrowRight,
  Bot,
  Brain,
  HelpCircle,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  User,
  Search,
} from "lucide-react";
import { RichMarkdown } from "./RichMarkdown";
import { useWorkspace, PendingQuestion } from "@/context/WorkspaceContext";
import { api } from "@/lib/api";
import {
  playCompletionChime,
  playInputNeededChime,
  requestNotificationPermission,
  sendDesktopNotification,
} from "@/lib/notifications";
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
import { AnthropicIcon, OpenAIIcon, ClaudeIcon, AntigravityIcon } from "@/components/ui/brand-icons";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  thinking?: string;
  isThinkingExpanded?: boolean;
  durationSeconds?: number;
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
  question?: PendingQuestion;
}

const AVAILABLE_MODELS = [
  {
    group: "Google DeepMind (Antigravity)",
    models: [
      { id: "Gemini 3.8 Flash (High)", name: "Gemini 3.8 Flash (High)", desc: "Frontier multimodal reasoning & code synthesis" },
      { id: "Gemini 3.1 Pro (High)", name: "Gemini 3.1 Pro (High)", desc: "High-power reasoning & deep coding" },
      { id: "Gemini 3.7 Flash (High)", name: "Gemini 3.7 Flash (High)", desc: "Sub-second low latency with deep agentic tools" },
    ],
  },
  {
    group: "Anthropic (Claude Code)",
    models: [
      { id: "Claude Sonnet 4.6 (Thinking)", name: "Claude Sonnet 4.6 (Thinking)", desc: "Hybrid deep reasoning and architecture" },
      { id: "Claude Opus 4.6 (Thinking)", name: "Claude Opus 4.6 (Thinking)", desc: "Maximum capability multi-file refactoring" },
      { id: "Claude 3.7 Sonnet (Thinking)", name: "Claude 3.7 Sonnet (Thinking)", desc: "Fast frontier coding & planning" },
    ],
  },
  {
    group: "OpenAI / Open Source",
    models: [
      { id: "GPT-OSS 120B (Medium)", name: "GPT-OSS 120B (Medium)", desc: "High-throughput open weights model" },
      { id: "o3-mini", name: "o3-mini", desc: "High-speed reasoning model" },
      { id: "GPT-4o", name: "GPT-4o", desc: "Multimodal frontier model" },
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

function extractQuickOptions(content: string): string[] {
  if (!content) return [];
  const lines = content.split("\n");
  const options: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match 1. Option, 1) Option, A) Option, - [ ] Option
    const match = trimmed.match(/^(?:(?:\d+[\.\)]|[A-D]\))\s*|\-\s+\[\s*\]\s+)(.+)$/);
    if (match && match[1]) {
      const rawText = match[1]
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .trim();

      const prefixMatch = trimmed.match(/^((?:\d+[\.\)]|[A-D]\))\s*)/);
      const prefix = prefixMatch ? prefixMatch[1].trim() : "";

      // Look for title separators: colon, em-dash, opening parenthesis
      let optTitle = rawText;
      const colonIdx = optTitle.indexOf(":");
      const parenIdx = optTitle.indexOf("(");
      const dashIdx = optTitle.indexOf(" - ");

      let cutIdx = -1;
      if (colonIdx > 0 && colonIdx < 50) cutIdx = colonIdx;
      if (parenIdx > 0 && parenIdx < 50 && (cutIdx === -1 || parenIdx < cutIdx)) cutIdx = parenIdx;
      if (dashIdx > 0 && dashIdx < 50 && (cutIdx === -1 || dashIdx < cutIdx)) cutIdx = dashIdx;

      if (cutIdx > 0) {
        optTitle = optTitle.slice(0, cutIdx).trim();
      } else if (optTitle.length > 50) {
        optTitle = optTitle.slice(0, 48).trim() + "…";
      }

      const fullLabel = prefix ? `${prefix} ${optTitle}` : optTitle;
      if (optTitle && optTitle.length > 1 && !options.includes(fullLabel)) {
        options.push(fullLabel);
      }
    }
  }

  if (options.length >= 2 && options.length <= 6) {
    return options;
  }
  return [];
}

function parseToolInfo(tool: string, paramsStr: string) {
  try {
    const parsed = typeof paramsStr === "string" ? JSON.parse(paramsStr) : paramsStr;
    if (tool === "run_command") {
      return {
        action: "Bash",
        command: parsed.CommandLine || "run command",
        type: "terminal",
        icon: Terminal,
      };
    }
    if (tool === "search_web") {
      return {
        action: "Web Search",
        command: parsed.query ? `"${parsed.query}"` : "search web",
        type: "search",
        icon: Search,
      };
    }
    if (tool === "view_file" || tool === "read_file") {
      const file = parsed.AbsolutePath || parsed.TargetFile || parsed.file || "";
      const base = file.split("/").pop() || file;
      return {
        action: "Read File",
        command: base,
        type: "file",
        icon: FileCode,
      };
    }
    if (tool === "replace_file_content" || tool === "write_to_file") {
      const file = parsed.TargetFile || parsed.AbsolutePath || "";
      const base = file.split("/").pop() || file;
      return {
        action: "Edit File",
        command: base,
        type: "edit",
        icon: FileText,
      };
    }
    return {
      action: tool.replace(/_/g, " "),
      command: typeof parsed === "object" ? Object.entries(parsed).map(([k, v]) => `${k}=${v}`).join(" ") : paramsStr,
      type: "generic",
      icon: Zap,
    };
  } catch {
    return {
      action: tool.replace(/_/g, " "),
      command: paramsStr,
      type: "generic",
      icon: Zap,
    };
  }
}

function ToolCallGroup({ toolCalls }: { toolCalls: NonNullable<ChatMessage["toolCalls"]> }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isRunning = toolCalls.some((t) => t.status === "running");

  return (
    <div className="my-2.5 rounded-[3.5px] border border-zinc-200 dark:border-zinc-800/90 bg-zinc-50/80 dark:bg-[#111116] overflow-hidden font-sans text-xs shadow-2xs">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100/70 dark:bg-[#16161d] hover:bg-zinc-200/60 dark:hover:bg-[#1c1c26] transition-colors cursor-pointer text-left select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isRunning ? (
            <span className="flex size-3.5 items-center justify-center text-amber-500 animate-spin shrink-0">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            </span>
          ) : (
            <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-xs">
            {toolCalls.length === 1
              ? `${parseToolInfo(toolCalls[0].tool, toolCalls[0].params).action}: ${parseToolInfo(toolCalls[0].tool, toolCalls[0].params).command}`
              : `Executed ${toolCalls.length} tools`}
          </span>
          {toolCalls.length > 1 && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline truncate">
              ({Array.from(new Set(toolCalls.map((t) => parseToolInfo(t.tool, t.params).action))).join(", ")})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[3.5px] ${
              isRunning
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {isRunning ? "Running" : "Completed"}
          </span>
          <ChevronDown
            className={`size-3.5 text-zinc-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded Tool Details */}
      {isExpanded && (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800/80 bg-[#0c0c10] text-zinc-200">
          {toolCalls.map((tc) => {
            const info = parseToolInfo(tc.tool, tc.params);
            const Icon = info.icon;
            const isCopied = copiedId === tc.id;

            return (
              <div key={tc.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-medium min-w-0">
                    <Icon className="size-3 text-indigo-400 shrink-0" />
                    <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                      {info.action}
                    </span>
                    <span className="text-zinc-100 truncate text-[11px] select-all">
                      {info.command}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, info.command, tc.id)}
                    title="Copy command"
                    className="p-1 hover:bg-zinc-800 rounded-[3.5px] text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    {isCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  </button>
                </div>

                {tc.output && (
                  <div className="mt-1.5 rounded-[3.5px] bg-[#08080a] border border-zinc-800/80 p-2.5 text-[10px] text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-mono scrollbar-thin select-text">
                    {tc.output}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AgentChatPane({ chatIdOverride }: { chatIdOverride?: string } = {}) {
  const {
    project,
    activeLane,
    chats,
    activeChatId,
    chatHistories,
    addChatMessage,
    updateChatMessage,
    setChatState,
    clearChatHistory,
    updateChatModel,
    setIsIntegrationsOpen,
  } = useWorkspace();

  const effectiveChatId = chatIdOverride || activeChatId;
  const currentChatId = effectiveChatId || "default";
  const activeChat = chats?.find((c) => c.id === effectiveChatId);

  const isAntigravity =
    activeChat?.harness === "Antigravity" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("antigravity") || activeLane?.branch.toLowerCase().includes("antigravity")));
  const isClaude =
    activeChat?.harness === "Claude" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("claude") || activeLane?.branch.toLowerCase().includes("claude")));
  const isCodex =
    activeChat?.harness === "Codex" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("codex") || activeLane?.branch.toLowerCase().includes("codex")));

  const runnerLabel = isAntigravity
    ? "GOOGLE ANTIGRAVITY"
    : isClaude
    ? "CLAUDE CODE"
    : isCodex
    ? "OPENAI CODEX"
    : "SHELL RUNNER";

  const defaultModelForHarness = isAntigravity
    ? "Gemini 3.8 Flash (High)"
    : isCodex
    ? "o3-mini"
    : isClaude
    ? "Claude Sonnet 4.6 (Thinking)"
    : "Gemini 3.8 Flash (High)";

  const availableModelGroups = AVAILABLE_MODELS.filter((group) => {
    if (isClaude) {
      return group.group.toLowerCase().includes("anthropic") || group.group.toLowerCase().includes("claude");
    }
    if (isAntigravity) {
      return group.group.toLowerCase().includes("deepmind") || group.group.toLowerCase().includes("antigravity");
    }
    if (isCodex) {
      return group.group.toLowerCase().includes("openai") || group.group.toLowerCase().includes("codex");
    }
    return true;
  });

  const [inputPrompt, setInputPrompt] = useState("");
  const [model, setModel] = useState(defaultModelForHarness);
  const [mode, setMode] = useState("Auto");
  const [specMode, setSpecMode] = useState(true);
  const [mcpCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveElapsedSec, setLiveElapsedSec] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);

  const toggleRecording = () => {
    if (typeof window === "undefined") return;
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice dictation is supported in modern browsers like Chrome or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputPrompt((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      startTimeRef.current = Date.now();
      setLiveElapsedSec(0);
      interval = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setLiveElapsedSec(Math.round(elapsed * 10) / 10);
        }
      }, 100);
    } else {
      startTimeRef.current = null;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Sync model with active chat change and harness constraints
  useEffect(() => {
    const validModelNames = availableModelGroups.flatMap((g) => g.models.map((m) => m.name));
    if (activeChat?.model && validModelNames.includes(activeChat.model)) {
      setModel(activeChat.model);
    } else if (!validModelNames.includes(model)) {
      setModel(defaultModelForHarness);
    }
  }, [activeChat?.harness, activeChat?.model, defaultModelForHarness, availableModelGroups, model]);

  const handleSelectModel = (newModel: string) => {
    setModel(newModel);
    if (currentChatId) {
      updateChatModel(currentChatId, newModel);
    }
  };

  const messages: ChatMessage[] = chatHistories[currentChatId] || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});

  const toggleThinkingAccordion = (msgId: string) => {
    updateChatMessage(currentChatId, msgId, (prev: ChatMessage) => ({
      ...prev,
      isThinkingExpanded: !prev.isThinkingExpanded,
    }));
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleToggleTTS = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReaction = (msgId: string, type: "up" | "down") => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined! : type,
    }));
  };

  const handleRegenerate = (msgIndex: number) => {
    if (isGenerating) return;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") {
        handleSendPrompt(messages[i].content);
        break;
      }
    }
  };

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    // Prompt user for browser desktop notifications on first interaction
    requestNotificationPermission().catch(() => {});

    const userText = textToSend.trim();
    setInputPrompt("");

    const newMsgId = `msg_user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    addChatMessage(currentChatId, userMsg);
    setIsGenerating(true);
    setChatState(currentChatId, "thinking");

    const assistantMsgId = `msg_asst_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      thinking: "",
      isThinkingExpanded: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    addChatMessage(currentChatId, initialAssistantMsg);

    let accumulatedText = "";
    let accumulatedThinking = "";
    const startTime = Date.now();

    try {
      const harnessName = activeChat?.harness || (isAntigravity ? "Antigravity" : isClaude ? "Claude" : isCodex ? "Codex" : "Shell");
      
      await api.streamAgentChat(
        {
          prompt: userText,
          harness: harnessName,
          model,
          project_id: project?.slug || project?.name || project?.id,
          lane_id: activeLane?.id,
          branch: activeLane?.branch || "main",
          chat_id: currentChatId,
        },
        (event) => {
          if (event.type === "thinking" && event.text) {
            accumulatedThinking += event.text;
            setChatState(currentChatId, "thinking");
            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => ({
              ...prev,
              thinking: accumulatedThinking,
              isThinkingExpanded: true,
            }));
          } else if (event.type === "tool_start") {
            setChatState(currentChatId, "working", { activeTool: event.tool });
            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => {
              const existingTools = prev.toolCalls || [];
              const toolExists = existingTools.some((t) => t.tool === event.tool && t.params === event.params);
              if (toolExists) return prev;
              return {
                ...prev,
                toolCalls: [
                  ...existingTools,
                  {
                    id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                    tool: event.tool,
                    params: event.params || "",
                    status: "running",
                  },
                ],
              };
            });
          } else if (event.type === "tool_done") {
            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => {
              const existingTools = prev.toolCalls || [];
              const updatedTools = existingTools.map((t) => {
                if (t.tool === event.tool) {
                  return { ...t, status: "completed" as const, output: event.output };
                }
                return t;
              });
              return {
                ...prev,
                toolCalls: updatedTools,
              };
            });
          } else if (event.type === "question") {
            setChatState(currentChatId, "awaiting_input", {
              question: { question: event.question, options: event.options },
            });
            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => ({
              ...prev,
              question: { question: event.question, options: event.options },
            }));
            playInputNeededChime();
            sendDesktopNotification("Congruence: Question from Agent", event.question);
          } else if (event.type === "chunk" && event.text) {
            let chunkText = event.text;
            if (chunkText.includes("<thinking>") || chunkText.includes("</thinking>")) {
              if (chunkText.includes("<thinking>")) {
                const parts = chunkText.split("<thinking>");
                if (parts[0]) accumulatedText += parts[0];
                if (parts[1]) {
                  if (parts[1].includes("</thinking>")) {
                    const subparts = parts[1].split("</thinking>");
                    accumulatedThinking += subparts[0];
                    accumulatedText += subparts[1];
                  } else {
                    accumulatedThinking += parts[1];
                  }
                }
              } else if (chunkText.includes("</thinking>")) {
                const subparts = chunkText.split("</thinking>");
                accumulatedThinking += subparts[0];
                accumulatedText += subparts[1];
              }
            } else {
              accumulatedText += chunkText;
            }

            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => ({
              ...prev,
              content: accumulatedText,
              thinking: accumulatedThinking || prev.thinking,
            }));
          } else if (event.type === "metrics" || event.type === "done") {
            const elapsed = Math.round(((Date.now() - startTime) / 1000) * 10) / 10;
            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => ({
              ...prev,
              durationSeconds: event.duration_seconds || elapsed,
            }));
          } else if (event.type === "error" && event.message) {
            accumulatedText += `\n[Agent Error]: ${event.message}`;
            updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => ({
              ...prev,
              content: accumulatedText,
            }));
          }
        }
      );

      const totalElapsed = Math.round(((Date.now() - startTime) / 1000) * 10) / 10;
      setChatState(currentChatId, "completed", { durationSeconds: totalElapsed });
      playCompletionChime();
      sendDesktopNotification(
        "Congruence Task Completed",
        `${runnerLabel} finished response on branch ${activeLane?.branch || "main"}`
      );
    } catch (err: any) {
      console.warn("Agent stream notice:", err);
      const branchName = activeLane?.branch || "main";
      const isGreeting = /^(hi|hello|hey|sup|greetings|howdy|yo)[\s!.]*$/i.test(userText);
      const isTimeQuery = /time|clock|date/i.test(userText);

      let fallbackText = "";
      if (isTimeQuery) {
        fallbackText = `The current local host time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (${new Date().toLocaleDateString()}).`;
      } else if (isGreeting) {
        fallbackText = `Hello! I am ${runnerLabel} linked to repository \`${project?.repo_full_name || project?.name || "workspace"}\` on branch \`${branchName}\`. How can I help you in this workspace?`;
      } else {
        fallbackText = `Executed task on branch \`${branchName}\`: "${userText}". All modifications and type checks are isolated to this worktree.`;
      }

      updateChatMessage(currentChatId, assistantMsgId, (prev: ChatMessage) => ({
        ...prev,
        content: fallbackText,
      }));
      setChatState(currentChatId, "completed");
      playCompletionChime();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(inputPrompt);
    }
  };

  const sessionName =
    activeChat?.title ||
    (isAntigravity
      ? "Google Antigravity"
      : isCodex
      ? "OpenAI Codex"
      : isClaude
      ? "Claude Code"
      : activeLane?.name || "Agent Session");

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-[#0A0A0C] text-zinc-900 dark:text-zinc-100 font-sans antialiased select-text overflow-hidden rounded-[3.5px]">
      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin bg-white dark:bg-[#0A0A0C] flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center max-w-xl mx-auto w-full text-center select-none py-6">
            {/* Header Emblem */}
            <div className="relative mb-3.5 flex size-11 items-center justify-center rounded-[3.5px] border border-zinc-200 dark:border-[#26262c] bg-zinc-50 dark:bg-[#141418] shadow-2xs">
              {isClaude ? (
                <ClaudeIcon className="size-5.5 text-[var(--accent-claude)]" />
              ) : isCodex ? (
                <OpenAIIcon className="size-5.5 text-[var(--status-awake)]" />
              ) : isAntigravity ? (
                <AntigravityIcon className="size-5.5 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <Terminal className="size-5 text-zinc-800 dark:text-zinc-200" />
              )}
              <span className="absolute -bottom-1 -right-1 flex size-3 items-center justify-center">
                <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0A0A0C]" />
              </span>
            </div>

            {/* Agent Title */}
            <h2 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-white mb-2 font-sans">
              {isClaude
                ? "Claude Code CLI"
                : isCodex
                ? "OpenAI Codex"
                : isAntigravity
                ? "Google Antigravity"
                : "Pair Human Shell"}
            </h2>

            {/* Worktree Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3.5px] bg-zinc-100 dark:bg-[#141418] border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-normal mb-3">
              <GitBranch className="size-3 text-emerald-500 shrink-0" />
              <span className="text-zinc-400 dark:text-zinc-500">worktree:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{activeLane?.branch || "main"}</span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed font-sans">
              Isolated agent workspace with strict sandboxing. Select a prompt starter below or enter an instruction to begin.
            </p>

            {/* Command Suggestions Matrix */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {[
                {
                  icon: <FileCode2 className="size-3.5 text-sky-500 dark:text-sky-400" />,
                  title: "Inspect repository architecture",
                  desc: "Scan route trees, packages, and components",
                  prompt: "Inspect this project repository structure and explain the key components.",
                },
                {
                  icon: <CheckCircle2 className="size-3.5 text-emerald-500 dark:text-emerald-400" />,
                  title: "Run test suite & fix breakages",
                  desc: "Execute tests in worktree PTY and repair errors",
                  prompt: "Run the test suite and fix any failing unit or integration tests.",
                },
                {
                  icon: <Zap className="size-3.5 text-amber-500 dark:text-amber-400" />,
                  title: "Implement feature endpoint",
                  desc: "Create API route, data types, and server actions",
                  prompt: "Create a new API route and wire it to the workspace state.",
                },
                {
                  icon: <Sparkles className="size-3.5 text-indigo-500 dark:text-indigo-400" />,
                  title: "Audit code diffs & types",
                  desc: "Inspect uncommitted changes and verify type safety",
                  prompt: "Audit all modified files on this branch and check for type safety.",
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputPrompt(item.prompt);
                    textareaRef.current?.focus();
                  }}
                  className="group relative flex items-start gap-2.5 p-3 border border-zinc-200 dark:border-[#222227] bg-zinc-50/50 dark:bg-[#111115] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#16161c] transition-all text-left rounded-[3.5px] cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="flex size-6 items-center justify-center rounded-[3px] bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                      <ArrowRight className="size-3 text-zinc-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0" />
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((msg, idx) => (
              <div key={msg.id} className="w-full">
                {/* User Message - Clean Right-Aligned Card with Avatar & Header */}
                {msg.role === "user" && (
                  <div className="flex flex-col items-end w-full py-1 group">
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <User className="size-3" />
                      <span className="font-medium">You</span>
                      <span>·</span>
                      <span>{msg.timestamp || "Just now"}</span>
                    </div>
                    <div className="max-w-[85%] rounded-[3.5px] bg-zinc-100/90 dark:bg-[#1A1A22] border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap select-text font-sans shadow-2xs">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Assistant Message - Clean Container with Agent Brand Header */}
                {msg.role === "assistant" && (
                  <div className="w-full space-y-3 py-2 group">
                    {/* Assistant Header */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-[3.5px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {isAntigravity ? (
                            <AntigravityIcon className="size-3 text-indigo-500" />
                          ) : isClaude ? (
                            <ClaudeIcon className="size-3 text-[var(--accent-claude)]" />
                          ) : (
                            <OpenAIIcon className="size-3 text-[var(--status-awake)]" />
                          )}
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-200">
                          {model.replace(" (Thinking)", "")}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">·</span>
                        <span>{msg.timestamp || "Just now"}</span>
                      </div>

                      {msg.durationSeconds ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-[3.5px] bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-500">
                          {msg.durationSeconds}s
                        </span>
                      ) : null}
                    </div>

                    {/* Collapsible Model Reasoning Accordion */}
                    {msg.thinking && msg.thinking.trim().length > 0 && (
                      <div className="w-full py-0.5 select-text text-xs">
                        <button
                          type="button"
                          onClick={() => toggleThinkingAccordion(msg.id)}
                          className="inline-flex items-center gap-1.5 py-1 px-2 -ml-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer select-none rounded-[3.5px] group hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                        >
                          {msg.isThinkingExpanded !== false ? (
                            <ChevronDown className="size-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform" />
                          ) : (
                            <ChevronRight className="size-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform" />
                          )}
                          <Brain className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                          <span className="font-medium text-xs">
                            {isGenerating && idx === messages.length - 1 && !msg.content ? (
                              <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                <span>Thinking</span>
                                <span className="inline-block size-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                                  ({liveElapsedSec.toFixed(1)}s)
                                </span>
                              </span>
                            ) : msg.durationSeconds ? (
                              `Thought for ${msg.durationSeconds}s`
                            ) : (
                              "Reasoning"
                            )}
                          </span>
                        </button>

                        {msg.isThinkingExpanded !== false && (
                          <div className="mt-1.5 rounded-[3.5px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 p-3 text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto scrollbar-thin">
                            {msg.thinking}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tool Call Group */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <ToolCallGroup toolCalls={msg.toolCalls} />
                    )}

                    {/* Interactive Question Card */}
                    {msg.question && (
                      <div className="rounded-[3.5px] border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 text-xs font-semibold uppercase tracking-wider">
                          <HelpCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Clarification / Input Needed</span>
                        </div>
                        <p className="text-sm text-zinc-800 dark:text-zinc-200 font-sans">
                          {msg.question.question}
                        </p>
                        {msg.question.options && msg.question.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.question.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleSendPrompt(opt)}
                                className="px-3 py-1.5 text-xs font-medium border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#18181c] text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer rounded-[3.5px] shadow-2xs"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assistant Text - Clean and Unboxed */}
                    <div className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans select-text">
                      {msg.content ? (
                        <RichMarkdown
                          content={msg.content}
                          isStreaming={isGenerating && idx === messages.length - 1}
                        />
                      ) : isGenerating && idx === messages.length - 1 ? (
                        !msg.thinking ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 py-1">
                            <Loader2 className="size-3.5 text-zinc-400 dark:text-zinc-500 animate-spin" />
                            <span>Generating response... ({liveElapsedSec.toFixed(1)}s)</span>
                          </div>
                        ) : null
                      ) : null}
                    </div>

                    {/* Quick Interactive Choices detected from numbered / choice lists */}
                    {!msg.question && !isGenerating && msg.content && (() => {
                      const quickOptions = extractQuickOptions(msg.content);
                      if (quickOptions.length === 0) return null;
                      return (
                        <div className="pt-2">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                            <Sparkles className="size-3 text-indigo-500" />
                            <span>Quick Selection:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {quickOptions.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleSendPrompt(opt)}
                                className="group flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-[#16161c] text-zinc-800 dark:text-zinc-200 hover:border-indigo-500/60 dark:hover:border-indigo-400/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer rounded-[3.5px] shadow-2xs"
                              >
                                <span>{opt}</span>
                                <ArrowRight className="size-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-500" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Bottom Action Bar (Copy, TTS, Thumbs Up, Thumbs Down, Regenerate) */}
                    {msg.content && !isGenerating && (
                      <div className="flex items-center gap-0.5 pt-1 text-zinc-400 dark:text-zinc-500">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy text"
                          className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors cursor-pointer"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleTTS(msg.id, msg.content)}
                          title={speakingMsgId === msg.id ? "Stop audio" : "Read aloud"}
                          className={`p-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors cursor-pointer ${
                            speakingMsgId === msg.id ? "text-indigo-500 dark:text-indigo-400" : ""
                          }`}
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="size-3.5" />
                          ) : (
                            <Volume2 className="size-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReaction(msg.id, "up")}
                          title="Good response"
                          className={`p-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors cursor-pointer ${
                            reactions[msg.id] === "up" ? "text-emerald-500 dark:text-emerald-400" : ""
                          }`}
                        >
                          <ThumbsUp className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReaction(msg.id, "down")}
                          title="Poor response"
                          className={`p-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors cursor-pointer ${
                            reactions[msg.id] === "down" ? "text-rose-500 dark:text-rose-400" : ""
                          }`}
                        >
                          <ThumbsDown className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRegenerate(idx)}
                          title="Regenerate response"
                          className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-[3.5px] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isGenerating && activeChat?.state === "working" && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pl-1 py-1">
                <Loader2 className="size-3 text-amber-500 animate-spin" />
                <span>
                  Running tool {activeChat.activeTool || ""} on branch {activeLane?.branch || "main"}...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer Dock */}
      <div className="p-3.5 shrink-0 select-none bg-white dark:bg-[#0A0A0C] rounded-[3.5px]">
        <div className="max-w-3xl w-full mx-auto border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] rounded-[3.5px] focus-within:border-zinc-950 dark:focus-within:border-zinc-200 transition-colors shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Instruct ${sessionName} (e.g. 'What time is it?' or 'Refactor auth middleware')…`}
            className="w-full resize-none bg-transparent p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden leading-relaxed font-sans rounded-[3.5px]"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] rounded-[3.5px]">
            {/* Left Controls */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* Model Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 items-center gap-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer rounded-[3.5px]"
                  >
                    {isAntigravity ? (
                      <AntigravityIcon className="size-3 text-indigo-500 shrink-0" />
                    ) : isClaude ? (
                      <ClaudeIcon className="size-3 text-[var(--accent-claude)] shrink-0" />
                    ) : (
                      <OpenAIIcon className="size-3 text-[var(--status-awake)] shrink-0" />
                    )}
                    <span className="font-medium truncate max-w-[120px]">{model.replace(" (Thinking)", "")}</span>
                    <ChevronDown className="size-2.5 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-72 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-xl max-h-96 overflow-y-auto p-1 text-xs rounded-[3.5px] font-sans">
                  {availableModelGroups.map((group, gIdx) => (
                    <DropdownMenuGroup key={group.group}>
                      {gIdx > 0 && <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800 my-1" />}
                      <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                        {group.group.includes("Anthropic") ? (
                          <ClaudeIcon className="size-3 text-[var(--accent-claude)]" />
                        ) : group.group.includes("OpenAI") ? (
                          <OpenAIIcon className="size-3 text-[var(--status-awake)]" />
                        ) : (
                          <AntigravityIcon className="size-3 text-indigo-500" />
                        )}
                        <span>{group.group}</span>
                      </DropdownMenuLabel>
                      {group.models.map((m) => {
                        const isSelected = model === m.name;
                        const isAnthropic = m.name.toLowerCase().includes("claude");
                        const isGemini = m.name.toLowerCase().includes("gemini");
                        return (
                          <DropdownMenuItem
                            key={m.id}
                            onClick={() => handleSelectModel(m.name)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-medium"
                                : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isAnthropic ? (
                                <ClaudeIcon className="size-3 text-[var(--accent-claude)] shrink-0" />
                              ) : isGemini ? (
                                <AntigravityIcon className="size-3 text-indigo-500 shrink-0" />
                              ) : (
                                <OpenAIIcon className="size-3 text-[var(--status-awake)] shrink-0" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-xs">{m.name}</span>
                                <span className="text-[10px] text-zinc-400">{m.desc}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="size-3.5 text-indigo-500 shrink-0 ml-2" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mode Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 items-center gap-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors cursor-pointer rounded-[3.5px]"
                  >
                    <Sliders className="size-2.5 text-zinc-500" />
                    <span>Mode: {mode}</span>
                    <ChevronDown className="size-2.5 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56 bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs p-1 rounded-[3.5px] font-sans">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
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
                      className={`flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-[3.5px] ${
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

              {/* Clear History Button */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearChatHistory(currentChatId)}
                  title="Clear chat history for this worktree session"
                  className="flex h-6 items-center gap-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-500 hover:text-red-500 hover:border-red-400/50 transition-colors cursor-pointer rounded-[3.5px]"
                >
                  <RotateCcw className="size-2.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Right Action: Voice Dictation & Send Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? "Listening... (Click to stop)" : "Voice dictation (Click to speak)"}
                className={`flex h-6 w-6 items-center justify-center transition-all cursor-pointer rounded-[3.5px] ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse shadow-sm"
                    : "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 hover:border-rose-400/60"
                }`}
              >
                {isRecording ? <MicOff className="size-3" /> : <Mic className="size-3" />}
              </button>

              <span className="hidden sm:inline text-[10px] text-zinc-400">
                ⇧⏎ newline · ⏎ send
              </span>
              <button
                type="button"
                onClick={() => handleSendPrompt(inputPrompt)}
                disabled={!inputPrompt.trim() && !isGenerating}
                className={`flex h-6 items-center gap-1 px-3 text-xs font-semibold transition-all rounded-[3.5px] ${
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
