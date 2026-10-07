"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  BookOpen,
  Folder,
  Edit3,
  CheckCircle2,
  Share2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface DocPage {
  id: string;
  title: string;
  category: "Specifications" | "Architecture" | "Field Notes";
  updatedAt: string;
  content: string;
}

export function PagesView() {
  const [pages, setPages] = useState<DocPage[]>([
    {
      id: "doc-1",
      title: "PRD: Congruence Browser Execution Deck",
      category: "Specifications",
      updatedAt: "Today",
      content: `# Congruence — Product Requirements

## Problem Statement
AI coding agents (Claude Code CLI, OpenAI Codex CLI, Aider) lack an isolated, high-performance browser execution layer with real POSIX PTY access, zero-conflict multi-lane Git worktrees, and instant hot reload previews.

## Target Audience
- Senior Fullstack Engineers orchestrating multiple LLM CLI agents concurrently.
- Lead Architects requiring cryptographic vault isolation and deterministic git branch merging.

## Core Features
1. **Interactive POSIX PTY Gateway**: High-throughput xterm.js terminal with raw ANSI escape sequence rendering.
2. **Git Worktree Isolation**: Zero merge conflicts across concurrent pair-lane and agent-lane branches.
3. **Hardware Encrypted Vault**: AES-256-GCM encrypted API key management with Anthropic Device OAuth.
4. **FastAPI Dynamic Reverse Proxy**: Instant live preview port routing.`,
    },
    {
      id: "doc-2",
      title: "TRD: POSIX PTY WebSocket Protocol & Runner",
      category: "Architecture",
      updatedAt: "Yesterday",
      content: `# Technical Architecture & Runner

## Protocol Specification
- **Endpoint**: \`/ws/session/{session_id}\`
- **Payload Format**: Binary or JSON \`{"type": "input", "data": "..."}\` / \`{"type": "resize", "cols": 120, "rows": 32}\`
- **Shell**: \`/bin/zsh\` / \`/bin/bash\` spawned via \`pty.fork()\` on macOS/Linux.

## Security Boundary
- Environment variable injection via AES-256-GCM decrypted vault tokens in ephemeral subprocess memory.
- Subprocess isolation with working directory pinned to Git worktree root.`,
    },
    {
      id: "doc-3",
      title: "Agent Field Notes: Claude Code vs Codex Tool Calling",
      category: "Field Notes",
      updatedAt: "2 days ago",
      content: `# Agent Field Notes

- **Claude Code CLI**: Best for complex end-to-end refactors and direct interactive terminal prompts with ANSI control codes.
- **OpenAI Codex**: High precision for single-file algorithmic changes and strict schema typing.
- **Aider**: Optimized for git diff generation and atomic multi-file edits.`,
    },
  ]);

  const [selectedPageId, setSelectedPageId] = useState<string>("doc-1");
  const activeDoc = pages.find((p) => p.id === selectedPageId) || pages[0];

  return (
    <div className="flex h-full w-full bg-[var(--surface-primary)] overflow-hidden">
      {/* Pages Left Index */}
      <div className="w-72 border-r border-[var(--border)] bg-[var(--surface-sidebar)] flex flex-col shrink-0">
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-sidebar)]/50">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[var(--accent-claude)]" />
            <span className="text-xs font-semibold text-[var(--foreground)]">Documentation</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const newDoc: DocPage = {
                id: `doc-${Date.now()}`,
                title: "Untitled Page",
                category: "Field Notes",
                updatedAt: "Just now",
                content: "# Untitled Page\n\nStart writing notes or agent specifications...",
              };
              setPages([newDoc, ...pages]);
              setSelectedPageId(newDoc.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)]"
          >
            <Plus className="size-3" />
          </button>
        </div>

        {/* List of Pages */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`flex w-full flex-col gap-1 rounded-lg p-2.5 text-left text-xs transition-colors ${
                selectedPageId === page.id
                  ? "bg-[var(--surface-secondary)] text-[var(--foreground)] border border-[var(--border-strong)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="font-medium text-[var(--foreground)] flex items-center justify-between">
                <span className="truncate">{page.title}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--subtle-foreground)]">
                <span>{page.category}</span>
                <span>{page.updatedAt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Page Content Editor / Viewer */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--surface-primary)]">
        {activeDoc ? (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-claude)]">
                  {activeDoc.category}
                </span>
                <h1 className="text-xl font-bold text-[var(--foreground)] mt-1">{activeDoc.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--subtle-foreground)]">Updated {activeDoc.updatedAt}</span>
              </div>
            </div>

            {/* Markdown rendering area */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-sidebar)] p-6 font-mono text-xs leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
              {activeDoc.content}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--subtle-foreground)]">
            Select a document to read
          </div>
        )}
      </div>
    </div>
  );
}
