import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

/** Error carrying an HTTP status so routes can map it to a response. */
export class ApiAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function authErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof ApiAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return null;
}

/** Resolve the signed-in Clerk user or throw 401. */
export async function requireUser(): Promise<ClerkUser> {
  try {
    const user = await currentUser();
    if (user) return user;
  } catch {
    // fall through to 401
  }
  throw new ApiAuthError(401, "Authentication required");
}

function userMatchesSql(): string {
  return `(u.supabase_user_id = $2 OR u.email = $3 OR CAST(m.user_id AS TEXT) = $2)`;
}

/**
 * Require that the signed-in user is a member of the workspace that owns
 * `projectId`, checking both project stores:
 *  - `workspace.projects` (created by these API routes)
 *  - `congruence_projects` (created by the FastAPI backend, org-scoped)
 *
 * Returns the owning workspace id (or "" for backend org projects).
 * Throws 401 when signed out and 404 when the project is outside the
 * caller's workspaces (existence is not disclosed across tenants).
 */
export async function requireProjectAccess(projectId: string | null | undefined): Promise<string> {
  const user = await requireUser();
  if (!projectId) {
    throw new ApiAuthError(400, "projectId is required");
  }
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    "";

  // 1. Frontend-managed projects → workspace membership
  let wsRows: Array<{ workspace_id: string }> = [];
  try {
    wsRows = await query<{ workspace_id: string }>(
      `SELECT workspace_id FROM workspace.projects WHERE id = $1`,
      [projectId]
    );
  } catch {
    // Table not provisioned yet — fall through to the backend project store.
  }

  if (wsRows.length > 0) {
    const wsId = wsRows[0].workspace_id;
    const members = await query(
      `SELECT 1 FROM workspace.memberships m
       JOIN identity.users u ON u.user_id = m.user_id
       WHERE m.workspace_id = $1 AND ${userMatchesSql()}
       LIMIT 1`,
      [wsId, user.id, email]
    );
    if (members.length === 0) {
      throw new ApiAuthError(404, "Project not found");
    }
    return wsId;
  }

  // 2. Backend-managed projects → organization membership
  try {
    const rows = await query(
      `SELECT p.id FROM congruence_projects p
       JOIN congruence_organization_members om ON om.organization_id = p.organization_id
       WHERE p.id = $1
         AND (om.user_id = $2
              OR om.user_id IN (SELECT user_id FROM identity.users WHERE supabase_user_id = $2 OR email = $3))
       LIMIT 1`,
      [projectId, user.id, email]
    );
    if (rows.length > 0) {
      return "";
    }
  } catch {
    // fall through → 404
  }

  throw new ApiAuthError(404, "Project not found");
}

/** Require that the signed-in user is a member of `workspaceId`. */
export async function requireWorkspaceAccess(workspaceId: string): Promise<ClerkUser> {
  const user = await requireUser();
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    "";
  const members = await query(
    `SELECT 1 FROM workspace.memberships m
     JOIN identity.users u ON u.user_id = m.user_id
     WHERE m.workspace_id = $1 AND ${userMatchesSql()}
     LIMIT 1`,
    [workspaceId, user.id, email]
  );
  if (members.length === 0) {
    throw new ApiAuthError(404, "Workspace not found");
  }
  return user;
}
