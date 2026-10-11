"use client";

import React, { useState } from "react";
import {
  Terminal,
  FileCode,
  FileEdit,
  Globe,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolFallback } from "@/components/assistant-ui/elements/tool-fallback.aui";
import { useWorkspace } from "@/context/WorkspaceContext";

interface ToolPartProps {
  toolCallId: string;
  toolName: string;
  args: any;
  argsText?: string;
  result?: any;
  isPreliminary?: boolean;
  isError?: boolean;
}

export function BashToolUI(props: ToolPartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { executeTerminalCommand, setActiveTab, setMode: setWorkspaceMode } = useWorkspace();

  const command =
    props.args?.CommandLine ||
    props.args?.command ||
    props.args?.cmd ||
    props.argsText ||
    "bash command";

  const isRunning = Boolean(props.isPreliminary);
  const resultText =
    typeof props.result === "string"
      ? props.result
      : props.result
      ? JSON.stringify(props.result, null, 2)
      : "";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunInTerminal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkspaceMode("deck");
    setActiveTab("terminal");
    executeTerminalCommand(command);
  };

  return (
    <div className="my-2 overflow-hidden rounded-md border border-border/70 bg-card text-card-foreground shadow-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-muted/70"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Terminal className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bash
          </span>
          <span className="truncate font-mono text-[11px] text-foreground/90">
            {command}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
              <Loader2 className="size-2.5 animate-spin" />
              Running
            </span>
          ) : props.isError ? (
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
              <AlertCircle className="size-2.5" />
              Failed
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="size-2.5" />
              Done
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-6 text-muted-foreground hover:text-foreground"
            title="Copy command"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          </Button>

          {isOpen ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/50 bg-background/50 p-3 font-mono text-xs">
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Terminal Output</span>
            <Button
              variant="link"
              size="sm"
              onClick={handleRunInTerminal}
              className="h-auto p-0 text-[11px] text-primary"
            >
              Run in interactive terminal &rarr;
            </Button>
          </div>
          <pre className="max-h-60 overflow-x-auto overflow-y-auto rounded-md bg-muted/30 p-2.5 text-[11px] leading-relaxed text-foreground break-words whitespace-pre-wrap">
            {resultText || (isRunning ? "Executing command on host runner..." : "No output returned.")}
          </pre>
        </div>
      )}
    </div>
  );
}

export function FileEditToolUI(props: ToolPartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveTab } = useWorkspace();

  const targetFile =
    props.args?.TargetFile ||
    props.args?.AbsolutePath ||
    props.args?.file ||
    props.args?.path ||
    "file";
  const fileName = targetFile.split("/").pop() || targetFile;

  const isRunning = Boolean(props.isPreliminary);
  const targetContent = props.args?.TargetContent;
  const replacementContent = props.args?.ReplacementContent || props.args?.CodeContent;

  return (
    <div className="my-2 overflow-hidden rounded-md border border-border/70 bg-card text-card-foreground shadow-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-muted/70"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileEdit className="size-3.5 shrink-0 text-amber-500" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Edit
          </span>
          <span className="truncate font-mono text-[11px] font-medium text-foreground">
            {fileName}
          </span>
          <span className="hidden truncate text-[10px] text-muted-foreground sm:inline">
            {targetFile}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
              <Loader2 className="size-2.5 animate-spin" />
              Editing
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="size-2.5" />
              Applied
            </span>
          )}

          {isOpen ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/50 bg-background/50 p-3 font-mono text-xs">
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Inline Diff</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => setActiveTab("changes")}
              className="h-auto p-0 text-[11px] text-primary"
            >
              Open in Changes tab &rarr;
            </Button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto rounded-md bg-muted/30 p-2.5 text-[11px]">
            {targetContent && (
              <div className="rounded border border-red-500/20 bg-red-500/10 p-2 text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">- Removed</span>
                {targetContent}
              </div>
            )}
            {replacementContent && (
              <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap font-mono">
                <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">+ Added</span>
                {replacementContent}
              </div>
            )}
            {!targetContent && !replacementContent && (
              <p className="text-muted-foreground">
                {props.result ? String(props.result) : "File updated successfully."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FileReadToolUI(props: ToolPartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const targetFile =
    props.args?.AbsolutePath ||
    props.args?.TargetFile ||
    props.args?.file ||
    props.args?.path ||
    "file";
  const fileName = targetFile.split("/").pop() || targetFile;
  const isRunning = Boolean(props.isPreliminary);

  return (
    <div className="my-2 overflow-hidden rounded-md border border-border/70 bg-card text-card-foreground shadow-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-muted/70"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileCode className="size-3.5 shrink-0 text-cyan-500" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Read
          </span>
          <span className="truncate font-mono text-[11px] font-medium text-foreground">
            {fileName}
          </span>
          {props.args?.StartLine && (
            <span className="text-[10px] text-muted-foreground">
              L{props.args.StartLine}-{props.args.EndLine || ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <Loader2 className="size-3 animate-spin text-blue-500" />
          ) : (
            <Check className="size-3 text-emerald-500" />
          )}
          {isOpen ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && props.result && (
        <div className="border-t border-border/50 bg-background/50 p-3 font-mono text-xs">
          <pre className="max-h-60 overflow-x-auto overflow-y-auto rounded-md bg-muted/30 p-2.5 text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
            {typeof props.result === "string" ? props.result : JSON.stringify(props.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function WebSearchToolUI(props: ToolPartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const query = props.args?.query || props.args?.q || props.argsText || "search query";
  const isRunning = Boolean(props.isPreliminary);

  return (
    <div className="my-2 overflow-hidden rounded-md border border-border/70 bg-card text-card-foreground shadow-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-muted/70"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Globe className="size-3.5 shrink-0 text-indigo-500" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Search
          </span>
          <span className="truncate text-[11px] italic text-foreground">
            "{query}"
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <Loader2 className="size-3 animate-spin text-blue-500" />
          ) : (
            <Check className="size-3 text-emerald-500" />
          )}
          {isOpen ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && props.result && (
        <div className="border-t border-border/50 bg-background/50 p-3 text-xs leading-relaxed">
          <pre className="max-h-60 overflow-y-auto rounded-md bg-muted/30 p-2.5 text-[11px] text-foreground whitespace-pre-wrap">
            {typeof props.result === "string" ? props.result : JSON.stringify(props.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function CustomToolDispatcher(props: any) {
  const name = props.toolName?.toLowerCase() || "";

  if (name.includes("command") || name.includes("bash") || name.includes("terminal") || name.includes("exec")) {
    return <BashToolUI {...props} />;
  }

  if (name.includes("replace") || name.includes("write") || name.includes("edit")) {
    return <FileEditToolUI {...props} />;
  }

  if (name.includes("view") || name.includes("read")) {
    return <FileReadToolUI {...props} />;
  }

  if (name.includes("search") || name.includes("web") || name.includes("google")) {
    return <WebSearchToolUI {...props} />;
  }

  return <ToolFallback {...props} />;
}
