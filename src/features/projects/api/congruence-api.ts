import { apiFetch, ApiError } from "@/lib/api";
import type {
  AgentCredential,
  CreateProjectInput,
  CreateTerminalInput,
  CreateWorktreeInput,
  Devbox,
  Project,
  Terminal,
  UsageSummary,
  Worktree,
} from "../types";

interface ProjectDto {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: Project["status"];
  repository_id: string | null;
  repo_provider: string;
  default_branch: string;
  root_path: string;
  setup_command: string | null;
  setup_status: Project["setupStatus"];
  base_image_ref: string | null;
  created_at: string;
  updated_at: string;
}

interface DevboxDto {
  id: string;
  project_id: string;
  provider: string;
  region: string;
  status: Devbox["status"];
  image_ref: string;
  cpu: number;
  memory_mb: number;
  disk_gb: number;
  awake_seconds_total: number;
  error_code: string | null;
  last_activity_at: string | null;
}

interface WorktreeDto {
  id: string;
  workspace_id: string;
  project_id: string;
  devbox_id: string;
  title: string;
  initial_prompt: string | null;
  branch: string;
  base_branch: string;
  path: string;
  slot: number;
  port_base: number;
  status: Worktree["status"];
  is_primary: boolean;
  pr_number: number | null;
  pr_url: string | null;
  created_by: string;
  created_at: string;
  deleted_at: string | null;
}

interface TerminalDto {
  id: string;
  worktree_id: string;
  devbox_id: string;
  tmux_session: string | null;
  kind: Terminal["kind"];
  agent: string | null;
  title: string | null;
  status: Terminal["status"];
  created_by: string;
  recording_enabled: boolean;
  cols: number;
  rows: number;
  created_at: string;
}

interface CredentialDto {
  provider: AgentCredential["provider"];
  kind: AgentCredential["kind"];
  status: AgentCredential["status"];
  label: string | null;
  last_verified_at: string | null;
  created_at: string;
}

interface UsageDto {
  plan: UsageSummary["plan"];
  awake_seconds: number;
  included_seconds: number;
  remaining_seconds: number;
  percent_used: number;
  awake_boxes: number;
  terminals_per_worktree: number;
}

