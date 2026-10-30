"use client";

import { useSignInController } from "@/features/auth/hooks/use-sign-in-controller";
import { MinimalAuthShell } from "@/features/auth/components/minimal-auth-shell";
import { AuthInput } from "@/features/auth/components/auth-input";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function SignInPage() {
  const {
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
  } = useSignInController();

  const [showPwd, setShowPwd] = useState(false);

  return (
    <MinimalAuthShell mode="sign-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your workspace to continue.
        </p>
      </div>

      <section aria-label="Sign in options" className="space-y-4">
        <div>
          <OAuthButtons
            mode="sign-in"
            onError={setError}
            disabled={isLoading}
            redirectTo={redirectTo}
          />
        </div>

        <div className="flex items-center gap-3 my-4" aria-hidden="true">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            or with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <AuthInput
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />

          <AuthInput
            label="Password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            }
          />

          <button
            type="submit"
            disabled={isLoading || !isReady || !email.trim()}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? "Signing in…" : "Sign in"}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </form>
      </section>

      <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </MinimalAuthShell>
  );
}
