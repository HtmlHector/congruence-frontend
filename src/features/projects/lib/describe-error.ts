import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";

interface ErrorEnvelope {
  detail?: string | { code?: string; message?: string };
  message?: string;
}

function envelope(error: unknown): ErrorEnvelope | undefined {
  if (error instanceof ApiError) return error.body as ErrorEnvelope | undefined;
  // 402s are normalized to a different error class that stores `data`.
  if (error && typeof error === "object" && "data" in error) {
    return (error as { data?: ErrorEnvelope }).data;
  }
  return undefined;
}

/**
 * The Congruence endpoints return `{ detail: { code, message } }` for domain
 * errors, which the generic error mapper does not unwrap.
 */
export function describeError(error: unknown): string {
  const body = envelope(error);
  if (typeof body?.detail === "string") return body.detail;
  if (body?.detail?.message) return body.detail.message;
  if (body?.message) return body.message;
  return getErrorMessage(error);
}

export function errorCode(error: unknown): string | undefined {
  const body = envelope(error);
  if (typeof body?.detail === "object") return body.detail?.code;
  return undefined;
}
