"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectIntegration,
  fetchOAuthAuthorizeUrl,
  fetchWorkspaceIntegrations,
  saveCustomApiKey,
} from "../api/integrations";
import type { CustomApiKeyPayload, IntegrationProvider } from "../types";

export const INTEGRATIONS_QUERY_KEY = ["workspace", "integrations"];

export function useIntegrations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: fetchWorkspaceIntegrations,
  });

  const connectOAuthMutation = useMutation({
    mutationFn: async ({
      provider,
      redirectUri,
    }: {
      provider: IntegrationProvider;
      redirectUri: string;
    }) => {
      return fetchOAuthAuthorizeUrl(provider, redirectUri);
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to initiate authorization: ${err.message}`);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      await disconnectIntegration(provider);
    },
    onSuccess: () => {
      toast.success("Integration disconnected successfully.");
      void queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY });
    },
    onError: (err: Error) => {
      toast.error(`Failed to disconnect integration: ${err.message}`);
    },
  });

  const saveCustomKeyMutation = useMutation({
    mutationFn: async (payload: CustomApiKeyPayload) => {
      return saveCustomApiKey(payload);
    },
    onSuccess: () => {
      toast.success("Credential saved successfully.");
      void queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY });
    },
    onError: (err: Error) => {
      toast.error(`Failed to save credential: ${err.message}`);
    },
  });

  return {
    integrations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    connectOAuth: connectOAuthMutation.mutate,
    isConnectingOAuth: connectOAuthMutation.isPending,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    saveCustomKey: saveCustomKeyMutation.mutateAsync,
    isSavingCustomKey: saveCustomKeyMutation.isPending,
  };
}
