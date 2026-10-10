/**
 * Typed API error classes for consistent error handling.
 *
 * All API errors are normalized in the Axios response interceptor
 * and flow through classifyApiError() for UX decisions.
 *
 * @see lib/api-client.ts — where these are thrown
 * @see services/api/error-classifier.ts — where UX actions are determined
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    // FastAPI's HTTPException body is {"detail": "..."} — surface that instead of a bare
    // status code, so callers relying on `err.message` (most `onError` toasts in this app)
    // show the actual reason instead of a useless "API Error 400".
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as Record<string, unknown>).detail)
        : undefined;
    super(detail ?? `API Error ${status}`);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  /**
   * Failure mode when there's no HTTP response.
   * - "timeout": the request was aborted by the client timeout
   * - "connection": the connection dropped with no response
   */
  public readonly code: "timeout" | "connection";

  constructor(
    message = "Network error. Please check your connection.",
    code: "timeout" | "connection" = "connection",
  ) {
    super(message);
    this.name = "NetworkError";
    this.code = code;
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Please sign in to continue.");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(data?: unknown) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as Record<string, unknown>).detail)
        : undefined;
    super(detail ?? "You don't have permission to do this.");
    this.name = "ForbiddenError";
  }
}

export class InsufficientCreditsError extends ApiError {
  constructor(data?: unknown) {
    super(402, data);
    this.name = "InsufficientCreditsError";
  }
}

export class ValidationError extends ApiError {
  public fields: { field: string; message: string }[];

  constructor(data: { detail?: { field: string; message: string }[] }) {
    super(422, data);
    this.name = "ValidationError";
    this.fields = data?.detail ?? [];
    this.message =
      this.fields.length > 0 ? this.fields.map((f) => f.message).join(", ") : "Validation failed";
  }
}

export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Rate limited. Retry after ${retryAfter}s.`);
    this.name = "RateLimitError";
  }
}

export class ServerError extends Error {
  constructor(
    public status: 500 | 502 | 503,
    data?: unknown,
  ) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as Record<string, unknown>).detail)
        : undefined;
    super(detail ?? `Server error (${status}). Please try again later.`);
    this.name = "ServerError";
  }
}

export class GatewayTimeoutError extends Error {
  constructor() {
    super("Request timed out. Retrying...");
    this.name = "GatewayTimeoutError";
  }
}
