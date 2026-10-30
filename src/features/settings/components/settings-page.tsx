import type { ReactNode } from "react";

import { EmptyState } from "@/components/primitives/empty-state";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SettingsPage({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <header className="max-w-[68ch]">
        <h1 className="text-[24px] leading-8 font-semibold tracking-[-0.02em] text-foundation-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[14px] leading-[22px] text-foundation-ink-secondary">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </div>
  );
}

/**
 * A settings group. Groups are framed by hairlines rather than cards: the
 * header closes with a rule, rows carry their own dividers, and the group ends
 * with one more rule. This keeps the page reading as a single pane.
 */
export function SettingsPanel({
  title,
  description,
  action,
  footer,
  children,
  className,
  contentClassName,
  footerClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  footerClassName?: string;
}) {
  return (
    <section className={cn("scroll-mt-8", className)}>
      <div className="flex items-start justify-between gap-6 border-b border-foundation-line pb-3">
        <div className="min-w-0">
          <h2 className="text-[13px] leading-5 font-semibold tracking-[-0.006em] text-foundation-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 max-w-[62ch] text-[12px] leading-[18px] text-foundation-ink-tertiary">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
      </div>

      <div
        className={cn(
          !footer && "border-b border-foundation-line",
          contentClassName,
        )}
      >
        {children}
      </div>

      {footer ? (
        <div
          className={cn(
            "flex items-center justify-between gap-4 border-b border-foundation-line py-3",
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Two-column setting row: name and explanation on the left, control on the
 * right. The pattern comes from desktop preference windows and keeps a long
 * form scannable without stacking labels above every field.
 */
export function SettingsRow({
  label,
  description,
  htmlFor,
  children,
  className,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,320px)] sm:items-start sm:gap-10",
        className,
      )}
    >
      <div className="min-w-0 sm:pt-1.5">
        {htmlFor ? (
          <Label
            htmlFor={htmlFor}
            className="text-[13px] leading-5 font-medium"
          >
            {label}
          </Label>
        ) : (
          <p className="text-[13px] leading-5 font-medium text-foundation-ink">
            {label}
          </p>
        )}

        {description ? (
          <p className="mt-1 max-w-[48ch] text-[12px] leading-[18px] text-foundation-ink-tertiary">
            {description}
          </p>
        ) : null}
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Label on the left, value pushed to the right edge. Used inside a `dl`. */
export function SettingsDetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center justify-between gap-6 py-2.5",
        className,
      )}
    >
      <dt className="shrink-0 text-[13px] leading-5 text-foundation-ink-secondary">
        {label}
      </dt>
      <dd className="flex min-w-0 items-center justify-end gap-1.5 text-right text-[13px] leading-5 text-foundation-ink">
        {children}
      </dd>
    </div>
  );
}

export function SettingsEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        "[&_[data-slot=empty-state-icon]]:grid [&_[data-slot=empty-state-icon]]:size-9 [&_[data-slot=empty-state-icon]]:place-items-center [&_[data-slot=empty-state-icon]]:rounded-full [&_[data-slot=empty-state-icon]]:border [&_[data-slot=empty-state-icon]]:border-foundation-line [&_[data-slot=empty-state-icon]]:bg-foundation-sunken/60 [&_[data-slot=empty-state-icon]]:text-foundation-ink-secondary",
        "[&_[data-slot=empty-state-title]]:mt-3 [&_[data-slot=empty-state-title]]:text-[13px] [&_[data-slot=empty-state-title]]:leading-5 [&_[data-slot=empty-state-title]]:font-medium [&_[data-slot=empty-state-title]]:text-foundation-ink",
        "[&_[data-slot=empty-state-description]]:mt-1 [&_[data-slot=empty-state-description]]:max-w-[46ch] [&_[data-slot=empty-state-description]]:text-[12px] [&_[data-slot=empty-state-description]]:leading-[18px] [&_[data-slot=empty-state-description]]:text-foundation-ink-secondary",
        "[&_[data-slot=empty-state-actions]]:mt-4 [&_[data-slot=empty-state-actions]]:flex [&_[data-slot=empty-state-actions]]:items-center [&_[data-slot=empty-state-actions]]:gap-2",
        className,
      )}
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  );
}
