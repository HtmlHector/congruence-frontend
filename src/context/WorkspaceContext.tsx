"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  api,
  setApiTokenProvider,
  ProjectData,
  WorkLaneData,
  WorkspaceActor,
  ServiceData,
  GitDiffData,
  ActivityData,
} from "@/lib/api";

export interface ActivityEvent {
  id: string;
  timestamp: string;
  text: string;
}

export type WorkspaceViewMode = "hub" | "deck" | "pull-requests";

export interface WorktreeChat {
  id: string;
  laneId: string;
  title: string;
  harness: "Claude" | "Codex" | "Antigravity" | "Shell";
  model?: string;
  createdAt: string;
}

interface WorkspaceContextType {
  projectId: string | null;
  project: ProjectData | null;
  projects: ProjectData[];
  switchProject: (projectId: string) => Promise<void>;
  mode: WorkspaceViewMode;
  setMode: (mode: WorkspaceViewMode) => void;
  hostState: "awake" | "asleep" | "waking" | "sleeping";
  activeLaneId: string | null;
  activeLane: WorkLaneData | null;
  lanes: WorkLaneData[];
  chats: WorktreeChat[];
  activeChatId: string | null;
  actors: WorkspaceActor[];
  services: ServiceData[];
  diff: GitDiffData | null;
  activeTab: "preview" | "terminal" | "changes";
  setActiveTab: (tab: "preview" | "terminal" | "changes") => void;
  activityEvents: ActivityEvent[];
  isIntegrationsOpen: boolean;
  setIsIntegrationsOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCloneOpen: boolean;
  setIsCloneOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  actorSidebarCollapsed: boolean;
  setActorSidebarCollapsed: (collapsed: boolean) => void;
  toggleActorSidebar: () => void;
  isLoading: boolean;

