"use client";

import Link from "next/link";
import { Loader2, Receipt } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { PLANS } from "@/features/billing/config/plans";
import {
  useCreatePortalSession,
  useSubscriptionQuery,
} from "@/features/billing/hooks/use-billing";
import {
  SettingsDetailRow,
  SettingsEmptyState,
  SettingsPage,
  SettingsPanel,
} from "@/features/settings/components/settings-page";
import { useWorkspaceQuery } from "@/features/workspace/hooks/use-workspace-query";
import { cn } from "@/lib/utils";

export function BillingSettings({ workspaceId }: { workspaceId: string }) {
  const { data: workspace } = useWorkspaceQuery(workspaceId);
  const { data: subscription, isLoading } = useSubscriptionQuery(workspaceId);
  const portal = useCreatePortalSession();

  const tier = (subscription?.tier ?? workspace?.plan ?? "free").toLowerCase();
  const plan = PLANS[tier] ?? PLANS.free;
  const isPaid = plan.key !== "free";
  const isCanceling = subscription?.cancel_at_period_end === true;
  const periodEnd = subscription?.current_period_end
    ? formatDate(subscription.current_period_end)
    : null;

  const handleManageBilling = () => {
    portal.mutate(
      {
        return_url: `${window.location.origin}/${workspaceId}/settings/billing`,
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
    <SettingsPage
      title="Billing"
      description="Manage the plan, payment method and invoices for this workspace."
    >
      <SettingsPanel
        title="Plan"
        description="Your current subscription and what it includes."
        action={
          <span className="inline-flex h-5 items-center rounded-fd-xs bg-foundation-sunken px-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase">
            {plan.name}
          </span>
        }
        footer={
          isPaid ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleManageBilling}
              disabled={portal.isPending}
              className="cursor-pointer"
            >
              {portal.isPending && (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              )}
              Manage billing
            </Button>
          ) : (
            <Link
              href="/billing"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
              )}
            >
              Compare plans
            </Link>
          )
        }
        footerClassName="justify-end"
      >
        <dl className="divide-y divide-foundation-line">
          <SettingsDetailRow label="Price">
            <span className="font-mono text-[12px] tabular-nums">
              ${plan.price}
              {plan.price > 0 ? " / month" : ""}
            </span>
          </SettingsDetailRow>

          <SettingsDetailRow label="Status">
            {isLoading ? (
              <span className="text-[12px] text-foundation-ink-tertiary">
                Checking subscription
              </span>
            ) : (
              <StatusChip status={subscription?.status} />
            )}
          </SettingsDetailRow>

          <SettingsDetailRow label={isCanceling ? "Ends" : "Renews"}>
            <span className="font-mono text-[12px] tabular-nums">
              {periodEnd ?? "Not scheduled"}
            </span>
          </SettingsDetailRow>

          <SettingsDetailRow label="Included">
            <span className="font-mono text-[12px] tabular-nums">
              {plan.credits.toLocaleString("en-US")}{" "}
              {plan.credits === 1 ? "credit" : "credits"} / month
            </span>
          </SettingsDetailRow>
        </dl>

        <p className="py-3 text-[12px] leading-[18px] text-foundation-ink-tertiary">
          Payments, invoices and cancellation are handled securely in Stripe.
        </p>
      </SettingsPanel>

      <SettingsPanel
        title="Invoices"
        description="Receipts and payment history for this workspace."
      >
        <SettingsEmptyState
          icon={<Receipt className="size-4" />}
          title="No invoices yet"
          description={
            isPaid
              ? "Invoices from Stripe will appear here after your next billing cycle."
              : "Invoices appear here after you upgrade to a paid plan."
          }
        />
      </SettingsPanel>
    </SettingsPage>
  );
}

function StatusChip({ status }: { status?: string }) {
  if (!status) {
    return (
      <span className="inline-flex h-5 items-center rounded-fd-xs bg-foundation-sunken px-1.5 text-[11px] font-medium text-foundation-ink-secondary">
        Free
      </span>
    );
  }

  const normalized = status.toLowerCase();
  const isActive = normalized === "active" || normalized === "trialing";
  const isProblem =
    normalized === "past_due" ||
    normalized === "unpaid" ||
    normalized === "incomplete";

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-fd-xs px-1.5 text-[11px] font-medium",
        isActive
          ? "bg-foundation-success/10 text-foundation-success"
          : isProblem
            ? "bg-foundation-danger/10 text-foundation-danger"
            : "bg-foundation-sunken text-foundation-ink-secondary",
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}
