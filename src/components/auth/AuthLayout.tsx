"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { DotMatrixCanvas } from "./DotMatrixCanvas";
import { ArrowRight, Loader2 } from "lucide-react";

interface AuthLayoutProps {
  mode: "sign-in" | "sign-up";
}

export function AuthLayout({ mode }: AuthLayoutProps) {
  const router = useRouter();
  const clerk = useClerk();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";

  const handleOAuth = async (strategy: "oauth_google" | "oauth_github" | "oauth_apple") => {
    try {
      setIsLoading(true);
      setError(null);

      if (clerk && (clerk as any).authenticateWithRedirect) {
        await (clerk as any).authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/u2XIBWLrbdEamg45Nq",
        });
      } else {
        router.push("/u2XIBWLrbdEamg45Nq");
      }
    } catch (err: any) {
      console.warn("OAuth redirect fallback to workspace:", err);
      router.push("/u2XIBWLrbdEamg45Nq");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      router.push("/u2XIBWLrbdEamg45Nq");
    } catch (err: any) {
      router.push("/u2XIBWLrbdEamg45Nq");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="h-svh overflow-auto bg-white text-zinc-900 select-none">
      <div className="flex min-h-full items-center justify-center">
        <div className="grid min-h-svh w-full grid-cols-1 md:grid-cols-2">
          {/* Left Column: Form & Auth Card */}
          <div className="flex items-center justify-center px-6 py-14 sm:px-12 bg-white">
            <div className="flex w-full max-w-sm flex-col gap-6">
              {/* Brand Header */}
              <div className="flex items-center gap-2 mb-2">
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
                  <div className="flex size-7 items-center justify-center bg-zinc-950 text-white font-mono font-bold text-xs rounded-[3.5px]">
                    ⎇
                  </div>
                  <span className="font-mono text-base font-semibold tracking-tight text-zinc-950">
                    congruence<span className="text-zinc-500">.dev</span>
                  </span>
                </Link>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {isSignUp ? "Build The Future With Congruence" : "Welcome Back"}
                </h1>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {isSignUp
                    ? "Everything your team needs to orchestrate coding agents, in one place."
                    : "Sign in to access your agent worktrees and live preview."}
                </p>
              </div>

              {/* Social Auth Buttons */}
              <div className="flex flex-col gap-2.5">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_google")}
                  disabled={isLoading}
                  className="flex h-10 w-full items-center justify-center gap-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors cursor-pointer rounded-[3.5px] shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Continue With Google</span>
                </button>

                {/* GitHub Button */}
                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_github")}
                  disabled={isLoading}
                  className="flex h-10 w-full items-center justify-center gap-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors cursor-pointer rounded-[3.5px] shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-current" fill="currentColor">
                    <path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
                  </svg>
                  <span>Continue With GitHub</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_apple")}
                  disabled={isLoading}
                  className="flex h-10 w-full items-center justify-center gap-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors cursor-pointer rounded-[3.5px] shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-current" fill="currentColor">
                    <path d="M11.6734 7.22198C10.7974 7.22198 9.44138 6.22598 8.01338 6.26198C6.12938 6.28598 4.40138 7.35397 3.42938 9.04597C1.47338 12.442 2.92538 17.458 4.83338 20.218C5.76938 21.562 6.87338 23.074 8.33738 23.026C9.74138 22.966 10.2694 22.114 11.9734 22.114C13.6654 22.114 14.1454 23.026 15.6334 22.99C17.1454 22.966 18.1054 21.622 19.0294 20.266C20.0974 18.706 20.5414 17.194 20.5654 17.11C20.5294 17.098 17.6254 15.982 17.5894 12.622C17.5654 9.81397 19.8814 8.46998 19.9894 8.40998C18.6694 6.47798 16.6414 6.26198 15.9334 6.21398C14.0854 6.06998 12.5374 7.22198 11.6734 7.22198ZM14.7934 4.38998C15.5734 3.45398 16.0894 2.14598 15.9454 0.849976C14.8294 0.897976 13.4854 1.59398 12.6814 2.52998C11.9614 3.35798 11.3374 4.68998 11.5054 5.96198C12.7414 6.05798 14.0134 5.32598 14.7934 4.38998Z" />
                  </svg>
                  <span>Continue With Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                <div className="h-[1px] flex-1 bg-zinc-200" />
                <span>Or</span>
                <div className="h-[1px] flex-1 bg-zinc-200" />
              </div>

              {/* Direct Email Form */}
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-zinc-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="h-9 w-full px-3 border border-zinc-300 bg-white text-xs text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-950 transition-colors rounded-[3.5px] font-mono"
                  />
                </div>

                {error && (
                  <div className="text-[11px] text-rose-500 font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-9 w-full items-center justify-center gap-2 bg-zinc-950 text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer rounded-[3.5px] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue With Email</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Switcher & Terms */}
              <div className="space-y-3 pt-2 text-center text-xs text-zinc-500">
                <div>
                  {isSignUp ? (
                    <span>
                      Already have an account?{" "}
                      <Link
                        href="/sign-in"
                        className="font-medium text-zinc-950 underline underline-offset-4 hover:opacity-80"
                      >
                        Sign in
                      </Link>
                    </span>
                  ) : (
                    <span>
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/sign-up"
                        className="font-medium text-zinc-950 underline underline-offset-4 hover:opacity-80"
                      >
                        Sign up
                      </Link>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-normal">
                  By continuing, you agree to Congruence&apos;s{" "}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-700">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Dot Matrix Wave Animation & White Background (Desktop) */}
          <div className="relative hidden min-h-[480px] overflow-hidden bg-white text-zinc-950 md:block border-l border-zinc-200">
            {/* Ambient Wash */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-emerald-500/8 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 size-80 rounded-full bg-blue-500/8 blur-3xl"
            />

            {/* Canvas Dot Matrix */}
            <div aria-hidden="true" className="absolute inset-0">
              <DotMatrixCanvas />
            </div>

            {/* Subtle Gradient Overlays */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40"
            />

            {/* Right Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-between p-10 lg:p-14 pointer-events-none">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-white/80 backdrop-blur-xs border border-zinc-200 text-[11px] font-mono text-zinc-600 rounded-[3.5px] shadow-2xs">
                  <span className="size-1.5 rounded-[3.5px] bg-emerald-500 animate-pulse" />
                  <span>Agent Mesh Active</span>
                </div>
              </div>

              {/* Testimonial Quote */}
              <figure className="max-w-md space-y-3 bg-white/85 backdrop-blur-xs p-5 border border-zinc-200 rounded-[3.5px] shadow-xs">
                <blockquote className="text-sm lg:text-base leading-relaxed text-zinc-800 font-normal">
                  “Since switching to Congruence, our coding agents write, test, and ship in parallel across isolated worktrees without collisions.”
                </blockquote>
                <figcaption className="text-[11px] font-mono text-zinc-500">
                  Diego Alvarez & Antigravity Research Team
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
