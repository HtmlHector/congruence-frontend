"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import type { CredentialType, IntegrationProvider } from "../types";

interface CustomKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: IntegrationProvider;
  onSave: (payload: {
    provider: IntegrationProvider;
    api_key: string;
    credential_type: CredentialType;
    metadata?: Record<string, unknown>;
  }) => Promise<unknown>;
}

export function CustomKeyModal({
  isOpen,
  onClose,
  provider,
  onSave,
}: CustomKeyModalProps) {
  const [keyName, setKeyName] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isWebhook = provider === "CUSTOM_WEBHOOK";
  const title = isWebhook ? "Configure Webhook Secret" : "Store API Key";
  const label = isWebhook ? "Webhook Signing Secret" : "API Token / Key";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        provider,
        api_key: keyValue.trim(),
        credential_type: isWebhook ? "WEBHOOK_SECRET" : "API_KEY",
        metadata: keyName ? { label: keyName.trim() } : {},
      });
      setKeyName("");
      setKeyValue("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isWebhook
              ? "Store a shared secret key used to verify incoming webhook request signatures."
              : "Store an encrypted secret or API key scoped strictly to this workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="key-name">Label / Identifier (Optional)</Label>
            <Input
              id="key-name"
              placeholder="e.g. Production Inbound or Stripe Webhook"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key-value">{label}</Label>
            <Input
              id="key-value"
              type="password"
              required
              placeholder="Enter sensitive secret value..."
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !keyValue.trim()}>
              {isSubmitting ? "Saving..." : "Save Credential"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
