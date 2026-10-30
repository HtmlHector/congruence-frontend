import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  ForbiddenError,
  InsufficientCreditsError,
  RateLimitError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/services/api/errors";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly code?: string;

  constructor(message: string, status: number, body?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

// ── Active workspace ID ──────────────────────────────────
let activeWorkspaceId: string | null = null;

export function setWorkspaceId(id: string | null): void {
  activeWorkspaceId = id;
}

export function getWorkspaceId(): string | null {
  return activeWorkspaceId;
}

// ── Token provider ────────────────────────────────────────────────────
let getTokenFn: (() => Promise<string | null>) | null = null;
let getTokenForceRefreshFn: (() => Promise<string | null>) | null = null;

// Requests can fire from mount effects before the auth provider has configured
// the token source. They wait on this promise instead of going out unauthenticated.
let markConfigured: (() => void) | null = null;
const configured = new Promise<void>((resolve) => {
  markConfigured = resolve;
});

const TOKEN_PROVIDER_TIMEOUT_MS = 2_000;

async function waitForTokenProvider(): Promise<void> {
  if (getTokenFn) return;
  await Promise.race([
    configured,
    new Promise<void>((resolve) => setTimeout(resolve, TOKEN_PROVIDER_TIMEOUT_MS)),
  ]);
}

export function configureApiClient(
  getToken: () => Promise<string | null>,
  getTokenForceRefresh?: () => Promise<string | null>,
): void {
  getTokenFn = getToken;
  getTokenForceRefreshFn = getTokenForceRefresh ?? getToken;
  markConfigured?.();
  markConfigured = null;
}

// ── Token cache ──────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getCachedToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const fn = forceRefresh ? (getTokenForceRefreshFn ?? getTokenFn) : getTokenFn;
  if (!fn) return null;
  cachedToken = await fn();
  tokenExpiry = Date.now() + 50_000;
  return cachedToken;
}

function normalizeApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;

    if (status === 401) return new UnauthorizedError();
    if (status === 402) return new InsufficientCreditsError(data);
    if (status === 403) return new ForbiddenError(data);
    if (status === 422) return new ValidationError(data as { detail?: Array<{ field: string; message: string }> });
    if (status === 429) return new RateLimitError((data as { retryAfter?: number })?.retryAfter ?? 60);
    if (status >= 500) return new ServerError(status as 500 | 502 | 503, data);

    return new ApiError(
      axiosError.message || "API request failed",
      status,
      data,
      axiosError.code,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }

  return new ApiError("API request failed", 0);
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "",
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    await waitForTokenProvider();
    const token = await getCachedToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    if (activeWorkspaceId) {
      config.headers.set("X-Workspace-Id", activeWorkspaceId);
    }

    return config;
  });

  // A token that arrived too late (or expired) surfaces as a 401; retry once with
  // a forced refresh so a single rejected request does not break the UI.
  client.interceptors.response.use(undefined, async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;

    const config = error.config as
      | (InternalAxiosRequestConfig & { authRetried?: boolean })
      | undefined;
    if (error.response?.status !== 401 || !config || config.authRetried) {
      throw error;
    }

    config.authRetried = true;
    await waitForTokenProvider();
    const token = await getCachedToken(true);
    if (!token) throw error;

    config.headers.set("Authorization", `Bearer ${token}`);
    return client.request(config);
  });

  return client;
}

export const apiClient = createApiClient();

export type ApiRequestOptions = Omit<AxiosRequestConfig, "url" | "baseURL">;

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient.request<T>({
      url: path,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
