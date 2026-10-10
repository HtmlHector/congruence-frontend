import { CompleteSignUpPage } from "@/features/auth/pages/complete-sign-up-page";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Complete Sign Up" };

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-7 h-7 border-2 border-border border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <CompleteSignUpPage />
    </Suspense>
  );
}
