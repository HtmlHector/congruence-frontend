import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral:
    "border-foundation-line bg-foundation-sunken text-foundation-ink-secondary",
  success:
    "border-foundation-success/25 bg-foundation-success/10 text-foundation-success",
  warning:
    "border-foundation-warning/25 bg-foundation-warning/10 text-foundation-warning",
  danger:
    "border-foundation-danger/25 bg-foundation-danger/10 text-foundation-danger",
  info: "border-foundation-info/25 bg-foundation-info/10 text-foundation-info",
};

export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-fd-xs border px-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function toneForStatus(status: string): StatusTone {
  switch (status) {
    case "awake":
    case "ready":
    case "active":
    case "merged":
      return "success";
    case "provisioning":
    case "waking":
    case "creating":
    case "working":
    case "pending":
    case "running":
      return "info";
    case "paused":
    case "needs_review":
    case "detached":
      return "warning";
    case "error":
    case "failed":
    case "lost":
      return "danger";
    default:
      return "neutral";
  }
}
