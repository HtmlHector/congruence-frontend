"use client";

import { useEffect } from "react";
import { setWorkspaceId } from "@/lib/api";

export function WorkspaceBinder({ workspaceId }: { workspaceId: string }) {
  useEffect(() => {
    setWorkspaceId(workspaceId);
    return () => {
      setWorkspaceId(null);
    };
  }, [workspaceId]);

  return null;
}
