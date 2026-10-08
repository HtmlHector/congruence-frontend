import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const CONGRUENCE_HOME = path.join(os.homedir(), ".congruence");
export const PROJECTS_BASE_DIR = path.join(CONGRUENCE_HOME, "projects");

// Ensure base directories exist
export function ensureBaseDirs() {
  if (!fs.existsSync(CONGRUENCE_HOME)) {
    fs.mkdirSync(CONGRUENCE_HOME, { recursive: true });
  }
  if (!fs.existsSync(PROJECTS_BASE_DIR)) {
    fs.mkdirSync(PROJECTS_BASE_DIR, { recursive: true });
  }
}

function copyCleanDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.name.startsWith(".git") ||
      entry.name.startsWith(".next") ||
      entry.name === "node_modules" ||
      entry.name === ".turbo" ||
      entry.name === ".DS_Store" ||
      entry.name === ".agents" ||
      entry.name === "dist" ||
      entry.name === "build"
    ) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyCleanDir(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch {}
    }
  }
}

/**
 * Helper to clone a GitHub repo using gh CLI or authenticated token
 */
async function cloneGithubRepo(repoFullNameOrUrl: string, destDir: string): Promise<boolean> {
  const repoName = repoFullNameOrUrl
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .trim();

  // 1. Try gh repo clone (uses keyring auth directly)
  try {
    await execAsync(`gh repo clone "${repoName}" "${destDir}" -- --depth 1`);
    if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
      return true;
    }
  } catch (err: any) {
    console.warn(`gh repo clone failed for ${repoName}:`, err.message);
  }

  // 2. Try git clone with gh auth token if available
  try {
    const { stdout: tokenOut } = await execAsync("gh auth token");
    const token = tokenOut.trim();
    if (token) {
      const authUrl = `https://x-access-token:${token}@github.com/${repoName}.git`;
      await execAsync(`git clone --depth 1 "${authUrl}" "${destDir}"`);
      if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
        return true;
      }
    }
  } catch (err: any) {
    console.warn(`Authenticated git clone failed for ${repoName}:`, err.message);
  }

  // 3. Try standard git clone
  try {
    const url = repoFullNameOrUrl.startsWith("http")
      ? repoFullNameOrUrl
      : `https://github.com/${repoName}.git`;
    await execAsync(`git clone --depth 1 "${url}" "${destDir}"`);
    if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
      return true;
    }
  } catch (err: any) {
    console.warn(`Standard git clone failed for ${repoFullNameOrUrl}:`, err.message);
  }

  return false;
}

/**
 * Resolves the real filesystem path for a given project and optional worktree lane
 */
export function getProjectDirectory(projectId?: string | null, laneId?: string | null): string {
  ensureBaseDirs();

  if (!projectId) {
    return process.cwd();
  }

  const projectDir = path.join(PROJECTS_BASE_DIR, projectId);
  const repoDir = path.join(projectDir, "repo");
  const worktreesDir = path.join(projectDir, "worktrees");

  // If a worktree lane is specified and is not main, resolve or auto-provision its worktree directory
  if (laneId && laneId !== "main" && !laneId.includes("main")) {
    const cleanSlug = laneId.replace(/[^a-zA-Z0-9_-]/g, "-");
    const worktreeDir = path.join(worktreesDir, cleanSlug);

    if (fs.existsSync(worktreeDir) && fs.readdirSync(worktreeDir).length > 0) {
      return worktreeDir;
    }

    // Auto-create isolated worktree directory from repoDir
    try {
      fs.mkdirSync(worktreesDir, { recursive: true });
      fs.mkdirSync(worktreeDir, { recursive: true });
      if (fs.existsSync(repoDir)) {
        copyCleanDir(repoDir, worktreeDir);
      }
      return worktreeDir;
    } catch {
      return repoDir;
    }
  }

  return repoDir;
}

/**
 * Provisions a project on disk: clones from GitHub or initializes a clean git repo
 */
export async function provisionProjectDisk(
  projectId: string,
  name: string,
  cloneUrl?: string,
  repoFullName?: string
): Promise<{ projectPath: string; repoDir: string; defaultBranch: string }> {
  ensureBaseDirs();

  const projectDir = path.join(PROJECTS_BASE_DIR, projectId);
  const repoDir = path.join(projectDir, "repo");
  const worktreesDir = path.join(projectDir, "worktrees");

  // Clean directory if already exists
  if (fs.existsSync(repoDir)) {
    try {
      fs.rmSync(repoDir, { recursive: true, force: true });
    } catch {}
  }

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(worktreesDir, { recursive: true });

  let defaultBranch = "main";
  const targetRepo = repoFullName || cloneUrl || name;

  // Attempt GitHub clone
  if (targetRepo && (targetRepo.includes("/") || targetRepo.startsWith("http"))) {
    const cloned = await cloneGithubRepo(targetRepo, repoDir);
    if (cloned) {
      try {
        const { stdout } = await execAsync("git branch --show-current", { cwd: repoDir });
        if (stdout.trim()) {
          defaultBranch = stdout.trim();
        }
      } catch {}
      return { projectPath: projectDir, repoDir, defaultBranch };
    }
  }

  // Fallback: Initialize clean custom repo
  await initializeFallbackRepo(repoDir, name, repoFullName);
  return { projectPath: projectDir, repoDir, defaultBranch };
}

/**
 * Initializes a new clean Git repository on disk with the full actual codebase
 */
async function initializeFallbackRepo(repoDir: string, name: string, repoFullName?: string) {
  fs.mkdirSync(repoDir, { recursive: true });

  // Copy full clean codebase into new repo
  copyCleanDir(process.cwd(), repoDir);

  // Initialize git repo and initial commit
  try {
    await execAsync("git init -b main", { cwd: repoDir });
    await execAsync("git config user.name 'Congruence Agent'", { cwd: repoDir });
    await execAsync("git config user.email 'agent@congruence.local'", { cwd: repoDir });
    await execAsync("git add .", { cwd: repoDir });
    await execAsync("git commit -m 'Initial project commit'", { cwd: repoDir });
  } catch (gitErr) {
    console.error("Failed to initialize git repository on disk:", gitErr);
  }
}

/**
 * Creates a real isolated git worktree for a new branch
 */
export async function createWorktreeLaneDisk(
  projectId: string,
  laneSlug: string,
  branchName: string
): Promise<{ worktreePath: string; branch: string }> {
  const projectDir = path.join(PROJECTS_BASE_DIR, projectId);
  const repoDir = path.join(projectDir, "repo");
  const worktreesDir = path.join(projectDir, "worktrees");
  const cleanSlug = laneSlug.replace(/[^a-zA-Z0-9_-]/g, "-");
  const worktreePath = path.join(worktreesDir, cleanSlug);

  fs.mkdirSync(worktreesDir, { recursive: true });

  if (fs.existsSync(worktreePath) && fs.readdirSync(worktreePath).length > 0) {
    return { worktreePath, branch: branchName };
  }

  // Ensure repoDir is initialized with real files first
  getProjectDirectory(projectId);

  try {
    // Add real git worktree
    await execAsync(`git worktree add "${worktreePath}" -b "${branchName}"`, { cwd: repoDir });
  } catch (err: any) {
    console.warn("git worktree add failed, trying fallback:", err.message);
    try {
      await execAsync(`git worktree add "${worktreePath}" "${branchName}"`, { cwd: repoDir });
    } catch {
      // If worktree add fails, copy full clean directory
      fs.mkdirSync(worktreePath, { recursive: true });
      copyCleanDir(repoDir, worktreePath);
    }
  }

  return { worktreePath, branch: branchName };
}
