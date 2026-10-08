"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys factory
export const workspaceKeys = {
  all: ["workspace"] as const,
  projects: () => [...workspaceKeys.all, "projects"] as const,
  project: (projectId?: string | null) => [...workspaceKeys.projects(), projectId] as const,
  files: (projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.project(projectId), "files", laneId] as const,
  fileContent: (filePath: string, projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.files(projectId, laneId), "content", filePath] as const,
  diff: (projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.project(projectId), "diff", laneId] as const,
  chats: (projectId?: string | null, laneId?: string | null) =>
    [...workspaceKeys.project(projectId), "chats", laneId] as const,
};

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
