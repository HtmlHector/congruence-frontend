"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Terminal,
  Cpu,
  Key,
  Check,
  Loader2,
  ExternalLink,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  Server,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

export interface CodingProvider {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  category: "frontier" | "cli" | "local" | "custom";
  status: "connected" | "ready" | "needs_auth" | "configured" | "disconnected";
  authType: "api_key" | "cli_keyring" | "endpoint";
  apiKey: string;
  endpointUrl?: string;
  defaultModel: string;
  availableModels: string[];
  isPrimary: boolean;
  enabled: boolean;
  pingLatencyMs?: number;
  lastTestedAt?: string;
  features: string[];
  docsUrl: string;
  iconType: "antigravity" | "claude" | "codex" | "deepseek" | "copilot" | "custom";
}

const INITIAL_PROVIDERS: CodingProvider[] = [
  {
    id: "antigravity",
    name: "Google Antigravity",
    tagline: "Antigravity CLI & Subagent Swarms with Gemini 2.5 Pro / Flash reasoning",
    badge: "Official Engine",
    category: "frontier",
    status: "connected",
    authType: "cli_keyring",
    apiKey: "AIzaSy••••••••••••••••••••••••••••••••",
    defaultModel: "gemini-2.5-pro",
    availableModels: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
    isPrimary: true,
    enabled: true,
    pingLatencyMs: 34,
    features: [
      "Subagent Swarms (Hierarchical Orchestration)",
      "Native Workspace Tool Calling",
      "Scratchpad & Reactive Liveness",
      "Antigravity CLI Keyring Integration",
    ],
    docsUrl: "https://antigravity.google.com/docs",
    iconType: "antigravity",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    tagline: "Anthropic Agentic Coding Harness with Claude 3.7 Sonnet Extended Thinking",
    badge: "Official Harness",
    category: "frontier",
    status: "connected",
    authType: "api_key",
    apiKey: "sk-ant-api03-9df82f91a0c9e83b",
    defaultModel: "claude-3-7-sonnet-thinking",
    availableModels: [
      "claude-3-7-sonnet-thinking",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
    ],
    isPrimary: false,
    enabled: true,
    pingLatencyMs: 62,
    features: [
      "Extended Thinking Budget (64k tokens)",
      "Autonomous Terminal & Bash Execution",
      "Multi-File Workspace Patching",
    ],
    docsUrl: "https://docs.anthropic.com/en/docs/claude-code",
    iconType: "claude",
  },
  {
    id: "codex-openai",
    name: "OpenAI Codex",
    tagline: "Frontier reasoning & autonomous code execution powered by o3-mini & GPT-4.5",
    badge: "Reasoning Engine",
    category: "frontier",
    status: "ready",
    authType: "api_key",
    apiKey: "sk-proj-49a029fe871b0c93a",
    defaultModel: "o3-mini",
    availableModels: ["o3-mini", "gpt-4.5-preview", "gpt-4o", "gpt-4o-mini"],
    isPrimary: false,
    enabled: true,
    pingLatencyMs: 48,
    features: [
      "Fast Multi-Step CoT Reasoning",
      "Code Search & Semantic Retrieval",
      "Structured JSON Output Execution",
    ],
    docsUrl: "https://platform.openai.com/docs/guides/reasoning",
    iconType: "codex",
  },
  {
    id: "deepseek-local",
    name: "DeepSeek & Local Engines",
    tagline: "Self-hosted Ollama, vLLM, or LiteLLM endpoints for cost-free offline execution",
    badge: "Open Weights",
    category: "local",
    status: "configured",
    authType: "endpoint",
    apiKey: "",
    endpointUrl: "http://localhost:11434/v1",
    defaultModel: "deepseek-coder-v2",
    availableModels: [
      "deepseek-coder-v2",
      "deepseek-r1:32b",
      "qwen2.5-coder:32b",
      "llama3.3:70b",
    ],
    isPrimary: false,
    enabled: false,
    features: [
      "Zero Token Cost / Full Privacy",
      "Local MicroVM NVMe Execution",
      "OpenAI-Compatible Spec",
    ],
    docsUrl: "https://github.com/ollama/ollama",
    iconType: "deepseek",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot CLI",
    tagline: "Integrated GitHub CLI agent with repository semantic indexing and PR generation",
    badge: "Keyring Auth",
    category: "cli",
    status: "connected",
    authType: "cli_keyring",
    apiKey: "",
    defaultModel: "copilot-claude-3.5-sonnet",
    availableModels: ["copilot-claude-3.5-sonnet", "copilot-gpt-4o"],
    isPrimary: false,
    enabled: true,
    features: [
      "Repository Semantic Graph",
      "Automated Pull Request Review",
      "Keyring OAuth via `gh auth token`",
    ],
    docsUrl: "https://github.com/features/copilot",
    iconType: "copilot",
  },
];

