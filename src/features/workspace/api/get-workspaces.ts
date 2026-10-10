import { apiClient } from "@/lib/api";
import type { Workspace, CreateWorkspaceInput } from "../types";

interface WorkspaceResponseDto {
  workspace_id?: string;
  id?: string;
  name: string;
  slug: string;
  plan_tier?: string;
  created_at: string;
}

function toWorkspace(dto: WorkspaceResponseDto): Workspace {
  return {
    id: String(dto.workspace_id || dto.id),
    name: dto.name,
    slug: dto.slug,
    plan: dto.plan_tier,
    createdAt: dto.created_at,
  };
}

export interface WorkspaceListItem {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  createdAt: string;
}

export async function getWorkspaces(): Promise<WorkspaceListItem[]> {
  const { data } = await apiClient.get<WorkspaceResponseDto[]>("/api/v1/workspaces");
  return (data ?? []).map(toWorkspace);
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const { data } = await apiClient.post<WorkspaceResponseDto>("/api/v1/workspaces", {
    name: input.name,
  });
  return toWorkspace(data);
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  const { data } = await apiClient.get<WorkspaceResponseDto>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}`,
  );
  return toWorkspace(data);
}

export interface UpdateWorkspaceInput {
  name?: string;
}

export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput,
): Promise<Workspace> {
  const { data } = await apiClient.patch<WorkspaceResponseDto>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}`,
    input,
  );
  return toWorkspace(data);
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await apiClient.delete(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}`);
}
