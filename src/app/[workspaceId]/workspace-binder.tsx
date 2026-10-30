"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useWorkspaceQuery } from "@/features/workspace/hooks/use-workspace-query";
import { setWorkspaceId } from "@/lib/api";
import { useAuthContext } from "@/providers/auth-provider";

function statusOf(error: unknown): number | null {
  if (error && typeof error === "object") {
    const response = (error as { response?: { status?: number } }).response;
    if (typeof response?.status === "number") return response.status;

    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return null;
}

export function WorkspaceBinder({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const { isSignedIn, lastWorkspaceId } = useAuthContext();
  const { error } = useWorkspaceQuery(workspaceId);

  useEffect(() => {
    setWorkspaceId(workspaceId);
    return () => {
      setWorkspaceId(null);
    };
  }, [workspaceId]);

  // A bookmarked or cached URL can outlive its workspace (deleted, or from a
  // previous Clerk instance). Recover instead of leaving the shell in 404 loops.
  useEffect(() => {
    if (isSignedIn !== true || statusOf(error) !== 404) return;

    const fallback =
      lastWorkspaceId && lastWorkspaceId !== workspaceId ? `/${lastWorkspaceId}` : "/";
    router.replace(fallback);
  }, [error, isSignedIn, lastWorkspaceId, router, workspaceId]);

  return null;
}
