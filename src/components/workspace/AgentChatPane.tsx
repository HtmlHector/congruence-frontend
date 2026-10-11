"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { Composer } from "@/components/assistant-ui/composer";
import { CustomToolDispatcher } from "@/components/assistant-ui/custom-tools";
import { ModelSelector, AVAILABLE_MODELS } from "@/components/assistant-ui/model-selector";
import { useCongruenceRuntime } from "@/components/assistant-ui/useCongruenceRuntime";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, IntegrationsStatusData } from "@/lib/api";
import { HARNESS_LOGIN_COMMANDS, HARNESS_LOGIN_HINTS } from "@/lib/harness-login";
import { toast } from "sonner";
import { Terminal, Key, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AgentChatPane({ chatIdOverride }: { chatIdOverride?: string } = {}) {
  const {
    project,
    activeLane,
    chats,
    activeChatId,
    updateChatModel,
    setMode: setWorkspaceMode,
    setActiveTab,
    executeTerminalCommand,
    setGroupAgentView,
  } = useWorkspace();

  const effectiveChatId = chatIdOverride || activeChatId || "default";
  const activeChat = chats?.find((c) => c.id === effectiveChatId);

  // Harness detection
  const isAntigravity =
    activeChat?.harness === "Antigravity" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("antigravity") || activeLane?.branch.toLowerCase().includes("antigravity")));
  const isClaude =
    activeChat?.harness === "Claude" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("claude") || activeLane?.branch.toLowerCase().includes("claude")));
  const isCodex =
    activeChat?.harness === "Codex" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("codex") || activeLane?.branch.toLowerCase().includes("codex")));
  const isOpenCode =
    activeChat?.harness === "OpenCode" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("opencode") || activeLane?.branch.toLowerCase().includes("opencode")));
  const isCommandCode =
    activeChat?.harness?.toLowerCase() === "commandcode" ||
    activeChat?.harness?.toLowerCase() === "command code" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("command") || activeLane?.branch.toLowerCase().includes("command")));
  const isOpenRouter =
    activeChat?.harness === "OpenRouter" ||
    (!activeChat && (activeLane?.name.toLowerCase().includes("openrouter") || activeLane?.branch.toLowerCase().includes("openrouter")));

  const harnessName = isAntigravity
    ? "Antigravity"
    : isClaude
    ? "Claude"
    : isCodex
    ? "Codex"
    : isOpenCode
    ? "OpenCode"
    : isCommandCode
    ? "Command Code"
    : isOpenRouter
    ? "OpenRouter"
    : "Claude";

  const defaultModelForHarness = isAntigravity
    ? "Gemini 3.7 Flash (High)"
    : isCodex
    ? "o3-mini"
    : isClaude
    ? "Claude Sonnet 4.6 (Thinking)"
    : isOpenCode
    ? "mimo-v2.6-flash-free"
    : isCommandCode
    ? "taste-1 (Adaptive)"
    : isOpenRouter
    ? "deepseek/deepseek-chat"
    : "Claude Sonnet 4.6 (Thinking)";

  const [model, setModel] = useState<string>(activeChat?.model || defaultModelForHarness);

  useEffect(() => {
    if (activeChat?.model) {
      setModel(activeChat.model);
    } else {
      setModel(defaultModelForHarness);
    }
  }, [activeChat?.model, defaultModelForHarness]);

  const handleSelectModel = useCallback(
    (newModel: string) => {
      setModel(newModel);
      if (effectiveChatId) {
        updateChatModel(effectiveChatId, newModel);
      }
    },
    [effectiveChatId, updateChatModel]
  );

  // Harness connection status from backend
  const [harnessStatus, setHarnessStatus] = useState<IntegrationsStatusData | null>(null);
  const agentHarnessKey = isClaude
    ? "claude"
    : isCodex
    ? "codex"
    : isAntigravity
    ? "antigravity"
    : isOpenCode
    ? "opencode"
    : isCommandCode
    ? "commandcode"
    : null;

  const isConnected = agentHarnessKey ? harnessStatus?.harnesses?.[agentHarnessKey]?.state === "connected" : false;
  const harnessDisconnected = Boolean(agentHarnessKey && !isConnected);

  useEffect(() => {
    const projId = project?.id;
    if (!projId || !agentHarnessKey) {
      setHarnessStatus(null);
      return;
    }
    let cancelled = false;
    api
      .getIntegrationsStatus(projId)
      .then((s) => {
        if (!cancelled) setHarnessStatus(s);
      })
      .catch(() => {
        if (!cancelled) setHarnessStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [project?.id, agentHarnessKey]);

  const launchHarnessLogin = () => {
    if (!agentHarnessKey) return;
    setWorkspaceMode("deck");
    setActiveTab("terminal");
    setGroupAgentView("primary", "pty");
    setGroupAgentView("secondary", "pty");
    const command = HARNESS_LOGIN_COMMANDS[agentHarnessKey];
    executeTerminalCommand(command);
    toast.success(
      `Running \`${command}\` in the terminal — ${HARNESS_LOGIN_HINTS[agentHarnessKey]}`
    );
  };

  // Congruence runtime connecting Assistant UI to api.streamAgentChat
  const { runtime } = useCongruenceRuntime({
    chatId: effectiveChatId,
    harness: harnessName,
    model,
    projectId: project?.slug || project?.name || project?.id,
    laneId: activeLane?.id,
    branch: activeLane?.branch || "main",
  });

  const threadComponents = useMemo(
    () => ({
      ToolFallback: CustomToolDispatcher,
      Composer: ({ autoFocus }: { autoFocus?: boolean }) => (
        <Composer
          autoFocus={autoFocus}
          modelSelector={
            <ModelSelector
              currentModel={model}
              onSelectModel={handleSelectModel}
              harness={harnessName}
            />
          }
        />
      ),
    }),
    [model, handleSelectModel, harnessName]
  );

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-background overflow-hidden relative">
      {/* Harness Disconnected Banner */}
      {harnessDisconnected && (
        <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-3.5 text-amber-400 shrink-0" />
            <span>
              {harnessName} is not connected on this host runner.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={launchHarnessLogin}
            className="h-6 gap-1 px-2 text-[11px] border-amber-500/30 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30"
          >
            <Terminal className="size-3" />
            Connect via Terminal
          </Button>
        </div>
      )}

      {/* Assistant UI Thread */}
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread components={threadComponents} />
      </AssistantRuntimeProvider>
    </div>
  );
}
