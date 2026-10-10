"use client";

import {
  AssistantRuntimeProvider,
  type AssistantRuntime,
} from "@assistant-ui/react";

/**
 * Wrap a future product chat surface with its selected Assistant UI runtime.
 * This starter intentionally does not create a runtime or make AI requests.
 */
export function AssistantUiProvider({
  runtime,
  children,
}: {
  runtime: AssistantRuntime;
  children: React.ReactNode;
}) {
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
