export const LAST_WORKSPACE_STORAGE_KEY = "tb_last_workspace_id";
export const LAST_WORKSPACE_COOKIE_KEY = "tb_last_workspace_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getStorageKey(userId?: string | null): string {
  return userId ? `${LAST_WORKSPACE_STORAGE_KEY}_${userId}` : LAST_WORKSPACE_STORAGE_KEY;
}

function getCookieKey(userId?: string | null): string {
  return userId ? `tb_last_workspace_${userId}` : LAST_WORKSPACE_COOKIE_KEY;
}

/**
 * Client-side cache of the last-visited workspace ID, read synchronously
 * on app load for an instant redirect — before the network round-trip to
 * GET /auth/me (which holds the durable, cross-device value) resolves.
 *
 * Scoped to the authenticated userId so that logging out, deleting an account,
 * or switching users never causes a new user to inherit a previous user's workspace.
 */
export function getLastWorkspaceId(userId?: string | null): string | null {
  if (!userId) return null;

  try {
    return localStorage.getItem(getStorageKey(userId));
  } catch {
    // localStorage unavailable (SSR, private browsing) — ignore
    return null;
  }
}

export function setLastWorkspaceId(workspaceId: string, userId?: string | null): void {
  if (!workspaceId) return;

  try {
    if (userId) {
      localStorage.setItem(getStorageKey(userId), workspaceId);
    }
    // Clean up legacy unscoped keys
    localStorage.removeItem(LAST_WORKSPACE_STORAGE_KEY);
    localStorage.removeItem("lastWorkspaceId");
  } catch {
    // localStorage unavailable — ignore
  }

  if (typeof document !== "undefined") {
    try {
      const isSecure =
        typeof window !== "undefined" && window.location.protocol === "https:";
      const secureFlag = isSecure ? "; Secure" : "";

      if (userId) {
        document.cookie = `${getCookieKey(userId)}=${encodeURIComponent(
          workspaceId
        )}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax${secureFlag}`;
      }

      // Clean up legacy unscoped cookie
      document.cookie = `${LAST_WORKSPACE_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch {
      // document.cookie unavailable — ignore
    }
  }
}

/**
 * Clears the cached workspace ID after it turns out to be dead (deleted,
 * or the user no longer has access).
 */
export function clearLastWorkspaceId(userId?: string | null): void {
  try {
    if (userId) {
      localStorage.removeItem(getStorageKey(userId));
    }
    localStorage.removeItem(LAST_WORKSPACE_STORAGE_KEY);
    localStorage.removeItem("lastWorkspaceId"); // legacy key
  } catch {
    // localStorage unavailable — ignore
  }

  if (typeof document !== "undefined") {
    try {
      if (userId) {
        document.cookie = `${getCookieKey(userId)}=; path=/; max-age=0; SameSite=Lax`;
      }
      document.cookie = `${LAST_WORKSPACE_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch {
      // document.cookie unavailable — ignore
    }
  }
}

/**
 * Completely purges all workspace cookies and localStorage items.
 * Called on sign-out so no residual workspace tokens linger in browser storage.
 */
export function clearAllWorkspaceStorage(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("tb_last_workspace") ||
          key === "lastWorkspaceId" ||
          key.startsWith("tb_pending_"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }

  try {
    const cookies = typeof document !== "undefined" && document.cookie ? document.cookie.split(";") : [];
    for (const c of cookies) {
      const parts = c.split("=");
      const name = parts[0]?.trim();
      if (name && name.startsWith("tb_last_workspace")) {
        document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
      }
    }
  } catch {
    // ignore
  }
}
