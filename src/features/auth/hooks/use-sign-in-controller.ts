import { useState, useCallback } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Uses the classic Clerk resource API (`signIn.create` / `attemptFirstFactor`
 * / `setActive`, from `@clerk/nextjs/legacy`) rather than the new signal-based
 * `signIn.password()` / `signIn.finalize()` "future" API (the default
 * `useSignIn` export), which has an SDK bug where the returned promise can
 * hang indefinitely.
 */
export function useSignInController() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!isLoaded || !signIn) return;

      if (!email.includes("@")) {
        setError("Enter a valid email address.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "needs_first_factor") {
          result = await signIn.attemptFirstFactor({
            strategy: "password",
            password,
          });
        }

        if (result.status === "complete" || result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push(redirectTo);
        } else if (result.status === "needs_second_factor") {
          setError("Two-factor authentication is required.");
        } else {
          setError("Sign in failed. Please check your credentials.");
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
        const message =
          clerkErr?.errors?.[0]?.longMessage || clerkErr?.errors?.[0]?.message || clerkErr?.message;
        setError(message || "Failed to sign in.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signIn, email, password, setActive, router, redirectTo]
  );

  const isReady = isLoaded && !!signIn;

  return {
    isLoaded,
    isReady,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    isLoading,
    handleSignIn,
    redirectTo,
  };
}
