import { cn } from "@/lib/utils";

import { ClaudeLogo } from "./claude";
import { ClineLogo } from "./cline";
import { CodexLogo } from "./codex";

export type AgentName = "claude" | "cline" | "codex";

export const AGENTS: readonly {
  name: AgentName;
  label: string;
  command: string;
}[] = [
  { name: "claude", label: "Claude", command: "claude" },
  { name: "cline", label: "Cline", command: "cline" },
  { name: "codex", label: "Codex", command: "codex" },
];

export function isAgentName(value: unknown): value is AgentName {
  return AGENTS.some((agent) => agent.name === value);
}

export function agentLabel(agent: AgentName): string {
  return AGENTS.find((item) => item.name === agent)?.label ?? agent;
}

export function agentCommand(agent: AgentName): string {
  return AGENTS.find((item) => item.name === agent)?.command ?? agent;
}

export function AgentLogo({
  agent,
  className,
}: {
  agent: AgentName;
  className?: string;
}) {
  if (agent === "claude") {
    return <ClaudeLogo aria-hidden="true" className={className} />;
  }
  if (agent === "cline") {
    return <ClineLogo aria-hidden="true" className={className} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0", className)}
    >
      <CodexLogo mode="light" className="size-full dark:hidden" />
      <CodexLogo mode="dark" className="hidden size-full dark:block" />
    </span>
  );
}
