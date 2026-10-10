import { apiFetch } from "@/lib/api";
import type {
  AuthorizeUrlResponse,
  CustomApiKeyPayload,
  IntegrationProvider,
  WorkspaceIntegration,
} from "../types";

export async function fetchWorkspaceIntegrations(): Promise<WorkspaceIntegration[]> {
  return apiFetch<WorkspaceIntegration[]>("/api/v1/integrations");
}

export async function fetchOAuthAuthorizeUrl(
  provider: IntegrationProvider,
  redirectUri: string,
): Promise<AuthorizeUrlResponse> {
  const params = new URLSearchParams({ redirect_uri: redirectUri });
  return apiFetch<AuthorizeUrlResponse>(`/api/v1/integrations/${provider}/authorize?${params.toString()}`);
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
  return apiFetch(`/api/v1/integrations/${provider}/callback?${params.toString()}`);
}

export async function disconnectIntegration(provider: IntegrationProvider): Promise<void> {
  await apiFetch(`/api/v1/integrations/${provider}`, {
    method: "DELETE",
  });
}

export async function saveCustomApiKey(
  payload: CustomApiKeyPayload,
): Promise<{ id: string; provider: string; credential_type: string }> {
  return apiFetch("/api/v1/integrations/custom-api-key", {
    method: "POST",
    data: payload,
  });
}
