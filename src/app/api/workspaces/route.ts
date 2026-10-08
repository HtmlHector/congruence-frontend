import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";

const generateWorkspaceNanoId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  18
);

export async function GET() {
  try {
    const rows = await query(`
      SELECT workspace_id, name, slug, plan_tier, created_at
      FROM workspace.workspaces
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("Failed to query workspaces from Docker Postgres:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, plan = "CORE" } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const workspaceId = generateWorkspaceNanoId();
    const rawSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${rawSlug}-${workspaceId.slice(0, 6)}`;

    const normalizedPlan = ["FREE", "HOBBY", "CORE", "AUTOSCALE", "PRO", "TEAM", "ENTERPRISE"].includes(
      plan.toUpperCase()
    )
      ? plan.toUpperCase()
      : "CORE";

    const rows = await query(
      `
      INSERT INTO workspace.workspaces (workspace_id, name, slug, plan_tier, settings, created_at, updated_at)
      VALUES ($1, $2, $3, $4, '{}'::jsonb, NOW(), NOW())
      RETURNING workspace_id, name, slug, plan_tier, created_at
    `,
      [workspaceId, name.trim(), slug, normalizedPlan]
    );

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("Failed to create workspace in Docker Postgres:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
