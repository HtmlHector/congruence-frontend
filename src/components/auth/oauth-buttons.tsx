"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, Loader2 } from "lucide-react";

export interface OAuthButtonsProps {
  onStart?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  redirectTo?: string;
  mode?: "sign-in" | "sign-up";
  allowSso?: boolean;
}

export function OAuthButtons({
  onStart,
  onError,
  disabled,
  redirectTo,
  mode = "sign-in",
  allowSso = true,
}: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [ssoMode, setSsoMode] = useState(false);
  const [ssoEmail, setSsoEmail] = useState("");

  const supabase = createClient();

  const handleOAuth = async (provider: "google" | "github") => {
    onStart?.();
    setLoadingProvider(provider);

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";
      const callbackUrl = `${origin}/auth/callback${
        redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        onError?.(error.message);
        setLoadingProvider(null);
      }
    } catch (err: any) {
      onError?.(err?.message || "Failed to initiate social login.");
      setLoadingProvider(null);
    }
  };

  const handleEnterpriseSso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoEmail.trim()) return;

    onStart?.();
    setLoadingProvider("sso");

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";
      const callbackUrl = `${origin}/auth/callback${
        redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
      }`;

      // In Supabase, SSO with domain/SAML or OTP magic link can be used
      const { error } = await supabase.auth.signInWithOtp({
        email: ssoEmail.trim(),
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        onError?.(error.message);
        setLoadingProvider(null);
      } else {
        setLoadingProvider(null);
        setSsoMode(false);
        onError?.("Magic login link sent to your work email. Check your inbox.");
      }
    } catch (err: any) {
      onError?.(err?.message || "Enterprise SSO login failed.");
      setLoadingProvider(null);
    }
  };

  if (ssoMode) {
    return (
      <form onSubmit={handleEnterpriseSso} className="flex flex-col gap-3 w-full">
        <div>
          <label className="text-[12.5px] font-medium text-foreground/85 block mb-1.5">
            Work email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              autoFocus
              required
              placeholder="you@company.com"
              value={ssoEmail}
              onChange={(e) => setSsoEmail(e.target.value)}
              disabled={disabled || loadingProvider === "sso"}
              className="w-full h-[42px] pl-10 pr-3.5 bg-background border border-border rounded-md text-[13.5px] text-foreground placeholder:text-muted-foreground/45 outline-none transition-all duration-150 hover:border-foreground/30 focus:border-foreground/60 focus:ring-2 focus:ring-foreground/5 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || loadingProvider === "sso" || !ssoEmail.trim()}
          className="flex items-center justify-center gap-2 w-full h-[42px] px-3.5 rounded-md bg-foreground text-background text-[13.5px] font-medium transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loadingProvider === "sso" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          <span>{loadingProvider === "sso" ? "Sending Link…" : "Send Work Magic Link"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSsoMode(false);
            setSsoEmail("");
          }}
          disabled={loadingProvider === "sso"}
          className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors self-center mt-1"
        >
          {mode === "sign-up" ? "← Back to all sign-up options" : "← Back to all sign-in options"}
        </button>
      </form>
    );
  }

  const actionText = mode === "sign-up" ? "Sign up" : "Sign in";

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={disabled || (!!loadingProvider && loadingProvider !== "google")}
        className={cn(
          "flex items-center justify-center gap-2.5 w-full h-[42px] px-3.5 rounded-md border border-border/80 bg-background text-foreground text-[13.5px] font-medium transition-all duration-150",
          "hover:bg-muted/50 hover:border-foreground/30 active:scale-[0.99]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          loadingProvider === "google" && "cursor-wait"
        )}
      >
        {loadingProvider === "google" ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon />
        )}
        <span>{actionText} with Google</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("github")}
        disabled={disabled || (!!loadingProvider && loadingProvider !== "github")}
        className={cn(
          "flex items-center justify-center gap-2.5 w-full h-[42px] px-3.5 rounded-md border border-border/80 bg-background text-foreground text-[13.5px] font-medium transition-all duration-150",
          "hover:bg-muted/50 hover:border-foreground/30 active:scale-[0.99]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          loadingProvider === "github" && "cursor-wait"
        )}
      >
        {loadingProvider === "github" ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <GithubIcon />
        )}
        <span>{actionText} with GitHub</span>
      </button>

      {allowSso && (
        <button
          type="button"
          onClick={() => setSsoMode(true)}
          disabled={disabled || !!loadingProvider}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full h-[42px] px-3.5 rounded-md border border-border/80 bg-background text-foreground text-[13.5px] font-medium transition-all duration-150",
            "hover:bg-muted/50 hover:border-foreground/30 active:scale-[0.99]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Lock className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
          <span>Continue with SSO / Work Email</span>
        </button>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}
