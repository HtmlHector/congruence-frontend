"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthArtPanel, type AuthArtPanelProps } from "./auth-art-panel";

export type AuthMode = "sign-in" | "sign-up" | "verify";

interface AuthShellProps {
  children: React.ReactNode;
  mode?: AuthMode;
  brandName?: string;
  backHref?: string;
  backLabel?: string;
  artProps?: Partial<AuthArtPanelProps>;
}

const DEFAULT_ART_PANELS: Record<AuthMode, Partial<AuthArtPanelProps>> = {
  "sign-in": {
    imageSrc: "/assets/auth-art-2.jpg",
    statement: "Precision engineering, zero ambiguity.",
    description: "Access your project workspaces, verify evidence gates, and coordinate autonomous builds.",
    badgeText: "Gateway Active",
  },
  "sign-up": {
    imageSrc: "/assets/auth-art.jpg",
    statement: "The Six Documents standard starts here.",
    description: "Turn unvetted ideas into rigorous specifications, design tokens, and verifiable roadmaps.",
    badgeText: "Workspace Provisioning",
  },
  verify: {
    imageSrc: "/assets/HJ0-oP8bYAA3KYj.jpeg",
    statement: "Verified access across all nodes.",
    description: "Hardware allocations, production schemas, and repository tokens stay safeguarded.",
    badgeText: "Authentication Guard",
  },
};

export function AuthShell({
  children,
  mode = "sign-in",
  brandName = "Parabox",
  backHref = "/",
  backLabel = "Back to home",
  artProps,
}: AuthShellProps) {
  const activeArtProps = {
    ...DEFAULT_ART_PANELS[mode],
    ...artProps,
    brandName,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Form Column */}
        <section className="relative flex min-h-screen flex-col justify-between overflow-y-auto bg-background px-6 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12 border-r border-border/40">
          {/* Header */}
          <header className="flex items-center justify-between w-full max-w-[420px] mx-auto mb-6">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>{backLabel}</span>
            </Link>

            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
              {brandName}
            </span>
          </header>

          {/* Form Content Body */}
          <main className="w-full max-w-[420px] mx-auto my-auto py-4">
            {children}
          </main>

          {/* Footer Terms */}
          <footer className="w-full max-w-[420px] mx-auto mt-6 pt-4 border-t border-border/40 text-[11.5px] leading-relaxed text-muted-foreground/60">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </footer>
        </section>

        {/* Visual Art Column (Desktop) */}
        <AuthArtPanel {...activeArtProps} />
      </div>
    </div>
  );
}
