"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Save,
  Copy,
  Check,
  FileCode2,
  FileText,
  FileJson,
  FileImage,
  File,
  RotateCcw,
  Loader2,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/context/WorkspaceContext";
import { RichMarkdown } from "./RichMarkdown";

interface FileEditorPaneProps {
  filePath: string;
}

type ViewMode = "edit" | "preview" | "split";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp", "tiff", "avif"]);
const BINARY_EXTENSIONS = new Set([
  "pdf", "zip", "tar", "gz", "bz2", "xz", "7z", "rar",
  "mp3", "mp4", "wav", "ogg", "flac", "mov", "avi", "mkv", "webm",
  "woff", "woff2", "ttf", "otf", "eot",
  "exe", "dll", "so", "dylib", "bin", "class", "pyc",
  "db", "sqlite", "parquet",
]);

function getFileExtension(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

export function FileEditorPane({ filePath }: FileEditorPaneProps) {
  const { projectId, activeLane } = useWorkspace();
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileExt, setFileExt] = useState<string>("");
  const [isReadOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  // Image preview URL (base64 data URI)
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const detectedExt = getFileExtension(filePath);
  const isImageFile = IMAGE_EXTENSIONS.has(detectedExt);
  const isBinaryFile = !isImageFile && BINARY_EXTENSIONS.has(detectedExt);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const isMarkdown = useMemo(() => {
    const ext = fileExt.toLowerCase() || filePath.split(".").pop()?.toLowerCase() || "";
    return ext === "md" || ext === "markdown" || filePath.toLowerCase().endsWith(".md") || filePath.toLowerCase().endsWith(".markdown");
  }, [fileExt, filePath]);


  // Load File Content
  const loadFile = async () => {
    setIsLoading(true);
    setImageSrc(null);
    try {
      // Binary files — don't attempt to fetch as text
      if (isBinaryFile) {
        setContent("");
        setOriginalContent("");
        setFileExt(detectedExt);
        setViewMode("edit");
        setIsLoading(false);
        return;
      }

      const q = new URLSearchParams({ path: filePath });
      if (projectId) q.set("projectId", projectId);
      if (activeLane?.id) q.set("laneId", activeLane.id);

      if (isImageFile) {
        // Request base64 for images
        q.set("encoding", "base64");
        const res = await fetch(`/api/files?${q.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const mimeMap: Record<string, string> = {
            png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
            gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
            ico: "image/x-icon", bmp: "image/bmp", tiff: "image/tiff", avif: "image/avif",
          };
          const mime = mimeMap[detectedExt] ?? "image/png";
          setImageSrc(`data:${mime};base64,${data.content}`);
          setFileSize(data.size ?? 0);
          setFileExt(detectedExt);
        } else {
          toast.error(`Could not load image: ${filePath}`);
        }
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/files?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const loadedContent = data.content || "";
        setContent(loadedContent);
        setOriginalContent(loadedContent);
        setFileSize(data.size || 0);
        const ext = data.extension || filePath.split(".").pop() || "";
        setFileExt(ext);
        
        // If markdown, default to preview
        if (ext.toLowerCase() === "md" || ext.toLowerCase() === "markdown") {
          setViewMode("preview");
        } else {
          setViewMode("edit");
        }
      } else {
        toast.error(`Could not read file: ${filePath}`);
      }
    } catch {
      toast.error(`Failed to load ${filePath}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    loadFile();
  }, [filePath, projectId, activeLane?.id]);

  // Synchronize gutter scrolling with textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Cursor position tracking
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart || 0;
    const textBeforeCursor = content.substring(0, pos);
    const linesBefore = textBeforeCursor.split("\n");
    setCursorPos({
      line: linesBefore.length,
      col: linesBefore[linesBefore.length - 1].length + 1,
    });
  };

  // Handle Tab key in textarea
  const handleKeyDownInEditor = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      setContent(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          updateCursorPosition();
        }
      }, 0);
    }
  };

  // Handle Save (POST /api/files)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          type: "file",
          content,
          projectId,
          laneId: activeLane?.id,
        }),
      });
      if (res.ok) {
        setOriginalContent(content);
        setFileSize(new Blob([content]).size);
        toast.success(`Saved changes to ${filePath.split("/").pop()}`);
      } else {
        toast.error(`Failed to save ${filePath}`);
      }
    } catch {
      toast.error(`Error saving ${filePath}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Global keyboard shortcuts (⌘S to save, ⌘Shift+P to toggle preview)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (isMarkdown) {
          setViewMode((prev) => (prev === "preview" ? "edit" : prev === "edit" ? "split" : "preview"));
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [content, filePath, isMarkdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    toast.success("Copied file contents to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRevert = () => {
    setContent(originalContent);
    toast.info("Reverted uncommitted changes");
  };

  const isDirty = content !== originalContent;
  const lines = content.split("\n");
  const fileName = filePath.split("/").pop() || filePath;
  const pathParts = filePath.split("/");

  const renderFileIcon = () => {
    switch (fileExt.toLowerCase()) {
      case "tsx":
      case "jsx":
      case "ts":
      case "js":
        return <FileCode2 className="size-4 text-cyan-600 dark:text-cyan-400" />;
      case "json":
        return <FileJson className="size-4 text-emerald-600 dark:text-emerald-400" />;
      case "md":
      case "markdown":
        return <FileText className="size-4 text-purple-600 dark:text-purple-400" />;
      case "svg":
      case "png":
      case "jpg":
        return <FileImage className="size-4 text-pink-600 dark:text-pink-400" />;
      default:
        return <File className="size-4 text-zinc-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-[#0A0A0C] text-zinc-400 font-mono text-xs gap-2 select-none">
        <Loader2 className="size-4 animate-spin text-zinc-500" />
        <span>Reading {fileName}...</span>
      </div>
    );
  }

  // ── Image Viewer ──────────────────────────────────────────────────────────
  if (isImageFile) {
    return (
      <div className="flex flex-1 flex-col h-full w-full bg-white dark:bg-[#0A0A0C] overflow-hidden">
        {/* Toolbar */}
        <div className="h-9 px-3 border-b border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileImage className="size-4 text-pink-600 dark:text-pink-400" />
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{filePath}</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 rounded-[3.5px]">
              IMAGE
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">{(fileSize / 1024).toFixed(1)} KB · {detectedExt.toUpperCase()}</span>
        </div>
        {/* Preview */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-6 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={fileName}
              className="max-w-full max-h-full object-contain shadow-lg border border-zinc-200/60 dark:border-zinc-700/60"
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-400 dark:text-zinc-600 select-none">
              <FileImage className="size-10 opacity-40" />
              <span className="text-xs font-mono">Failed to load image preview</span>
            </div>
          )}
        </div>
        {/* Status Bar */}
        <div className="h-6 px-3 border-t border-zinc-200 dark:border-[#222227] bg-[#F4F4F6] dark:bg-[#0E0E12] flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-[3.5px] bg-emerald-500" />
            <span>Image Preview</span>
          </span>
          <span>{detectedExt.toUpperCase()} · {(fileSize / 1024).toFixed(1)} KB · Read-only</span>
        </div>
      </div>
    );
  }

  // ── Binary File Placeholder ───────────────────────────────────────────────
  if (isBinaryFile) {
    return (
      <div className="flex flex-1 flex-col h-full w-full bg-white dark:bg-[#0A0A0C] overflow-hidden">
        {/* Toolbar */}
        <div className="h-9 px-3 border-b border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <File className="size-4 text-zinc-500" />
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{filePath}</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 rounded-[3.5px]">
              BINARY
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">{detectedExt.toUpperCase()}</span>
        </div>
        {/* Body */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-zinc-400 dark:text-zinc-600 select-none">
          <File className="size-12 opacity-30" />
          <div className="text-center font-mono text-xs space-y-1">
            <p className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">{fileName}</p>
            <p className="text-zinc-500 dark:text-zinc-500">Binary file — cannot display in editor</p>
            <p className="text-zinc-400 dark:text-zinc-600 text-[11px]">Type: {detectedExt.toUpperCase()}</p>
          </div>
        </div>
        {/* Status Bar */}
        <div className="h-6 px-3 border-t border-zinc-200 dark:border-[#222227] bg-[#F4F4F6] dark:bg-[#0E0E12] flex items-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-[3.5px] bg-zinc-400" />
            <span>Binary · Read-only</span>
          </span>
        </div>
      </div>
    );
  }

  return (

    <div className="flex flex-1 flex-col h-full w-full bg-white dark:bg-[#0A0A0C] text-zinc-900 dark:text-zinc-100 font-mono overflow-hidden select-none">
      {/* File Action & Info Toolbar */}
      <div className="h-9 px-3 border-b border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12] flex items-center justify-between text-xs shrink-0">
        {/* Breadcrumb Path & Badges */}
        <div className="flex items-center gap-1.5 min-w-0">
          {renderFileIcon()}
          <div className="flex items-center gap-1 text-[11px] font-mono truncate">
            {pathParts.map((part, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-zinc-400 dark:text-zinc-600">/</span>}
                <span
                  className={
                    idx === pathParts.length - 1
                      ? "text-zinc-950 dark:text-white font-semibold"
                      : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  {part}
                </span>
              </React.Fragment>
            ))}
          </div>

          {isDirty && (
            <span
              className="size-2 rounded-full bg-amber-500 shrink-0 ml-1 shadow-xs"
              title="Unsaved changes"
            />
          )}

          {isMarkdown && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-[3.5px]">
              GFM
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher for Markdown & Text files */}
          {isMarkdown && (
            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/90 p-0.5 rounded-[3.5px] mr-1">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer rounded-[3.5px] ${
                  viewMode === "preview"
                    ? "bg-white dark:bg-[#1A1A22] text-zinc-950 dark:text-white shadow-2xs font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Rich rendered Markdown preview"
              >
                <Eye className="size-3" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer rounded-[3.5px] ${
                  viewMode === "edit"
                    ? "bg-white dark:bg-[#1A1A22] text-zinc-950 dark:text-white shadow-2xs font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Raw source code editor"
              >
                <Edit3 className="size-3" />
                <span>Raw</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer rounded-[3.5px] ${
                  viewMode === "split"
                    ? "bg-white dark:bg-[#1A1A22] text-zinc-950 dark:text-white shadow-2xs font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Split side-by-side (Editor & Preview)"
              >
                <Columns className="size-3" />
                <span>Split</span>
              </button>
            </div>
          )}

          <span className="text-[10px] text-zinc-400 hidden sm:inline">
            {lines.length} lines · {(fileSize / 1024).toFixed(1)} KB · UTF-8
          </span>

          <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

          {isDirty && (
            <button
              type="button"
              onClick={handleRevert}
              className="flex items-center gap-1 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors rounded-[3.5px] cursor-pointer"
              title="Revert changes"
            >
              <RotateCcw className="size-3" />
              <span className="hidden md:inline">Revert</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors rounded-[3.5px] cursor-pointer"
            title="Copy code"
          >
            {isCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span className="hidden md:inline">Copy</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase transition-all rounded-[3.5px] cursor-pointer ${
              isDirty
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            }`}
            title="Save file (⌘S)"
          >
            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on viewMode */}
      <div className="flex flex-1 overflow-hidden relative min-h-0 bg-white dark:bg-[#0A0A0C]">
        {/* Mode: EDIT / RAW */}
        {viewMode === "edit" && (
          <div className="flex flex-1 w-full h-full overflow-hidden">
            {/* Line Numbers Gutter */}
            <div
              ref={gutterRef}
              className="w-12 shrink-0 py-3 bg-[#F8F9FA] dark:bg-[#0A0A0C] border-r border-zinc-200 dark:border-[#1E1E24] text-[11px] font-mono text-zinc-400 dark:text-zinc-600 text-right pr-3 select-none overflow-hidden"
            >
              {lines.map((_, i) => (
                <div key={i} className="leading-6 h-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Textarea Code Buffer */}
            <div className="flex-1 relative overflow-auto">
              <textarea
                ref={textareaRef}
                value={content}
                readOnly={isReadOnly}
                onChange={(e) => {
                  setContent(e.target.value);
                  updateCursorPosition();
                }}
                onScroll={handleScroll}
                onClick={updateCursorPosition}
                onKeyUp={updateCursorPosition}
                onKeyDown={handleKeyDownInEditor}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="w-full h-full p-3 bg-transparent text-zinc-900 dark:text-[#E6EDF3] text-[12px] font-mono leading-6 resize-none focus:outline-none focus:ring-0 border-none whitespace-pre tab-4 select-text"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* Mode: PREVIEW */}
        {viewMode === "preview" && (
          <div className="flex-1 w-full h-full overflow-y-auto bg-zinc-50/50 dark:bg-[#070709] p-4 md:p-8 select-text">
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#0E0E12] border border-zinc-200/80 dark:border-[#222227] shadow-xs p-6 md:p-10">
              {/* Document Subheader */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 dark:border-[#222227] text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-zinc-950 dark:text-white">{fileName}</span>
                  <span className="text-zinc-400">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">{lines.length} lines</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer rounded-[3.5px]"
                >
                  <Edit3 className="size-3" />
                  <span>Edit Source</span>
                </button>
              </div>

              {/* Rendered Document */}
              <RichMarkdown content={content} />
            </div>
          </div>
        )}

        {/* Mode: SPLIT (Side-by-Side: Editor on Left, Live Preview on Right) */}
        {viewMode === "split" && (
          <div className="flex flex-1 w-full h-full overflow-hidden">
            {/* Left Pane: Editor */}
            <div className="flex flex-1 h-full overflow-hidden border-r border-zinc-200 dark:border-[#222227]">
              {/* Line Numbers Gutter */}
              <div
                ref={gutterRef}
                className="w-11 shrink-0 py-3 bg-[#F8F9FA] dark:bg-[#0A0A0C] border-r border-zinc-200 dark:border-[#1E1E24] text-[11px] font-mono text-zinc-400 dark:text-zinc-600 text-right pr-2.5 select-none overflow-hidden"
              >
                {lines.map((_, i) => (
                  <div key={i} className="leading-6 h-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea Code Buffer */}
              <div className="flex-1 relative overflow-auto">
                <textarea
                  ref={textareaRef}
                  value={content}
                  readOnly={isReadOnly}
                  onChange={(e) => {
                    setContent(e.target.value);
                    updateCursorPosition();
                  }}
                  onScroll={handleScroll}
                  onClick={updateCursorPosition}
                  onKeyUp={updateCursorPosition}
                  onKeyDown={handleKeyDownInEditor}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="w-full h-full p-3 bg-transparent text-zinc-900 dark:text-[#E6EDF3] text-[12px] font-mono leading-6 resize-none focus:outline-none focus:ring-0 border-none whitespace-pre tab-4 select-text"
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    tabSize: 2,
                  }}
                />
              </div>
            </div>

            {/* Right Pane: Live Rendered Preview */}
            <div className="flex flex-1 flex-col h-full overflow-hidden bg-zinc-50/50 dark:bg-[#070709]">
              <div className="h-6 px-3 bg-zinc-100 dark:bg-[#111116] border-b border-zinc-200 dark:border-[#222227] flex items-center justify-between text-[10px] font-mono text-zinc-400 select-none">
                <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                  <Sparkles className="size-3" />
                  <span>Live Rendered Preview</span>
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">GFM Spec Compliant</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 md:p-6 select-text">
                <div className="max-w-2xl">
                  <RichMarkdown content={content} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Status Bar Footer */}
      <div className="h-6 px-3 border-t border-zinc-200 dark:border-[#222227] bg-[#F4F4F6] dark:bg-[#0E0E12] flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span
              className={`size-1.5 rounded-[3.5px] ${
                isDirty ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span>NVMe File Buffer</span>
          </span>
          <span>·</span>
          <span className={isDirty ? "text-amber-600 dark:text-amber-400 font-semibold" : ""}>
            {isDirty ? "Modified" : "Saved"}
          </span>
          {isMarkdown && (
            <>
              <span>·</span>
              <span className="uppercase text-purple-600 dark:text-purple-400">
                Mode: {viewMode}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>Tab Size: 2</span>
          <span>UTF-8</span>
          <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">
            Write Lease Active
          </span>
        </div>
      </div>
    </div>
  );
}
