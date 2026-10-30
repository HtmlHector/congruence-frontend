export type ProjectSetupStatus = "pending" | "running" | "ready" | "failed";

export type ProjectStatus = "draft" | "active" | "archived";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  repositoryId: string | null;
  repoProvider: string;
  defaultBranch: string;
  rootPath: string;
  setupCommand: string | null;
  setupStatus: ProjectSetupStatus;
  baseImageRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DevboxStatus =
  | "provisioning"
  | "awake"
  | "pausing"
  | "paused"
  | "waking"
  | "error"
  | "destroyed";

export interface Devbox {
  id: string;
  projectId: string;
  provider: string;
  region: string;
  status: DevboxStatus;
  imageRef: string;
  cpu: number;
  memoryMb: number;
  diskGb: number;
  awakeSecondsTotal: number;
  errorCode: string | null;
  lastActivityAt: string | null;
}

export type WorktreeStatus =
  | "creating"
  | "ready"
  | "working"
  | "needs_review"
  | "merged"
  | "failed"
  | "deleted";

export interface Worktree {
  id: string;
  workspaceId: string;
  projectId: string;
  devboxId: string;
  title: string;
  initialPrompt: string | null;
  branch: string;
  baseBranch: string;
  path: string;
  slot: number;
  portBase: number;
  status: WorktreeStatus;
  isPrimary: boolean;
  prNumber: number | null;
  prUrl: string | null;
  createdBy: string;
  createdAt: string;
  deletedAt: string | null;
}

export type TerminalKind = "shell" | "agent" | "login";
export type TerminalStatus = "starting" | "open" | "detached" | "lost" | "closed";

export interface Terminal {
  id: string;
  worktreeId: string;
  devboxId: string;
  tmuxSession: string | null;
  kind: TerminalKind;
  agent: string | null;
  title: string | null;
  status: TerminalStatus;
  createdBy: string;
  recordingEnabled: boolean;
  cols: number;
  rows: number;
  createdAt: string;
}

export type CredentialProvider = "anthropic" | "openai";
export type CredentialKind = "api_key" | "oauth";
export type CredentialStatus = "active" | "needs_reconnect" | "revoked";

export interface AgentCredential {
  provider: CredentialProvider;
  kind: CredentialKind;
  status: CredentialStatus;
  label: string | null;
  lastVerifiedAt: string | null;
  createdAt: string;
}

export interface UsageSummary {
  plan: "trial" | "starter" | "pro" | "max";
  awakeSeconds: number;
  includedSeconds: number;
  remainingSeconds: number;
  percentUsed: number;
  awakeBoxes: number;
  terminalsPerWorktree: number;
}

export interface CreateProjectInput {
  name: string;
  repositoryId: string;
  repoProvider?: string;
  defaultBranch?: string;
  setupCommand?: string;
  description?: string;
}

export interface CreateWorktreeInput {
  title: string;
  baseBranch?: string;
  branch?: string;
  initialPrompt?: string;
}

export interface CreateTerminalInput {
  kind: TerminalKind;
  agent?: string | null;
  title?: string;
}
