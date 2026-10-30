"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthContext } from "@/providers/auth-provider";
import {
  closeTerminal,
  createProject,
  createTerminal,
  createWorktree,
  deleteWorktree,
  devboxAction,
  ensurePrimaryWorktree,
  getCredentials,
  getDevbox,
  getProject,
  getProjects,
  getTerminals,
  getUsage,
  getWorktrees,
  revokeCredential,
  storeApiKey,
} from "../api/congruence-api";
import { describeError } from "../lib/describe-error";
import { ensureInitialWorktree } from "../lib/ensure-initial-worktree";
import type {
  CreateProjectInput,
  CreateTerminalInput,
  CreateWorktreeInput,
  Project,
  Worktree,
} from "../types";

export const projectKeys = {
  all: ["congruence"] as const,
  lists: () => [...projectKeys.all, "projects"] as const,
  list: (workspaceId?: string) =>
    workspaceId
      ? ([...projectKeys.all, "projects", workspaceId] as const)
      : ([...projectKeys.all, "projects"] as const),
  detail: (projectId: string) => [...projectKeys.all, "project", projectId] as const,
  box: (projectId: string) => [...projectKeys.all, "box", projectId] as const,
  worktrees: (projectId: string) => [...projectKeys.all, "worktrees", projectId] as const,
  terminals: (worktreeId: string) => [...projectKeys.all, "terminals", worktreeId] as const,
  credentials: () => [...projectKeys.all, "credentials"] as const,
  usage: () => [...projectKeys.all, "usage"] as const,
};

export function useProjectsQuery(workspaceId?: string) {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: () => getProjects(workspaceId),
    enabled: isSignedIn === true,
    staleTime: 15_000,
  });
}

export function useProjectQuery(projectId: string) {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: isSignedIn === true && !!projectId,
    staleTime: 15_000,
  });
}

export function useDevboxQuery(projectId: string) {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.box(projectId),
    queryFn: () => getDevbox(projectId),
    enabled: isSignedIn === true && !!projectId,
    staleTime: 5_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "waking" || status === "provisioning" || status === "pausing"
        ? 3_000
        : false;
    },
  });
}

export function useWorktreesQuery(projectId: string) {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.worktrees(projectId),
    queryFn: () => getWorktrees(projectId),
    enabled: isSignedIn === true && !!projectId,
    staleTime: 10_000,
  });
}

export function useTerminalsQuery(worktreeId: string | null) {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.terminals(worktreeId ?? "none"),
    queryFn: () => getTerminals(worktreeId as string),
    enabled: isSignedIn === true && !!worktreeId,
    staleTime: 5_000,
  });
}

export function useCredentialsQuery() {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.credentials(),
    queryFn: getCredentials,
    enabled: isSignedIn === true,
    staleTime: 30_000,
  });
}

export function useUsageQuery() {
  const { isSignedIn } = useAuthContext();

  return useQuery({
    queryKey: projectKeys.usage(),
    queryFn: getUsage,
    enabled: isSignedIn === true,
    staleTime: 60_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      toast.success(`Project "${project.name}" created`);
      void ensureInitialWorktree(project).finally(() => {
        queryClient.invalidateQueries({ queryKey: projectKeys.worktrees(project.id) });
      });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCreateWorktree(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorktreeInput) => createWorktree(projectId, input),
    onSuccess: (worktree) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.worktrees(projectId) });
      toast.success(`Worktree "${worktree.title}" ready`);
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useDeleteWorktree(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (worktreeId: string) => deleteWorktree(worktreeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.worktrees(projectId) });
      toast.success("Worktree deleted");
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useDevboxAction(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: "pause" | "resume" | "reset") => devboxAction(projectId, action),
    onSuccess: (box) => {
      queryClient.setQueryData(projectKeys.box(projectId), box);
      queryClient.invalidateQueries({ queryKey: projectKeys.box(projectId) });
      const label =
        box.status === "paused" ? "Devbox paused" : box.status === "awake" ? "Devbox awake" : `Devbox ${box.status}`;
      toast.success(label);
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCreateTerminal(worktreeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTerminalInput) => createTerminal(worktreeId as string, input),
    onSuccess: () => {
      if (worktreeId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.terminals(worktreeId) });
      }
      toast.success("Terminal opened");
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCloseTerminal(worktreeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (terminalId: string) => closeTerminal(terminalId),
    onSuccess: () => {
      if (worktreeId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.terminals(worktreeId) });
      }
      toast.success("Terminal closed");
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useStoreApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.credentials() });
      toast.success("Credential saved");
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useRevokeCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: string) => revokeCredential(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.credentials() });
      toast.success("Credential revoked");
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export interface ProjectTreeEntry {
  project: Project;
  worktrees: Worktree[];
}

/**
 * Projects plus their worktrees for the sidebar. Worktrees are fetched per
 * project (the API is project-scoped) and cached under the same keys the
 * project page uses, so opening a project is instant.
 */
export function useProjectTreeQuery(workspaceId: string) {
  const { isSignedIn, isLoading: isAuthLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const projects = useProjectsQuery(workspaceId);
  const list = projects.data ?? [];

  const worktreeQueries = useQueries({
    queries: list.map((project) => ({
      queryKey: projectKeys.worktrees(project.id),
      queryFn: () => getWorktrees(project.id),
      enabled: isSignedIn === true,
      staleTime: 10_000,
    })),
  });

  const entries: ProjectTreeEntry[] = list.map((project, index) => ({
    project,
    worktrees: worktreeQueries[index]?.data ?? [],
  }));

  // A project can predate the backend that records its primary checkout (or have
  // had provisioning interrupted), which would render it as a bare name in the
  // sidebar. Ask the backend once per session to provision the missing checkout.
  const missingKey = entries
    .filter((entry, index) => {
      const query = worktreeQueries[index];
      return (
        entry.project.repositoryId !== null &&
        query?.isFetched === true &&
        entry.worktrees.length === 0
      );
    })
    .map((entry) => entry.project.id)
    .join(",");
  const attempted = useRef(new Set<string>());

  useEffect(() => {
    if (!isSignedIn) return;
    for (const projectId of missingKey ? missingKey.split(",") : []) {
      if (attempted.current.has(projectId)) continue;
      attempted.current.add(projectId);
      void ensurePrimaryWorktree(projectId)
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: projectKeys.worktrees(projectId),
          }),
        )
        .catch(() => {
          // Rendering the sidebar must not depend on provisioning succeeding.
        });
    }
  }, [isSignedIn, missingKey, queryClient]);

  return {
    entries,
    isSignedIn,
    isAuthLoading,
    isLoading: projects.isLoading,
    isError: projects.isError,
    refetch: projects.refetch,
  };
}

/** Tracks the selected worktree and falls back to the first live one. */
export function useSelectedWorktree(
  worktreeIds: string[],
  initialId: string | null = null,
) {
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  const selected = selectedId && worktreeIds.includes(selectedId) ? selectedId : null;
  const fallback = selected ?? worktreeIds[0] ?? null;

  return { selectedId: fallback, setSelectedId };
}
