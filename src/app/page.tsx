"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QueryRestoreStatus } from "@/app/providers";

type StarterNote = {
  title: string;
  description: string;
};

const starterNote: StarterNote = {
  title: "Your foundation is ready.",
  description:
    "A clean place to begin building. Add product-specific routes, components, and data when you need them.",
};

async function getStarterNote(): Promise<StarterNote> {
  // Local deterministic data demonstrates the query lifecycle without a backend.
  return starterNote;
}

export default function Home() {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["starter-note"],
    queryFn: getStarterNote,
  });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between border-b pb-5">
        <Link className="text-sm font-semibold tracking-tight" href="/">
          Frontend starter
        </Link>
        <span className="text-xs text-muted-foreground">Ready for your product</span>
      </header>

      <section className="flex flex-1 flex-col justify-center gap-10 py-16">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-medium text-muted-foreground">A fresh starting point</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {isPending ? "Preparing your foundation…" : data?.title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {isError
              ? "The example data could not be loaded. Try again."
              : data?.description}
          </p>
          {isError ? (
            <Button onClick={() => void refetch()}>Try again</Button>
          ) : null}
        </div>

        <div className="max-w-xl rounded-lg border bg-card p-5 text-card-foreground">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">TanStack Query example</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                This local sample is cached and persisted in this browser for up to 24 hours.
              </p>
            </div>
            <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {dataUpdatedAt
              ? `Loaded ${new Date(dataUpdatedAt).toLocaleTimeString()}`
              : "Loading cached example…"}
          </p>
          <QueryRestoreStatus />
        </div>
      </section>

      <footer className="border-t pt-5 text-xs text-muted-foreground">
        Replace this screen with your product experience when you are ready.
      </footer>
    </main>
  );
}
