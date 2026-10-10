import React from "react";

export interface ResourceHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  breadcrumbs?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Headless, unstyled standard ResourceHeader primitive.
 * Semantic slots for breadcrumbs, title, description, badges, and primary action buttons.
 */
export function ResourceHeader({
  breadcrumbs,
  title,
  description,
  badge,
  actions,
  className = "",
  ...props
}: ResourceHeaderProps) {
  return (
    <div data-slot="resource-header" className={className} {...props}>
      <div data-slot="resource-header-content">
        {breadcrumbs && <div data-slot="resource-header-breadcrumbs">{breadcrumbs}</div>}
        <div data-slot="resource-header-title-row">
          <h1 data-slot="resource-header-title">{title}</h1>
          {badge && <span data-slot="resource-header-badge">{badge}</span>}
        </div>
        {description && <p data-slot="resource-header-description">{description}</p>}
      </div>
      {actions && <div data-slot="resource-header-actions">{actions}</div>}
    </div>
  );
}
