import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";
import { provisionProjectDisk } from "@/lib/project-runner";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const workspaceId = resolvedParams?.id;
    const rows = await query(
      `
      SELECT id, name, surface, description, connected_repo_ids, environments, setup_status, created_at, workspace_id
      FROM workspace.projects
      WHERE workspace_id = $1
      ORDER BY created_at ASC
    `,
      [workspaceId]
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("Failed to query workspace projects:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const workspaceId = resolvedParams?.id;
    const body = await req.json();
    const { name, repoFullName, surface = "web", description = "" } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const projectId = randomUUID();
    const connectedRepos = repoFullName ? [repoFullName] : [];

    // 1. Provision repository and worktrees on disk
    let defaultBranch = "main";
    try {
      const diskInfo = await provisionProjectDisk(projectId, name.trim(), description, repoFullName);
      defaultBranch = diskInfo.defaultBranch || "main";
    } catch (diskErr: any) {
      console.warn("Disk provisioning error (continuing with DB insert):", diskErr.message);
    }

    // 2. Insert into PostgreSQL database
    const rows = await query(
      `
      INSERT INTO workspace.projects (id, name, surface, description, connected_repo_ids, environments, setup_status, created_at, updated_at, workspace_id)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, 'ready', NOW(), NOW(), $7)
      RETURNING id, name, surface, description, connected_repo_ids, setup_status, created_at, workspace_id
    `,
      [
        projectId,
        name.trim(),
        surface,
        description,
        JSON.stringify(connectedRepos),
        JSON.stringify([{ name: "default", default_branch: defaultBranch }]),
        workspaceId,
      ]
    );

    const project = rows[0];
    return NextResponse.json({
      ...project,
      default_branch: defaultBranch,
    });
  } catch (err: any) {
    console.error("Failed to create project for workspace:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
