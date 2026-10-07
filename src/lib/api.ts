/**
 * Typed API client for Congruence Backend.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

export interface ProjectData {
  id: string;
  name: string;
  slug: string;
  repo_full_name: string;
  default_branch?: string;
  host?: {
    id: string;
    state: "awake" | "asleep" | "waking" | "sleeping";
    backend_type: string;
  };
  lanes?: WorkLaneData[];
  actors?: WorkspaceActor[];
}

export interface WorkLaneData {
  id: string;
  name: string;
  slug: string;
  branch: string;
  branch_name?: string;
  is_pair_lane: boolean;
  status: "ready" | "running_dev" | "editing" | "closed";
  harness?: string;
}

export interface WorkspaceActor {
  id: string;
  display_name: string;
  actor_type: string;
  role: "owner" | "writer" | "watcher";
  presence: "online" | "away" | "offline";
  avatar_color?: string;
}

export interface ServiceData {
  id: string;
  lane_id?: string;
  port: number;
  protocol: string;
  address_subdomain: string;
  access_mode: "private" | "public_timeboxed";
  is_active: boolean;
  url: string;
}

export interface GitDiffData {
  lane_id: string;
  branch_name: string;
  files_changed: number;
  insertions: number;
  deletions: number;
  diff_text: string;
}

export interface PullRequestData {
  id: string;
  lane_id: string;
  pr_number: number;
  pr_url: string;
  title: string;
  status: string;
  created_at?: string;
}

export interface ActivityData {
  id: string;
  action_type: string;
  summary: string;
  actor_id?: string;
  lane_id?: string;
  timestamp?: string;
}

export interface GrantData {
  id: string | null;
  lane_id: string;
  actor_id: string;
  permission: "watch" | "write";
  is_revoked: boolean;
  granted_at?: string;
}

export interface IntegrationsStatusData {
  project_id: string;
  github: {
    connected: boolean;
    username?: string | null;
    app_id: string;
    app_slug?: string;
    install_url: string;
    repo: string | null;
  };

  harnesses: Record<
    string,
    {
      label: string;
      state: "disconnected" | "awaiting_user" | "connected" | "error";
      credential_path: string;
      supports_login: boolean;
    }
  >;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export interface GitHubStatusData {
  connected: boolean;
  username: string | null;
  avatar_url: string | null;
  github_user_id: string | null;
  scope?: string | null;
  app_slug?: string;
  app_id?: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  owner_avatar?: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  description: string | null;
  updated_at: string;
  pushed_at?: string;
  stargazers_count?: number;
  fork?: boolean;
}

export const api = {
  // Projects
  getProjects: () => request<ProjectData[]>("/projects"),
  getProject: (id: string) => request<ProjectData>(`/projects/${id}`),
  cloneProject: (data: { name: string; repo_url: string; default_branch?: string }) =>
    request<ProjectData>("/projects/clone", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Host lifecycle
  getHost: (projectId: string) =>
    request<{ id: string; state: "awake" | "asleep" | "waking" | "sleeping" }>(
      `/projects/${projectId}/host`
    ),
  sleepHost: (projectId: string) =>
    request<{ status: string; host_id: string }>(`/projects/${projectId}/host/sleep`, {
      method: "POST",
    }),
  wakeHost: (projectId: string) =>
    request<{ status: string; host_id: string }>(`/projects/${projectId}/host/wake`, {
      method: "POST",
    }),

  // Lanes
  getLanes: (projectId: string) => request<WorkLaneData[]>(`/projects/${projectId}/lanes`),
  createLane: (projectId: string, data: { name: string; slug: string; branch_name: string; is_pair_lane?: boolean }) =>
    request<WorkLaneData>(`/projects/${projectId}/lanes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Grants
  getLaneGrant: (projectId: string, laneId: string) =>
    request<GrantData>(`/projects/${projectId}/lanes/${laneId}/grant`),
  grantLaneControl: (projectId: string, laneId: string, actorId: string, permission: "watch" | "write" = "write") =>
    request<GrantData>(`/projects/${projectId}/lanes/${laneId}/grant`, {
      method: "POST",
      body: JSON.stringify({ actor_id: actorId, permission }),
    }),
  revokeLaneControl: (projectId: string, laneId: string) =>
    request<{ status: string; lane_id: string }>(`/projects/${projectId}/lanes/${laneId}/grant`, {
      method: "DELETE",
    }),

  // Actors
  getActors: (projectId: string) => request<WorkspaceActor[]>(`/projects/${projectId}/actors`),

  // Services
  getServices: (projectId: string) => request<ServiceData[]>(`/projects/${projectId}/services`),

  // Git diff
  getDiff: (projectId: string, laneId: string) =>
    request<GitDiffData>(`/projects/${projectId}/git/diff?lane_id=${encodeURIComponent(laneId)}`),

  // Pull Requests
  getPullRequests: (projectId: string) =>
    request<PullRequestData[]>(`/projects/${projectId}/github/pull-requests`),
  createPullRequest: (
    projectId: string,
    data: { lane_id: string; title: string; body?: string; target_branch?: string }
  ) =>
    request<PullRequestData>(`/projects/${projectId}/github/pull-requests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Activity Feed
  getActivity: (projectId: string, limit = 20) =>
    request<ActivityData[]>(`/projects/${projectId}/activity?limit=${limit}`),

  // Integrations & Vault
  getIntegrationsStatus: (projectId: string) =>
    request<IntegrationsStatusData>(`/integrations/status/${projectId}`),
  startHarnessLogin: (laneId: string, harness: "claude" | "codex") =>
    request<{ status: string; instruction?: string; prompt?: string }>(
      `/integrations/harnesses/${harness}/login/${laneId}`,
      { method: "POST" }
    ),
  getHarnessLoginStatus: (laneId: string, harness: string) =>
    request<{ state: string }>(`/integrations/harnesses/${harness}/login/${laneId}`),

  // GitHub Integration & OAuth
  getGithubConnectUrl: () =>
    request<{ provider: string; authorize_url: string; client_id: string; app_slug: string }>(
      "/integrations/github/connect"
    ),
  getGithubStatus: () => request<GitHubStatusData>("/integrations/github/status"),
  getGithubRepos: () => request<GitHubRepoItem[]>("/integrations/github/repos"),
  disconnectGithub: () =>
    request<{ connected: boolean; disconnected: boolean }>("/integrations/github/disconnect", {
      method: "DELETE",
    }),
};

