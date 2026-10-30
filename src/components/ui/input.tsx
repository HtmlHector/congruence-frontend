import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-fd-md border border-foundation-line-strong bg-foundation-surface px-3 py-1 text-sm text-foundation-ink transition-colors duration-150 ease-fd outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foundation-ink placeholder:text-foundation-ink-tertiary hover:border-foundation-ink-secondary focus-visible:border-foundation-ink focus-visible:foundation-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-foundation-line disabled:bg-foundation-sunken disabled:text-foundation-ink-disabled aria-invalid:border-foundation-danger aria-invalid:outline-foundation-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
