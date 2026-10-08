import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";
import { currentUser } from "@clerk/nextjs/server";

const generateWorkspaceNanoId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  18
);

export async function GET() {
  try {
    let clerkUser = null;
    try {
      clerkUser = await currentUser();
    } catch {
      // unauthenticated or background route call
    }

    if (clerkUser) {
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        "";
      const fullName = clerkUser.fullName || clerkUser.firstName || "User";
      const avatarUrl = clerkUser.imageUrl || null;

      // 1. Ensure user exists in identity.users
      const userRes = await query(
        `
        INSERT INTO identity.users (user_id, supabase_user_id, email, full_name, avatar_url, is_active, metadata, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, TRUE, '{}'::jsonb, NOW(), NOW())
        ON CONFLICT (supabase_user_id) DO UPDATE 
        SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, avatar_url = COALESCE(EXCLUDED.avatar_url, identity.users.avatar_url)
        RETURNING user_id;
        `,
        [clerkUser.id, email, fullName, avatarUrl]
      );
      const internalUserId = userRes[0]?.user_id;

      // 2. Query existing memberships for this user
      let rows = await query(
        `
        SELECT w.workspace_id, w.name, w.slug, w.plan_tier, w.created_at
        FROM workspace.workspaces w
        JOIN workspace.memberships m ON m.workspace_id = w.workspace_id
        WHERE m.user_id = $1 AND w.deleted_at IS NULL
        ORDER BY w.created_at DESC
        `,
        [internalUserId]
      );

      // 3. Auto-provision initial workspace if the user has none
      if (!rows || rows.length === 0) {
        const workspaceName = clerkUser.firstName
          ? `${clerkUser.firstName}'s Workspace`
          : `${fullName}'s Workspace`;
        const workspaceId = generateWorkspaceNanoId();
        const rawSlug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const slug = `${rawSlug}-${workspaceId.slice(0, 6)}`;

        const createdWs = await query(
          `
          INSERT INTO workspace.workspaces (workspace_id, name, slug, plan_tier, settings, created_at, updated_at)
          VALUES ($1, $2, $3, 'PRO', '{}'::jsonb, NOW(), NOW())
          RETURNING workspace_id, name, slug, plan_tier, created_at
          `,
          [workspaceId, workspaceName, slug]
        );

        // Fetch OWNER role
        const roleRes = await query(
          `SELECT role_id FROM identity.roles WHERE name = 'OWNER' LIMIT 1`
        );
        const ownerRoleId = roleRes[0]?.role_id;

        if (ownerRoleId && internalUserId) {
          await query(
            `
            INSERT INTO workspace.memberships (membership_id, user_id, workspace_id, role_id, joined_at)
            VALUES (gen_random_uuid(), $1, $2, $3, NOW())
            ON CONFLICT DO NOTHING
            `,
            [internalUserId, workspaceId, ownerRoleId]
          );
        }

        rows = createdWs;
      }

      return NextResponse.json(rows);
    }

    // Unauthenticated callers get nothing: listing every workspace would
    // leak every tenant's data.
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  } catch (err: any) {
    console.error("Failed to query or auto-provision workspaces:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, plan = "PRO" } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let clerkUser = null;
    try {
      clerkUser = await currentUser();
    } catch {
      // unauthenticated
    }
    if (!clerkUser) {
      // Workspaces must belong to a signed-in owner.
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const workspaceId = generateWorkspaceNanoId();
    const rawSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${rawSlug}-${workspaceId.slice(0, 6)}`;

    const normalizedPlan = ["FREE", "HOBBY", "CORE", "AUTOSCALE", "PRO", "TEAM", "ENTERPRISE"].includes(
      plan.toUpperCase()
    )
      ? plan.toUpperCase()
      : "PRO";

    const rows = await query(
      `
      INSERT INTO workspace.workspaces (workspace_id, name, slug, plan_tier, settings, created_at, updated_at)
      VALUES ($1, $2, $3, $4, '{}'::jsonb, NOW(), NOW())
      RETURNING workspace_id, name, slug, plan_tier, created_at
    `,
      [workspaceId, name.trim(), slug, normalizedPlan]
    );

    if (clerkUser) {
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        "";
      const fullName = clerkUser.fullName || clerkUser.firstName || "User";
      const avatarUrl = clerkUser.imageUrl || null;

      const userRes = await query(
        `
        INSERT INTO identity.users (user_id, supabase_user_id, email, full_name, avatar_url, is_active, metadata, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, TRUE, '{}'::jsonb, NOW(), NOW())
        ON CONFLICT (supabase_user_id) DO UPDATE 
        SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, avatar_url = COALESCE(EXCLUDED.avatar_url, identity.users.avatar_url)
        RETURNING user_id;
        `,
        [clerkUser.id, email, fullName, avatarUrl]
      );
      const internalUserId = userRes[0]?.user_id;

      const roleRes = await query(
        `SELECT role_id FROM identity.roles WHERE name = 'OWNER' LIMIT 1`
      );
      const ownerRoleId = roleRes[0]?.role_id;

      if (ownerRoleId && internalUserId) {
        await query(
          `
          INSERT INTO workspace.memberships (membership_id, user_id, workspace_id, role_id, joined_at)
          VALUES (gen_random_uuid(), $1, $2, $3, NOW())
          ON CONFLICT DO NOTHING
          `,
          [internalUserId, workspaceId, ownerRoleId]
        );
      }
    }

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("Failed to create workspace in Docker Postgres:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
