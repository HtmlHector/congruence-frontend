import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ── cn ─────────────────────────────────────────────────
 * Merge Tailwind classes with conflict resolution.
 * Usage: cn("px-4 py-2", "px-6") → "px-6 py-2"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * ── formatDate ─────────────────────────────────────────
 * Consistent date formatting across the app.
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    ...options,
  }).format(new Date(date));
}

/**
 * ── formatRelativeTime ─────────────────────────────────
 * Compact relative time for table/list date columns: "1s ago", "2m ago", "3h ago", "4d ago",
 * "5w ago", "6mo ago", "7y ago". Never falls back to a full date — a value from any point in
 * the past reduces to one of these units, which is the whole point (a full "Jul 24, 7:00 PM"
 * timestamp is what this replaces).
 */
export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * ── truncate ───────────────────────────────────────────
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
