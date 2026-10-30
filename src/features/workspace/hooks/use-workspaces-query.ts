"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/auth-provider";
import { getWorkspaces, createWorkspace, type WorkspaceListItem } from "../api/get-workspaces";
import type { CreateWorkspaceInput, Workspace } from "../types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-message";

// ── Query keys ───────────────────────────────────────────

export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
};

// ── List workspaces ──────────────────────────────────────

/**
 * Gated on isSignedIn === true (see use-workspace-query.ts for why) —
 * without it this fires on mount before configureApiClient() has run
 * and 401s.
 */
export function useWorkspacesQuery(): {
  data: WorkspaceListItem[];
  isLoading: boolean;
  error: Error | null;
} {
  const { isSignedIn } = useAuthContext();

  const { data = [], isLoading, error } = useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: getWorkspaces,
    enabled: isSignedIn === true,
    staleTime: 1000 * 30, // 30 seconds — keeps the list fresh after workspace creation
    refetchOnWindowFocus: true,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
  };
}

// ── Create workspace ─────────────────────────────────────

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => createWorkspace(input),
    onSuccess: (created: Workspace) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      toast.success(`Workspace "${created.name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
