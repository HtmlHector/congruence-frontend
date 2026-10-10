"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { QueryRestoreStatus } from "@/app/providers";
import { useAuthContext } from "@/providers/auth-provider";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ArrowRight, Building, CreditCard, Shield } from "lucide-react";

type StarterNote = {
  title: string;
  description: string;
};

const starterNote: StarterNote = {
  title: "Your foundation is ready.",
  description:
    "A clean, full-stack SaaS foundation with Auth, Billing, Multi-Tenant Row-Level Security, and Realtime sync.",
};

async function getStarterNote(): Promise<StarterNote> {
  return starterNote;
}

function AuthNav() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded-md hover:bg-foreground/90 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }
  return <ClerkAuthNav />;
}

function ClerkAuthNav() {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground hidden sm:inline-block">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <SignOutButton>
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded-md hover:bg-foreground/90 transition-colors"
      >
        Sign up
      </Link>
    </div>
  );
}

export default function Home() {
  const { lastWorkspaceId } = useAuthContext();

  const { data, isPending, isError, dataUpdatedAt } = useQuery({
    queryKey: ["starter-note"],
    queryFn: getStarterNote,
  });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between border-b pb-5">
        <Link className="text-sm font-semibold tracking-tight" href="/">
          Frontend starter
        </Link>
        <AuthNav />
      </header>

      <section className="flex flex-1 flex-col justify-center gap-8 py-12">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Product Foundation</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {isPending ? "Preparing your foundation…" : data?.title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {isError ? "The example data could not be loaded. Try again." : data?.description}
          </p>
        </div>

        {/* Quick Launchpad to Core Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/sign-in"
            className="group rounded-xl border bg-card p-5 hover:border-foreground/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <Shield className="w-5 h-5 text-foreground" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Clerk OAuth (Google, GitHub), password login, verification, and /complete profiles.
              </p>
            </div>
          </Link>

          <Link
            href="/billing"
            className="group rounded-xl border bg-card p-5 hover:border-foreground/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <CreditCard className="w-5 h-5 text-foreground" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Billing & Plans</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Stripe Checkout sessions, subscription tiers, and Customer Portal management.
              </p>
            </div>
          </Link>

          <Link
            href={lastWorkspaceId ? `/${lastWorkspaceId}` : "/00000000-0000-0000-0000-000000000001"}
            className="group rounded-xl border bg-card p-5 hover:border-foreground/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <Building className="w-5 h-5 text-foreground" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Workspace Tenancy</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Scoped route isolation with automatic `X-Workspace-Id` header synchronization.
              </p>
            </div>
          </Link>
        </div>

        <div className="max-w-xl rounded-lg border bg-card p-5 text-card-foreground">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">TanStack Query example</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                This local sample is cached and persisted in this browser for up to 24 hours.
              </p>
            </div>
            <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {dataUpdatedAt
              ? `Loaded ${new Date(dataUpdatedAt).toLocaleTimeString()}`
              : "Loading cached example…"}
          </p>
          <QueryRestoreStatus />
        </div>
      </section>

      <footer className="border-t pt-5 text-xs text-muted-foreground flex items-center justify-between">
        <span>Parabox Product Frontend Foundation</span>
        <span className="font-mono text-[11px]">Next.js 16 · React 19 · Clerk · Stripe</span>
      </footer>
    </main>
  );
}
