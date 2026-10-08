/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React from "react";
import { Users, Code2, KeyRound, Smartphone, GitFork, Sparkles, Check, ArrowRight } from "lucide-react";
import { ClaudeIcon, AntigravityIcon, OpenAIIcon } from "@/components/ui/brand-icons";

export function PillarsSection() {
  const pillars = [
    {
      icon: Users,
      badge: "For PMs & Founders",
      title: "Direct agents without touching a terminal.",
      description:
        "Prompt Claude Code, Google Antigravity, or Codex in plain natural language. See the real running application update instantly and test buttons and workflows directly in your browser.",
    },
    {
      icon: Code2,
      badge: "For Developers & Leads",
      title: "Isolated Git worktrees per agent lane.",
      description:
        "No more messy overwrites. Each agent operates in its own isolated worktree lane. Developers retain full write-lease control, interactive PTY terminal access, and clean PR generation.",
    },
    {
      icon: KeyRound,
      badge: "Zero-Proxy Custody",
      title: "Your API keys and tokens stay yours.",
      description:
        "We never proxy or resell AI model tokens. Connect your own Anthropic, OpenAI, or Google AI accounts securely via browser-side encrypted storage or environment secrets.",
    },
    {
      icon: Smartphone,
      badge: "Any Device & Anywhere",
      title: "Pick up your workspace from any screen.",
      description:
        "Close your laptop in the office and pick up the exact same session on your iPad, home desktop, or mobile phone. Files, terminal logs, and live previews persist safely.",
    },
  ];

  return (
    <section id="for-teams" className="w-full border-t border-[var(--border)] py-20 bg-[var(--surface-inset)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border)] pb-6 gap-4">
          <div>
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-widest block mb-1">
              03 / Why Congruence
            </span>
            <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-[var(--foreground)]">
              Built for the whole team. Not just CLI experts.
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted-foreground)]">
            <span className="size-1.5 rounded-[3.5px] bg-[var(--accent-antigravity)]" />
            <span>Architecture & Concurrency</span>
          </div>
        </div>

        {/* 4 Pillar Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between border border-[var(--border)] bg-[var(--surface-primary)] p-6 sm:p-8 transition-all hover:border-[var(--border-strong)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="size-8 flex items-center justify-center border border-[var(--border)] bg-[var(--surface-sidebar)] text-[var(--foreground)]">
                      <Icon className="size-4" />
                    </div>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--muted-foreground)]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Matrix / Comparison Table */}
        <div className="border border-[var(--border)] bg-[var(--surface-primary)]">
          <div className="border-b border-[var(--border)] bg-[var(--surface-sidebar)] px-6 py-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--foreground)] font-medium">
              Capability Comparison Matrix
            </span>
            <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
              Honest Architecture Analysis
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--muted-foreground)]">
                  <th className="p-4 font-medium uppercase text-[11px]">Feature</th>
                  <th className="p-4 font-medium uppercase text-[11px]">Local CLI / Terminal</th>
                  <th className="p-4 font-medium uppercase text-[11px]">Generic Cloud IDE</th>
                  <th className="p-4 font-medium uppercase text-[11px] text-[var(--foreground)] bg-[var(--surface-tertiary)]">
                    Congruence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--muted-foreground)]">
                <tr>
                  <td className="p-4 text-[var(--foreground)] font-sans font-medium">Setup for non-technical users</td>
                  <td className="p-4">Complex (Node, Python, Git CLI)</td>
                  <td className="p-4">Moderate (Container configs)</td>
                  <td className="p-4 text-[var(--accent-codex)] bg-[var(--surface-tertiary)] font-medium">
                    ✓ Instant (Zero setup URL)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-[var(--foreground)] font-sans font-medium">Simultaneous Multi-Agent Lanes</td>
                  <td className="p-4">Manual (Separate terminals)</td>
                  <td className="p-4">Single agent at a time</td>
                  <td className="p-4 text-[var(--accent-codex)] bg-[var(--surface-tertiary)] font-medium">
                    ✓ Native (Isolated worktrees)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-[var(--foreground)] font-sans font-medium">Integrated Live App Preview</td>
                  <td className="p-4">Separate browser window</td>
                  <td className="p-4">Basic webview tab</td>
                  <td className="p-4 text-[var(--accent-codex)] bg-[var(--surface-tertiary)] font-medium">
                    ✓ Side-by-side with hot reload
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-[var(--foreground)] font-sans font-medium">Git Merge Safety</td>
                  <td className="p-4">Risk of silent file overwrites</td>
                  <td className="p-4">Standard branch workflow</td>
                  <td className="p-4 text-[var(--accent-codex)] bg-[var(--surface-tertiary)] font-medium">
                    ✓ Worktree isolation per lane
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-[var(--foreground)] font-sans font-medium">Model Token Custody</td>
                  <td className="p-4">Your own keys</td>
                  <td className="p-4">Resold tokens / Markup</td>
                  <td className="p-4 text-[var(--accent-codex)] bg-[var(--surface-tertiary)] font-medium">
                    ✓ 100% Direct (BYOK / Zero markup)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
