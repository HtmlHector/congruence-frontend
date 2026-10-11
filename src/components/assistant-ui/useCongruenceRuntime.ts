"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useLocalRuntime } from "@assistant-ui/react";
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/core";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  playCompletionChime,
  playInputNeededChime,
  sendDesktopNotification,
} from "@/lib/notifications";

type ChatModelAdapter = Parameters<typeof useLocalRuntime>[0];

interface UseCongruenceRuntimeOptions {
  chatId: string;
  harness: string;
  model?: string;
  projectId?: string;
  laneId?: string;
  branch?: string;
}

class AsyncQueue<T> {
  private queue: T[] = [];
  private resolvers: ((value: IteratorResult<T>) => void)[] = [];
  private closed = false;

  push(value: T) {
    if (this.closed) return;
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;
      resolve({ value, done: false });
    } else {
      this.queue.push(value);
    }
  }

  close() {
    this.closed = true;
    while (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;
      resolve({ value: undefined as any, done: true });
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, void> {
    while (true) {
      if (this.queue.length > 0) {
        yield this.queue.shift()!;
      } else if (this.closed) {
        return;
      } else {
        const next = await new Promise<IteratorResult<T>>((resolve) => {
          this.resolvers.push(resolve);
        });
        if (next.done) return;
        yield next.value;
      }
    }
  }
}

export function useCongruenceRuntime({
  chatId,
  harness,
  model,
  projectId,
  laneId,
  branch = "main",
}: UseCongruenceRuntimeOptions) {
  const [initialMessages, setInitialMessages] = useState<any[] | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load existing chat history from Congruence API
  useEffect(() => {
    if (!projectId || !chatId) {
      setIsLoaded(true);
      return;
    }

    let active = true;
    api
      .getProjectChats(projectId)
      .then((chats) => {
        if (!active) return;
        const matchingChat = chats.find((c) => c.id === chatId);
        if (matchingChat && Array.isArray(matchingChat.messages) && matchingChat.messages.length > 0) {
          const converted = matchingChat.messages.map((m: any, index: number) => ({
            id: m.id || `msg_${index}`,
            role: m.role || "user",
            content: typeof m.content === "string" ? m.content : JSON.stringify(m.content || ""),
            createdAt: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
          setInitialMessages(converted);
        }
        setIsLoaded(true);
      })
      .catch(() => {
        if (active) setIsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [projectId, chatId]);

  const latestStateRef = useRef({ harness, model, projectId, laneId, branch, chatId });
  latestStateRef.current = { harness, model, projectId, laneId, branch, chatId };

  const adapter: ChatModelAdapter = useMemo(() => {
    return {
      async *run({ messages, abortSignal }) {
        const { harness: curHarness, model: curModel, projectId: curProj, laneId: curLane, branch: curBranch, chatId: curChatId } =
          latestStateRef.current;

        // Get user prompt text from last message
        const lastMsg = messages[messages.length - 1];
        let promptText = "";
        if (lastMsg) {
          if (typeof (lastMsg as any).content === "string") {
            promptText = (lastMsg as any).content;
          } else if (Array.isArray((lastMsg as any).content)) {
            const textParts = (lastMsg as any).content
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text);
            const fileParts = (lastMsg as any).content
              .filter((p: any) => p.type === "file" || p.type === "image")
              .map((p: any) => `[Attachment: ${p.filename || p.name || p.type}]`);
            promptText = [...textParts, ...fileParts].join("\n");
          }

          if (Array.isArray((lastMsg as any).attachments) && (lastMsg as any).attachments.length > 0) {
            const attachNotes = (lastMsg as any).attachments.map((a: any) => {
              if (a.type === "image") return `[Image Attached: ${a.name || "screenshot"}]`;
              if (a.content) return `[File: ${a.name}]\n${a.content}`;
              return `[Attachment: ${a.name}]`;
            });
            promptText += "\n\n" + attachNotes.join("\n\n");
          }
        }

        if (!promptText.trim()) return;

        const queue = new AsyncQueue<any>();
        let accumulatedText = "";
        let accumulatedThinking = "";
        const toolCallsMap = new Map<
          string,
          {
            toolCallId: string;
            toolName: string;
            args: any;
            argsText: string;
            result?: any;
            isPreliminary?: boolean;
            isError?: boolean;
          }
        >();

        const buildContentParts = () => {
          const parts: any[] = [];
          if (accumulatedThinking) {
            parts.push({
              type: "reasoning",
              text: accumulatedThinking,
            });
          }
          for (const t of toolCallsMap.values()) {
            parts.push({
              type: "tool-call",
              toolCallId: t.toolCallId,
              toolName: t.toolName,
              args: t.args,
              argsText: t.argsText,
              result: t.result,
              isPreliminary: t.isPreliminary,
              isError: t.isError,
            });
          }
          if (accumulatedText) {
            parts.push({
              type: "text",
              text: accumulatedText,
            });
          }
          return parts;
        };

        const startTime = Date.now();

        // Launch backend stream in background
        api
          .streamAgentChat(
            {
              prompt: promptText,
              harness: curHarness || "Claude",
              model: curModel,
              project_id: curProj,
              lane_id: curLane,
              branch: curBranch,
              chat_id: curChatId,
              signal: abortSignal,
            },
            (event) => {
              if (abortSignal.aborted) return;

              if (event.type === "thinking" && event.text) {
                accumulatedThinking += event.text;
                queue.push({ content: buildContentParts() });
              } else if (event.type === "tool_start") {
                const toolCallId = event.tool_id || `tc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                const key = event.tool_id || event.tool;
                const argsObj = event.args || (typeof event.params === "object" ? event.params : { params: event.params });
                toolCallsMap.set(key, {
                  toolCallId,
                  toolName: event.tool,
                  args: argsObj,
                  argsText: typeof event.params === "string" ? event.params : JSON.stringify(argsObj || {}),
                  isPreliminary: event.status !== "complete",
                });
                queue.push({ content: buildContentParts() });
              } else if (event.type === "tool_done") {
                const key = event.tool_id && toolCallsMap.has(event.tool_id) ? event.tool_id : event.tool;
                const existing = toolCallsMap.get(key) || Array.from(toolCallsMap.values()).pop();
                if (existing) {
                  existing.result = event.output ?? "Success";
                  existing.isPreliminary = false;
                }
                queue.push({ content: buildContentParts() });
              } else if (event.type === "question" && event.question) {
                playInputNeededChime();
                sendDesktopNotification("Congruence: Question from Agent", event.question);

                let questionDisplay = `\n\n> **Agent Question:** ${event.question}`;
                if (Array.isArray(event.options) && event.options.length > 0) {
                  questionDisplay += "\n\n" + event.options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join("\n");
                }
                accumulatedText += questionDisplay;
                queue.push({ content: buildContentParts() });
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
                queue.push({ content: buildContentParts() });
              } else if (event.type === "error" && event.message) {
                accumulatedText += `\n\n[Agent Error: ${event.message}]`;
                queue.push({ content: buildContentParts() });
              } else if (event.type === "done" || event.type === "metrics") {
                playCompletionChime();
                sendDesktopNotification("Congruence Task Completed", `${curHarness} finished response on branch ${curBranch}`);
              }
            }
          )
          .then(() => {
            queue.close();
            // Persist to backend if project exists
            if (curProj && curChatId) {
              const allMsgs = [
                ...messages.map((m: any) => ({
                  id: m.id,
                  role: m.role,
                  content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
                })),
                {
                  id: `asst_${Date.now()}`,
                  role: "assistant",
                  content: accumulatedText,
                },
              ];
              api.saveProjectChat(curProj, {
                id: curChatId,
                lane_id: curLane || "default",
                title: `${curHarness} Session`,
                harness: curHarness,
                model: curModel,
                messages: allMsgs,
              }).catch(() => {});
            }
          })
          .catch((err: any) => {
            if (!abortSignal.aborted) {
              const errMsg = err?.message || "Failed to stream response from agent runner.";
              accumulatedText += `\n\n[Runner Error: ${errMsg}]`;
              queue.push({ content: buildContentParts() });
            }
            queue.close();
          });

        abortSignal.addEventListener("abort", () => {
          queue.close();
        });

        for await (const update of queue) {
          yield update;
        }
      },
    };
  }, []);
  const attachmentAdapter = useMemo(
    () =>
      new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    []
  );

  const runtime = useLocalRuntime(adapter, {
    initialMessages,
    adapters: {
      attachments: attachmentAdapter,
    },
  });

  return { runtime, isLoaded };
}
