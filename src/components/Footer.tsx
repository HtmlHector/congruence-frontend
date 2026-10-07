import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface-sidebar)] py-10 text-xs text-[var(--muted-foreground)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[var(--foreground)]">congruence.dev</span>
          <span className="text-[var(--subtle-foreground)]">·</span>
          <span>The repository, the agent, and the preview in one place.</span>
        </div>

        <div className="flex items-center gap-5 text-[11px]">
          <a
            href="#how-it-works"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Workflow
          </a>
          <a
            href="#the-details"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Questions
          </a>
          <Link
            href="/workspace"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Workspace
          </Link>
        </div>
      </div>
    </footer>
  );
}
