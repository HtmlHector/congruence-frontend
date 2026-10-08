import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { getProjectDirectory, createWorktreeLaneDisk } from "@/lib/project-runner";
import { authErrorResponse, requireProjectAccess } from "@/lib/api-auth";

const execAsync = promisify(exec);

// GET /api/git?projectId=...&laneId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const laneId = searchParams.get("laneId");

    await requireProjectAccess(projectId);
    const targetDir = getProjectDirectory(projectId, laneId);

    // 1. Current branch
    let currentBranch = "main";
    try {
      const { stdout: branchOut } = await execAsync("git branch --show-current", { cwd: targetDir });
      currentBranch = branchOut.trim() || "main";
    } catch {}

    // 2. All local branches
    let branches: string[] = [currentBranch];
    try {
      const { stdout: branchesOut } = await execAsync("git branch --format='%(refname:short)'", { cwd: targetDir });
      const list = branchesOut.split("\n").map((b) => b.trim()).filter(Boolean);
      if (list.length > 0) branches = list;
    } catch {}

    // 3. Git status porcelain
    const staged: Array<{ path: string; status: string }> = [];
    const unstaged: Array<{ path: string; status: string }> = [];
    const untracked: Array<{ path: string; status: string }> = [];

    try {
      const { stdout: statusOut } = await execAsync("git status --porcelain=v1", { cwd: targetDir });
      const statusLines = statusOut.split("\n").filter(Boolean);

      for (const line of statusLines) {
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const filePath = line.slice(3).trim();

        if (indexStatus === "?" && workTreeStatus === "?") {
          untracked.push({ path: filePath, status: "U" });
        } else {
          if (indexStatus !== " " && indexStatus !== "?") {
            staged.push({ path: filePath, status: indexStatus });
          }
          if (workTreeStatus !== " " && workTreeStatus !== "?") {
            unstaged.push({ path: filePath, status: workTreeStatus });
          }
        }
      }
    } catch {}

    // 4. Recent commits log (last 8)
    let commits: Array<{ hash: string; message: string; author: string; relativeTime: string }> = [];
    try {
      const { stdout: logOut } = await execAsync('git log -n 8 --pretty=format:"%h|%s|%an|%cr"', { cwd: targetDir });
      commits = logOut
        .split("\n")
        .filter(Boolean)
        .map((l) => {
          const [hash, message, author, relativeTime] = l.split("|");
          return { hash, message, author, relativeTime };
        });
    } catch {}

    // 5. Diff summary count
    let insertions = 0;
    let deletions = 0;
    try {
      const { stdout: diffStat } = await execAsync("git diff --shortstat", { cwd: targetDir });
      const insertMatch = diffStat.match(/(\d+)\s+insertion/);
      const deleteMatch = diffStat.match(/(\d+)\s+deletion/);
      if (insertMatch) insertions = parseInt(insertMatch[1], 10);
      if (deleteMatch) deletions = parseInt(deleteMatch[1], 10);
    } catch {}

    return NextResponse.json({
      branch: currentBranch,
      branches,
      staged,
      unstaged,
      untracked,
      commits,
      stats: {
        insertions,
        deletions,
        totalChanged: staged.length + unstaged.length + untracked.length,
      },
      targetDir,
    });
  } catch (err: any) {
    const authErr = authErrorResponse(err);
    if (authErr) return authErr;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/git
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, file, message, branch, projectId, laneId, laneSlug } = body;

    await requireProjectAccess(projectId);
    const targetDir = getProjectDirectory(projectId, laneId);

    switch (action) {
      case "stage": {
        const target = file ? `"${file}"` : ".";
        await execAsync(`git add ${target}`, { cwd: targetDir });
        return NextResponse.json({ success: true, action: "staged", target });
      }
      case "unstage": {
        const target = file ? `"${file}"` : ".";
        await execAsync(`git restore --staged ${target}`, { cwd: targetDir });
        return NextResponse.json({ success: true, action: "unstaged", target });
      }
      case "discard": {
        if (!file) return NextResponse.json({ error: "File required for discard" }, { status: 400 });
        await execAsync(`git checkout -- "${file}"`, { cwd: targetDir });
        return NextResponse.json({ success: true, action: "discarded", file });
      }
      case "commit": {
        if (!message || !message.trim()) {
          return NextResponse.json({ error: "Commit message is required" }, { status: 400 });
        }
        const safeMessage = message.replace(/"/g, '\\"');
        const { stdout } = await execAsync(`git commit -m "${safeMessage}"`, { cwd: targetDir });
        return NextResponse.json({ success: true, output: stdout.trim() });
      }
      case "checkout": {
        if (!branch) return NextResponse.json({ error: "Branch is required" }, { status: 400 });
        await execAsync(`git checkout "${branch}"`, { cwd: targetDir });
        return NextResponse.json({ success: true, branch });
      }
      case "create_branch": {
        if (!branch) return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
        await execAsync(`git checkout -b "${branch}"`, { cwd: targetDir });
        return NextResponse.json({ success: true, branch });
      }
      case "new_worktree": {
        if (!branch) return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
        const slug = laneSlug || branch.replace(/[^a-zA-Z0-9_-]/g, "-");
        const worktree = await createWorktreeLaneDisk(projectId || "default", slug, branch);
        return NextResponse.json({ success: true, ...worktree });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    const authErr = authErrorResponse(err);
    if (authErr) return authErr;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
