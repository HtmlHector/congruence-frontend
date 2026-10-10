"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  GitBranch,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  Unplug,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IntegrationDefinition, WorkspaceIntegration } from "../types";

interface IntegrationCardProps {
  definition: IntegrationDefinition;
  connectedIntegration?: WorkspaceIntegration;
  onConnectOAuth: (provider: IntegrationDefinition["id"]) => void;
  onOpenCustomKeyModal: (provider: IntegrationDefinition["id"]) => void;
  onDisconnect: (provider: IntegrationDefinition["id"]) => void;
  isConnecting: boolean;
  isDisconnecting: boolean;
}

export function IntegrationCard({
  definition,
  connectedIntegration,
  onConnectOAuth,
  onOpenCustomKeyModal,
  onDisconnect,
  isConnecting,
  isDisconnecting,
}: IntegrationCardProps) {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const isConnected = Boolean(connectedIntegration && connectedIntegration.is_active);

  const getIcon = () => {
    switch (definition.id) {
      case "GITHUB":
        return <GitBranch className="h-5 w-5 text-foreground" />;
      case "SLACK":
        return <MessageSquare className="h-5 w-5 text-emerald-500" />;
      case "LINEAR":
        return <ShieldCheck className="h-5 w-5 text-indigo-500" />;
      case "CUSTOM_API_KEY":
        return <KeyRound className="h-5 w-5 text-amber-500" />;
      case "CUSTOM_WEBHOOK":
        return <Webhook className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <Card className="flex flex-col justify-between border-border bg-card transition-all hover:border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{definition.name}</CardTitle>
              <span className="text-xs text-muted-foreground">{definition.category}</span>
            </div>
          </div>
          {isConnected ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              Not connected
            </span>
          )}
        </div>
        <CardDescription className="pt-2 text-xs leading-relaxed">
          {definition.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 py-0 text-xs text-muted-foreground">
        {isConnected && connectedIntegration?.scopes && connectedIntegration.scopes.length > 0 && (
          <div className="rounded border border-border/50 bg-muted/20 p-2 font-mono text-[11px]">
            Scopes: {connectedIntegration.scopes.join(", ")}
          </div>
        )}
        {isConnected && connectedIntegration?.metadata && Object.keys(connectedIntegration.metadata).length > 0 && (
          <div className="text-[11px] text-muted-foreground">
            Account:{" "}
            {String(
              connectedIntegration.metadata.account_login ||
                connectedIntegration.metadata.label ||
                "Configured"
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4">
        {definition.docsUrl ? (
          <a
            href={definition.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
          >
            Docs <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {isConnected ? (
            confirmDisconnect ? (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  disabled={isDisconnecting}
                  onClick={() => {
                    onDisconnect(definition.id);
                    setConfirmDisconnect(false);
                  }}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => setConfirmDisconnect(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDisconnect(true)}
              >
                <Unplug className="h-3.5 w-3.5" />
                Disconnect
              </Button>
            )
          ) : definition.isOAuth ? (
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={isConnecting}
              onClick={() => onConnectOAuth(definition.id)}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs"
              onClick={() => onOpenCustomKeyModal(definition.id)}
            >
              Configure Key
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
