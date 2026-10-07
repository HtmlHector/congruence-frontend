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

export type WorkspaceViewMode = "hub" | "deck" | "automations" | "tasks" | "pull-requests" | "pages";

interface WorkspaceContextType {
  projectId: string | null;
  mode: WorkspaceViewMode;
  setMode: (mode: WorkspaceViewMode) => void;
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
  isIntegrationsOpen: boolean;
  setIsIntegrationsOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCloneOpen: boolean;
  setIsCloneOpen: (open: boolean) => void;
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
  pendingCommand: string | null;
  clearPendingCommand: () => void;
  executeTerminalCommand: (command: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

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
      { id: "1", text: "Fix mobile padding on hero banner", completed: true, statusLabel: "Done in main" },
      { id: "2", text: "Wire Clerk Auth callback handler", completed: false, statusLabel: "Ready for review" },
      { id: "3", text: "Audit design tokens against Hallmark rules", completed: false, statusLabel: "Pending" },
    ],
    terminalLogs: [
      "admin@congruence:~/sample-app$ git status",
      "On branch main",
      "Your branch is up to date with 'origin/main'.",
      "nothing to commit, working tree clean",
      "admin@congruence:~/sample-app$ ",
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
    changesCount: 2,
    tasks: [
      { id: "4", text: "Implement interactive Anthropic OAuth", completed: true, statusLabel: "Completed" },
      { id: "5", text: "Refactor terminal resize message handler", completed: false, statusLabel: "In progress" },
    ],
    terminalLogs: [
      "claude@congruence:~/sample-app (worktree: claude/progress)$ claude --effort high",
      "Claude Code (v0.2.29) initialized in worktree isolation.",
      "Reading src/components/workspace/TerminalPane.tsx...",
      "claude@congruence:~/sample-app $ ",
    ],
  },
  {
    id: "codex-lane",
    name: "OpenAI Codex",
    branch: "codex/refactor",
    badge: "O",
    badgeBg: "bg-[rgba(59,130,246,0.15)]",
    badgeFg: "text-blue-400",
    status: "Ready",
    currentWriter: "Codex",
    allowWatchers: false,
    isDevRunning: false,
    previewState: "saved",
    changesCount: 1,
    tasks: [
      { id: "6", text: "Add AES-256-GCM vault encryption layer", completed: true, statusLabel: "Done" },
    ],
    terminalLogs: [
      "codex@congruence:~/sample-app (worktree: codex/refactor)$ codex exec",
      "Refactoring src/infrastructure/vault/crypto.py...",
      "Done.",
    ],
  },
];

const initialActors: WorkspaceActor[] = [
  {
    id: "actor-you",
    name: "You",
    role: "Repo Owner",
    statusText: "Active in pair lane",
    badge: "Y",
    badgeBg: "bg-[var(--surface-tertiary)]",
    badgeFg: "text-[var(--foreground)]",
  },
  {
    id: "actor-claude",
    name: "Claude Code",
    role: "Autonomous CLI Agent",
    statusText: "Ready in claude/progress",
    badge: "C",
    badgeBg: "bg-[rgba(232,128,74,0.15)]",
    badgeFg: "text-[var(--accent-claude)]",
  },
  {
    id: "actor-codex",
    name: "OpenAI Codex",
    role: "Fast Refactoring CLI",
    statusText: "Idle",
    badge: "O",
    badgeBg: "bg-[rgba(59,130,246,0.15)]",
    badgeFg: "text-blue-400",
  },
];

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WorkspaceViewMode>("deck");
  const [hostState, setHostState] = useState<"awake" | "asleep" | "waking" | "sleeping">("awake");
  const [lanes, setLanes] = useState<WorkLaneData[]>(initialLanes);
  const [actors, setActors] = useState<WorkspaceActor[]>(initialActors);
  const [activeLaneId, setActiveLaneId] = useState<string>("pair-lane");
  const [activeTab, setActiveTab] = useState<"preview" | "terminal" | "changes">("preview");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([
    { id: "1", timestamp: "just now", text: "Workspace opened" }
  ]);

  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        let res = await fetch("http://localhost:8000/api/v1/projects");
        let projs = await res.json();
        let projId = null;
        if (projs && projs.length > 0) {
          projId = projs[0].id;
        } else {
          res = await fetch("http://localhost:8000/api/v1/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Sample App",
              slug: "sample-app",
              repo_full_name: "parabox/sample-app",
              default_branch: "main",
              visibility: "private"
            })
          });
          const newProj = await res.json();
          projId = newProj.id;
        }
        setProjectId(projId);

        const lanesRes = await fetch(`http://localhost:8000/api/v1/projects/${projId}/lanes`);
        const lanesData = await lanesRes.json();
        
        if (lanesData && lanesData.length > 0) {
          const mappedLanes: WorkLaneData[] = lanesData.map((l: any) => {
            const matchingInit = initialLanes.find((init) => init.name === l.name);
            return {
              id: l.id,
              name: l.name,
              branch: l.branch_name,
              badge: l.is_pair_lane ? "P" : (l.name.includes("Codex") ? "O" : "C"),
              badgeBg: l.is_pair_lane ? "bg-[var(--surface-tertiary)]" : (l.name.includes("Codex") ? "bg-[rgba(59,130,246,0.15)]" : "bg-[rgba(232,128,74,0.15)]"),
              badgeFg: l.is_pair_lane ? "text-[var(--foreground)]" : (l.name.includes("Codex") ? "text-blue-400" : "text-[var(--accent-claude)]"),
              status: l.status === "ready" ? "Ready" : l.status,
              currentWriter: "You",
              allowWatchers: true,
              isDevRunning: false,
              previewState: "saved",
              changesCount: matchingInit?.changesCount || 0,
              tasks: matchingInit?.tasks || [],
              terminalLogs: matchingInit?.terminalLogs || ["Connected to real terminal..."]
            };
          });
          setLanes(mappedLanes);
          setActiveLaneId((prev) => {
            const found = mappedLanes.find((m) => m.id === prev || m.name === prev);
            return found ? found.id : mappedLanes[0].id;
          });
        }

        const actorsRes = await fetch(`http://localhost:8000/api/v1/projects/${projId}/actors`);
        const actorsData = await actorsRes.json();
        if (actorsData && actorsData.length > 0) {
          setActors(actorsData.map((a: any) => ({
            id: a.id,
            name: a.display_name,
            role: a.role,
            statusText: a.presence,
            badge: a.actor_type === "human" ? "Y" : "C",
            badgeBg: "bg-[var(--surface-tertiary)]",
            badgeFg: "text-[var(--foreground)]"
          })));
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const activeLane = lanes.find((l) => l.id === activeLaneId) || lanes[0] || {} as WorkLaneData;


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

  const executeTerminalCommand = (command: string) => {
    logActivity(`Executed command in active lane: ${command}`);
    setPendingCommand(command);
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id === activeLaneId
          ? {
              ...lane,
              terminalLogs: [
                ...lane.terminalLogs,
                `admin@congruence:~/sample-app (${lane.branch})$ ${command}`,
              ],
            }
          : lane
      )
    );
  };

  const clearPendingCommand = () => {
    setPendingCommand(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        projectId,
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
        isIntegrationsOpen,
        setIsIntegrationsOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCloneOpen,
        setIsCloneOpen,
        toggleSleepWake,
        switchLane,
        toggleDevServer,
        simulateEdit,
        grantControl,
        revokeControl,
        toggleAllowWatchers,
        submitPrompt,
        toggleTaskCompletion,
        pendingCommand,
        clearPendingCommand,
        executeTerminalCommand,
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
