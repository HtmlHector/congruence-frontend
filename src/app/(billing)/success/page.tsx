"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Subscription confirmed!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your workspace has been upgraded. All plan benefits and elevated quotas are immediately active.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <span>Return to dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/billing"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Review billing details
          </Link>
        </div>
      </div>
    </main>
  );
}
