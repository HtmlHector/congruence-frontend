import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="w-full border-t border-[var(--border)] py-24 text-center bg-[var(--surface-inset)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
          congruence.dev
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[var(--foreground)] leading-tight">
          A browser. Your tools.
          <br />
          A place to pick up where you left off.
        </h2>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/workspace"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-8 text-sm font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] hover:shadow-lg transition-all"
          >
            Open a repository
          </Link>
        </div>
      </div>
    </section>
  );
}
