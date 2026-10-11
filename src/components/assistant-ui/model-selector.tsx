"use client";

import React, { useMemo } from "react";
import { Sparkles, Brain, Bot, Code2, Globe } from "lucide-react";
import {
  ModelSelectorRoot,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorSearch,
  ModelSelectorList,
  ModelSelectorGroup,
  ModelSelectorSeparator,
  ModelSelectorItem,
  ModelSelectorEffort,
  ModelSelectorEmpty,
} from "@/components/assistant-ui/elements/model-selector";
import type { ModelOption } from "@/components/assistant-ui/utils/model-selection";

export const AVAILABLE_MODELS = [
  {
    group: "Google DeepMind (Antigravity)",
    icon: <Sparkles className="size-3.5 text-indigo-400" />,
    models: [
      { id: "Gemini 3.8 Flash (High)", name: "Gemini 3.8 Flash", desc: "Frontier multimodal reasoning & code synthesis", efforts: true },
      { id: "Gemini 3.1 Pro (High)", name: "Gemini 3.1 Pro", desc: "High-power reasoning & deep coding", efforts: true },
      { id: "Gemini 3.7 Flash (High)", name: "Gemini 3.7 Flash", desc: "Sub-second low latency with deep agentic tools", efforts: true },
    ],
  },
  {
    group: "Anthropic (Claude Code)",
    icon: <Brain className="size-3.5 text-amber-500" />,
    models: [
      { id: "Claude Sonnet 4.6 (Thinking)", name: "Claude Sonnet 4.6", desc: "Hybrid deep reasoning and architecture", efforts: true },
      { id: "Claude Opus 4.6 (Thinking)", name: "Claude Opus 4.6", desc: "Maximum capability multi-file refactoring", efforts: true },
      { id: "Claude 3.7 Sonnet (Thinking)", name: "Claude 3.7 Sonnet", desc: "Fast frontier coding & planning", efforts: true },
    ],
  },
  {
    group: "OpenRouter (Frontier Gateway)",
    icon: <Globe className="size-3.5 text-sky-400" />,
    models: [
      { id: "openai/gpt-5.6-luna", name: "GPT-5.6 Luna", desc: "Next-gen OpenAI frontier model on OpenRouter" },
      { id: "openai/gpt-4o", name: "GPT-4o", desc: "OpenAI flagship with verified tool execution" },
      { id: "qwen/qwen3-coder", name: "Qwen 3 Coder", desc: "Frontier code specialist with tool calling" },
      { id: "mistralai/codestral-2508", name: "Codestral 2508", desc: "Mistral code flagship with function calling" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", desc: "High-capability reasoning and general coding" },
    ],
  },
  {
    group: "OpenCode & Open Models",
    icon: <Code2 className="size-3.5 text-emerald-400" />,
    models: [
      { id: "inclusionai/ling-3.0-flash-sante:free", name: "Ling 3.0 Flash Sante (Free)", desc: "InclusionAI frontier open coding model" },
      { id: "mimo-v2.6-flash-free", name: "mimo-v2.6-flash-free", desc: "Ultra-fast low latency free tier open model" },
      { id: "DeepSeek R1 (Thinking)", name: "DeepSeek R1", desc: "Frontier open weights reasoning & code synthesis", efforts: true },
      { id: "Qwen 2.5 Coder 32B", name: "Qwen 2.5 Coder 32B", desc: "High-accuracy open code generation" },
    ],
  },
  {
    group: "Command Code (Taste-1 / Cohere)",
    icon: <Bot className="size-3.5 text-violet-400" />,
    models: [
      { id: "taste-1 (Adaptive)", name: "taste-1 (Adaptive)", desc: "Meta neuro-symbolic coding agent trained on developer taste" },
      { id: "Command A+ (218B MoE)", name: "Command A+", desc: "Cohere flagship frontier mixture-of-experts model" },
      { id: "Command R+ (Reasoning & RAG)", name: "Command R+", desc: "Enterprise grounded reasoning with high tool accuracy" },
    ],
  },
];

interface ModelSelectorProps {
  currentModel: string;
  onSelectModel: (model: string) => void;
  harness?: string;
}

export function ModelSelector({ currentModel, onSelectModel }: ModelSelectorProps) {
  // Flatten model options for assistant-ui root
  const flattenedModels = useMemo<ModelOption[]>(() => {
    const list: ModelOption[] = [];
    for (const group of AVAILABLE_MODELS) {
      for (const m of group.models) {
        list.push({
          id: m.id,
          name: m.name,
          description: m.desc,
          efforts: m.efforts,
          keywords: [group.group, m.name, m.id],
          icon: group.icon,
        });
      }
    }
    return list;
  }, []);

  return (
    <ModelSelectorRoot
      models={flattenedModels}
      value={currentModel}
      onValueChange={(val) => {
        if (val) onSelectModel(val);
      }}
    >
      <ModelSelectorTrigger
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground border-none rounded-md"
      />
      <ModelSelectorContent align="start" searchable side="top" className="w-80 max-h-96 shadow-xl border border-border">
        <ModelSelectorSearch placeholder="Search AI models & engines..." />
        <ModelSelectorList className="max-h-64 overflow-y-auto">
          <ModelSelectorEmpty />
          {AVAILABLE_MODELS.map((group, groupIdx) => (
            <React.Fragment key={group.group}>
              {groupIdx > 0 && <ModelSelectorSeparator />}
              <ModelSelectorGroup heading={group.group}>
                {group.models.map((m) => {
                  const opt = flattenedModels.find((f) => f.id === m.id);
                  if (!opt) return null;
                  return <ModelSelectorItem key={m.id} model={opt} />;
                })}
              </ModelSelectorGroup>
            </React.Fragment>
          ))}
        </ModelSelectorList>
        <ModelSelectorEffort label="Thinking Effort" />
      </ModelSelectorContent>
    </ModelSelectorRoot>
  );
}
