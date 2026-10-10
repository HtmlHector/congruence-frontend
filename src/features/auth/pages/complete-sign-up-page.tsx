"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignUpController } from "../hooks/use-sign-up-controller";
import { AuthInput } from "../components/auth-input";
import {
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuthContext } from "@/providers/auth-provider";
import { useWorkspacesQuery } from "@/features/workspace/hooks/use-workspaces-query";
import { getLastWorkspaceId } from "@/lib/last-workspace";

/**
 * Enterprise Complete Sign Up page.
 * Split-screen layout with live operator identity preview and editorial art panel.
 */
export function CompleteSignUpPage() {
  const { user } = useUser();
  const router = useRouter();
  const { isLoading: isAuthLoading, onboardingCompleted, lastWorkspaceId } = useAuthContext();
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useWorkspacesQuery();
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    isLoading,
    error,
    handleCompleteProfile,
    canSubmit,
    redirectTo,
  } = useSignUpController();

  useEffect(() => {
    if (user?.firstName && !firstName) setFirstName(user.firstName);
    if (user?.lastName && !lastName) setLastName(user.lastName);
  }, [user, firstName, lastName, setFirstName, setLastName]);

  useEffect(() => {
    if (isAuthLoading || isWorkspacesLoading) return;

    if (onboardingCompleted) {
      const hasWorkspace = Boolean(
        lastWorkspaceId ||
        getLastWorkspaceId(user?.id) ||
        workspaces.length > 0
      );

      if (hasWorkspace) {
        const dest =
          redirectTo && redirectTo !== "/onboarding" && redirectTo !== "/creation"
            ? redirectTo
            : "/";
        router.replace(dest);
      } else {
        const dest =
          redirectTo && redirectTo !== "/creation"
            ? redirectTo
            : "/onboarding";
        router.replace(dest);
      }
    }
  }, [
    isAuthLoading,
    isWorkspacesLoading,
    onboardingCompleted,
    lastWorkspaceId,
    user?.id,
    workspaces.length,
    redirectTo,
    router,
  ]);

  if (isAuthLoading || onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-[12px] font-mono tracking-wide text-muted-foreground">
            INITIALIZING WORKSPACE SESSION…
          </p>
        </div>
      </div>
    );
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress || "operator@company.com";
  const firstInitial = firstName.trim() ? firstName.trim().charAt(0).toUpperCase() : "";
  const lastInitial = lastName.trim() ? lastName.trim().charAt(0).toUpperCase() : "";
  const emailInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "O";
  const initials = (firstInitial + lastInitial) || emailInitial || "OP";

  const displayName =
    firstName.trim() || lastName.trim()
      ? `${firstName} ${lastName}`.trim()
      : "Unnamed Operator";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit && !isLoading) {
      handleCompleteProfile();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* Left Column: Form & Live Identity Configuration */}
        <section className="relative flex min-h-screen flex-col justify-center overflow-y-auto bg-background border-r border-border/40 px-6 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12">
          {/* Center Form Section */}
          <main className="my-auto w-full max-w-[460px] mx-auto py-4">
            {/* Headline */}
            <h1 className="font-sora text-[28px] sm:text-[34px] font-normal tracking-[-0.025em] text-foreground leading-[1.15] mb-2.5">
              What&apos;s your name?
            </h1>
            <p className="text-[14px] leading-relaxed text-muted-foreground mb-6">
              Shows up on automated test suites, PR verifications, and fleet audit logs.
            </p>

            {/* Live Identity Preview Card (High Visual Density & Polish) */}
            <div className="mb-6 rounded-[6px] border border-border bg-card/70 p-4 shadow-sm backdrop-blur-xs transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                  Live Identity Preview
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-foreground text-background font-mono text-[14px] font-bold tracking-tight shadow-sm ring-1 ring-border/50">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={displayName}
                      width={44}
                      height={44}
                      className="rounded-[5px] object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-foreground tracking-[-0.01em]">
                    {displayName}
                  </p>
                  <p className="truncate text-[12px] font-mono text-muted-foreground/80 mt-0.5">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit && !isLoading) handleCompleteProfile();
              }}
              onKeyDown={handleKeyDown}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <AuthInput
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Hector"
                  autoFocus
                  required
                />
                <AuthInput
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Lovelace"
                  required
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="btn-surface-dark group/button mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[3.5px] text-[14.5px] font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm hover:shadow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning profile…</span>
                  </>
                ) : (
                  <>
                    <span>Continue to workspace setup</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-[var(--duration-fast)] group-hover/button:translate-x-1" />
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div
                  className="rounded-[3.5px] border border-destructive/30 bg-destructive/[0.08] px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-destructive animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  {error}
                </div>
              )}
            </form>
          </main>
        </section>

        {/* Right Column: Editorial Artwork & Assurance Panel */}
        <aside
          className="relative hidden min-h-screen overflow-hidden bg-[#0A0B0E] lg:block lg:h-screen lg:min-h-0"
          aria-label="Traceback AI quality assurance overview"
        >
          {/* Artwork backdrop */}
          <Image
            src="/assets/HJ0-oP8bYAA3KYj.jpeg"
            alt="Traceback QA artwork"
            fill
            priority
            sizes="(max-width: 1024px) 0vw, 50vw"
            className="object-cover object-center"
          />

          {/* Smooth bottom-up vignette gradient for text contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,11,14,0.05) 0%, rgba(10,11,14,0.2) 40%, rgba(10,11,14,0.8) 80%, rgba(10,11,14,0.92) 100%)",
            }}
          />

          {/* Editorial Content Area */}
          <div className="relative z-10 flex flex-col justify-end h-full p-10 lg:p-14 text-white">
            <div className="max-w-[440px] space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3.5px] border border-white/20 bg-black/40 backdrop-blur-md text-[10.5px] font-mono uppercase tracking-[0.12em] text-white/90 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4AA84] animate-pulse" />
                <span>Autonomous Quality System</span>
              </div>

              <h2 className="font-sora text-[28px] sm:text-[34px] font-medium tracking-tight text-white leading-[1.15]">
                Complete your profile.
              </h2>

              <p className="text-[14px] leading-relaxed text-white/80 font-normal">
                Configure your operator identity to start running autonomous tests across your workspace.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
