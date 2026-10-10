"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getAuthMe, type AuthMeResponse } from "@/features/auth/api/get-auth-me";

// ── Context type ─────────────────────────────────────────

interface IAuthContext {
  /** The full /auth/me response, or null if not yet loaded. */
  user: AuthMeResponse | null;
  /** Permissions array from the backend. */
  permissions: string[];
  /** The backend's provisioning status. */
  status: AuthMeResponse["status"] | null;
  /** True if the user was just created in the backend DB. */
  isNew: boolean;
  /** True once the user has confirmed their profile. */
  onboardingCompleted: boolean;
  /** The workspace the user most recently visited. */
  lastWorkspaceId: string | null;
  /** True while the /auth/me query is loading. */
  isLoading: boolean;
  /** True if the backend returned 202. */
  isSyncing: boolean;
  /** True if the query errored. */
  isError: boolean;
}

const defaultAuthContext: IAuthContext = {
  user: null,
  permissions: [],
  status: null,
  isNew: false,
  onboardingCompleted: false,
  lastWorkspaceId: null,
  isLoading: false,
  isSyncing: false,
  isError: false,
};

const AuthContext = createContext<IAuthContext>(defaultAuthContext);

export function useAuthContext(): IAuthContext {
  return useContext(AuthContext);
}

function ActiveAuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();

  const {
    data: authData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["auth", "me", userId],
    queryFn: getAuthMe,
    enabled: isSignedIn === true && !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: (failureCount, err) => {
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        err.name === "UnauthorizedError"
      ) {
        return false;
      }
      return failureCount < 3;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && "isSyncing" in data && data.isSyncing) {
        return data.retryAfter * 1000;
      }
      return false;
    },
  });

  const syncing =
    authData !== undefined && "isSyncing" in authData ? authData.isSyncing : false;
  const user =
    authData !== undefined && "data" in authData ? authData.data : null;

  const isOnboardingComplete =
    user?.onboarding_completed === true ||
    clerkUser?.unsafeMetadata?.onboarding_completed === true;

  const value: IAuthContext = {
    user,
    permissions: user?.permissions ?? [],
    status: user?.status ?? null,
    isNew: user?.is_new ?? false,
    onboardingCompleted: isOnboardingComplete,
    lastWorkspaceId: user?.last_workspace_id ?? null,
    isLoading:
      isSignedIn === undefined ||
      (isSignedIn && !isError && (isLoading || authData === undefined)),
    isSyncing: isSignedIn === true && syncing,
    isError: isError && !!error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return <AuthContext.Provider value={defaultAuthContext}>{children}</AuthContext.Provider>;
  }

  return <ActiveAuthProvider>{children}</ActiveAuthProvider>;
}
