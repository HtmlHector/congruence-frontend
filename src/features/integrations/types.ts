export type IntegrationProvider =
  | "GITHUB"
  | "SLACK"
  | "LINEAR"
  | "CUSTOM_WEBHOOK"
  | "CUSTOM_API_KEY";

export type CredentialType = "OAUTH_TOKEN" | "API_KEY" | "WEBHOOK_SECRET";

/** Git providers whose connected repositories can be listed. */
export type RepositoryProvider = "GITHUB" | "GITLAB" | "BITBUCKET";

export interface Repository {
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string | null;
}

export interface WorkspaceIntegration {
  id: string;
  provider: IntegrationProvider;
  credential_type: CredentialType;
  scopes: string[];
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthorizeUrlResponse {
  authorization_url: string;
  provider: string;
}

export interface CustomApiKeyPayload {
  provider: IntegrationProvider;
  api_key: string;
  credential_type?: CredentialType;
  metadata?: Record<string, unknown>;
}

export interface IntegrationDefinition {
  id: IntegrationProvider;
  name: string;
  category: "Developer & CI/CD" | "Alerts & Chat" | "Issue Tracking" | "Custom";
  description: string;
  isOAuth: boolean;
  docsUrl?: string;
}
