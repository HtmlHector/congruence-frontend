export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Bring your repository",
      body: "Start with a GitHub project and give it a persistent place to run.",
    },
    {
      num: "02",
      title: "Use your own agents",
      body: "Run the real Claude Code or Codex CLI with the account you already have.",
    },
    {
      num: "03",
      title: "See what's running",
      body: "Start your dev server and open a private HTTPS preview alongside the terminal.",
    },
    {
      num: "04",
      title: "Come back to the work",
      body: "Return from another device, wake the workspace, and restart the processes you need.",
    },
  ];

  return (
    <div id="how-it-works" className="w-full border-t border-[var(--border)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Section 01 / THE IDEA */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-baseline">
          <div className="md:col-span-3">
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
              01 / The Idea
            </span>
          </div>
          <div className="md:col-span-9 max-w-3xl space-y-5">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--foreground)]">
              Changing devices shouldn't mean rebuilding your context.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-normal">
              <p>
                Work happens in more places than one laptop. Your code, authenticated tools,
                terminal sessions, and app preview all need somewhere to live while you move between them.
              </p>
              <p>
                <strong className="text-[var(--foreground)] font-medium">congruence</strong> puts that execution
                context in a shared workspace you can reach from a browser, so you can keep working with the
                agents and tools you already know.
              </p>
            </div>
          </div>
        </div>

        {/* Section 02 / THE WORKFLOW */}
        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border)] pb-4 gap-2">
            <div>
              <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
                02 / The Workflow
              </span>
              <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--foreground)]">
                From a repository to a running app.
              </h3>
            </div>
            <p className="text-xs font-mono text-[var(--subtle-foreground)]">
              The planned experience, without a new toolchain to learn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="group rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] p-6 transition-all hover:border-[var(--border-strong)]"
              >
                <span className="font-mono text-xs text-[var(--accent-claude)] block mb-3">
                  {step.num}
                </span>
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-2 group-hover:text-[var(--foreground-strong)] transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
