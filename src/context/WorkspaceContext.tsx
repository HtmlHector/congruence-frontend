"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  api,
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
  actors: WorkspaceActor[];
  services: ServiceData[];
  diff: GitDiffData | null;
  activeTab: "preview" | "terminal" | "changes";
  setActiveTab: (tab: "preview" | "terminal" | "changes") => void;
  activityEvents: ActivityEvent[];
  isIntegrationsOpen: boolean;
  setIsIntegrationsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsTab: "general" | "environment" | "team" | "billing";
  setSettingsTab: (tab: "general" | "environment" | "team" | "billing") => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCloneOpen: boolean;
  setIsCloneOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isLoading: boolean;

  // Actions
  refreshProjectData: () => Promise<void>;
  toggleSleepWake: () => Promise<void>;
  switchLane: (laneId: string) => void;
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

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WorkspaceViewMode>("deck");
  const [hostState, setHostState] = useState<"awake" | "asleep" | "waking" | "sleeping">("awake");
  const [lanes, setLanes] = useState<WorkLaneData[]>([]);
  const [actors, setActors] = useState<WorkspaceActor[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [diff, setDiff] = useState<GitDiffData | null>(null);
  const [activeLaneId, setActiveLaneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "terminal" | "changes">("preview");
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "environment" | "team" | "billing">("general");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Keyboard shortcut ⌘B / Ctrl+B to toggle sidebar & ⌘, / Ctrl+, to open Settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        if (window.location.pathname !== "/settings") {
          window.location.href = "/settings";
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);


  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);

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
        setLanes([]);
        setActiveLaneId(null);
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
          setProjects([]);
          setProject(null);
          setLanes([]);
          setActors([]);
          setServices([]);
        }
      } catch (err) {
        console.error("Failed to fetch projects list:", err);
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

  const switchLane = (laneId: string) => {
    const lane = lanes.find((l) => l.id === laneId);
    if (!lane) return;
    setActiveLaneId(laneId);
    logActivity(`Switched to worktree lane ${lane.name} (${lane.branch})`);
  };

  const toggleDevServer = () => {
    if (hostState === "asleep") return;
    executeTerminalCommand("npm run dev");
    logActivity("Triggered dev server in terminal PTY");
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
      setMode("deck");
      setActiveTab("terminal");
      logActivity(`Spawned isolated worktree on branch ${branchName} for ${harness}`);

      // Pass the prompt to terminal
      const harnessCmd = harness.toLowerCase().includes("claude")
        ? `claude "${promptText.replace(/"/g, '\\"')}"`
        : `codex exec "${promptText.replace(/"/g, '\\"')}"`;
      setPendingCommand(harnessCmd);
    } catch (err) {
      console.error("Failed to create agent lane:", err);
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
        actors,
        services,
        diff,
        activeTab,
        setActiveTab,
        activityEvents,
        isIntegrationsOpen,
        setIsIntegrationsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        settingsTab,
        setSettingsTab,
        isSearchOpen,
        setIsSearchOpen,
        isCloneOpen,
        setIsCloneOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        isLoading,

        refreshProjectData,
        toggleSleepWake,
        switchLane,
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
