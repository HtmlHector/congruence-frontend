import { apiClient } from "@/lib/api";

export interface AuthMeResponse {
  user_id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_new: boolean;
  status: "INCOMPLETE" | "ACTIVE" | (string & {});
  onboarding_completed: boolean;
  last_workspace_id: string | null;
  permissions: string[];
}

const DEFAULT_RETRY_AFTER_SECONDS = 2;

export async function getAuthMe(): Promise<
  | { data: AuthMeResponse; isSyncing: false }
  | { isSyncing: true; retryAfter: number }
> {
  const response = await apiClient.get<AuthMeResponse>("/api/v1/auth/me");

  if (response.status === 202) {
    const header = response.headers?.["retry-after"];
    const retryAfter = Number(header) || DEFAULT_RETRY_AFTER_SECONDS;
    return { isSyncing: true, retryAfter };
  }

  return { data: response.data, isSyncing: false };
}

export async function updateProfile(firstName: string, lastName: string): Promise<AuthMeResponse> {
  const { data } = await apiClient.patch<AuthMeResponse>("/api/v1/auth/profile", {
    first_name: firstName,
    last_name: lastName,
  });
  return data;
}

export async function completeOnboarding(): Promise<AuthMeResponse> {
  const { data } = await apiClient.post<AuthMeResponse>("/api/v1/auth/complete-onboarding");
  return data;
}
