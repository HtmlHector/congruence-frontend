import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";

const generateWorkspaceNanoId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  18
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload?.type;

    if (eventType === "user.created") {
      const data = payload.data;
      const clerkUserId = data.id;
      const email =
        data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id)?.email_address ||
        data.email_addresses?.[0]?.email_address ||
        "";
      const firstName = data.first_name || "";
      const lastName = data.last_name || "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
      const avatarUrl = data.image_url || null;

      // 1. Insert user into identity.users
      const userRes = await query(
        `
        INSERT INTO identity.users (user_id, supabase_user_id, email, full_name, avatar_url, is_active, metadata, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, TRUE, '{}'::jsonb, NOW(), NOW())
        ON CONFLICT (supabase_user_id) DO UPDATE 
        SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, avatar_url = COALESCE(EXCLUDED.avatar_url, identity.users.avatar_url)
        RETURNING user_id;
        `,
        [clerkUserId, email, fullName, avatarUrl]
      );
      const internalUserId = userRes[0]?.user_id;

      // 2. Check if user already has a workspace
      const existingMemberships = await query(
        `
        SELECT m.workspace_id 
        FROM workspace.memberships m
        WHERE m.user_id = $1
        LIMIT 1
        `,
        [internalUserId]
      );

      if (existingMemberships.length === 0) {
        const workspaceName = firstName ? `${firstName}'s Workspace` : `${fullName}'s Workspace`;
        const workspaceId = generateWorkspaceNanoId();
        const rawSlug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const slug = `${rawSlug}-${workspaceId.slice(0, 6)}`;

        // 3. Create workspace
        await query(
          `
          INSERT INTO workspace.workspaces (workspace_id, name, slug, plan_tier, settings, created_at, updated_at)
          VALUES ($1, $2, $3, 'PRO', '{}'::jsonb, NOW(), NOW())
          `,
          [workspaceId, workspaceName, slug]
        );

        // 4. Fetch OWNER role
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
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error processing Clerk webhook:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
