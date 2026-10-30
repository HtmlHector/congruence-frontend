import { apiFetch } from "@/lib/api";
import type {
  AuthorizeUrlResponse,
  CustomApiKeyPayload,
  IntegrationProvider,
  Repository,
  RepositoryProvider,
  WorkspaceIntegration,
} from "../types";

interface RepositoryDto {
  full_name: string;
  private: boolean;
  default_branch: string | null;
}

// The backend keys providers by their lowercase slug while the UI uses display
// ids, so translate at the boundary.
function providerSlug(provider: IntegrationProvider | RepositoryProvider): string {
  return provider.toLowerCase();
}

export async function fetchWorkspaceIntegrations(): Promise<WorkspaceIntegration[]> {
  const data = await apiFetch<WorkspaceIntegration[]>("/api/v1/integrations");
  return (data ?? []).map((integration) => ({
    ...integration,
    provider: integration.provider.toUpperCase() as IntegrationProvider,
  }));
}

export async function fetchOAuthAuthorizeUrl(
  provider: IntegrationProvider,
  redirectUri: string,
): Promise<AuthorizeUrlResponse> {
  const params = new URLSearchParams({ redirect_uri: redirectUri });
  return apiFetch<AuthorizeUrlResponse>(
    `/api/v1/integrations/${providerSlug(provider)}/authorize?${params.toString()}`,
  );
}

export async function completeOAuthCallback(
  provider: IntegrationProvider,
  code: string,
  state: string,
  redirectUri: string,
): Promise<{ status: string; provider: string; workspace_id: string; scopes: string[] }> {
  const params = new URLSearchParams({
    code,
    state,
    redirect_uri: redirectUri,
  });
  return apiFetch(
    `/api/v1/integrations/${providerSlug(provider)}/callback?${params.toString()}`,
  );
}

export async function fetchRepositories(
  provider: RepositoryProvider,
  workspaceId?: string,
): Promise<Repository[]> {
  // Pass the tenant explicitly so opening the dialog from a `?new=1` link
  // cannot list repositories before the workspace binder runs.
  const data = await apiFetch<RepositoryDto[]>(
    `/api/v1/integrations/${providerSlug(provider)}/repositories`,
    workspaceId ? { headers: { "X-Workspace-Id": workspaceId } } : undefined,
  );
  return (data ?? []).map((repository) => ({
    fullName: repository.full_name,
    isPrivate: repository.private,
    defaultBranch: repository.default_branch,
  }));
}

export async function disconnectIntegration(provider: IntegrationProvider): Promise<void> {
  await apiFetch(`/api/v1/integrations/${providerSlug(provider)}`, {
    method: "DELETE",
  });
}

export async function saveCustomApiKey(
  payload: CustomApiKeyPayload,
): Promise<{ id: string; provider: string; credential_type: string }> {
  return apiFetch("/api/v1/integrations/custom-api-key", {
    method: "POST",
    data: {
      ...payload,
      provider: payload.provider.toLowerCase(),
      credential_type: payload.credential_type?.toLowerCase(),
    },
  });
}
