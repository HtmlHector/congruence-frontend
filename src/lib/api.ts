import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

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

export type ApiRequestOptions = Omit<AxiosRequestConfig, "url" | "baseURL">;

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, ""),
  headers: {
    Accept: "application/json",
  },
});

function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    return new ApiError(
      axiosError.message || "API request failed",
      axiosError.response?.status ?? 0,
      axiosError.response?.data,
      axiosError.code,
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : "API request failed",
    0,
  );
}

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
