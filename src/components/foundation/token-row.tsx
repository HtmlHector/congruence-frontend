import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";
import type { FoundationToken } from "./sections";

export function TokenRow({ token }: { token: FoundationToken }) {
  return (
    <li className="flex flex-wrap items-start gap-3 py-3 sm:flex-nowrap">
      <span className="flex shrink-0 gap-1" aria-hidden="true">
        <span className="foundation-theme-light block">
          <span
            className={cn(
              "block size-5 rounded-fd-xs border border-black/10",
              token.swatch,
            )}
          />
        </span>
        <span className="foundation-theme-dark block">
          <span
            className={cn(
              "block size-5 rounded-fd-xs border border-white/15",
              token.swatch,
            )}
          />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <code className="font-mono text-[12px] text-foundation-ink">
            {token.cssVar}
          </code>
          <code className="font-mono text-[11px] text-foundation-ink-tertiary">
            {token.utility}
          </code>
        </div>
        <p className="mt-0.5 text-xs leading-5 text-foundation-ink-secondary">
          {token.use}
          {token.note ? ` ${token.note}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <CopyButton
          value={token.cssVar}
          label={`Copy CSS variable ${token.cssVar}`}
        />
        <CopyButton
          value={token.utility}
          label={`Copy utility ${token.utility}`}
        />
      </div>
    </li>
  );
}