  // Actions
  refreshProjectData: () => Promise<void>;
  toggleSleepWake: () => Promise<void>;
  switchLane: (laneId: string) => void;
  closeLane: (laneId: string, e?: React.MouseEvent) => void;
  createChat: (laneId: string, harness: "Claude" | "Codex" | "Antigravity" | "Shell", title?: string) => string;
  switchChat: (chatId: string) => void;
  closeChat: (chatId: string, e?: React.MouseEvent) => void;
  toggleDevServer: () => void;
  grantControl: (actorId: string) => Promise<void>;
  revokeControl: () => Promise<void>;
  toggleAllowWatchers: (val: boolean) => void;
  submitPrompt: (promptText: string, harness: string, model: string, effort: string) => Promise<void>;
  pendingCommand: string | null;
  clearPendingCommand: () => void;
  executeTerminalCommand: (command: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const DEMO_PROJECTS: ProjectData[] = [
  {
    id: "proj-ecommerce",
    name: "ecommerce-test-app",
    slug: "ecommerce-test-app",
    repo_full_name: "HtmlHector/ecommerce-test-app",
    default_branch: "main",
    host: {
      id: "host-1",
      state: "awake",
      backend_type: "docker",
    },
  },
  {
    id: "proj-spec-docs",
    name: "spec-docs",
    slug: "spec-docs",
    repo_full_name: "HtmlHector/spec-docs",
    default_branch: "main",
    host: {
      id: "host-2",
      state: "awake",
      backend_type: "docker",
    },
  },
];

const DEMO_LANES: WorkLaneData[] = [
  {
    id: "lane-pair",
    name: "Pair lane",
    slug: "pair-main",
    branch: "main",
    branch_name: "main",
    is_pair_lane: true,
    status: "ready",
  },
  {
    id: "lane-claude",
    name: "Claude Code",
    slug: "claude-progress",
    branch: "claude/progress",
    branch_name: "claude/progress",
    is_pair_lane: false,
    status: "ready",
    harness: "claude",
  },
];

const INITIAL_CHATS: WorktreeChat[] = [
  {
    id: "chat-pair-1",
    laneId: "lane-pair",
    title: "Terminal 1",
    harness: "Shell",
    createdAt: "13m ago",
  },
  {
    id: "chat-claude-1",
    laneId: "lane-claude",
    title: "Claude Code",
    harness: "Claude",
    model: "Claude 3.7 Sonnet (Thinking)",
    createdAt: "42m ago",
  },
];

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WorkspaceViewMode>("deck");
  const [hostState, setHostState] = useState<"awake" | "asleep" | "waking" | "sleeping">("awake");
  const [lanes, setLanes] = useState<WorkLaneData[]>(DEMO_LANES);
  const [chats, setChats] = useState<WorktreeChat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>("chat-pair-1");
  const [actors, setActors] = useState<WorkspaceActor[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [diff, setDiff] = useState<GitDiffData | null>(null);
  const [activeLaneId, setActiveLaneId] = useState<string | null>(DEMO_LANES[0].id);
  const [activeTab, setActiveTab] = useState<"preview" | "terminal" | "changes">("preview");
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [actorSidebarCollapsed, setActorSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  // Backend requires a bearer token on every project route; attach the signed-in user's Clerk token.
  const { getToken } = useAuth();
  useEffect(() => {
    setApiTokenProvider(() => getToken());
    return () => setApiTokenProvider(null);
  }, [getToken]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleActorSidebar = useCallback(() => {
    setActorSidebarCollapsed((prev) => !prev);
  }, []);

  // Keyboard shortcut ⌘B / Ctrl+B to toggle left sidebar, ⌘J to toggle actor sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleActorSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, toggleActorSidebar]);


  const [projectId, setProjectId] = useState<string | null>(DEMO_PROJECTS[0].id);
  const [project, setProject] = useState<ProjectData | null>(DEMO_PROJECTS[0]);
  const [projects, setProjects] = useState<ProjectData[]>(DEMO_PROJECTS);

  const logActivity = (text: string) => {
    setActivityEvents((prev) => [
      { id: Date.now().toString(), timestamp: "just now", text },
      ...prev.slice(0, 19),
    ]);
  };

  const loadProjectDetails = useCallback(async (projId: string) => {
    try {
      setProjectId(projId);

      const [lanesData, actorsData, hostData, servicesData, activityData] = await Promise.allSettled([
        api.getLanes(projId),
        api.getActors(projId),
        api.getHost(projId),
        api.getServices(projId),
        api.getActivity(projId),
      ]);

      if (lanesData.status === "fulfilled" && lanesData.value.length > 0) {
        const mappedLanes: WorkLaneData[] = lanesData.value.map((l: any) => ({
          id: l.id,
          name: l.name,
          slug: l.slug,
          branch: l.branch_name || l.branch || "main",
          branch_name: l.branch_name || l.branch || "main",
          is_pair_lane: Boolean(l.is_pair_lane),
          status: l.status || "ready",
          harness: l.name.toLowerCase().includes("claude")
            ? "claude"
            : l.name.toLowerCase().includes("codex")
            ? "codex"
            : undefined,
        }));
        setLanes(mappedLanes);
        setActiveLaneId((prev) => {
          const exists = mappedLanes.find((m) => m.id === prev);
          return exists ? exists.id : mappedLanes[0].id;
        });
      } else {
        setLanes(DEMO_LANES);
        setActiveLaneId(DEMO_LANES[0].id);
      }

      if (actorsData.status === "fulfilled") {
        setActors(actorsData.value);
      } else {
        setActors([]);
      }

      if (hostData.status === "fulfilled") {
        setHostState(hostData.value.state || "awake");
      }

      if (servicesData.status === "fulfilled") {
        setServices(servicesData.value);
      } else {
        setServices([]);
      }

      if (activityData.status === "fulfilled" && activityData.value.length > 0) {
        setActivityEvents(
          activityData.value.map((e) => ({
            id: e.id,
            timestamp: e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "just now",
            text: e.summary,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load project details:", err);
      setLanes(DEMO_LANES);
      setActiveLaneId(DEMO_LANES[0].id);
    }
  }, []);

  const refreshProjectData = useCallback(async () => {
    if (projectId) {
      await loadProjectDetails(projectId);
    }
  }, [projectId, loadProjectDetails]);

  // Load projects on startup
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const projs = await api.getProjects();
        if (projs && projs.length > 0) {
          setProjects(projs);
          setProject(projs[0]);
          await loadProjectDetails(projs[0].id);
        } else {
          setProjects(DEMO_PROJECTS);
          setProject(DEMO_PROJECTS[0]);
          await loadProjectDetails(DEMO_PROJECTS[0].id);
        }
      } catch (err) {
        console.warn("Backend API not connected, running with demo projects:", err);
        setProjects(DEMO_PROJECTS);
        setProject(DEMO_PROJECTS[0]);
        await loadProjectDetails(DEMO_PROJECTS[0].id);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [loadProjectDetails]);

  // Fetch diff when active lane changes
  useEffect(() => {
    if (projectId && activeLaneId) {
      api
        .getDiff(projectId, activeLaneId)
        .then(setDiff)
        .catch(() => setDiff(null));
    }
  }, [projectId, activeLaneId]);

  const switchProject = async (targetProjId: string) => {
    const target = projects.find((p) => p.id === targetProjId);
    if (target) {
      setProject(target);
      await loadProjectDetails(target.id);
      logActivity(`Switched to project ${target.name} (${target.repo_full_name})`);
    }
  };

  const activeLane = lanes.find((l) => l.id === activeLaneId) || lanes[0] || null;

  const toggleSleepWake = async () => {
    if (!projectId) return;

    if (hostState === "awake") {
      setHostState("sleeping");
      logActivity("Putting host to sleep (suspending compute, keeping files)...");
      try {
        await api.sleepHost(projectId);
        setHostState("asleep");
        logActivity("Host asleep (compute paused, disk persistent)");
      } catch (err) {
        console.error(err);
        setHostState("awake");
      }
    } else if (hostState === "asleep") {
      setHostState("waking");
      logActivity("Waking compute host from sleep...");
      try {
        await api.wakeHost(projectId);
        setHostState("awake");
        logActivity("Host awake and ready");
      } catch (err) {
        console.error(err);
        setHostState("asleep");
      }
    }
  };

  const createChat = useCallback(
    (laneId: string, harness: "Claude" | "Codex" | "Antigravity" | "Shell", title?: string) => {
      const newChatId = `chat-${Date.now().toString().slice(-6)}`;
      const newChat: WorktreeChat = {
        id: newChatId,
        laneId,
        title: title || `${harness} Chat`,
        harness,
        model: harness === "Claude" ? "Claude 3.7 Sonnet" : harness === "Codex" ? "o3-mini" : "Gemini 2.0 Flash",
        createdAt: "just now",
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChatId);
      setActiveTab("terminal");
      logActivity(`Created new ${harness} chat in worktree`);
      return newChatId;
    },
    []
  );

  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const closeChat = useCallback((chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== chatId);
      if (activeChatId === chatId && remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      }
      return remaining;
    });
  }, [activeChatId]);

  const switchLane = (laneId: string) => {
    const lane = lanes.find((l) => l.id === laneId);
    if (!lane) return;
    setActiveLaneId(laneId);
    // Find or create active chat for this lane
    setChats((prev) => {
      const laneChats = prev.filter((c) => c.laneId === laneId);
      if (laneChats.length > 0) {
        setActiveChatId(laneChats[0].id);
        return prev;
      }
      const defaultChat: WorktreeChat = {
        id: `chat-${laneId}-${Date.now().toString().slice(-4)}`,
        laneId,
        title: lane.name.startsWith("Claude") ? "Claude Code" : lane.name.startsWith("Pair") ? "Terminal 1" : "Agent Chat",
        harness: lane.name.startsWith("Claude") ? "Claude" : lane.name.startsWith("Codex") ? "Codex" : "Shell",
        createdAt: "just now",
      };
      setActiveChatId(defaultChat.id);
      return [...prev, defaultChat];
    });
    logActivity(`Switched to worktree lane ${lane.name} (${lane.branch})`);
  };

  const closeLane = (laneId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lanes.length <= 1) return;
    const remaining = lanes.filter((l) => l.id !== laneId);
    setLanes(remaining);
    if (activeLaneId === laneId) {
      setActiveLaneId(remaining[0].id);
    }
    logActivity(`Closed worktree lane`);
  };

  const toggleDevServer = () => {
    if (hostState === "asleep") return;
    const isCurrentlyRunning = services.some(
      (s) => (s.lane_id === activeLaneId || !s.lane_id) && s.is_active
    );
    if (isCurrentlyRunning) {
      setServices((prev) =>
        prev.map((s) => (s.lane_id === activeLaneId ? { ...s, is_active: false } : s))
      );
      logActivity("Stopped dev server process");
    } else {
      const activeLaneObj = lanes.find((l) => l.id === activeLaneId);
      const laneService: ServiceData = {
        id: `srv-${activeLaneId || "default"}`,
        lane_id: activeLaneId || undefined,
        port: 3000,
        protocol: "http",
        address_subdomain: `${activeLaneObj?.slug || "ecommerce-app"}.preview`,
        access_mode: "private",
        is_active: true,
        url: `/preview/${activeLaneId || "lane-pair"}/3000/`,
      };
      setServices((prev) => {
        const existing = prev.findIndex((s) => s.lane_id === activeLaneId);
        if (existing >= 0) {
          const copy = [...prev];
          copy[existing] = { ...copy[existing], is_active: true };
          return copy;
        }
        return [...prev, laneService];
      });
      executeTerminalCommand("npm run dev");
      logActivity("Started live dev server on port 3000 -> https://ecommerce-test-app.preview.congruence.dev");
    }
  };

  const grantControl = async (actorId: string) => {
    if (!projectId || !activeLaneId) return;
    try {
      await api.grantLaneControl(projectId, activeLaneId, actorId, "write");
      logActivity(`Write control lease granted to actor on lane`);
      await refreshProjectData();
    } catch (err) {
      console.error("Failed to grant control:", err);
    }
  };

  const revokeControl = async () => {
    if (!projectId || !activeLaneId) return;
    try {
      await api.revokeLaneControl(projectId, activeLaneId);
      logActivity(`Write control reclaimed by owner`);
      await refreshProjectData();
    } catch (err) {
      console.error("Failed to revoke control:", err);
    }
  };

  const toggleAllowWatchers = (_val: boolean) => {
    // Watchers are allowed by default in Congruence invariants
  };

  const submitPrompt = async (
    promptText: string,
    harness: string,
    _model: string,
    _effort: string
  ) => {
    if (!projectId) return;
    const slug =
      promptText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24) || "task";
    const branchName = `agent/${slug}`;

    try {
      const createdLane = await api.createLane(projectId, {
        name: `${harness} · ${slug}`,
        slug: `lane-${slug}`,
        branch_name: branchName,
        is_pair_lane: false,
      });

      await refreshProjectData();
      setActiveLaneId(createdLane.id);
      
      // Create initial chat inside this new worktree
      const newChat: WorktreeChat = {
        id: `chat-${createdLane.id}-${Date.now().toString().slice(-4)}`,
        laneId: createdLane.id,
        title: `${harness} Task`,
        harness: harness as any,
        createdAt: "just now",
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChat.id);

      setMode("deck");
      setActiveTab("terminal");
      logActivity(`Spawned isolated worktree on branch ${branchName} for ${harness}`);

      // Pass the prompt to terminal
      const harnessCmd = harness.toLowerCase().includes("claude")
        ? `claude "${promptText.replace(/"/g, '\\"')}"`
        : `codex exec "${promptText.replace(/"/g, '\\"')}"`;
      setPendingCommand(harnessCmd);
    } catch (err) {
      console.warn("Failed to create agent lane on backend, adding locally:", err);
      const newLaneId = `lane-${slug}-${Date.now().toString().slice(-4)}`;
      const newLane: WorkLaneData = {
        id: newLaneId,
        name: `${harness} · ${slug}`,
        slug: `lane-${slug}`,
        branch: branchName,
        branch_name: branchName,
        is_pair_lane: harness === "Pair",
        status: "ready",
        harness: harness.toLowerCase().includes("claude")
          ? "claude"
          : harness.toLowerCase().includes("codex")
          ? "codex"
          : undefined,
      };
      setLanes((prev) => [...prev, newLane]);
      setActiveLaneId(newLaneId);

      const newChat: WorktreeChat = {
        id: `chat-${newLaneId}-${Date.now().toString().slice(-4)}`,
        laneId: newLaneId,
        title: `${harness} Task`,
        harness: harness as any,
        createdAt: "just now",
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChat.id);

      setMode("deck");
      setActiveTab("terminal");
      logActivity(`Spawned isolated worktree on branch ${branchName} for ${harness}`);

      const harnessCmd = harness.toLowerCase().includes("claude")
        ? `claude "${promptText.replace(/"/g, '\\"')}"`
        : `codex exec "${promptText.replace(/"/g, '\\"')}"`;
      setPendingCommand(harnessCmd);
    }
  };

  const executeTerminalCommand = (command: string) => {
    logActivity(`Command sent to PTY: ${command}`);
    setPendingCommand(command);
  };

  const clearPendingCommand = () => {
    setPendingCommand(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        projectId,
        project,
        projects,
        switchProject,
        mode,
        setMode,
        hostState,
        activeLaneId,
        activeLane,
        lanes,
        chats,
        activeChatId,
        actors,
        services,
        diff,
        activeTab,
        setActiveTab,
        activityEvents,
        isIntegrationsOpen,
        setIsIntegrationsOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCloneOpen,
        setIsCloneOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        actorSidebarCollapsed,
        setActorSidebarCollapsed,
        toggleActorSidebar,
        isLoading,

        refreshProjectData,
        toggleSleepWake,
        switchLane,
        closeLane,
        createChat,
        switchChat,
        closeChat,
        toggleDevServer,
        grantControl,
        revokeControl,
        toggleAllowWatchers,
        submitPrompt,
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
