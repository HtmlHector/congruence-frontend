"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { completeOAuthCallback } from "@/features/integrations/api/integrations";
import type { IntegrationProvider } from "@/features/integrations/types";

// The provider redirects here directly, so this route cannot contain the
// workspace id: one registered callback URL has to serve every workspace. The
// backend recovers the workspace from the signed state and hands it back.
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const provider = (searchParams.get("provider") ?? "github").toUpperCase() as IntegrationProvider;

  const missingParams = !code || !state;

  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    missingParams ? "error" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    missingParams ? "Missing authorization code or state token from provider redirect." : null,
  );

  useEffect(() => {
    if (!code || !state) return;

    const redirectUri = `${window.location.origin}/oauth/callback?provider=${provider.toLowerCase()}`;

    completeOAuthCallback(provider, code, state, redirectUri)
      .then((res) => {
        setStatus("success");
        toast.success(`Successfully connected ${res.provider}!`);
        router.replace(`/${res.workspace_id}/settings`);
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMessage(err.message || "Failed to exchange OAuth token.");
        toast.error("OAuth handshake failed.");
      });
  }, [code, state, provider, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          {status === "loading" && (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
              <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            </div>
          )}
          {status === "success" && (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          )}
          {status === "error" && (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
          )}

          <CardTitle className="pt-3 text-lg">
            {status === "loading" && `Connecting ${provider}...`}
            {status === "success" && "Connected Successfully!"}
            {status === "error" && "Connection Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" &&
              "Verifying signed state and exchanging temporary credentials with the provider."}
            {status === "success" &&
              `Your workspace is now securely linked to ${provider}.`}
            {status === "error" &&
              (errorMessage || "An unexpected error occurred during the OAuth exchange.")}
          </CardDescription>
        </CardHeader>

        <CardContent />

        <CardFooter className="flex justify-center border-t border-border/50 pt-4">
          <Button onClick={() => router.push("/")} disabled={status === "loading"}>
            Back to workspace
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
