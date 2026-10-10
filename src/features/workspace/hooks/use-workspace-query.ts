"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspace, updateWorkspace, deleteWorkspace } from "@/features/workspace/api/get-workspaces";
import type { Workspace } from "@/features/workspace/types";
import type { UpdateWorkspaceInput } from "@/features/workspace/api/get-workspaces";

export const workspaceKeys = {
  detail: (id: string) => ["workspace", id] as const,
};

/**
 * Fetches a single workspace by ID from GET /api/v1/workspaces/:id.
 *
 * Gated on isSignedIn === true (same as AuthProvider's /auth/me query) —
 * workspaceId comes from the URL and is available on the very first render,
 * before Clerk finishes loading and before QueryProvider has had a chance
 * to call configureApiClient(). Without this gate the request fires with
 * no Authorization header and 401s.
 */
export function useWorkspaceQuery(workspaceId: string): {
  data: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { isSignedIn } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => getWorkspace(workspaceId),
    enabled: !!workspaceId && isSignedIn === true,
    staleTime: 1000 * 60 * 2, // 2 min
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Updates a workspace (currently just `name`) via PATCH /api/v1/workspaces/:id.
 */
export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) => updateWorkspace(workspaceId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(workspaceKeys.detail(workspaceId), updated);
      queryClient.invalidateQueries({ queryKey: ["workspaces", "list"] });
    },
  });
}

/**
 * Deletes a workspace via DELETE /api/v1/workspaces/:id.
 */
export function useDeleteWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: ["workspaces", "list"] });
    },
  });
}
