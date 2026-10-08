"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function WorkspaceRedirectPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    // 1. Check local storage for last active tenant ID
    if (typeof window !== "undefined") {
      const savedTenantId = localStorage.getItem("congruence_active_tenant");
      if (savedTenantId && savedTenantId.trim()) {
        router.replace(`/${savedTenantId.trim()}`);
        return;
      }
    }

    // 2. Fetch user's workspaces from DB
    async function resolveTenantAndRedirect() {
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const targetId = rows[0].workspace_id || rows[0].slug;
            if (typeof window !== "undefined") {
              localStorage.setItem("congruence_active_tenant", targetId);
            }
            router.replace(`/${targetId}`);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to resolve workspace:", err);
      }

      // Fallback: create default workspace if none exists
      try {
        const createRes = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Personal Workspace", plan: "PRO" }),
        });
        if (createRes.ok) {
          const row = await createRes.json();
          const targetId = row.workspace_id || row.slug;
          if (typeof window !== "undefined") {
            localStorage.setItem("congruence_active_tenant", targetId);
          }
          router.replace(`/${targetId}`);
          return;
        }
      } catch (err) {
        console.error("Failed to auto-create workspace:", err);
      }
    }

    resolveTenantAndRedirect();
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <span className="animate-spin text-emerald-500">⠋</span>
        <span>Redirecting to your workspace...</span>
      </div>
    </div>
  );
}
