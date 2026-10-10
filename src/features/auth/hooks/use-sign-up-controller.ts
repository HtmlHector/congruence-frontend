import { useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile, completeOnboarding } from "@/features/auth/api/get-auth-me";

/**
 * Uses the classic Clerk resource API (`signUp.create` /
 * `prepareEmailAddressVerification` / `attemptEmailAddressVerification` /
 * `setActive`, from `@clerk/nextjs/legacy`) rather than the new signal-based
 * `signUp.verifications.*` / `signUp.finalize()` "future" API (the default
 * `useSignUp` export), which has an SDK bug where the returned promise can
 * hang indefinitely.
 */
export function useSignUpController() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectTo =
    rawRedirect && rawRedirect !== "/" && rawRedirect !== "/creation"
      ? rawRedirect
      : "/onboarding";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!isLoaded || !signUp) return;

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
        await signUp.create({
          emailAddress: email,
          password,
        });

        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerifying(true);
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
        setError(
          clerkErr?.errors?.[0]?.longMessage ||
            clerkErr?.errors?.[0]?.message ||
            clerkErr?.message ||
            "Failed to create account."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signUp, email, password]
  );

  const handleVerify = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!isLoaded || !signUp) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await signUp.attemptEmailAddressVerification({ code });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace(
            redirectTo && redirectTo !== "/creation" && redirectTo !== "/onboarding"
              ? `/complete?redirect=${encodeURIComponent(redirectTo)}`
              : "/complete"
          );
        } else {
          setError("Verification failed. Please try again.");
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
        setError(
          clerkErr?.errors?.[0]?.longMessage ||
            clerkErr?.errors?.[0]?.message ||
            clerkErr?.message ||
            "Invalid verification code"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signUp, code, setActive, router, redirectTo]
  );

  const handleCompleteProfile = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Update Clerk's profile and the backend record (name + onboarding
        // confirmation, folded into one PATCH) concurrently -- previously
        // this was 3 sequential/semi-sequential round trips (Clerk update,
        // backend name update, then a separate complete-onboarding call);
        // now it's a single pair of parallel requests.
        const clerkUpdate = user.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          unsafeMetadata: {
            ...user.unsafeMetadata,
            onboarding_completed: true,
          },
        });

        const [, updated] = await Promise.all([
          clerkUpdate,
          updateProfile(firstName.trim(), lastName.trim()),
          completeOnboarding().catch(() => null),
        ]);

        if (updated) {
          if (user?.id) {
            queryClient.setQueryData(["auth", "me", user.id], { data: updated, isSyncing: false });
          }
          queryClient.setQueryData(["auth", "me"], { data: updated, isSyncing: false });
        }
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

        router.push(redirectTo);
      } catch (err: unknown) {
        const clerkErr = err as { message?: string };
        setError(clerkErr?.message || "Failed to complete profile");
        setIsLoading(false);
      }
    },
    [firstName, lastName, router, user, redirectTo, queryClient]
  );

  const isReady = isLoaded && !!signUp;
  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  return {
    isLoaded,
    isReady,
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    verifying,
    error,
    setError,
    isLoading,
    handleSignUp,
    handleVerify,
    handleCompleteProfile,
    canSubmit,
    redirectTo,
  };
}
