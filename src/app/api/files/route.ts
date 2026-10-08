import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProjectDirectory } from "@/lib/project-runner";

// Helper to ignore bulky or internal directories
const IGNORED_NAMES = new Set([
  ".git",
  ".next",
  "node_modules",
  ".turbo",
  ".DS_Store",
  ".agents",
]);

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  children?: FileTreeNode[];
}

function buildTree(dirPath: string, relativePath = ""): FileTreeNode[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileTreeNode[] = [];

    // Sort: directories first, then alphabetical
    const sorted = entries
      .filter((e) => !IGNORED_NAMES.has(e.name))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    for (const entry of sorted) {
      const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: entryRelPath,
          type: "directory",
          children: buildTree(fullPath, entryRelPath),
        });
      } else {
        const ext = path.extname(entry.name).slice(1);
        let size = 0;
        try {
          size = fs.statSync(fullPath).size;
        } catch {}

        nodes.push({
          name: entry.name,
          path: entryRelPath,
          type: "file",
          extension: ext,
          size,
        });
      }
    }
    return nodes;
  } catch (err) {
    console.error("Failed to build file tree:", err);
    return [];
  }
}

// GET /api/files?path=...&projectId=...&laneId=...&encoding=utf-8|base64
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetPath = searchParams.get("path");
    const projectId = searchParams.get("projectId");
    const laneId = searchParams.get("laneId");
    const encoding = searchParams.get("encoding") ?? "utf-8";

    const baseDir = getProjectDirectory(projectId, laneId);

    if (targetPath) {
      const safePath = path.normalize(targetPath).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(baseDir, safePath);

      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const tree = buildTree(fullPath, safePath);
        return NextResponse.json({ tree });
      }

      // Base64 path: read as binary (for image/binary files)
      if (encoding === "base64") {
        const data = fs.readFileSync(fullPath);
        return NextResponse.json({
          path: safePath,
          size: stat.size,
          content: data.toString("base64"),
          encoding: "base64",
          extension: path.extname(safePath).slice(1),
        });
      }

      // Read text file (limit to 500KB)
      if (stat.size > 500 * 1024) {
        return NextResponse.json({
          path: safePath,
          size: stat.size,
          content: "// File is too large to preview in editor (>500KB)",
          isTruncated: true,
        });
      }

      const content = fs.readFileSync(fullPath, "utf8");
      return NextResponse.json({
        path: safePath,
        size: stat.size,
        content,
        extension: path.extname(safePath).slice(1),
      });
    }


    const tree = buildTree(baseDir);
    return NextResponse.json({ tree, root: path.basename(baseDir), baseDir });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/files
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path: relPath, type = "file", content = "", projectId, laneId } = body;

    if (!relPath) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const baseDir = getProjectDirectory(projectId, laneId);
    const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(baseDir, safePath);

    if (type === "directory") {
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf8");
    }

    return NextResponse.json({
      success: true,
      path: safePath,
      type,
      size: Buffer.byteLength(content, "utf8"),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/files?path=...&projectId=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetPath = searchParams.get("path");
    const projectId = searchParams.get("projectId");
    const laneId = searchParams.get("laneId");

    if (!targetPath) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const baseDir = getProjectDirectory(projectId, laneId);
    const safePath = path.normalize(targetPath).replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(baseDir, safePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File or directory not found" }, { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    return NextResponse.json({ success: true, removed: safePath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/files
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { oldPath, newPath, projectId, laneId } = body;

    if (!oldPath || !newPath) {
      return NextResponse.json({ error: "Both oldPath and newPath are required" }, { status: 400 });
    }

    const baseDir = getProjectDirectory(projectId, laneId);
    const safeOldPath = path.normalize(oldPath).replace(/^(\.\.[\/\\])+/, "");
    const safeNewPath = path.normalize(newPath).replace(/^(\.\.[\/\\])+/, "");

    const fullOld = path.join(baseDir, safeOldPath);
    const fullNew = path.join(baseDir, safeNewPath);

    if (!fs.existsSync(fullOld)) {
      return NextResponse.json({ error: "Source file not found" }, { status: 404 });
    }

    fs.mkdirSync(path.dirname(fullNew), { recursive: true });
    fs.renameSync(fullOld, fullNew);

    return NextResponse.json({ success: true, oldPath: safeOldPath, newPath: safeNewPath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
