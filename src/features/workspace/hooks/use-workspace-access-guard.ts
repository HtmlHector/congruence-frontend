"use client";

import { useWorkspaceQuery } from "./use-workspace-query";
import { ForbiddenError, ApiError } from "@/services/api/errors";

interface UseWorkspaceAccessGuardResult {
  /** The workspace data, if access is granted. */
  workspace: ReturnType<typeof useWorkspaceQuery>["data"];
  /** True while the membership check is in-flight. */
  isLoading: boolean;
  /** True if the user isn't a member of a workspace that does exist (403). */
  isForbidden: boolean;
  /** True if the workspace itself doesn't exist / was soft-deleted (404). */
  isWorkspaceMissing: boolean;
  /** True if an unexpected error occurred (network, server 5xx, etc.). */
  isError: boolean;
  /** The raw error, if any, for callers that want to distinguish. */
  error: Error | null;
  /** Refetch the membership check. */
  refetch: () => void;
}

/**
 * Checks whether the current user has access to a workspace.
 *
 * Wraps `useWorkspaceQuery` and classifies the result into:
 * - `isForbidden` — 403 ForbiddenError (a real workspace, but not a member).
 *   Renders a 404 rather than a 403 so a non-member can't tell the workspace
 *   exists from the response alone.
 * - `isWorkspaceMissing` — 404 ApiError (workspace doesn't exist / was
 *   soft-deleted). Distinct from `isForbidden` so the caller can recover by
 *   sending the user to onboarding instead of a dead end.
 * - `isLoading` — query still in-flight
 * - `isError` — unexpected error (network, 5xx, etc.)
 *
 * The calling component is responsible for rendering the appropriate UI
 * (e.g. 404 page, redirect, error state, or the children).
 */
export function useWorkspaceAccessGuard(
  workspaceId: string,
): UseWorkspaceAccessGuardResult {
  const { data, isLoading, error, refetch } = useWorkspaceQuery(workspaceId);

  const isForbidden = !isLoading && error instanceof ForbiddenError;

  const isWorkspaceMissing =
    !isLoading && error instanceof ApiError && error.status === 404;

  const isActualError =
    !isLoading &&
    error !== null &&
    !isForbidden &&
    !isWorkspaceMissing;

  return {
    workspace: data,
    isLoading,
    isForbidden,
    isWorkspaceMissing,
    isError: isActualError,
    error,
    refetch,
  };
}
