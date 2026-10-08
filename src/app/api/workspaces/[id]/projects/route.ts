import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";
import { provisionProjectDisk } from "@/lib/project-runner";
import { authErrorResponse, requireWorkspaceAccess } from "@/lib/api-auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const workspaceParam = resolvedParams?.id;

    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS workspace.projects (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id TEXT NOT NULL REFERENCES workspace.workspaces(workspace_id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        surface VARCHAR(64) DEFAULT 'web',
        description TEXT DEFAULT '',
        connected_repo_ids JSONB DEFAULT '[]'::jsonb,
        environments JSONB DEFAULT '[]'::jsonb,
        setup_status VARCHAR(32) DEFAULT 'ready',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS ix_workspace_projects_workspace_id ON workspace.projects(workspace_id);
    `);

    // Resolve actual workspace_id if a slug was passed
    const wsRows = await query(
      `SELECT workspace_id FROM workspace.workspaces WHERE workspace_id = $1 OR slug = $1 LIMIT 1`,
      [workspaceParam]
    );
    const actualWorkspaceId = wsRows[0]?.workspace_id || workspaceParam;

    // Only members of this workspace may list its projects.
    await requireWorkspaceAccess(actualWorkspaceId);

    const rows = await query(
      `
      SELECT id, name, surface, description, connected_repo_ids, environments, setup_status, created_at, workspace_id
      FROM workspace.projects
      WHERE workspace_id = $1
      ORDER BY created_at ASC
    `,
      [actualWorkspaceId]
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    const authErr = authErrorResponse(err);
    if (authErr) return authErr;
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
    const workspaceParam = resolvedParams?.id;
    const body = await req.json();
    const { name, repoFullName, surface = "web", description = "" } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS workspace.projects (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id TEXT NOT NULL REFERENCES workspace.workspaces(workspace_id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        surface VARCHAR(64) DEFAULT 'web',
        description TEXT DEFAULT '',
        connected_repo_ids JSONB DEFAULT '[]'::jsonb,
        environments JSONB DEFAULT '[]'::jsonb,
        setup_status VARCHAR(32) DEFAULT 'ready',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS ix_workspace_projects_workspace_id ON workspace.projects(workspace_id);
    `);

    // Resolve actual workspace_id if a slug was passed
    const wsRows = await query(
      `SELECT workspace_id FROM workspace.workspaces WHERE workspace_id = $1 OR slug = $1 LIMIT 1`,
      [workspaceParam]
    );
    const actualWorkspaceId = wsRows[0]?.workspace_id || workspaceParam;

    // Only members of this workspace may create projects in it.
    await requireWorkspaceAccess(actualWorkspaceId);

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
        actualWorkspaceId,
      ]
    );

    const project = rows[0];
    return NextResponse.json({
      ...project,
      default_branch: defaultBranch,
    });
  } catch (err: any) {
    const authErr = authErrorResponse(err);
    if (authErr) return authErr;
    console.error("Failed to create project for workspace:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
