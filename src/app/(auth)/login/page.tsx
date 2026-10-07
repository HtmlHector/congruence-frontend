import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in · Congruence",
  description: "Sign in to your Congruence workspace.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
          <div className="flex h-6 w-6 flex-col justify-center gap-[3px] rounded-[3px] bg-[var(--surface-tertiary)] p-1 border border-[var(--border)] group-hover:border-[var(--muted-foreground)] transition-colors">
            <span className="h-[2px] w-full rounded-full bg-[var(--foreground)]" />
            <span className="h-[2px] w-3/4 rounded-full bg-[var(--muted-foreground)]" />
            <span className="h-[2px] w-full rounded-full bg-[var(--foreground)]" />
          </div>
          <span className="font-mono text-base font-medium tracking-tight text-[var(--foreground)]">
            congruence<span className="text-[var(--muted-foreground)]">.dev</span>
          </span>
        </Link>
        <p className="text-xs text-[var(--muted-foreground)] font-mono">
          Pick up where you left off.
        </p>
      </div>

      {/* Clerk Sign In Component */}
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/workspace"
      />
    </div>
  );
}
