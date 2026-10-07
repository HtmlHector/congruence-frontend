import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Create Account · Parabox",
  description: "Join the workspace to architect and build.",
};

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Loading session…
          </div>
        }
      >
        <SignUpForm signInHref="/login" defaultRedirect="/dashboard" />
      </Suspense>
    </AuthShell>
  );
}
