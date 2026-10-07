"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
      {/* Subtle radial background glow */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[rgba(232,128,74,0.15)] to-[rgba(16,185,129,0.1)] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Subtag Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-8">
          <span className="size-1.5 rounded-full bg-[var(--accent-claude)]" />
          <span>Shared Execution Context · congruence.dev</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[var(--foreground)] leading-[1.12] mb-6">
          Your repository, your agents,
          <br className="hidden sm:inline" /> and the running app.
          <br />
          <span className="text-[var(--muted-foreground)]">In one place.</span>
        </h1>

        {/* Lead Copy */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-10 font-normal">
          Claude Code already runs in the cloud. What it cannot do is show you the application it just started. Congruence is the environment where the agent you already pay for, the repository, and the live preview stay together.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/workspace"
            className="group flex h-11 items-center gap-2 rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] hover:shadow-md transition-all w-full sm:w-auto justify-center"
          >
            <span>Open a repository</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Micro-copy */}
        <p className="mt-4 text-xs font-mono text-[var(--subtle-foreground)]">
          Your tools. Your accounts. A browser is enough.
        </p>
      </div>
    </section>
  );
}
