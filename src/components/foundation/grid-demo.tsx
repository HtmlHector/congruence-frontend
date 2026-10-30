"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GridDemo() {
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-foundation-ink-secondary">
          12 columns with a 24px gutter at desktop and 16px below.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={showGrid}
          onClick={() => setShowGrid((value) => !value)}
        >
          <LayoutGrid aria-hidden="true" />
          {showGrid ? "Hide grid" : "Show grid"}
        </Button>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface p-4">
        <div aria-hidden="true" className="grid h-40 grid-cols-12 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="rounded-fd-xs bg-foundation-sunken/70" />
          ))}
        </div>

        {showGrid ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 grid grid-cols-12 gap-4 sm:gap-6"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="rounded-fd-xs border-x border-foundation-ink/15 bg-foundation-ink/[0.04]"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
