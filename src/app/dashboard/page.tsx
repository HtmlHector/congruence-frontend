import Link from "next/link";
import { ArrowUpRight, Plus, Activity, Layers, Database } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-baseline gap-4 border-b border-[var(--border-line)] pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium">Overview</h1>
          <p className="text-sm text-[var(--ink-secondary)] mt-1">
            Workspace resources, active runs, and system primitives.
          </p>
        </div>

        <Link
          href="/dashboard/resources/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--accent-primary)] text-[var(--ink-inverted)] text-xs font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Resource</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-sm">
          <span className="text-xs text-[var(--ink-muted)]">Active Workspace</span>
          <div className="text-xl font-medium mt-1">Default Workspace</div>
          <span className="text-[11px] text-[var(--status-success)] flex items-center gap-1 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] inline-block" />
            Healthy & Connected
          </span>
        </div>

        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-sm">
          <span className="text-xs text-[var(--ink-muted)]">Total Resources</span>
          <div className="text-xl font-medium mt-1">0</div>
          <span className="text-[11px] text-[var(--ink-muted)] mt-2 block">
            Awaiting first run
          </span>
        </div>

        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-sm">
          <span className="text-xs text-[var(--ink-muted)]">Subscription Tier</span>
          <div className="text-xl font-medium mt-1">Starter / Free</div>
          <Link
            href="/dashboard/billing"
            className="text-[11px] text-[var(--accent-primary)] mt-2 inline-flex items-center gap-0.5 hover:underline"
          >
            Upgrade plan <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Resources / Empty State */}
      <section className="mb-12">
        <h2 className="text-lg font-serif font-medium mb-4">Resources</h2>
        <div className="p-8 border border-dashed border-[var(--border-line)] rounded-sm text-center bg-[var(--bg-surface)]">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-3 text-[var(--ink-muted)]">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-medium text-base">No resources created yet</h3>
          <p className="text-xs text-[var(--ink-muted)] max-w-sm mx-auto mt-1 mb-5">
            This is where your product entities live. Customize this section to display
            runs, tests, or workflows based on your app flow.
          </p>
          <Link
            href="/dashboard/resources/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--border-line)] rounded-sm text-xs font-medium hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Resource
          </Link>
        </div>
      </section>

      {/* Parabox System Primitives Status */}
      <section className="pt-6 border-t border-[var(--border-line)]">
        <h2 className="text-sm font-medium text-[var(--ink-muted)] uppercase tracking-wider mb-4 font-mono text-[11px]">
          Foundation Primitives Status
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-2 px-3 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-sm">
            <span className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span>Supabase Authentication & Row-Level Security</span>
            </span>
            <span className="text-[var(--status-success)] font-medium">Ready</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-sm">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span>Stripe Checkout & Billing Portal API</span>
            </span>
            <span className="text-[var(--status-success)] font-medium">Ready</span>
          </div>
        </div>
      </section>
    </div>
  );
}
