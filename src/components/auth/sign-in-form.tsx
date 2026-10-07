"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "./auth-input";
import { OAuthButtons } from "./oauth-buttons";
import { toast } from "sonner";

export interface SignInFormProps {
  signUpHref?: string;
  defaultRedirect?: string;
  allowOAuth?: boolean;
}

export function SignInForm({
  signUpHref = "/signup",
  defaultRedirect = "/dashboard",
  allowOAuth = true,
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || defaultRedirect;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        toast.error(signInError.message);
        return;
      }

      toast.success("Welcome back!");
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const msg = err?.message || "Failed to sign in. Please verify your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-[-0.03em] text-foreground leading-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
          Sign in to your workspace to manage specifications and builds.
        </p>
      </div>

      {/* OAuth Section */}
      {allowOAuth && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10.5px] font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Continue with
            </p>
            <OAuthButtons
              mode="sign-in"
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
      <form onSubmit={handleSignIn} className="space-y-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
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
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="pt-2 border-t border-border/50 text-[12.5px] text-muted-foreground text-center sm:text-left">
        Don&apos;t have an account?{" "}
        <Link
          href={
            redirectTo !== defaultRedirect
              ? `${signUpHref}?redirect=${encodeURIComponent(redirectTo)}`
              : signUpHref
          }
          className="font-medium text-foreground underline underline-offset-4 decoration-border/80 hover:decoration-foreground transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
