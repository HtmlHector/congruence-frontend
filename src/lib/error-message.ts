import {
  ApiError,
  ForbiddenError,
  NetworkError,
  RateLimitError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/services/api/errors";

/**
 * ── getErrorMessage ────────────────────────────────────
 * Single entry point for all user-facing error messages.
 *
 * Maps typed error classes → human-readable strings.
 * Unknown errors get a generic fallback.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) return error.message;
  if (error instanceof RateLimitError) return error.message;
  if (error instanceof UnauthorizedError) return error.message;
  if (error instanceof ForbiddenError) return error.message;
  if (error instanceof ServerError) return error.message;
  if (error instanceof NetworkError) return error.message;
  if (error instanceof ApiError) {
    const data = error.data as { message?: string } | undefined;
    return data?.message ?? `Server error (${error.status})`;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
