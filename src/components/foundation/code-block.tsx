import { CopyButton } from "./copy-button";

export function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface">
      <div className="flex items-center justify-between gap-3 border-b border-foundation-line px-3 py-2">
        <span className="font-mono text-[11px] text-foundation-ink-tertiary">
          {title}
        </span>
        <CopyButton value={code} label={`Copy ${title}`} />
      </div>
      <pre className="overflow-x-auto bg-foundation-sunken/60 p-4 font-mono text-[12px] leading-6 text-foundation-ink">
        {code}
      </pre>
    </div>
  );
}
