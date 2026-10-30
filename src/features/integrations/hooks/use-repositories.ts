"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";

import { fetchRepositories } from "../api/integrations";
import type { RepositoryProvider } from "../types";

export const repositoryKeys = {
  list: (provider: RepositoryProvider, workspaceId?: string) =>
    ["integrations", "repositories", provider, workspaceId ?? null] as const,
};

/**
 * Repositories the workspace's provider connection can reach. The list is
 * cached per provider, so reopening the new-project dialog is instant.
 */
export function useRepositoriesQuery(
  provider: RepositoryProvider,
  workspaceId?: string,
) {
  const { isSignedIn } = useAuthContext();

  const query = useQuery({
    queryKey: repositoryKeys.list(provider, workspaceId),
    queryFn: () => fetchRepositories(provider, workspaceId),
    enabled: isSignedIn === true,
    staleTime: 60_000,
  });

  // A disabled query is pending forever, so surface the auth state for the
  // signed-out message instead of an endless loading row.
  return { ...query, isSignedIn };
}
