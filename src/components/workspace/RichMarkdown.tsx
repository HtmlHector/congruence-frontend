"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Copy,
  ExternalLink,
  FileCode,
  Terminal,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface RichMarkdownProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function RichMarkdown({
  content,
  isStreaming = false,
  className = "",
}: RichMarkdownProps) {
  const { setActiveTab } = useWorkspace();
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleFileClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const cleanPath = href.replace(/^file:\/\/\/?/, "").split("/.congruence/projects/")[1] || href;
    navigator.clipboard.writeText(cleanPath);
    setActiveTab("changes");
  };

  return (
    <div
      className={`prose dark:prose-invert max-w-none text-xs leading-relaxed font-sans select-text ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-zinc-950 dark:text-white mt-4 mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800/80 font-sans tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[13px] font-bold text-zinc-950 dark:text-zinc-100 mt-4 mb-2 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/40 font-sans tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5 uppercase tracking-wider font-mono">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 mt-2 mb-1 font-mono">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans text-xs">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-950 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-800 dark:text-zinc-300">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 mb-3 space-y-1.5 text-zinc-800 dark:text-zinc-200 text-xs">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5 text-zinc-800 dark:text-zinc-200 text-xs font-mono">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-zinc-400 dark:marker:text-zinc-500 [&:has(>input[type='checkbox'])]:list-none [&:has(>input[type='checkbox'])]:-ml-5">
              {children}
            </li>
          ),
          input: ({ type, checked, disabled }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  readOnly
                  className="size-3.5 mr-2 inline-block accent-purple-600 dark:accent-purple-400 rounded-[3.5px] align-middle cursor-default"
                />
              );
            }
            return <input type={type} />;
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500 dark:border-indigo-400 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1.5 my-3 text-zinc-600 dark:text-zinc-300 italic text-xs rounded-[3.5px]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-zinc-200 dark:border-zinc-800 rounded-[3.5px]">
              <table className="w-full text-left border-collapse text-[11px] font-sans">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-semibold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 leading-normal">{children}</td>
          ),
          hr: () => (
            <hr className="my-3 border-zinc-200 dark:border-zinc-800/80" />
          ),
          a: ({ href, children }) => {
            const isFileLink =
              href?.startsWith("file://") ||
              (href && (href.endsWith(".ts") || href.endsWith(".tsx") || href.endsWith(".js") || href.endsWith(".json") || href.endsWith(".md") || href.endsWith(".py")));
            
            if (isFileLink && href) {
              const fileName = href.split("/").pop() || href;
              return (
                <button
                  type="button"
                  onClick={(e) => handleFileClick(e, href)}
                  title={`Open / inspect file: ${href}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-medium rounded-[3.5px] border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer select-none align-baseline"
                >
                  <FileCode className="size-3 shrink-0" />
                  <span>{children || fileName}</span>
                </button>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <span>{children}</span>
                <ExternalLink className="size-2.5 opacity-70" />
              </a>
            );
          },
          pre: ({ children }) => <>{children}</>,
          code: ({ className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const codeString = String(children).replace(/\n$/, "");
            const isMultiLine = codeString.includes("\n") || Boolean(match);

            if (isMultiLine) {
              const lang = match ? match[1] : "text";
              const codeId = `code_${codeString.slice(0, 16)}_${codeString.length}`;
              const isCopied = copiedCodeId === codeId;

              return (
                <div className="relative my-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] text-zinc-900 dark:text-zinc-100 rounded-[3.5px] overflow-hidden font-mono shadow-xs">
                  {/* Code Header Bar */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 dark:bg-[#18181e] border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 select-none">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                      <Terminal className="size-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{lang}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(codeString, codeId)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-[3.5px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer text-[10px]"
                      title="Copy code to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-2.5 text-zinc-500 dark:text-zinc-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  {/* Code Body */}
                  <div className="p-3.5 overflow-x-auto text-[11px] leading-relaxed font-mono whitespace-pre text-zinc-900 dark:text-zinc-200 scrollbar-thin bg-white dark:bg-[#121216]">
                    <code>{codeString}</code>
                  </div>
                </div>
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 text-[11px] font-mono rounded-[3.5px] bg-zinc-100 dark:bg-[#1C1C22] text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 inline align-baseline"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-zinc-500/70 dark:bg-zinc-400/70 animate-pulse align-middle" />
      )}
    </div>
  );
}
