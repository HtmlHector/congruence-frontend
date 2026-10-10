"use client";

import { Check, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { PLANS, PLAN_KEYS, type PlanKey } from "@/features/billing/config/plans";
import { cn } from "@/lib/utils";

type PlanSelectorProps = {
  currentPlan?: string;
  onSelectPlan: (planKey: PlanKey) => void;
  isUpgrading: boolean;
};

export function PlanSelector({
  currentPlan = "free",
  onSelectPlan,
  isUpgrading,
}: PlanSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLAN_KEYS.map((key) => {
        const plan = PLANS[key];
        if (!plan) return null;

        const isCurrent = plan.key.toLowerCase() === currentPlan.toLowerCase();
        const isPopular = key === "pro";

        return (
          <div
            key={key}
            className={cn(
              "rounded-xl border bg-card text-card-foreground p-6 flex flex-col justify-between transition-all shadow-xs",
              isCurrent
                ? "border-foreground/40 ring-1 ring-foreground/20"
                : "border-border hover:border-foreground/20",
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {plan.name}
                </h3>
                {isCurrent ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Active
                  </span>
                ) : isPopular ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-foreground/10 text-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                  ${plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Included capabilities
                </p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground/80 leading-snug">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border">
              {isCurrent ? (
                <div className="w-full py-2.5 text-center text-sm font-medium text-muted-foreground bg-muted rounded-lg select-none">
                  Current plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlan(key)}
                  disabled={isUpgrading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <span>Select {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
