"use client";

import { useAuthContext } from "@/providers/auth-provider";
import { useSubscriptionQuery, useCreateCheckoutSession, useCreatePortalSession } from "@/features/billing/hooks/use-billing";
import { PlanSelector } from "@/features/billing/components/plan-selector";
import { type PlanKey } from "@/features/billing/config/plans";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const { lastWorkspaceId } = useAuthContext();
  const workspaceId = lastWorkspaceId;
  const { data: subscription, isLoading: isSubLoading } = useSubscriptionQuery(workspaceId);
  const checkoutMutation = useCreateCheckoutSession();
  const portalMutation = useCreatePortalSession();

  const handleSelectPlan = (targetKey: PlanKey) => {
    if (targetKey === "free") return;

    checkoutMutation.mutate(
      {
        tier: targetKey,
        success_url: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/billing`,
      },
      {
        onSuccess: (data) => {
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          }
        },
      },
    );
  };

  const handleManageBilling = () => {
    portalMutation.mutate(
      {
        return_url: `${window.location.origin}/billing`,
      },
      {
        onSuccess: (data) => {
          if (data.portal_url) {
            window.location.href = data.portal_url;
          }
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-background py-12 px-6 sm:px-10 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        {subscription?.tier && subscription.tier !== "free" && (
          <button
            type="button"
            onClick={handleManageBilling}
            disabled={portalMutation.isPending}
            className="text-xs font-medium text-foreground hover:underline"
          >
            Manage subscription in Stripe
          </button>
        )}
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Billing & Plans
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Select the optimal plan tier for your product and workspace.
        </p>

        {isSubLoading ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching active subscription…</span>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
            <span>Current plan:</span>
            <span className="font-bold uppercase tracking-wider">
              {subscription?.tier || "Free"}
            </span>
          </div>
        )}
      </div>

      <PlanSelector
        currentPlan={subscription?.tier || "free"}
        onSelectPlan={handleSelectPlan}
        isUpgrading={checkoutMutation.isPending}
      />
    </main>
  );
}
