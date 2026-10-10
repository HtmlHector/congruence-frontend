"use client";

import Image from "next/image";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * SSO / OAuth callback page.
 *
 * Google/GitHub redirect here after authentication. We read the intended
 * redirect from sessionStorage synchronously (it's available at render time —
 * no useEffect needed) so AuthenticateWithRedirectCallback is mounted
 * immediately. If we delay rendering it via useEffect, Clerk may consume
 * the OAuth URL params before the component mounts and fall back to its
 * hosted domain.
 *
 * Both signUpForceRedirectUrl and signInForceRedirectUrl point at /complete.
 * OAuthButtons initiates every OAuth attempt via `signIn.authenticateWithRedirect()`
 * (not a SignUp resource), so Clerk always completes it through the sign-in
 * branch here — even for a brand-new account — meaning signUpForceRedirectUrl
 * never actually fires in practice. Routing both branches through /complete
 * is what makes "always confirm your name after OAuth" work regardless of
 * which branch Clerk resolves. /complete forwards the original destination
 * (in `redirectTo`, read from sessionStorage below) once the user confirms.
 */
export default function SSOCallback() {
  let stored: string | null = null;

  try {
    stored = sessionStorage.getItem("tb_oauth_redirect");
    sessionStorage.removeItem("tb_oauth_redirect");
  } catch {
    // sessionStorage unavailable (SSR or private browsing) — ignore
  }

  const targetUrl = stored
    ? stored.startsWith("/complete")
      ? stored
      : `/complete?redirect=${encodeURIComponent(stored)}`
    : "/complete";

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background">
        <div className="sso-mark w-10 h-10 rounded-[9px] overflow-hidden">
          <Image src="/assets/logo.png" alt="" width={40} height={40} className="object-cover" />
        </div>

        <p
          className="text-[18px] text-foreground/85 tracking-[-0.005em]"
          style={{ fontFamily: "var(--app-font-display)" }}
        >
          Setting up your experience
        </p>

        <div className="flex items-center gap-[5px] text-muted-foreground">
          <span className="sso-dot" />
          <span className="sso-dot" />
          <span className="sso-dot" />
        </div>
      </div>

      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl={targetUrl}
        signInForceRedirectUrl={targetUrl}
      />

      <style>{`
        .sso-mark {
          animation: sso-breathe 2.4s ease-in-out infinite;
        }
        @keyframes sso-breathe {
          0%, 100% { opacity: 0.4; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1); }
        }
        .sso-dot {
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.3;
          animation: sso-dot-pulse 1.3s ease-in-out infinite;
        }
        .sso-dot:nth-child(2) { animation-delay: 0.15s; }
        .sso-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes sso-dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sso-mark, .sso-dot { animation: none; }
        }
      `}</style>
    </>
  );
}
