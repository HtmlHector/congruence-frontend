export function PillarsSection() {
  const pillars = [
    {
      category: "Continuity",
      title: "Keep the important parts.",
      description:
        "Files and configured identities are designed to survive sleep. Live processes are not. Wake the workspace and restart your harness or service when you're ready.",
    },
    {
      category: "Parallel Work",
      title: "Give each writer a lane.",
      description:
        "Use a pair lane for shared work and separate Git worktrees for independent agents, so changes can be reviewed and brought back together through GitHub.",
    },
    {
      category: "Explicit Control",
      title: "Watch first. Grant when needed.",
      description:
        "Let others observe without handing over the keyboard. Write control is explicit, scoped to a lane, and revocable by the owner.",
    },
  ];

  return (
    <section className="w-full border-t border-[var(--border)] py-20 bg-[var(--surface-inset)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border)] pb-4 gap-2">
          <div>
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
              03 / Built around shared work
            </span>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--foreground)]">
              One context. Room for more than one writer.
            </h3>
          </div>
          {/* Superset geometric decorative glyph */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-[var(--muted-foreground)]">
            <span>&#123;&lt; &gt;&#125;</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.category}
              className="flex flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] p-6 sm:p-8"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                {pillar.category}
              </span>
              <h4 className="text-base font-medium text-[var(--foreground)] mb-3">
                {pillar.title}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-normal">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
