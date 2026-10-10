"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type AuthMode = "sign-in" | "sign-up" | "verify";

type PanelCopy = {
  statement: string;
  body: string;
};

const PANEL_COPY: Record<AuthMode, PanelCopy> = {
  "sign-in": {
    statement: "Welcome back.",
    body: "Sign in to your workspace and keep shipping with confidence.",
  },
  "sign-up": {
    statement: "Start testing smarter.",
    body: "Create your account and let Traceback handle the quality assurance.",
  },
  verify: {
    statement: "Keep quality close.",
    body: "Verified access keeps your tests and release evidence in the right hands.",
  },
};

export function MinimalAuthShell({ children, mode = "sign-up" }: { children: ReactNode; mode?: AuthMode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-background border-r border-border/40 lg:h-screen lg:min-h-0">
          <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10 sm:py-6 lg:px-14">
            <Link
              href="/"
              className="group flex w-fit items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              aria-label="Traceback home"
            >
              <Image
                src="/assets/logo.png"
                alt=""
                width={24}
                height={24}
                className="rounded-[5px] object-cover transition-transform duration-[var(--duration-mid)] ease-[var(--ease-out)] group-hover:scale-105"
              />
              <span className="text-[14px] font-semibold tracking-tight text-foreground">Traceback</span>
            </Link>
          </header>

          <main className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-8">
            <div className="relative w-full max-w-[405px]">{children}</div>
          </main>
        </section>

        <QualityPanel mode={mode} />
      </div>
    </div>
  );
}

function QualityPanel({ mode }: { mode: AuthMode }) {
  const panel = PANEL_COPY[mode];

  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-[#0A0B0E] lg:block lg:h-screen lg:min-h-0"
      aria-label="Traceback AI quality assurance overview"
    >
      {/* Artwork backdrop */}
      <Image
        src="/assets/HJ0-oP8bYAA3KYj.jpeg"
        alt="Traceback QA artwork"
        fill
        priority
        sizes="(max-width: 1024px) 0vw, 50vw"
        className="object-cover object-center"
      />

      {/* Smooth bottom-up vignette gradient for impeccable text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,11,14,0.05) 0%, rgba(10,11,14,0.2) 40%, rgba(10,11,14,0.8) 80%, rgba(10,11,14,0.92) 100%)",
        }}
      />

      {/* Editorial Content Area following design.md Satoshi typography */}
      <div className="relative z-10 flex flex-col justify-end h-full p-10 lg:p-14 text-white">
        <div className="max-w-[440px] space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3.5px] border border-white/20 bg-black/40 backdrop-blur-md text-[10.5px] font-mono uppercase tracking-[0.12em] text-white/90 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4AA84] animate-pulse" />
            <span>Autonomous Quality System</span>
          </div>

          <h2 className="font-sora text-[28px] sm:text-[34px] font-medium tracking-tight text-white leading-[1.15]">
            {panel.statement}
          </h2>

          <p className="text-[14px] leading-relaxed text-white/80 font-normal">
            {panel.body}
          </p>
        </div>
      </div>
    </aside>
  );
}
