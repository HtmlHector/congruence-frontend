import React from "react";

export interface ResourceGridProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  renderSkeleton?: () => React.ReactNode;
  skeletonCount?: number;
  emptyState?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

/**
 * Headless, unstyled ResourceGrid primitive.
 * Safely renders lists, empty states, and loading skeleton states without imposing styling.
 */
export function ResourceGrid<T>({
  items,
  renderItem,
  isLoading = false,
  renderSkeleton,
  skeletonCount = 3,
  emptyState,
  keyExtractor,
  className = "",
  ...props
}: ResourceGridProps<T>) {
  if (isLoading) {
    if (renderSkeleton) {
      return (
        <div data-slot="resource-grid-loading" className={className} {...props}>
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <React.Fragment key={`skeleton-${idx}`}>{renderSkeleton()}</React.Fragment>
          ))}
        </div>
      );
    }
    return (
      <div data-slot="resource-grid-loading" className={className} {...props}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div key={`default-skeleton-${idx}`} data-slot="resource-grid-skeleton" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div data-slot="resource-grid-empty" className={className} {...props}>
        {emptyState ?? <div>No items to display.</div>}
      </div>
    );
  }

  return (
    <div data-slot="resource-grid" className={className} {...props}>
      {items.map((item, index) => {
        const key = keyExtractor
          ? keyExtractor(item, index)
          : (item as { id?: string | number })?.id ?? index;
        return (
          <div key={key} data-slot="resource-grid-item">
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
