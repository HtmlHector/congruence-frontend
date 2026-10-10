"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  type ICreateCheckoutSessionInput,
  type ICreatePortalSessionInput,
} from "../api/billing";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-message";

export function useSubscriptionQuery(workspaceId?: string | null) {
  return useQuery({
    queryKey: ["billing", "subscription", workspaceId],
    queryFn: getSubscription,
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (input: ICreateCheckoutSessionInput) => createCheckoutSession(input),
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: (input: ICreatePortalSessionInput) => createPortalSession(input),
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