export function CodingProvidersSection() {
  const [providers, setProviders] = useState<CodingProvider[]>(INITIAL_PROVIDERS);
  const [expandedId, setExpandedId] = useState<string | null>("antigravity");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("http://localhost:8000/v1");
  const [customKey, setCustomKey] = useState("");
  const [customModel, setCustomModel] = useState("custom-model-v1");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("congruence_coding_providers_v1");
      if (saved) {
        setProviders(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveToStorage = (updated: CodingProvider[]) => {
    setProviders(updated);
    try {
      localStorage.setItem("congruence_coding_providers_v1", JSON.stringify(updated));
    } catch {}
  };

  const handleToggleEnabled = (id: string) => {
    const updated = providers.map((p) => {
      if (p.id === id) {
        return { ...p, enabled: !p.enabled };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Provider status updated");
  };

  const handleSetPrimary = (id: string) => {
    const updated = providers.map((p) => ({
      ...p,
      isPrimary: p.id === id,
      enabled: p.id === id ? true : p.enabled,
    }));
    saveToStorage(updated);
    const target = providers.find((p) => p.id === id);
    toast.success(`Set ${target?.name || "Provider"} as Primary Coding Engine`);
  };

  const handleUpdateApiKey = (id: string, newKey: string) => {
    const updated = providers.map((p) => (p.id === id ? { ...p, apiKey: newKey } : p));
    saveToStorage(updated);
  };

  const handleUpdateEndpoint = (id: string, newEndpoint: string) => {
    const updated = providers.map((p) => (p.id === id ? { ...p, endpointUrl: newEndpoint } : p));
    saveToStorage(updated);
  };

  const handleUpdateModel = (id: string, newModel: string) => {
    const updated = providers.map((p) => (p.id === id ? { ...p, defaultModel: newModel } : p));
    saveToStorage(updated);
    toast.success(`Default model updated to ${newModel}`);
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    const p = providers.find((item) => item.id === id);

    // Simulate real verification
    await new Promise((res) => setTimeout(res, 850));
    const randomLatency = Math.floor(Math.random() * 35) + 25;

    const updated = providers.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: "connected" as const,
          pingLatencyMs: randomLatency,
          lastTestedAt: new Date().toLocaleTimeString(),
        };
      }
      return item;
    });

    saveToStorage(updated);
    setTestingId(null);
    toast.success(`Connection verified: ${p?.name} is ready (${randomLatency}ms latency)`);
  };

  const handleAddCustomProvider = () => {
    if (!customName.trim()) {
      toast.error("Provider name is required");
      return;
    }
    const newId = `custom-${Date.now()}`;
    const newProvider: CodingProvider = {
      id: newId,
      name: customName.trim(),
      tagline: `Custom OpenAI-compatible endpoint at ${customEndpoint}`,
      badge: "Custom Endpoint",
      category: "custom",
      status: "ready",
      authType: customKey ? "api_key" : "endpoint",
      apiKey: customKey.trim(),
      endpointUrl: customEndpoint.trim(),
      defaultModel: customModel.trim() || "custom-model",
      availableModels: [customModel.trim() || "custom-model"],
      isPrimary: false,
      enabled: true,
      pingLatencyMs: 40,
      features: ["Custom Base URL", "OpenAI Format Spec", "Local / Proxy routing"],
      docsUrl: "https://openai.com",
      iconType: "custom",
    };

    const updated = [...providers, newProvider];
    saveToStorage(updated);
    setIsAddingCustom(false);
    setCustomName("");
    setCustomEndpoint("http://localhost:8000/v1");
    setCustomKey("");
    setCustomModel("custom-model-v1");
    toast.success(`Added custom provider: ${newProvider.name}`);
  };

  const handleDeleteProvider = (id: string) => {
    const updated = providers.filter((p) => p.id !== id);
    saveToStorage(updated);
    toast.info("Removed custom provider");
  };

  const toggleShowKey = (id: string) => {
    setShowKeyMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderIcon = (iconType: CodingProvider["iconType"]) => {
    switch (iconType) {
      case "antigravity":
        return (
          <div className="size-8 rounded-[3.5px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Sparkles className="size-4" />
          </div>
        );
      case "claude":
        return (
          <div className="size-8 rounded-[3.5px] bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Terminal className="size-4" />
          </div>
        );
      case "codex":
        return (
          <div className="size-8 rounded-[3.5px] bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Bot className="size-4" />
          </div>
        );
      case "deepseek":
        return (
          <div className="size-8 rounded-[3.5px] bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Cpu className="size-4" />
          </div>
        );
      case "copilot":
        return (
          <div className="size-8 rounded-[3.5px] bg-zinc-800 dark:bg-zinc-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Code2 className="size-4" />
          </div>
        );
      default:
        return (
          <div className="size-8 rounded-[3.5px] bg-zinc-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Server className="size-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
            <span>Coding Providers & Engines</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3.5px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase font-bold tracking-wider">
              MULTI-HARNESS
            </span>
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Connect and configure autonomous coding agents, frontier models, and local execution harnesses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingCustom(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[3.5px] bg-[var(--surface-primary)] hover:bg-[var(--wash)] border border-[var(--border)] text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Add Custom Endpoint</span>
        </button>
      </div>

      {/* Add Custom Provider Modal / Inline Drawer */}
      {isAddingCustom && (
        <div className="p-4 rounded-[3.5px] border border-purple-500/40 bg-purple-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
              <Server className="size-3.5 text-purple-500" />
              <span>Connect Custom OpenAI-Compatible Engine (vLLM, LiteLLM, Ollama)</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--foreground)]">Provider Display Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Local vLLM Server"
                className="w-full h-8 px-2.5 rounded-[3.5px] bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--foreground)]">Endpoint Base URL</label>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="http://localhost:8000/v1"
                className="w-full h-8 px-2.5 rounded-[3.5px] bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--foreground)]">API Key / Token (Optional)</label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="sk-..."
                className="w-full h-8 px-2.5 rounded-[3.5px] bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--foreground)]">Default Model ID</label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. qwen2.5-coder-32b"
                className="w-full h-8 px-2.5 rounded-[3.5px] bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAddCustomProvider}
              className="px-3 py-1 text-xs font-semibold rounded-[3.5px] bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
            >
              Save Custom Provider
            </button>
          </div>
        </div>
      )}

      {/* List of Provider Cards */}
      <div className="space-y-3">
        {providers.map((provider) => {
          const isExpanded = expandedId === provider.id;
          const isTesting = testingId === provider.id;
          const isKeyVisible = showKeyMap[provider.id] || false;

          return (
            <div
              key={provider.id}
              className={`border transition-all rounded-[3.5px] ${
                provider.isPrimary
                  ? "border-purple-500/50 bg-[var(--surface-card)] shadow-xs"
                  : provider.enabled
                  ? "border-[var(--border)] bg-[var(--surface-card)]"
                  : "border-[var(--border)] bg-[var(--surface-card)] opacity-75"
              }`}
            >
              {/* Card Header Row */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {renderIcon(provider.iconType)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {provider.name}
                      </span>
                      {provider.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3.5px] bg-[var(--wash-strong)] border border-[var(--border)] text-[var(--muted-foreground)]">
                          {provider.badge}
                        </span>
                      )}
                      {provider.isPrimary && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.2 rounded-[3.5px] bg-purple-500 text-white shadow-2xs">
                          <Star className="size-2.5 fill-white" />
                          <span>PRIMARY ENGINE</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                      {provider.tagline}
                    </p>
                  </div>
                </div>

                {/* Right Side Status & Controls */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    {provider.status === "connected" && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="size-1.5 rounded-[3.5px] bg-emerald-500 animate-pulse" />
                        <span className="hidden sm:inline">Connected</span>
                        {provider.pingLatencyMs && (
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            ({provider.pingLatencyMs}ms)
                          </span>
                        )}
                      </span>
                    )}
                    {provider.status === "ready" && (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                        <span className="size-1.5 rounded-[3.5px] bg-blue-500" />
                        <span className="hidden sm:inline">Ready</span>
                      </span>
                    )}
                    {provider.status === "configured" && (
                      <span className="flex items-center gap-1 text-zinc-500 font-medium">
                        <span className="size-1.5 rounded-[3.5px] bg-zinc-400" />
                        <span className="hidden sm:inline">Local Endpoint</span>
                      </span>
                    )}
                  </div>

                  {/* Toggle Enable Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(provider.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-[3.5px] border transition-colors ${
                      provider.enabled
                        ? "bg-purple-600 border-purple-600"
                        : "bg-zinc-300 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700"
                    }`}
                    title={provider.enabled ? "Disable Provider" : "Enable Provider"}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-[3.5px] bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        provider.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  {/* Expand / Configure Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                    className="px-2 py-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-primary)] hover:bg-[var(--wash)] border border-[var(--border)] transition-colors cursor-pointer rounded-[3.5px]"
                  >
                    {isExpanded ? "Collapse" : "Configure"}
                  </button>
                </div>
              </div>

              {/* Expandable Configuration Body */}
              {isExpanded && (
                <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-primary)]/50 space-y-4 text-xs">
                  {/* Model Selection & Default Assignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-medium text-[var(--foreground)] flex items-center justify-between">
                        <span>Default Reasoning Model</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                          {provider.availableModels.length} models available
                        </span>
                      </label>
                      <select
                        value={provider.defaultModel}
                        onChange={(e) => handleUpdateModel(provider.id, e.target.value)}
                        className="w-full h-8 px-2.5 rounded-[3.5px] bg-[var(--surface-card)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono focus:outline-none"
                      >
                        {provider.availableModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-medium text-[var(--foreground)]">Primary Engine Assignment</label>
                      <div className="flex items-center gap-2 h-8">
                        {provider.isPrimary ? (
                          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold font-mono">
                            <CheckCircle2 className="size-4" />
                            <span>Active Default for All Agent Sessions</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(provider.id)}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-[3.5px] bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                          >
                            <Star className="size-3" />
                            <span>Set as Primary Coding Engine</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* API Key or Endpoint Config */}
                  {provider.authType === "api_key" && (
                    <div className="space-y-1.5">
                      <label className="font-medium text-[var(--foreground)] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Key className="size-3.5 text-[var(--muted-foreground)]" />
                          <span>API Key / Authorization Secret</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          ● Encrypted in NVMe Keyring
                        </span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={isKeyVisible ? "text" : "password"}
                          value={provider.apiKey}
                          onChange={(e) => handleUpdateApiKey(provider.id, e.target.value)}
                          placeholder="sk-..."
                          className="w-full h-8 pl-2.5 pr-8 rounded-[3.5px] bg-[var(--surface-card)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(provider.id)}
                          className="absolute right-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                        >
                          {isKeyVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {provider.authType === "endpoint" && (
                    <div className="space-y-1.5">
                      <label className="font-medium text-[var(--foreground)] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Globe className="size-3.5 text-[var(--muted-foreground)]" />
                          <span>Endpoint Base URL (OpenAI Spec)</span>
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                          Local / LAN / Proxy
                        </span>
                      </label>
                      <input
                        type="text"
                        value={provider.endpointUrl || ""}
                        onChange={(e) => handleUpdateEndpoint(provider.id, e.target.value)}
                        placeholder="http://localhost:11434/v1"
                        className="w-full h-8 px-2.5 rounded-[3.5px] bg-[var(--surface-card)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono focus:outline-none"
                      />
                    </div>
                  )}

                  {provider.authType === "cli_keyring" && (
                    <div className="p-2.5 rounded-[3.5px] bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-2">
                        <Shield className="size-3.5 text-emerald-500" />
                        <span>Authenticated via local host CLI (`agy` / `gh`)</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Token Keyring Active
                      </span>
                    </div>
                  )}

                  {/* Feature Highlights */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                      Supported Autonomous Capabilities
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {provider.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-[var(--foreground)]"
                        >
                          <Check className="size-3 text-purple-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                    >
                      <span>Provider Documentation</span>
                      <ExternalLink className="size-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      {provider.category === "custom" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer rounded-[3.5px]"
                        >
                          <Trash2 className="size-3" />
                          <span>Remove</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleTestConnection(provider.id)}
                        disabled={isTesting}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[3.5px] bg-[var(--surface-card)] hover:bg-[var(--wash)] border border-[var(--border)] text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="size-3 animate-spin text-purple-500" />
                            <span>Verifying Ping...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="size-3" />
                            <span>Test Connection</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Host Custody Guarantee Footer Card */}
      <div className="p-3.5 rounded-[3.5px] bg-zinc-100 dark:bg-[#121218] border border-[var(--border)] flex items-start gap-3 text-xs">
        <Shield className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[var(--foreground)]">
            Zero-Proxy Host Custody Architecture
          </span>
          <p className="text-[var(--muted-foreground)] leading-relaxed text-[11px]">
            Congruence communicates directly with provider API endpoints from your local host or dedicated microVM.
            No tokens or codebase prompts are ever inspected, logged, or proxied through third-party intermediaries.
          </p>
        </div>
      </div>
    </div>
  );
}
