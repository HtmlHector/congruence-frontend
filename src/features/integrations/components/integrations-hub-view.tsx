"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { INTEGRATION_CATALOG } from "../config";
import { useIntegrations } from "../hooks/use-integrations";
import type { CredentialType, IntegrationProvider } from "../types";
import { CustomKeyModal } from "./custom-key-modal";
import { IntegrationCard } from "./integration-card";

interface IntegrationsHubViewProps {
  workspaceId: string;
}

export function IntegrationsHubView({ workspaceId }: IntegrationsHubViewProps) {
  const {
    integrations,
    isLoading,
    connectOAuth,
    isConnectingOAuth,
    disconnect,
    isDisconnecting,
    saveCustomKey,
  } = useIntegrations();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [modalProvider, setModalProvider] = useState<IntegrationProvider | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(INTEGRATION_CATALOG.map((i) => i.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredCatalog = useMemo(() => {
    return INTEGRATION_CATALOG.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  const connectedMap = useMemo(() => {
    const map = new Map<string, (typeof integrations)[number]>();
    for (const item of integrations) {
      map.set(item.provider, item);
    }
    return map;
  }, [integrations]);

  const handleConnectOAuth = (provider: IntegrationProvider) => {
    const redirectUri = `${window.location.origin}/${workspaceId}/integrations/callback?provider=${provider}`;
    connectOAuth({ provider, redirectUri });
  };

  const handleSaveCustomKey = async (payload: {
    provider: IntegrationProvider;
    api_key: string;
    credential_type: CredentialType;
    metadata?: Record<string, unknown>;
  }) => {
    await saveCustomKey(payload);
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Integration Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 animate-pulse rounded-lg border border-border/40 bg-muted/20"
            />
          ))}
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No integrations found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.map((def) => (
            <IntegrationCard
              key={def.id}
              definition={def}
              connectedIntegration={connectedMap.get(def.id)}
              onConnectOAuth={handleConnectOAuth}
              onOpenCustomKeyModal={(p) => setModalProvider(p)}
              onDisconnect={disconnect}
              isConnecting={isConnectingOAuth}
              isDisconnecting={isDisconnecting}
            />
          ))}
        </div>
      )}

      {/* Custom Key / Webhook Secret Modal */}
      {modalProvider && (
        <CustomKeyModal
          isOpen={Boolean(modalProvider)}
          provider={modalProvider}
          onClose={() => setModalProvider(null)}
          onSave={handleSaveCustomKey}
        />
      )}
    </div>
  );
}
