import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "Sign in · Parabox",
  description: "Sign in to your Parabox workspace.",
};

export default function LoginPage() {
  return (
    <AuthShell mode="sign-in">
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Loading session…
          </div>
        }
      >
        <SignInForm signUpHref="/signup" defaultRedirect="/dashboard" />
      </Suspense>
    </AuthShell>
  );
}
