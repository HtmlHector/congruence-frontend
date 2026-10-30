"use client";

import { useWorkspaceQuery } from "@/features/workspace/hooks/use-workspace-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FolderGit2,
  Layers,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function WorkspaceDashboardPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const { data: workspace, isLoading, error } = useWorkspaceQuery(workspaceId);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider">Loading workspace…</span>
        </div>
      </main>
    );
  }

  if (error || !workspace) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border bg-card p-6 text-center">
          <h1 className="text-lg font-bold text-foreground">Workspace not found</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            You may not have membership in this workspace or it has been deleted.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-foreground hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background font-mono font-bold text-sm">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">{workspace.name}</h1>
            <span className="text-xs font-mono text-muted-foreground">ID: {workspace.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${workspaceId}/projects`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects</span>
          </Link>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Manage billing</span>
          </Link>
        </div>
      </header>

      <section className="py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Building2 className="w-4 h-4" />
            <h2 className="text-xs font-mono uppercase tracking-wider">Multi-Tenant Isolation</h2>
          </div>
          <p className="text-2xl font-bold text-foreground">PostgreSQL RLS</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Requests automatically bind `X-Workspace-Id: {workspace.id}` into database row policies.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ShieldCheck className="w-4 h-4" />
            <h2 className="text-xs font-mono uppercase tracking-wider">Subscription Tier</h2>
          </div>
          <p className="text-2xl font-bold uppercase text-foreground">
            {workspace.plan || "Free"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Governed by Stripe webhook synchronization and Clerk token claims.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="w-4 h-4" />
            <h2 className="text-xs font-mono uppercase tracking-wider">Realtime Room</h2>
          </div>
          <p className="text-2xl font-bold text-foreground">Socket.IO</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Scoped to `workspace:{workspace.id}` backed by Redis Pub/Sub.
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t pt-5 text-xs text-muted-foreground">
        Workspace tenant context active. All API calls scoped to this organization.
      </footer>
    </main>
  );
}
