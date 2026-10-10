"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import {
  QueryClient,
  isServer,
  useIsRestoring,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState, useEffect, useRef } from "react";
import { configureApiClient } from "@/lib/api";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const CACHE_KEY = "frontend-starter-query-cache-v1";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: CACHE_MAX_AGE,
        retry: 1,
      },
    },
  });
}

function getQueryClient() {
  if (isServer) return createQueryClient();
  if (!globalThis.__frontendStarterQueryClient) {
    globalThis.__frontendStarterQueryClient = createQueryClient();
  }
  return globalThis.__frontendStarterQueryClient;
}

declare global {
  // Keep one browser QueryClient across renders and route transitions.
  var __frontendStarterQueryClient: QueryClient | undefined;
}

const localStoragePersister = createAsyncStoragePersister({
  key: CACHE_KEY,
  storage: {
    getItem: (key) => {
      if (typeof window === "undefined") return null;
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Persistence is best-effort: the query cache remains usable in memory.
      }
    },
    removeItem: (key) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Storage may be disabled by browser policy.
      }
    },
  },
});

function ApiClientConfigurator() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return null;
  return <ActiveApiClientConfigurator />;
}

function ActiveApiClientConfigurator() {
  const { getToken, isSignedIn } = useAuth();
  const isConfiguredRef = useRef(false);

  useEffect(() => {
    if (isSignedIn && !isConfiguredRef.current) {
      configureApiClient(
        () => getToken(),
        () => getToken({ skipCache: true }),
      );
      isConfiguredRef.current = true;
    } else if (!isSignedIn) {
      isConfiguredRef.current = false;
    }
  }, [getToken, isSignedIn]);

  return null;
}

function QueryProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: CACHE_MAX_AGE,
        buster: CACHE_KEY,
      }}
    >
      <ApiClientConfigurator />
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </PersistQueryClientProvider>
  );
}

function OptionalClerkProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return publishableKey ? (
    <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
  ) : (
    <>{children}</>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OptionalClerkProvider>
      <QueryProviders>{children}</QueryProviders>
    </OptionalClerkProvider>
  );
}

export function QueryRestoreStatus() {
  const isRestoring = useIsRestoring();
  return (
    <span aria-live="polite" className="sr-only" data-testid="query-restore-status">
      {isRestoring ? "Restoring saved data" : "Saved data is ready"}
    </span>
  );
}
