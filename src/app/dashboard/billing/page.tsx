"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, ExternalLink } from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading("checkout");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate checkout");
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout error");
    } finally {
      setLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch (err: any) {
      toast.error(err.message || "Portal error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="border-b border-[var(--border-line)] pb-6 mb-8">
        <h1 className="text-3xl font-serif font-medium">Subscription & Billing</h1>
        <p className="text-sm text-[var(--ink-secondary)] mt-1">
          Manage your plan, invoices, and payment details via Stripe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Starter Plan */}
        <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-sm flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--ink-muted)] font-mono">
              Current Plan
            </div>
            <h2 className="text-2xl font-serif font-medium mt-1">Starter</h2>
            <div className="text-3xl font-medium mt-3">$0 <span className="text-xs text-[var(--ink-muted)]">/ month</span></div>
            <p className="text-xs text-[var(--ink-secondary)] mt-2">
              For initial testing, proofs of concept, and development.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-[var(--ink-secondary)]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
                <span>1 Active Workspace</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
                <span>Up to 100 API runs / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
                <span>Community support</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--border-line)] text-xs text-[var(--ink-muted)]">
            Included by default
          </div>
        </div>

        {/* Pro Plan */}
        <div className="p-6 bg-[var(--bg-surface)] border-2 border-[var(--accent-primary)] rounded-sm flex flex-col justify-between relative">
          <span className="absolute -top-3 right-4 px-2 py-0.5 bg-[var(--accent-primary)] text-[var(--ink-inverted)] text-[10px] font-medium tracking-wide uppercase rounded-xs">
            Recommended
          </span>
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--accent-primary)] font-mono">
              Pilot & Scale
            </div>
            <h2 className="text-2xl font-serif font-medium mt-1">Pro</h2>
            <div className="text-3xl font-medium mt-3">$29 <span className="text-xs text-[var(--ink-muted)]">/ month</span></div>
            <p className="text-xs text-[var(--ink-secondary)] mt-2">
              For teams piloting live software with customers.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-[var(--ink-secondary)]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
                <span>Unlimited workspaces & team members</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
                <span>High-throughput agent execution</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
                <span>Priority support & SLA guarantee</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout("price_pro_monthly")}
            disabled={loading !== null}
            className="mt-8 w-full py-2 px-4 bg-[var(--accent-primary)] text-[var(--ink-inverted)] text-xs font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2"
          >
            {loading === "checkout" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Upgrade to Pro
          </button>
        </div>
      </div>

      {/* Customer Billing Portal */}
      <div className="p-5 border border-[var(--border-line)] rounded-sm bg-[var(--bg-subtle)] flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-medium">Stripe Customer Portal</h3>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Update credit cards, download tax receipts, or modify subscription seats.
          </p>
        </div>

        <button
          onClick={handleOpenPortal}
          disabled={loading !== null}
          className="px-3.5 py-1.5 border border-[var(--border-line)] bg-[var(--bg-surface)] text-xs font-medium rounded-sm hover:bg-[var(--bg-canvas)] transition-colors flex items-center gap-1.5"
        >
          {loading === "portal" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ExternalLink className="w-3.5 h-3.5" />
          )}
          Manage in Stripe
        </button>
      </div>
    </div>
  );
}
