"use client";

import { useSignUpController } from "@/features/auth/hooks/use-sign-up-controller";
import { MinimalAuthShell } from "@/features/auth/components/minimal-auth-shell";
import { AuthInput } from "@/features/auth/components/auth-input";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const {
    isReady,
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    verifying,
    error,
    setError,
    isLoading,
    handleSignUp,
    handleVerify,
    redirectTo,
  } = useSignUpController();

  if (verifying) {
    return (
      <MinimalAuthShell mode="verify">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a verification code to <span className="font-semibold text-foreground">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <AuthInput
            label="Verification code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            autoFocus
            required
          />

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? "Verifying…" : "Confirm code"}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </form>
      </MinimalAuthShell>
    );
  }

  return (
    <MinimalAuthShell mode="sign-up">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started with your collaborative workspace.
        </p>
      </div>

      <section aria-label="Sign up options" className="space-y-4">
        <div>
          <OAuthButtons
            mode="sign-up"
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

        <form onSubmit={handleSignUp} className="space-y-4">
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            disabled={isLoading || !isReady || !email.trim() || password.length < 8}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? "Creating account…" : "Create account"}</span>
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
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </MinimalAuthShell>
  );
}
