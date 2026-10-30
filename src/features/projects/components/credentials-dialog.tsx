"use client";

import { useState } from "react";
import { KeyRound, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  useCredentialsQuery,
  useRevokeCredential,
  useStoreApiKey,
} from "../hooks/use-projects";
import type { CredentialProvider } from "../types";
import { StatusPill, toneForStatus } from "./status-pill";

const PROVIDER_LABEL: Record<CredentialProvider, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "Codex (OpenAI)",
};

export function CredentialsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const credentials = useCredentialsQuery();
  const storeApiKey = useStoreApiKey();
  const revoke = useRevokeCredential();

  const [provider, setProvider] = useState<CredentialProvider>("anthropic");
  const [value, setValue] = useState("");

  const active = credentials.data ?? [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    try {
      await storeApiKey.mutateAsync({ provider, value: value.trim() });
      setValue("");
    } catch {
      // Toast is raised by the mutation.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Agent credentials</DialogTitle>
          <DialogDescription>
            Credentials are encrypted, private to you, and injected only into the
            terminals you open — a teammate on the same devbox never sees them.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          {(Object.keys(PROVIDER_LABEL) as CredentialProvider[]).map((key) => {
            const credential = active.find((item) => item.provider === key);
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-fd-md border border-foundation-line bg-foundation-surface px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-fd-xs bg-foundation-sunken text-foundation-ink-secondary">
                    <KeyRound className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foundation-ink">
                      {PROVIDER_LABEL[key]}
                    </p>
                    <p className="truncate text-[11px] text-foundation-ink-tertiary">
                      {credential
                        ? `${credential.kind === "oauth" ? "Subscription" : "API key"} · ${credential.status}`
                        : "Not connected"}
                    </p>
                  </div>
                </div>

                {credential ? (
                  <div className="flex items-center gap-2">
                    <StatusPill
                      label={credential.status}
                      tone={toneForStatus(credential.status)}
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Revoke ${PROVIDER_LABEL[key]}`}
                      disabled={revoke.isPending}
                      onClick={() => revoke.mutate(key)}
                    >
                      <Trash2 className="size-3" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <StatusPill label="missing" tone="neutral" />
                )}
              </div>
            );
          })}
        </section>

        <form onSubmit={handleSubmit} className="space-y-3 border-t border-foundation-line pt-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <label className="sr-only" htmlFor="credential-provider">
              Provider
            </label>
            <select
              id="credential-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value as CredentialProvider)}
              className="h-8 rounded-fd-md border border-foundation-line-strong bg-foundation-surface px-2 text-sm text-foundation-ink outline-none focus-visible:border-foundation-ink focus-visible:foundation-focus"
            >
              <option value="anthropic">Claude</option>
              <option value="openai">Codex</option>
            </select>

            <div>
              <label className="sr-only" htmlFor="credential-value">
                API key
              </label>
              <Input
                id="credential-value"
                type="password"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Anthropic or OpenAI API key"
                autoComplete="off"
              />
            </div>
          </div>

          <p className="text-[11px] text-foundation-ink-tertiary">
            Using a Claude Pro/Max or ChatGPT subscription? The guided{" "}
            <span className="font-mono">claude login</span> flow runs inside a worktree
            terminal and ships with the terminal gateway.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={storeApiKey.isPending}
            >
              Close
            </Button>
            <Button type="submit" disabled={!value.trim() || storeApiKey.isPending}>
              {storeApiKey.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="size-3.5" aria-hidden="true" />
              )}
              Save key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
