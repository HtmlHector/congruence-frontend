import React from "react";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

/**
 * Headless, unstyled EmptyState container.
 * Provides accessible container and semantic slots for zero-state scenarios across resources.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div data-slot="empty-state" role="status" className={className} {...props}>
      {icon && <div data-slot="empty-state-icon">{icon}</div>}
      <h3 data-slot="empty-state-title">{title}</h3>
      {description && <p data-slot="empty-state-description">{description}</p>}
      {(action || secondaryAction) && (
        <div data-slot="empty-state-actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