function toProject(dto: ProjectDto): Project {
  return {
    id: dto.id,
    workspaceId: dto.workspace_id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    repositoryId: dto.repository_id,
    repoProvider: dto.repo_provider,
    defaultBranch: dto.default_branch,
    rootPath: dto.root_path,
    setupCommand: dto.setup_command,
    setupStatus: dto.setup_status,
    baseImageRef: dto.base_image_ref,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function toDevbox(dto: DevboxDto): Devbox {
  return {
    id: dto.id,
    projectId: dto.project_id,
    provider: dto.provider,
    region: dto.region,
    status: dto.status,
    imageRef: dto.image_ref,
    cpu: dto.cpu,
    memoryMb: dto.memory_mb,
    diskGb: dto.disk_gb,
    awakeSecondsTotal: dto.awake_seconds_total,
    errorCode: dto.error_code,
    lastActivityAt: dto.last_activity_at,
  };
}

function toWorktree(dto: WorktreeDto): Worktree {
  return {
    id: dto.id,
    workspaceId: dto.workspace_id,
    projectId: dto.project_id,
    devboxId: dto.devbox_id,
    title: dto.title,
    initialPrompt: dto.initial_prompt,
    branch: dto.branch,
    baseBranch: dto.base_branch,
    path: dto.path,
    slot: dto.slot,
    portBase: dto.port_base,
    status: dto.status,
    isPrimary: dto.is_primary,
    prNumber: dto.pr_number,
    prUrl: dto.pr_url,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
    deletedAt: dto.deleted_at,
  };
}

function toTerminal(dto: TerminalDto): Terminal {
  return {
    id: dto.id,
    worktreeId: dto.worktree_id,
    devboxId: dto.devbox_id,
    tmuxSession: dto.tmux_session,
    kind: dto.kind,
    agent: dto.agent,
    title: dto.title,
    status: dto.status,
    createdBy: dto.created_by,
    recordingEnabled: dto.recording_enabled,
    cols: dto.cols,
    rows: dto.rows,
    createdAt: dto.created_at,
  };
}

export async function getProjects(workspaceId?: string): Promise<Project[]> {
  // Pass the tenant explicitly so the very first request after a reload cannot
  // race the WorkspaceBinder effect and land on the backend's default workspace.
  const data = await apiFetch<ProjectDto[]>(
    "/api/v1/projects",
    workspaceId ? { headers: { "X-Workspace-Id": workspaceId } } : undefined,
  );
  return (data ?? []).map(toProject);
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const data = await apiFetch<ProjectDto>("/api/v1/projects", {
    method: "POST",
    data: {
      name: input.name,
      description: input.description,
      repository_id: input.repositoryId,
      repo_provider: input.repoProvider ?? "github",
      default_branch: input.defaultBranch ?? "main",
      setup_command: input.setupCommand || null,
    },
  });
  return toProject(data);
}

export async function getProject(projectId: string): Promise<Project> {
  const data = await apiFetch<ProjectDto>(
    `/api/v1/projects/${encodeURIComponent(projectId)}`,
  );
  return toProject(data);
}

export async function getDevbox(projectId: string): Promise<Devbox | null> {
  try {
    const data = await apiFetch<DevboxDto>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/box`,
    );
    return toDevbox(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function devboxAction(
  projectId: string,
  action: "pause" | "resume" | "reset",
): Promise<Devbox> {
  const data = await apiFetch<DevboxDto>(
    `/api/v1/projects/${encodeURIComponent(projectId)}/box/${action}`,
    { method: "POST" },
  );
  return toDevbox(data);
}

export async function getWorktrees(projectId: string): Promise<Worktree[]> {
  const data = await apiFetch<WorktreeDto[]>(
    `/api/v1/projects/${encodeURIComponent(projectId)}/worktrees`,
  );
  return (data ?? []).map(toWorktree);
}

export async function createWorktree(
  projectId: string,
  input: CreateWorktreeInput,
): Promise<Worktree> {
  const data = await apiFetch<WorktreeDto>(
    `/api/v1/projects/${encodeURIComponent(projectId)}/worktrees`,
    {
      method: "POST",
      data: {
        title: input.title,
        base_branch: input.baseBranch || null,
        branch: input.branch || null,
        initial_prompt: input.initialPrompt || null,
      },
    },
  );
  return toWorktree(data);
}

/**
 * Returns the project's primary (root checkout) worktree, provisioning it when
 * the backend has not recorded one yet. Idempotent, so retries are safe.
 */
export async function ensurePrimaryWorktree(projectId: string): Promise<Worktree> {
  const data = await apiFetch<WorktreeDto>(
    `/api/v1/projects/${encodeURIComponent(projectId)}/worktrees/primary`,
    { method: "POST" },
  );
  return toWorktree(data);
}

export async function deleteWorktree(worktreeId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/worktrees/${encodeURIComponent(worktreeId)}`, {
    method: "DELETE",
  });
}

export async function getTerminals(worktreeId: string): Promise<Terminal[]> {
  const data = await apiFetch<TerminalDto[]>(
    `/api/v1/worktrees/${encodeURIComponent(worktreeId)}/terminals`,
  );
  return (data ?? []).map(toTerminal);
}

export async function createTerminal(
  worktreeId: string,
  input: CreateTerminalInput,
): Promise<Terminal> {
  const data = await apiFetch<TerminalDto>(
    `/api/v1/worktrees/${encodeURIComponent(worktreeId)}/terminals`,
    {
      method: "POST",
      data: {
        kind: input.kind,
        agent: input.agent ?? null,
        title: input.title ?? null,
      },
    },
  );
  return toTerminal(data);
}

export async function closeTerminal(terminalId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/terminals/${encodeURIComponent(terminalId)}`, {
    method: "DELETE",
  });
}

export async function getCredentials(): Promise<AgentCredential[]> {
  const data = await apiFetch<CredentialDto[]>("/api/v1/credentials");
  return (data ?? []).map((dto) => ({
    provider: dto.provider,
    kind: dto.kind,
    status: dto.status,
    label: dto.label,
    lastVerifiedAt: dto.last_verified_at,
    createdAt: dto.created_at,
  }));
}

export async function storeApiKey(input: {
  provider: AgentCredential["provider"];
  value: string;
  label?: string;
}): Promise<AgentCredential> {
  const dto = await apiFetch<CredentialDto>("/api/v1/credentials", {
    method: "POST",
    data: { provider: input.provider, value: input.value, label: input.label },
  });
  return {
    provider: dto.provider,
    kind: dto.kind,
    status: dto.status,
    label: dto.label,
    lastVerifiedAt: dto.last_verified_at,
    createdAt: dto.created_at,
  };
}

export async function revokeCredential(provider: string): Promise<void> {
  await apiFetch<void>(`/api/v1/credentials/${encodeURIComponent(provider)}`, {
    method: "DELETE",
  });
}

export async function getUsage(): Promise<UsageSummary> {
  const dto = await apiFetch<UsageDto>("/api/v1/usage");
  return {
    plan: dto.plan,
    awakeSeconds: dto.awake_seconds,
    includedSeconds: dto.included_seconds,
    remainingSeconds: dto.remaining_seconds,
    percentUsed: dto.percent_used,
    awakeBoxes: dto.awake_boxes,
    terminalsPerWorktree: dto.terminals_per_worktree,
  };
}
