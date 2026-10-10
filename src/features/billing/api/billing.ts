import { apiClient } from "@/lib/api";

export interface ISubscriptionResponse {
  id: string;
  workspace_id: string;
  tier: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface ICreateCheckoutSessionInput {
  tier?: string;
  success_url: string;
  cancel_url: string;
}

export interface ICreateCheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface ICreatePortalSessionInput {
  return_url: string;
}

export interface ICreatePortalSessionResponse {
  portal_url: string;
}

export async function getSubscription(): Promise<ISubscriptionResponse> {
  const response = await apiClient.get<ISubscriptionResponse>("/api/v1/billing/subscription");
  return response.data;
}

export async function createCheckoutSession(
  input: ICreateCheckoutSessionInput,
): Promise<ICreateCheckoutSessionResponse> {
  const response = await apiClient.post<ICreateCheckoutSessionResponse>(
    "/api/v1/billing/checkout",
    input,
  );
  return response.data;
}

export async function createPortalSession(
  input: ICreatePortalSessionInput,
): Promise<ICreatePortalSessionResponse> {
  const response = await apiClient.post<ICreatePortalSessionResponse>(
    "/api/v1/billing/portal",
    input,
  );
  return response.data;
}
