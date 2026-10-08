"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, GitHubRepoItem, GitHubStatusData } from "@/lib/api";

// Query Keys factory
export const workspaceKeys = {
  all: ["workspace"] as const,
  tenants: () => [...workspaceKeys.all, "tenants"] as const,
  projects: (workspaceId?: string | null) => [...workspaceKeys.all, "projects", workspaceId] as const,
  project: (projectId?: string | null) => [...workspaceKeys.all, "project", projectId] as const,
  files: (projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.project(projectId), "files", laneId] as const,
  fileContent: (filePath: string, projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.files(projectId, laneId), "content", filePath] as const,
  diff: (projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.project(projectId), "diff", laneId] as const,
  chats: (projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.project(projectId), "chats", laneId] as const,
  github: {
    all: ["github"] as const,
    status: () => ["github", "status"] as const,
    repos: () => ["github", "repos"] as const,
  },
};

// 0. Hook to fetch all user workspaces with instant persistence
export function useWorkspacesQuery() {
  return useQuery({
    queryKey: workspaceKeys.tenants(),
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to load workspaces");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persisted
  });
}

// 0.1 Hook to fetch projects for a specific workspace with instant persistence
export function useTenantProjectsQuery(workspaceId?: string | null) {
  return useQuery({
    queryKey: workspaceKeys.projects(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`);
      if (!res.ok) throw new Error("Failed to load workspace projects");
      return res.json();
    },
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persisted
  });
}

// 1. Hook to fetch the project file tree with auto-refresh
export function useFileTreeQuery(projectId?: string | null, laneId?: string | null) {
  return useQuery({
    queryKey: workspaceKeys.files(projectId, laneId),
    queryFn: async () => {
      const q = new URLSearchParams();
      if (projectId) q.set("projectId", projectId);
      if (laneId) q.set("laneId", laneId);
      const res = await fetch(`/api/files?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to load file tree");
      return res.json();
    },
    staleTime: 5000,
    refetchInterval: 15000, // Background poll every 15s for file system changes
  });
}

// 2. Hook to fetch individual file content
export function useFileContentQuery(
  filePath: string,
  projectId?: string | null,
  laneId?: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: workspaceKeys.fileContent(filePath, projectId, laneId),
    queryFn: async () => {
      const q = new URLSearchParams({ path: filePath });
      if (projectId) q.set("projectId", projectId);
      if (laneId) q.set("laneId", laneId);
      const res = await fetch(`/api/files?${q.toString()}`);
      if (!res.ok) throw new Error(`Failed to load file: ${filePath}`);
      return res.json();
    },
    enabled: Boolean(filePath) && enabled,
    staleTime: 5000,
  });
}

// 3. Hook to save file content with optimistic cache invalidation
export function useSaveFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      filePath,
      content,
      projectId,
      laneId,
    }: {
      filePath: string;
      content: string;
      projectId?: string | null;
      laneId?: string | null;
    }) => {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          type: "file",
          content,
          projectId,
          laneId,
        }),
      });
      if (!res.ok) throw new Error("Failed to save file");
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate file cache & tree
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.files(variables.projectId, variables.laneId),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.diff(variables.projectId, variables.laneId),
      });
    },
    onError: (err: any) => {
      toast.error(`Save failed: ${err.message || "Unknown error"}`);
    },
  });
}

// 4. Hook to fetch Git Diffs
export function useGitDiffQuery(projectId?: string | null, laneId?: string | null) {
  return useQuery({
    queryKey: workspaceKeys.diff(projectId, laneId),
    queryFn: async () => {
      const q = new URLSearchParams();
      if (projectId) q.set("projectId", projectId);
      if (laneId) q.set("laneId", laneId);
      const res = await fetch(`/api/git/diff?${q.toString()}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5000,
    refetchInterval: 10000, // Revalidate git diff every 10s
  });
}

// 5. GitHub Status & Repositories Hooks (with instant TanStack local storage hydration & cache)
export function useGithubStatusQuery() {
  return useQuery<GitHubStatusData>({
    queryKey: workspaceKeys.github.status(),
    queryFn: async () => {
      try {
        return await api.getGithubStatus();
      } catch {
        return { connected: false, username: null, avatar_url: null, github_user_id: null };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persisted in local storage
  });
}

export function useGithubReposQuery(options?: { enabled?: boolean }) {
  return useQuery<GitHubRepoItem[]>({
    queryKey: workspaceKeys.github.repos(),
    queryFn: async () => {
      return await api.getGithubRepos();
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 10, // 10 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persisted in local storage
    retry: 1,
  });
}

export function useConnectGithubPatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      return await api.connectGithubPat(token);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(workspaceKeys.github.status(), {
        connected: true,
        username: data.username,
        avatar_url: data.avatar_url,
        github_user_id: data.github_user_id,
      });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.github.status() });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.github.repos() });
    },
  });
}

export function useDisconnectGithubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await api.disconnectGithub();
    },
    onSuccess: () => {
      queryClient.setQueryData(workspaceKeys.github.status(), {
        connected: false,
        username: null,
        avatar_url: null,
        github_user_id: null,
      });
      queryClient.setQueryData(workspaceKeys.github.repos(), []);
      queryClient.invalidateQueries({ queryKey: workspaceKeys.github.all });
    },
  });
}

