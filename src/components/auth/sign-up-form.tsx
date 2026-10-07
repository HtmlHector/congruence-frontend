"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BadgeCheck, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "./auth-input";
import { OAuthButtons } from "./oauth-buttons";
import { toast } from "sonner";

export interface SignUpFormProps {
  signInHref?: string;
  defaultRedirect?: string;
  allowOAuth?: boolean;
}

export function SignUpForm({
  signInHref = "/login",
  defaultRedirect = "/dashboard",
  allowOAuth = true,
}: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || defaultRedirect;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification Stage
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";
      const callbackUrl = `${origin}/auth/callback${
        redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
      }`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
        return;
      }

      // If user session is created immediately (email confirmation disabled in Supabase)
      if (data.session) {
        toast.success("Account created successfully!");
        router.push(redirectTo);
        router.refresh();
      } else {
        // Email confirmation is required
        setVerifying(true);
        toast.info("Verification email sent! Check your inbox.");
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to create account.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setVerifyLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "signup",
      });

      if (verifyError) {
        setError(verifyError.message);
        toast.error(verifyError.message);
        return;
      }

      toast.success("Email verified successfully!");
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const msg = err?.message || "Verification code is invalid or expired.";
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted/60 text-foreground">
            <MailCheck className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-[-0.03em] text-foreground leading-tight">
            Check your inbox
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
            We sent a verification confirmation to{" "}
            <span className="font-medium text-foreground">{email}</span>. Enter the 6-digit code or click the confirmation link.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <AuthInput
            label="Verification code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoComplete="one-time-code"
            className="font-mono text-center text-[20px] tracking-[0.35em] h-[46px]"
            maxLength={6}
            required
            autoFocus
          />

          {error && (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-[12.5px] text-destructive leading-relaxed animate-in fade-in"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={verifyLoading || code.length !== 6}
            className="group inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-md bg-foreground text-background text-[13.5px] font-medium transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {verifyLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <BadgeCheck className="w-4 h-4" />
                <span>Verify & Continue</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setVerifying(false)}
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-center mt-2"
          >
            ← Back to sign up
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-[-0.03em] text-foreground leading-tight">
          Create an account
        </h1>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
          Join the workspace to architect, specify, and build with clarity.
        </p>
      </div>

      {/* OAuth Section */}
      {allowOAuth && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10.5px] font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Start with
            </p>
            <OAuthButtons
              mode="sign-up"
              onError={setError}
              disabled={loading}
              redirectTo={redirectTo}
            />
          </div>

          <div className="flex items-center gap-3 my-4" aria-hidden="true">
            <div className="h-px flex-1 bg-border/70" />
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60">
              or email
            </span>
            <div className="h-px flex-1 bg-border/70" />
          </div>
        </div>
      )}

      {/* Email Password Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        <AuthInput
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
          required
          disabled={loading}
        />

        <AuthInput
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint="Min. 8 chars"
          required
          disabled={loading}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        {error && (
          <div
            className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-[12.5px] text-destructive leading-relaxed animate-in fade-in"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="group inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-md bg-foreground text-background text-[13.5px] font-medium transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="pt-2 border-t border-border/50 text-[12.5px] text-muted-foreground text-center sm:text-left">
        Already have an account?{" "}
        <Link
          href={
            redirectTo !== defaultRedirect
              ? `${signInHref}?redirect=${encodeURIComponent(redirectTo)}`
              : signInHref
          }
          className="font-medium text-foreground underline underline-offset-4 decoration-border/80 hover:decoration-foreground transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
