import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";
import { ApiAuthError, authErrorResponse } from "@/lib/api-auth";

const generateWorkspaceNanoId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  18
);

/**
 * Verify a Svix-signed Clerk webhook (HMAC-SHA256 over id.timestamp.body).
 * Rejects when the secret is unset: forged user.created events could create
 * users and workspaces for arbitrary identities.
 */
function verifySvixSignature(req: Request, body: string): void {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new ApiAuthError(
      503,
      "CLERK_WEBHOOK_SECRET is not configured; refusing unsigned webhooks"
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new ApiAuthError(401, "Missing webhook signature headers");
  }

  const timestamp = parseInt(svixTimestamp, 10);
  if (!Number.isFinite(timestamp)) {
    throw new ApiAuthError(401, "Invalid webhook timestamp");
  }
  const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
  if (ageSeconds > 300) {
    throw new ApiAuthError(401, "Webhook timestamp outside tolerance");
  }

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const passes = svixSignature.split(" ").some((entry) => {
    const parts = entry.split(",");
    const provided = parts.length === 2 ? parts[1] : parts[0];
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
      return false;
    }
  });
  if (!passes) {
    throw new ApiAuthError(401, "Invalid webhook signature");
  }
}

export async function POST(req: Request) {
  let payload: any;
  try {
    const rawBody = await req.text();
    verifySvixSignature(req, rawBody);
    payload = JSON.parse(rawBody || "{}");
  } catch (err: any) {
    const authErr = authErrorResponse(err);
    if (authErr) return authErr;
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  try {
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
