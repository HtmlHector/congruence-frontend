"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface FieldnoteTask {
  id: string;
  text: string;
  completed: boolean;
  statusLabel?: string;
}

export interface WorkLaneData {
  id: string;
  name: string;
  branch: string;
  badge: "P" | "C" | "O";
  badgeBg: string;
  badgeFg: string;
  status: "Ready" | "Running dev" | "Editing";
  currentWriter: string;
  allowWatchers: boolean;
  isDevRunning: boolean;
  previewState: "saved" | "live";
  changesCount: number;
  tasks: FieldnoteTask[];
  terminalLogs: string[];
}

export interface WorkspaceActor {
  id: string;
  name: string;
  role: string;
  statusText: string;
  badge: "Y" | "C" | "O";
  badgeBg: string;
  badgeFg: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  text: string;
}

interface WorkspaceContextType {
  mode: "hub" | "deck";
  setMode: (mode: "hub" | "deck") => void;
  hostState: "awake" | "asleep" | "waking" | "sleeping";
  activeLaneId: string;
  activeLane: WorkLaneData;
  lanes: WorkLaneData[];
  actors: WorkspaceActor[];
  activeTab: "preview" | "terminal" | "changes";
  setActiveTab: (tab: "preview" | "terminal" | "changes") => void;
  activityEvents: ActivityEvent[];
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  // Actions
  toggleSleepWake: () => void;
  switchLane: (laneId: string) => void;
  toggleDevServer: () => void;
  simulateEdit: () => void;
  grantControl: (actorName: string) => void;
  revokeControl: () => void;
  toggleAllowWatchers: (val: boolean) => void;
  submitPrompt: (promptText: string, harness: string, model: string, effort: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
}

const initialLanes: WorkLaneData[] = [
  {
    id: "pair-lane",
    name: "Pair lane",
    branch: "main",
    badge: "P",
    badgeBg: "bg-[var(--surface-tertiary)]",
    badgeFg: "text-[var(--foreground)]",
    status: "Ready",
    currentWriter: "You",
    allowWatchers: true,
    isDevRunning: false,
    previewState: "saved",
    changesCount: 0,
    tasks: [
      { id: "1", text: "Find the first good idea", completed: true, statusLabel: "Done" },
      { id: "2", text: "Make something small", completed: false, statusLabel: "Today" },
      { id: "3", text: "Share it with someone", completed: false, statusLabel: "Next" },
    ],
    terminalLogs: [
      "admin@congruence:~/sample-app (main)$ git status",
      "On branch main",
      "Your branch is up to date with 'origin/main'.",
      "nothing to commit, working tree clean",
      "admin@congruence:~/sample-app (main)$",
    ],
  },
  {
    id: "claude-lane",
    name: "Claude Code",
    branch: "claude/progress",
    badge: "C",
    badgeBg: "bg-[rgba(232,128,74,0.15)]",
    badgeFg: "text-[var(--accent-claude)]",
    status: "Ready",
    currentWriter: "Claude Code",
    allowWatchers: true,
    isDevRunning: false,
    previewState: "saved",
    changesCount: 1,
    tasks: [
      { id: "1", text: "Find the first good idea", completed: true, statusLabel: "Done" },
      { id: "2", text: "Make something small (refactored by Claude)", completed: true, statusLabel: "Done" },
      { id: "3", text: "Share it with someone", completed: false, statusLabel: "Next" },
    ],
    terminalLogs: [
      "claude@congruence:~/sample-app/lanes/claude-progress (claude/progress)$ claude code",
      "[Claude Code 1.0.12] Authenticated with Anthropic account.",
      "Reading repository structure...",
      "Found 1 file to improve: src/components/Fieldnotes.tsx",
      "Applying patch to improve task completed state transition.",
      "✓ Edit complete. 1 file changed (+12, -4).",
    ],
  },
  {
    id: "codex-lane",
    name: "Codex",
    branch: "codex/copy",
    badge: "O",
    badgeBg: "bg-[rgba(16,185,129,0.15)]",
    badgeFg: "text-[var(--accent-codex)]",
    status: "Ready",
    currentWriter: "Codex",
    allowWatchers: true,
    isDevRunning: false,
    previewState: "saved",
    changesCount: 2,
    tasks: [
      { id: "1", text: "Find the first good idea", completed: true, statusLabel: "Done" },
      { id: "2", text: "Craft high-conviction micro-copy", completed: false, statusLabel: "In progress" },
      { id: "3", text: "Share with product reviewers", completed: false, statusLabel: "Next" },
    ],
    terminalLogs: [
      "codex@congruence:~/sample-app/lanes/codex-copy (codex/copy)$ codex exec 'refine copy'",
      "[Codex CLI] Initializing session in worktree /lanes/codex-copy...",
      "Analyzing headline and status labels.",
      "Replacing generic task placeholders with precise editorial directives.",
      "Changes staged for branch codex/copy.",
    ],
  },
];

const initialActors: WorkspaceActor[] = [
  {
    id: "actor-you",
    name: "You",
    role: "Owner · full access",
    statusText: "Here",
    badge: "Y",
    badgeBg: "bg-[var(--surface-tertiary)]",
    badgeFg: "text-[var(--foreground)]",
  },
  {
    id: "actor-claude",
    name: "Claude Code",
    role: "Your account · demo identity",
    statusText: "Idle",
    badge: "C",
    badgeBg: "bg-[rgba(232,128,74,0.15)]",
    badgeFg: "text-[var(--accent-claude)]",
  },
  {
    id: "actor-codex",
    name: "Codex",
    role: "Your account · demo identity",
    statusText: "Idle",
    badge: "O",
    badgeBg: "bg-[rgba(16,185,129,0.15)]",
    badgeFg: "text-[var(--accent-codex)]",
  },
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"hub" | "deck">("deck");
  const [hostState, setHostState] = useState<"awake" | "asleep" | "waking" | "sleeping">("awake");
  const [activeLaneId, setActiveLaneId] = useState<string>("pair-lane");
  const [lanes, setLanes] = useState<WorkLaneData[]>(initialLanes);
  const [actors] = useState<WorkspaceActor[]>(initialActors);
  const [activeTab, setActiveTab] = useState<"preview" | "terminal" | "changes">("preview");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([
    { id: "1", timestamp: "just now", text: "Workspace opened" },
    { id: "2", timestamp: "just now", text: "Files and demo identities loaded" },
  ]);

  const activeLane = lanes.find((l) => l.id === activeLaneId) || lanes[0];

  const logActivity = (text: string) => {
    setActivityEvents((prev) => [
      { id: Date.now().toString(), timestamp: "just now", text },
      ...prev.slice(0, 8),
    ]);
  };

  const toggleSleepWake = () => {
    if (hostState === "awake") {
      setHostState("sleeping");
      logActivity("Putting workspace to sleep...");
      setTimeout(() => {
        setHostState("asleep");
        setLanes((prev) =>
          prev.map((lane) => ({
            ...lane,
            isDevRunning: false,
            previewState: "saved",
            terminalLogs: [
              ...lane.terminalLogs,
              "[Process terminated - Host entered sleep mode]",
              "[Persistent disk & identities preserved]",
            ],
          }))
        );
        logActivity("Workspace asleep (compute stopped; files kept)");
      }, 700);
    } else if (hostState === "asleep") {
      setHostState("waking");
      logActivity("Waking host from sleep...");
      setTimeout(() => {
        setHostState("awake");
        logActivity("Workspace awake (ready for dev processes)");
      }, 900);
    }
  };

  const switchLane = (laneId: string) => {
    const lane = lanes.find((l) => l.id === laneId);
    if (!lane) return;
    setActiveLaneId(laneId);
    logActivity(`Switched context to ${lane.name} (${lane.branch})`);
  };

  const toggleDevServer = () => {
    if (hostState === "asleep") return;

    setLanes((prev) =>
      prev.map((l) => {
        if (l.id !== activeLaneId) return l;
        const willRun = !l.isDevRunning;
        const newLogs = willRun
          ? [
              ...l.terminalLogs,
              `admin@congruence:~/sample-app$ pnpm dev`,
              `[vite] dev server running at:`,
              `> Local:    http://localhost:3000/`,
              `> Congruence Rewrite: https://sample-app.congruence.example [HTTPS private]`,
            ]
          : [
              ...l.terminalLogs,
              `^C`,
              `Dev server stopped.`,
            ];
        return {
          ...l,
          isDevRunning: willRun,
          previewState: willRun ? "live" : "saved",
          status: willRun ? "Running dev" : "Ready",
          terminalLogs: newLogs,
        };
      })
    );

    if (!activeLane.isDevRunning) {
      logActivity(`Dev server started on port 3000 -> https://sample-app.congruence.example`);
    } else {
      logActivity(`Dev server stopped on ${activeLane.name}`);
    }
  };

  const simulateEdit = () => {
    if (hostState === "asleep") return;

    setLanes((prev) =>
      prev.map((l) => {
        if (l.id !== activeLaneId) return l;
        const newTask: FieldnoteTask = {
          id: (l.tasks.length + 1).toString(),
          text: `Review changes from ${l.currentWriter}`,
          completed: false,
          statusLabel: "New",
        };
        return {
          ...l,
          changesCount: l.changesCount + 1,
          tasks: [...l.tasks, newTask],
          terminalLogs: [
            ...l.terminalLogs,
            `[Agent edit] Mutated Fieldnotes.tsx in worktree (${l.branch})`,
            `+1 note item added: "Review changes from ${l.currentWriter}"`,
          ],
        };
      })
    );

    logActivity(`Simulated edit committed to ${activeLane.branch}`);
  };

  const grantControl = (actorName: string) => {
    setLanes((prev) =>
      prev.map((l) => (l.id === activeLaneId ? { ...l, currentWriter: actorName } : l))
    );
    logActivity(`Write control granted to ${actorName} on ${activeLane.name}`);
  };

  const revokeControl = () => {
    setLanes((prev) =>
      prev.map((l) => (l.id === activeLaneId ? { ...l, currentWriter: "You" } : l))
    );
    logActivity(`Write control revoked to Owner on ${activeLane.name}`);
  };

  const toggleAllowWatchers = (val: boolean) => {
    setLanes((prev) =>
      prev.map((l) => (l.id === activeLaneId ? { ...l, allowWatchers: val } : l))
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setLanes((prev) =>
      prev.map((l) => {
        if (l.id !== activeLaneId) return l;
        return {
          ...l,
          tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  const submitPrompt = (promptText: string, harness: string, model: string, effort: string) => {
    const slug = promptText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "task";
    const newLaneId = `lane-${Date.now()}`;
    const newLane: WorkLaneData = {
      id: newLaneId,
      name: `${harness} Task`,
      branch: `agent/${slug}`,
      badge: harness.toLowerCase().includes("claude") ? "C" : "O",
      badgeBg: harness.toLowerCase().includes("claude")
        ? "bg-[rgba(232,128,74,0.15)]"
        : "bg-[rgba(16,185,129,0.15)]",
      badgeFg: harness.toLowerCase().includes("claude")
        ? "text-[var(--accent-claude)]"
        : "text-[var(--accent-codex)]",
      status: "Ready",
      currentWriter: harness,
      allowWatchers: true,
      isDevRunning: true,
      previewState: "live",
      changesCount: 1,
      tasks: [
        { id: "1", text: "Find the first good idea", completed: true, statusLabel: "Done" },
        { id: "2", text: promptText, completed: false, statusLabel: "Active task" },
      ],
      terminalLogs: [
        `[${harness}] Dispatched task from Omnibar: "${promptText}"`,
        `Model: ${model} | Effort: ${effort}`,
        `Created isolated worktree at /lanes/${newLaneId} on branch agent/${slug}`,
        `Running dev server...`,
        `Preview listening at https://sample-app.congruence.example [HTTPS private]`,
      ],
    };

    setLanes((prev) => [...prev, newLane]);
    setActiveLaneId(newLaneId);
    setMode("deck");
    setActiveTab("terminal");
    logActivity(`Launched ${harness} on new worktree lane: agent/${slug}`);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        mode,
        setMode,
        hostState,
        activeLaneId,
        activeLane,
        lanes,
        actors,
        activeTab,
        setActiveTab,
        activityEvents,
        isProductModalOpen,
        setIsProductModalOpen,
        toggleSleepWake,
        switchLane,
        toggleDevServer,
        simulateEdit,
        grantControl,
        revokeControl,
        toggleAllowWatchers,
        submitPrompt,
        toggleTaskCompletion,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}
