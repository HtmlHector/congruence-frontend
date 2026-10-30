"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GitBranch,
  KeyRound,
  ListTodo,
  Loader2,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  disconnectIntegration,
  fetchOAuthAuthorizeUrl,
  fetchWorkspaceIntegrations,
  saveCustomApiKey,
} from "@/features/integrations/api/integrations";
import type {
  IntegrationProvider,
  WorkspaceIntegration,
} from "@/features/integrations/types";
import { useAuthContext } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

import {
  SettingsPage,
  SettingsPanel,
} from "@/features/settings/components/settings-page";

const integrationsKey = ["integrations"] as const;

type ProviderDefinition = {
  id: IntegrationProvider;
  name: string;
  description: string;
  icon: LucideIcon;
};

const OAUTH_PROVIDERS: ProviderDefinition[] = [
  {
    id: "GITHUB",
    name: "GitHub",
    description: "Read repositories and CI results for workspace projects.",
    icon: GitBranch,
  },
  {
    id: "SLACK",
    name: "Slack",
    description: "Post run summaries and alerts to a workspace channel.",
    icon: MessagesSquare,
  },
  {
    id: "LINEAR",
    name: "Linear",
    description: "Create and sync issues from workspace activity.",
    icon: ListTodo,
  },
];

const CUSTOM_KEY_PROVIDERS = OAUTH_PROVIDERS.map((p) => ({
  value: p.id,
  label: p.name,
}));

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] leading-5 text-foundation-ink-secondary">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          connected ? "bg-foundation-success" : "bg-foundation-line-strong",
        )}
      />
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "unknown"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function IntegrationsSettings() {
  const { isSignedIn } = useAuthContext();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyProvider, setApiKeyProvider] = useState<IntegrationProvider>("GITHUB");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const {
    data: integrations,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: integrationsKey,
    queryFn: fetchWorkspaceIntegrations,
    enabled: isSignedIn === true,
    staleTime: 1000 * 30,
  });

  const byProvider = new Map<IntegrationProvider, WorkspaceIntegration>(
    (integrations ?? []).map((integration) => [integration.provider, integration]),
  );

  const connectMutation = useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      const redirectUri = `${window.location.origin}/oauth/callback?provider=${provider.toLowerCase()}`;
      return fetchOAuthAuthorizeUrl(provider, redirectUri);
    },
    onSuccess: (res) => {
      window.location.href = res.authorization_url;
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not start the authorization flow.");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (provider: IntegrationProvider) => disconnectIntegration(provider),
    onSuccess: (_res, provider) => {
      queryClient.invalidateQueries({ queryKey: integrationsKey });
      const name =
        OAUTH_PROVIDERS.find((definition) => definition.id === provider)?.name ?? provider;
      toast.success(`${name} disconnected.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to disconnect the integration.");
    },
  });

  const saveKeyMutation = useMutation({
    mutationFn: () =>
      saveCustomApiKey({
        provider: apiKeyProvider,
        api_key: apiKey.trim(),
        credential_type: "API_KEY",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationsKey });
      setApiKey("");
      setApiKeyError(null);
      toast.success("API key saved.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save the API key.");
    },
  });

  const submitApiKey = (event: React.FormEvent) => {
    event.preventDefault();
    if (apiKey.trim().length < 8) {
      setApiKeyError("Enter an API key of at least 8 characters.");
      return;
    }
    setApiKeyError(null);
    saveKeyMutation.mutate();
  };

  return (
    <SettingsPage
      title="Integrations"
      description="Connect external tools to this workspace. Credentials are stored server-side and scoped to this workspace."
    >
      {isPending ? (
        <div className="flex items-center gap-2 py-12 text-[13px] text-foundation-ink-secondary">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading integrations…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between gap-4 py-8">
          <p className="text-[13px] leading-5 text-foundation-ink-secondary">
            {error?.message || "Could not load integrations for this workspace."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <SettingsPanel
            title="Providers"
            description="Authorize a provider once; every project in this workspace can use it."
          >
            <ul className="divide-y divide-foundation-line">
              {OAUTH_PROVIDERS.map((provider) => {
                const Icon = provider.icon;
                const connected = byProvider.get(provider.id);
                const isPendingAction =
                  (connectMutation.isPending && connectMutation.variables === provider.id) ||
                  (disconnectMutation.isPending && disconnectMutation.variables === provider.id);

                return (
                  <li
                    key={provider.id}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-fd-md border border-foundation-line bg-foundation-sunken/60 text-foundation-ink-secondary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] leading-5 font-medium text-foundation-ink">
                          {provider.name}
                        </p>
                        <p className="mt-0.5 max-w-[52ch] text-[12px] leading-[18px] text-foundation-ink-tertiary">
                          {provider.description}
                        </p>
                        {connected ? (
                          <p className="mt-1 text-[12px] leading-[18px] text-foundation-ink-tertiary">
                            {connected.credential_type === "OAUTH_TOKEN"
                              ? `OAuth${connected.scopes.length ? ` · ${connected.scopes.join(", ")}` : ""}`
                              : `API key${connected.scopes.length ? ` · ${connected.scopes.join(", ")}` : ""}`}
                            {" · "}
                            {formatDate(connected.updated_at)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <StatusBadge connected={Boolean(connected?.is_active)} />
                      {connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPendingAction}
                          onClick={() => disconnectMutation.mutate(provider.id)}
                        >
                          {isPendingAction ? (
                            <Loader2 data-slot="icon" className="size-3.5 animate-spin" aria-hidden="true" />
                          ) : null}
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isPendingAction}
                          onClick={() => connectMutation.mutate(provider.id)}
                        >
                          {isPendingAction ? (
                            <Loader2 data-slot="icon" className="size-3.5 animate-spin" aria-hidden="true" />
                          ) : null}
                          Connect
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </SettingsPanel>

          <SettingsPanel
            title="Custom API key"
            description="Store a provider key directly when OAuth is not available. The key is saved to this workspace only."
          >
            <form onSubmit={submitApiKey} className="py-4">
              <div className="grid max-w-[520px] gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="api-key-provider"
                    className="text-[12px] font-medium text-foundation-ink-secondary"
                  >
                    Provider
                  </Label>
                  <select
                    id="api-key-provider"
                    value={apiKeyProvider}
                    onChange={(event) =>
                      setApiKeyProvider(event.target.value as IntegrationProvider)
                    }
                    className="mt-1.5 h-8 w-full rounded-fd-md border border-foundation-line-strong bg-foundation-surface px-2.5 text-sm text-foundation-ink outline-none transition-colors duration-150 ease-fd hover:border-foundation-ink-secondary focus-visible:border-foundation-ink focus-visible:foundation-focus"
                  >
                    {CUSTOM_KEY_PROVIDERS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="api-key-value"
                    className="text-[12px] font-medium text-foundation-ink-secondary"
                  >
                    API key
                  </Label>
                  <Input
                    id="api-key-value"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    onBlur={() => {
                      if (apiKey && apiKey.trim().length < 8) {
                        setApiKeyError("Enter an API key of at least 8 characters.");
                      }
                    }}
                    aria-invalid={apiKeyError ? true : undefined}
                    aria-describedby={apiKeyError ? "api-key-error" : undefined}
                    placeholder="sk_live_…"
                    className="mt-1.5 font-mono"
                  />
                </div>
              </div>

              {apiKeyError ? (
                <p
                  id="api-key-error"
                  className="mt-2 text-[12px] leading-[18px] text-foundation-danger"
                >
                  {apiKeyError}
                </p>
              ) : null}

              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="submit"
                  size="sm"
                  disabled={saveKeyMutation.isPending || apiKey.trim().length === 0}
                >
                  {saveKeyMutation.isPending ? (
                    <Loader2 data-slot="icon" className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <KeyRound data-slot="icon" className="size-3.5" aria-hidden="true" />
                  )}
                  Save API key
                </Button>
              </div>
            </form>
          </SettingsPanel>
        </>
      )}
    </SettingsPage>
  );
}
