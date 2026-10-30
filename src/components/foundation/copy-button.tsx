"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

type CopyStatus = "idle" | "copied" | "error";

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 1500);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-6 place-items-center rounded-fd-xs text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus",
        className,
      )}
    >
      {status === "copied" ? (
        <Check className="size-3.5 text-foundation-success" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied"
          ? `Copied ${value}`
          : status === "error"
            ? "Copy failed"
            : ""}
      </span>
    </button>
  );
}
