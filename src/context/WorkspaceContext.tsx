"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  api,
  setApiTokenProvider,
  ProjectData,
  WorkLaneData,
  WorkspaceActor,
  ServiceData,
  GitDiffData,
  ActivityData,
  GrantData,
} from "@/lib/api";
import {
  playCompletionChime,
  playInputNeededChime,
  requestNotificationPermission,
  sendDesktopNotification,
} from "@/lib/notifications";

export type SplitDirection = "vertical" | "horizontal";

export interface SplitPaneView {
  tabType: "chat" | "preview" | "changes";
  chatId?: string;
  agentView?: "chat" | "pty";
}

export interface PaneGroup {
  id: "primary" | "secondary";
  tabIds: string[];
  activeTabId: string;
  agentView?: "chat" | "pty";
}

export interface SplitState {
  isSplit: boolean;
  direction: SplitDirection;
  primaryView: SplitPaneView;
  secondaryView: SplitPaneView;
  ratio: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  text: string;
}

export type WorkspaceViewMode = "hub" | "deck" | "pull-requests";

export type AgentExecutionState = "idle" | "thinking" | "working" | "awaiting_input" | "completed" | "error";

export interface PendingQuestion {
  question: string;
  options?: string[];
}

export interface WorkspaceTenant {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
  plan: "Free" | "Pro" | "Enterprise";
  ownerEmail: string;
  createdAt: string;
  projectsCount?: number;
}

export interface WorktreeChat {
  id: string;
  laneId: string;
  title: string;
  harness: "Claude" | "Codex" | "Antigravity" | "Shell";
  model?: string;
  createdAt: string;
  state?: AgentExecutionState;
  activeTool?: string;
  pendingQuestion?: PendingQuestion | null;
  durationSeconds?: number;
}

interface WorkspaceContextType {
  currentTenant: WorkspaceTenant;
  tenants: WorkspaceTenant[];
  switchTenant: (tenantId: string) => void;
  createTenant: (name: string, plan?: "Free" | "Pro" | "Enterprise") => Promise<WorkspaceTenant>;
  isNewWorkspaceOpen: boolean;
  setIsNewWorkspaceOpen: (open: boolean) => void;
  projectId: string | null;
  project: ProjectData | null;
  projects: ProjectData[];
  switchProject: (projectId: string) => Promise<void>;
  createProject: (name: string, repoUrl?: string, repoFullName?: string) => Promise<ProjectData | null>;
  mode: WorkspaceViewMode;
  setMode: (mode: WorkspaceViewMode) => void;
  hostState: "awake" | "asleep" | "waking" | "sleeping";
  activeLaneId: string | null;
  activeLane: WorkLaneData | null;
  lanes: WorkLaneData[];
  chats: WorktreeChat[];
  activeChatId: string | null;
  chatHistories: Record<string, any[]>;
  addChatMessage: (chatId: string, message: any) => void;
  updateChatMessage: (chatId: string, messageId: string, updater: (prev: any) => any) => void;
  setChatState: (
    chatId: string,
    state: AgentExecutionState,
    meta?: { activeTool?: string; question?: PendingQuestion | null; durationSeconds?: number }
  ) => void;
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
  settingsTab: "general" | "providers" | "environment" | "team" | "billing";
  setSettingsTab: (tab: "general" | "providers" | "environment" | "team" | "billing") => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCloneOpen: boolean;
  setIsCloneOpen: (open: boolean) => void;
  isNewWorktreeOpen: boolean;
  setIsNewWorktreeOpen: (open: boolean) => void;
  worktreeTargetProjectId: string | null;
  setWorktreeTargetProjectId: (id: string | null) => void;
  openNewWorktreeModal: (targetProjId?: string) => void;
  createWorktree: (
    branchName: string,
    targetProjectId?: string,
    harness?: "Claude" | "Codex" | "Antigravity" | "Shell"
  ) => Promise<void>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  actorSidebarCollapsed: boolean;
  setActorSidebarCollapsed: (collapsed: boolean) => void;
  toggleActorSidebar: () => void;
  isLoading: boolean;
  tabOrders: Record<string, string[]>;
  setLaneTabOrder: (laneId: string, newOrder: string[]) => void;
  splitState: SplitState;
  setSplitState: React.Dispatch<React.SetStateAction<SplitState>>;
  openSplit: (
    tab: { tabType: "chat" | "preview" | "changes"; chatId?: string; agentView?: "chat" | "pty" },
    direction?: SplitDirection,
    side?: "left" | "right" | "top" | "bottom"
  ) => void;
  closeSplit: () => void;
  toggleSplitDirection: () => void;
  swapSplitPanes: () => void;
  setSplitRatio: (ratio: number) => void;
  setPaneView: (pane: "primary" | "secondary", view: SplitPaneView) => void;
  paneGroups: { primary: PaneGroup; secondary: PaneGroup };
  setGroupActiveTab: (groupId: "primary" | "secondary", tabId: string) => void;
  setGroupAgentView: (groupId: "primary" | "secondary", view: "chat" | "pty") => void;
  closeTabInGroup: (groupId: "primary" | "secondary", tabId: string) => void;
  closeTabsToTheRight: (groupId: "primary" | "secondary", tabId: string) => void;
  closeOtherTabs: (groupId: "primary" | "secondary", tabId: string) => void;
  closeAllTabs: (groupId: "primary" | "secondary") => void;
  addTabToGroup: (groupId: "primary" | "secondary", tabId: string) => void;
  reorderGroupTabs: (groupId: "primary" | "secondary", newOrder: string[]) => void;
  moveTabBetweenGroups: (
    fromGroup: "primary" | "secondary",
    toGroup: "primary" | "secondary",
    tabId: string,
    targetIdx?: number
  ) => void;
  createChatInGroup: (
    groupId: "primary" | "secondary",
    harness: "Claude" | "Codex" | "Antigravity" | "Shell",
    title?: string
  ) => string;
  openSplitWithTab: (
    tabId: string,
    direction?: SplitDirection,
    side?: "left" | "right" | "top" | "bottom"
  ) => void;
  openFileTab: (filePath: string, targetGroupId?: "primary" | "secondary") => void;

  // Actions
  refreshProjectData: () => Promise<void>;
  toggleSleepWake: () => Promise<void>;
  switchLane: (laneId: string) => void;
  closeLane: (laneId: string, e?: React.MouseEvent) => void;
  createChat: (laneId: string, harness: "Claude" | "Codex" | "Antigravity" | "Shell", title?: string) => string;
  switchChat: (chatId: string) => void;
  closeChat: (chatId: string, e?: React.MouseEvent) => void;
  clearChatHistory: (chatId: string) => void;
  updateChatModel: (chatId: string, model: string) => void;
  toggleDevServer: () => void;
  grantControl: (actorId: string) => Promise<void>;
  revokeControl: () => Promise<void>;
  currentLease: GrantData | null;
  toggleAllowWatchers: (val: boolean) => void;
  submitPrompt: (promptText: string, harness: string, model: string, effort: string) => Promise<void>;
  pendingCommand: string | null;
  clearPendingCommand: () => void;
  executeTerminalCommand: (command: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);



export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const workspaceSlugOrId = params?.workspaceId as string | undefined;
  const { user } = useUser();

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";
  const userDisplayName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName}'s Workspace` : "Personal Workspace");

  const [tenants, setTenants] = useState<WorkspaceTenant[]>(() => {
    if (workspaceSlugOrId) {
      const formatted = workspaceSlugOrId
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return [
        {
          id: workspaceSlugOrId,
          name: formatted,
          slug: workspaceSlugOrId,
          role: "owner",
          plan: "Pro",
          ownerEmail: userEmail,
          createdAt: new Date().toISOString().split("T")[0],
          projectsCount: 1,
        },
      ];
    }
    return [
      {
        id: "personal",
        name: userDisplayName,
        slug: "personal",
        role: "owner",
        plan: "Pro",
        ownerEmail: userEmail,
        createdAt: new Date().toISOString().split("T")[0],
        projectsCount: 0,
      },
    ];
  });

  const [currentTenant, setCurrentTenant] = useState<WorkspaceTenant>(() => {
    if (workspaceSlugOrId) {
      const formatted = workspaceSlugOrId
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return {
        id: workspaceSlugOrId,
        name: formatted,
        slug: workspaceSlugOrId,
        role: "owner",
        plan: "Pro",
        ownerEmail: userEmail,
        createdAt: new Date().toISOString().split("T")[0],
        projectsCount: 1,
      };
    }
    return {
      id: "personal",
      name: userDisplayName,
      slug: "personal",
      role: "owner",
      plan: "Pro",
      ownerEmail: userEmail,
      createdAt: new Date().toISOString().split("T")[0],
      projectsCount: 0,
    };
  });

  // Fetch live workspaces directly from Docker PostgreSQL
  useEffect(() => {
    async function loadWorkspacesFromDb() {
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const mapped: WorkspaceTenant[] = rows.map((r: any) => ({
              id: r.workspace_id,
              name: r.name,
              slug: r.slug,
              role: "owner",
              plan:
                r.plan_tier === "FREE"
                  ? "Free"
                  : r.plan_tier === "ENTERPRISE"
                  ? "Enterprise"
                  : "Pro",
              ownerEmail: userEmail,
              createdAt: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
              projectsCount: 1,
            }));
            setTenants(mapped);
            if (workspaceSlugOrId) {
              const matched = mapped.find(
                (m) => m.id === workspaceSlugOrId || m.slug === workspaceSlugOrId
              );
              if (matched) {
                setCurrentTenant(matched);
              }
            } else if (mapped.length > 0) {
              setCurrentTenant(mapped[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load workspaces from DB API:", err);
      }
    }
    loadWorkspacesFromDb();
  }, [workspaceSlugOrId, userEmail]);

  // Sync currentTenant when route param changes
  useEffect(() => {
    if (!workspaceSlugOrId) return;

    const existing = tenants.find(
      (t) => t.slug === workspaceSlugOrId || t.id === workspaceSlugOrId
    );

    if (existing) {
      setCurrentTenant(existing);
    } else {
      const formatted = workspaceSlugOrId
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      const autoTenant: WorkspaceTenant = {
        id: workspaceSlugOrId,
        name: formatted,
        slug: workspaceSlugOrId,
        role: "owner",
        plan: "Pro",
        ownerEmail: userEmail,
        createdAt: new Date().toISOString().split("T")[0],
        projectsCount: 1,
      };
      setTenants((prev) =>
        prev.some((t) => t.id === autoTenant.id || t.slug === autoTenant.slug)
          ? prev
          : [autoTenant, ...prev]
      );
      setCurrentTenant(autoTenant);
    }
  }, [workspaceSlugOrId, tenants, userEmail]);

  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);
  const [mode, setMode] = useState<WorkspaceViewMode>("deck");
  const [hostState, setHostState] = useState<"awake" | "asleep" | "waking" | "sleeping">("awake");
  const [lanes, setLanes] = useState<WorkLaneData[]>([]);
  const [chats, setChats] = useState<WorktreeChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, any[]>>({});
  const [actors, setActors] = useState<WorkspaceActor[]>([]);

  const switchTenant = useCallback(
    (tenantId: string) => {
      const found = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
      if (!found) return;
      setCurrentTenant(found);
      if (typeof window !== "undefined") {
        localStorage.setItem("congruence_active_tenant", found.id);
      }
      router.push(`/${found.id}`);
    },
    [tenants, router]
  );

  const createTenant = useCallback(
    async (name: string, plan: "Free" | "Pro" | "Enterprise" = "Pro") => {
      try {
        const res = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, plan }),
        });
        if (res.ok) {
          const row = await res.json();
          const newTenant: WorkspaceTenant = {
            id: row.workspace_id,
            name: row.name,
            slug: row.slug,
            role: "owner",
            plan,
            ownerEmail: userEmail,
            createdAt: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            projectsCount: 1,
          };
          setTenants((prev) => [newTenant, ...prev.filter((t) => t.id !== newTenant.id)]);
          setCurrentTenant(newTenant);
          if (typeof window !== "undefined") {
            localStorage.setItem("congruence_active_tenant", newTenant.id);
          }
          router.push(`/${newTenant.id}`);
          return newTenant;
        }
      } catch (err) {
        console.error("Failed to insert workspace in Docker Postgres:", err);
      }

      // Fallback
      const fallbackId = `ws_${Date.now().toString(36)}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const fallbackTenant: WorkspaceTenant = {
        id: fallbackId,
        name,
        slug,
        role: "owner",
        plan,
        ownerEmail: userEmail,
        createdAt: new Date().toISOString().split("T")[0],
        projectsCount: 1,
      };
      setTenants((prev) => [fallbackTenant, ...prev]);
      setCurrentTenant(fallbackTenant);
      router.push(`/${fallbackTenant.id}`);
      return fallbackTenant;
    },
    [router, userEmail]
  );

  const addChatMessage = useCallback((chatId: string, message: any) => {
    setChatHistories((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));
  }, []);

  const updateChatMessage = useCallback((chatId: string, messageId: string, updater: (prev: any) => any) => {
    setChatHistories((prev) => {
      const history = prev[chatId] || [];
      const updated = history.map((msg) => (msg.id === messageId ? updater(msg) : msg));
      return {
        ...prev,
        [chatId]: updated,
      };
    });
  }, []);

  const setChatState = useCallback(
    (
      chatId: string,
      state: AgentExecutionState,
      meta?: { activeTool?: string; question?: PendingQuestion | null; durationSeconds?: number }
    ) => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            state,
            activeTool: meta?.activeTool ?? (state === "working" ? c.activeTool : undefined),
            pendingQuestion: meta?.question !== undefined ? meta.question : c.pendingQuestion,
            durationSeconds: meta?.durationSeconds ?? c.durationSeconds,
          };
        })
      );
    },
    []
  );
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [diff, setDiff] = useState<GitDiffData | null>(null);
  const [activeLaneId, setActiveLaneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "terminal" | "changes">("preview");
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "providers" | "environment" | "team" | "billing">("general");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [isNewWorktreeOpen, setIsNewWorktreeOpen] = useState(false);
  const [worktreeTargetProjectId, setWorktreeTargetProjectId] = useState<string | null>(null);

  const openNewWorktreeModal = useCallback((targetProjId?: string) => {
    setWorktreeTargetProjectId(targetProjId || projectId || null);
    setIsNewWorktreeOpen(true);
  }, [projectId]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [actorSidebarCollapsed, setActorSidebarCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [tabOrders, setTabOrders] = useState<Record<string, string[]>>({});

  const [splitState, setSplitState] = useState<SplitState>({
    isSplit: false,
    direction: "vertical",
    primaryView: { tabType: "preview" },
    secondaryView: { tabType: "changes" },
    ratio: 50,
  });

  const setLaneTabOrder = useCallback((laneId: string, newOrder: string[]) => {
    setTabOrders((prev) => ({
      ...prev,
      [laneId]: newOrder,
    }));
  }, []);

  const openSplit = useCallback(
    (
      tab: { tabType: "chat" | "preview" | "changes"; chatId?: string; agentView?: "chat" | "pty" },
      direction: SplitDirection = "vertical",
      side: "left" | "right" | "top" | "bottom" = "right"
    ) => {
      setSplitState((prev) => {
        const currentPrimary: SplitPaneView = prev.isSplit
          ? prev.primaryView
          : {
              tabType: activeTab === "terminal" ? "chat" : activeTab,
              chatId: activeChatId || undefined,
            };

        const targetSplitDir = side === "top" || side === "bottom" ? "horizontal" : direction;

        if (side === "left" || side === "top") {
          return {
            isSplit: true,
            direction: targetSplitDir,
            primaryView: tab,
            secondaryView: currentPrimary,
            ratio: prev.ratio || 50,
          };
        } else {
          return {
            isSplit: true,
            direction: targetSplitDir,
            primaryView: currentPrimary,
            secondaryView: tab,
            ratio: prev.ratio || 50,
          };
        }
      });
    },
    [activeTab, activeChatId]
  );

  const closeSplit = useCallback(() => {
    setSplitState((prev) => ({ ...prev, isSplit: false }));
  }, []);

  const toggleSplitDirection = useCallback(() => {
    setSplitState((prev) => ({
      ...prev,
      direction: prev.direction === "vertical" ? "horizontal" : "vertical",
    }));
  }, []);

  const swapSplitPanes = useCallback(() => {
    setSplitState((prev) => ({
      ...prev,
      primaryView: prev.secondaryView,
      secondaryView: prev.primaryView,
    }));
  }, []);

  const setSplitRatio = useCallback((ratio: number) => {
    setSplitState((prev) => ({
      ...prev,
      ratio: Math.min(80, Math.max(20, ratio)),
    }));
  }, []);

  const setPaneView = useCallback((pane: "primary" | "secondary", view: SplitPaneView) => {
    setSplitState((prev) => ({
      ...prev,
      [pane === "primary" ? "primaryView" : "secondaryView"]: view,
    }));
  }, []);

  const [paneGroups, setPaneGroups] = useState<{ primary: PaneGroup; secondary: PaneGroup }>({
    primary: {
      id: "primary",
      tabIds: ["preview", "changes"],
      activeTabId: "preview",
      agentView: "chat",
    },
    secondary: {
      id: "secondary",
      tabIds: ["preview", "changes"],
      activeTabId: "preview",
      agentView: "chat",
    },
  });

  const setGroupActiveTab = useCallback(
    (groupId: "primary" | "secondary", tabId: string) => {
      setPaneGroups((prev) => {
        const targetChat = chats.find((c) => c.id === tabId);
        const isAiAgent = targetChat && targetChat.harness !== "Shell";
        return {
          ...prev,
          [groupId]: {
            ...prev[groupId],
            activeTabId: tabId,
            ...(isAiAgent ? { agentView: "chat" } : targetChat?.harness === "Shell" ? { agentView: "pty" } : {}),
          },
        };
      });
      if (groupId === "primary") {
        if (tabId === "preview") setActiveTab("preview");
        else if (tabId === "changes") setActiveTab("changes");
        else {
          setActiveTab("terminal");
          setActiveChatId(tabId);
        }
      }
    },
    [chats]
  );

  const setGroupAgentView = useCallback((groupId: "primary" | "secondary", view: "chat" | "pty") => {
    setPaneGroups((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        agentView: view,
      },
    }));
  }, []);

  const closeTabInGroup = useCallback(
    (groupId: "primary" | "secondary", tabId: string) => {
      setPaneGroups((prev) => {
        const group = prev[groupId];
        const remainingTabIds = group.tabIds.filter((id) => id !== tabId);

        if (groupId === "secondary" && remainingTabIds.length === 0) {
          setSplitState((s) => ({ ...s, isSplit: false }));
        }

        let nextActiveTabId = group.activeTabId;
        if (group.activeTabId === tabId) {
          const closedIdx = group.tabIds.indexOf(tabId);
          if (remainingTabIds.length > 0) {
            const newIdx = Math.min(closedIdx, remainingTabIds.length - 1);
            nextActiveTabId = remainingTabIds[newIdx];
          } else {
            nextActiveTabId = "preview";
          }
        }

        return {
          ...prev,
          [groupId]: {
            ...group,
            tabIds: remainingTabIds.length > 0 ? remainingTabIds : ["preview"],
            activeTabId: nextActiveTabId,
          },
        };
      });
      setChats((prev) => prev.filter((c) => c.id !== tabId));
      setChatHistories((prev) => {
        const copy = { ...prev };
        delete copy[tabId];
        return copy;
      });
      if (projectId) {
        api.deleteProjectChat(projectId, tabId).catch(() => {});
      }
    },
    [projectId]
  );

  const closeTabsToTheRight = useCallback(
    (groupId: "primary" | "secondary", tabId: string) => {
      setPaneGroups((prev) => {
        const group = prev[groupId];
        const idx = group.tabIds.indexOf(tabId);
        if (idx === -1) return prev;

        const remainingTabIds = group.tabIds.slice(0, idx + 1);
        const removedIds = group.tabIds.slice(idx + 1);
        let nextActiveTabId = group.activeTabId;
        if (!remainingTabIds.includes(group.activeTabId)) {
          nextActiveTabId = tabId;
        }

        if (removedIds.length > 0) {
          setChats((prevChats) => prevChats.filter((c) => !removedIds.includes(c.id)));
          setChatHistories((prevHistories) => {
            const copy = { ...prevHistories };
            removedIds.forEach((id) => delete copy[id]);
            return copy;
          });
          if (projectId) {
            removedIds.forEach((id) => {
              api.deleteProjectChat(projectId, id).catch(() => {});
            });
          }
        }

        return {
          ...prev,
          [groupId]: {
            ...group,
            tabIds: remainingTabIds.length > 0 ? remainingTabIds : ["preview"],
            activeTabId: nextActiveTabId,
          },
        };
      });
    },
    [projectId]
  );

  const closeOtherTabs = useCallback(
    (groupId: "primary" | "secondary", tabId: string) => {
      setPaneGroups((prev) => {
        const group = prev[groupId];
        const otherIds = group.tabIds.filter((id) => id !== tabId);
        if (otherIds.length > 0) {
          setChats((prevChats) => prevChats.filter((c) => !otherIds.includes(c.id)));
          setChatHistories((prevHistories) => {
            const copy = { ...prevHistories };
            otherIds.forEach((id) => delete copy[id]);
            return copy;
          });
          if (projectId) {
            otherIds.forEach((id) => {
              api.deleteProjectChat(projectId, id).catch(() => {});
            });
          }
        }
        return {
          ...prev,
          [groupId]: {
            ...group,
            tabIds: [tabId],
            activeTabId: tabId,
          },
        };
      });
    },
    [projectId]
  );

  const closeAllTabs = useCallback(
    (groupId: "primary" | "secondary") => {
      setPaneGroups((prev) => {
        const group = prev[groupId];
        const removedIds = group.tabIds.filter((id) => id !== "preview");
        if (removedIds.length > 0 && projectId) {
          removedIds.forEach((id) => {
            api.deleteProjectChat(projectId, id).catch(() => {});
          });
        }
        return {
          ...prev,
          [groupId]: {
            ...group,
            tabIds: ["preview"],
            activeTabId: "preview",
          },
        };
      });
      setChats((prev) => {
        if (projectId) {
          prev.forEach((c) => {
            api.deleteProjectChat(projectId, c.id).catch(() => {});
          });
        }
        return [];
      });
      setChatHistories({});
      setActiveChatId(null);
      setActiveTab("preview");
    },
    [projectId]
  );

  const addTabToGroup = useCallback((groupId: "primary" | "secondary", tabId: string) => {
    setPaneGroups((prev) => {
      const group = prev[groupId];
      const tabIds = group.tabIds.includes(tabId) ? group.tabIds : [...group.tabIds, tabId];
      return {
        ...prev,
        [groupId]: {
          ...group,
          tabIds,
          activeTabId: tabId,
        },
      };
    });
  }, []);

  const reorderGroupTabs = useCallback((groupId: "primary" | "secondary", newOrder: string[]) => {
    setPaneGroups((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        tabIds: newOrder,
      },
    }));
  }, []);

  const moveTabBetweenGroups = useCallback(
    (fromGroup: "primary" | "secondary", toGroup: "primary" | "secondary", tabId: string, targetIdx?: number) => {
      if (fromGroup === toGroup) return;
      setPaneGroups((prev) => {
        const sourceGroup = prev[fromGroup];
        const destGroup = prev[toGroup];

        const newSourceTabIds = sourceGroup.tabIds.filter((id) => id !== tabId);
        const newDestTabIds = destGroup.tabIds.filter((id) => id !== tabId);

        if (typeof targetIdx === "number" && targetIdx >= 0) {
          newDestTabIds.splice(targetIdx, 0, tabId);
        } else {
          newDestTabIds.push(tabId);
        }

        if (fromGroup === "secondary" && newSourceTabIds.length === 0) {
          setSplitState((s) => ({ ...s, isSplit: false }));
        }

        let nextSourceActiveId = sourceGroup.activeTabId;
        if (sourceGroup.activeTabId === tabId) {
          nextSourceActiveId = newSourceTabIds[0] || "preview";
        }

        return {
          ...prev,
          [fromGroup]: {
            ...sourceGroup,
            tabIds: newSourceTabIds.length > 0 ? newSourceTabIds : ["preview"],
            activeTabId: nextSourceActiveId,
          },
          [toGroup]: {
            ...destGroup,
            tabIds: newDestTabIds,
            activeTabId: tabId,
          },
        };
      });
    },
    []
  );

  const openFileTab = useCallback(
    (filePath: string, targetGroupId: "primary" | "secondary" = "primary") => {
      const tabId = `file:${filePath}`;
      setPaneGroups((prev) => {
        const group = prev[targetGroupId];
        const tabIds = group.tabIds.includes(tabId) ? group.tabIds : [...group.tabIds, tabId];
        return {
          ...prev,
          [targetGroupId]: {
            ...group,
            tabIds,
            activeTabId: tabId,
          },
        };
      });
      logActivity(`Opened file: ${filePath}`);
    },
    []
  );

  const createChat = useCallback(
    (laneId: string, harness: "Claude" | "Codex" | "Antigravity" | "Shell", title?: string) => {
      const newChatId = `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const defaultModel =
        harness === "Claude"
          ? "Claude Sonnet 4.6 (Thinking)"
          : harness === "Codex"
          ? "o3-mini"
          : harness === "Antigravity"
          ? "Gemini 3.8 Flash (High)"
          : undefined;
      const newChat: WorktreeChat = {
        id: newChatId,
        laneId,
        title: title || `${harness} Chat`,
        harness,
        model: defaultModel,
        createdAt: "just now",
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChatId);
      setActiveTab("terminal");
      setPaneGroups((prev) => ({
        ...prev,
        primary: {
          ...prev.primary,
          tabIds: prev.primary.tabIds.includes(newChatId)
            ? prev.primary.tabIds
            : [...prev.primary.tabIds, newChatId],
          activeTabId: newChatId,
          agentView: harness === "Shell" ? "pty" : "chat",
        },
      }));
      logActivity(`Created new ${harness} chat in worktree`);
      return newChatId;
    },
    []
  );

  const createChatInGroup = useCallback(
    (groupId: "primary" | "secondary", harness: "Claude" | "Codex" | "Antigravity" | "Shell", title?: string) => {
      if (!activeLaneId) return "";
      const count = chats.filter((c) => c.laneId === activeLaneId).length + 1;
      const defaultTitle = `${harness} Chat ${count}`;
      const newChatId = createChat(activeLaneId, harness, title || defaultTitle);
      addTabToGroup(groupId, newChatId);
      setGroupAgentView(groupId, harness === "Shell" ? "pty" : "chat");
      return newChatId;
    },
    [activeLaneId, chats, createChat, addTabToGroup, setGroupAgentView]
  );

  const openSplitWithTab = useCallback(
    (tabId: string, direction: SplitDirection = "vertical", side: "left" | "right" | "top" | "bottom" = "right") => {
      setSplitState({
        isSplit: true,
        direction: side === "top" || side === "bottom" ? "horizontal" : direction,
        primaryView: { tabType: "chat" },
        secondaryView: { tabType: "preview" },
        ratio: 50,
      });

      setPaneGroups((prev) => {
        const secondaryTabs = prev.secondary.tabIds.includes(tabId)
          ? prev.secondary.tabIds
          : [tabId, ...prev.secondary.tabIds.filter((t) => t !== tabId)];

        if (side === "left" || side === "top") {
          return {
            primary: {
              ...prev.secondary,
              tabIds: secondaryTabs,
              activeTabId: tabId,
            },
            secondary: prev.primary,
          };
        } else {
          return {
            primary: prev.primary,
            secondary: {
              ...prev.secondary,
              tabIds: secondaryTabs,
              activeTabId: tabId,
            },
          };
        }
      });
    },
    []
  );
  const [currentLease, setCurrentLease] = useState<GrantData | null>(null);

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

  // Keyboard shortcut ⌘B / Ctrl+B to toggle left sidebar, ⌘J to toggle actor sidebar, ⌘, to open settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/settings")) {
          window.location.href = "/settings";
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
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


  const logActivity = (text: string) => {
    setActivityEvents((prev) => [
      { id: Date.now().toString(), timestamp: "just now", text },
      ...prev.slice(0, 19),
    ]);
  };

  const isHydratedRef = useRef(false);
  const STORAGE_KEY_PREFIX = "congruence:workspace:";

  const hydrateWorkspace = useCallback(async (projId: string) => {
    if (typeof window === "undefined") return;
    const storageKey = `${STORAGE_KEY_PREFIX}${projId}`;
    let loadedFromStorage = false;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.chats)) {
          setChats(parsed.chats);
        }
        if (parsed.chatHistories && typeof parsed.chatHistories === "object") {
          setChatHistories(parsed.chatHistories);
        }
        if (parsed.activeChatId !== undefined) setActiveChatId(parsed.activeChatId);
        if (parsed.activeLaneId) setActiveLaneId(parsed.activeLaneId);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.sidebarCollapsed !== undefined) setSidebarCollapsed(parsed.sidebarCollapsed);
        if (parsed.actorSidebarCollapsed !== undefined) setActorSidebarCollapsed(parsed.actorSidebarCollapsed);
        if (parsed.tabOrders) setTabOrders(parsed.tabOrders);
        if (parsed.splitState) setSplitState(parsed.splitState);
        if (parsed.paneGroups) {
          setPaneGroups(parsed.paneGroups);
        }
        loadedFromStorage = true;
      }
    } catch (err) {
      console.warn("Failed to hydrate workspace from localStorage:", err);
    }

    // Background sync / backfill from backend database ONLY if not loaded from localStorage
    if (!loadedFromStorage) {
      try {
        const backendChats = await api.getProjectChats(projId);
        if (backendChats && backendChats.length > 0) {
          const mappedChats: WorktreeChat[] = backendChats.map((bc) => ({
            id: bc.id,
            laneId: bc.lane_id,
            title: bc.title,
            harness: bc.harness as any,
            model: bc.model,
            state: (bc.state as any) || "idle",
            createdAt: bc.created_at
              ? new Date(bc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "earlier",
          }));
          const mappedHistories: Record<string, any[]> = {};
          backendChats.forEach((bc) => {
            mappedHistories[bc.id] = Array.isArray(bc.messages) ? bc.messages : [];
          });
          setChats(mappedChats);
          setChatHistories(mappedHistories);
          if (mappedChats.length > 0) {
            setActiveChatId(mappedChats[0].id);
            setPaneGroups((prev) => ({
              ...prev,
              primary: {
                ...prev.primary,
                tabIds: [...mappedChats.map((c) => c.id), "preview", "changes"],
                activeTabId: mappedChats[0].id,
              },
            }));
          }
        }
      } catch {
        // Backend chat sync optional if offline
      }
    }

    isHydratedRef.current = true;
  }, []);

  const loadProjectDetails = useCallback(async (projId: string) => {
    try {
      setProjectId(projId);
      await hydrateWorkspace(projId);

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
        const initialLane: WorkLaneData = {
          id: `lane-main-${projId.slice(0, 6)}`,
          name: "main",
          slug: "main",
          branch: "main",
          branch_name: "main",
          is_pair_lane: true,
          status: "ready",
        };
        setLanes([initialLane]);
        setActiveLaneId(initialLane.id);
      }

      if (actorsData.status === "fulfilled" && actorsData.value.length > 0) {
        setActors(actorsData.value);
      } else {
        setActors([
          {
            id: "actor-owner",
            display_name: "You (Owner)",
            role: "owner",
            actor_type: "human",
            presence: "online",
          },
        ]);
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
      setLanes([]);
      setActiveLaneId(null);
    }
  }, [hydrateWorkspace]);

  // Persist to localStorage and debounced sync to backend
  useEffect(() => {
    if (!isHydratedRef.current || !projectId || typeof window === "undefined") return;

    const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;
    try {
      const dataToPersist = {
        chats,
        chatHistories,
        activeChatId,
        activeLaneId,
        activeTab,
        mode,
        sidebarCollapsed,
        actorSidebarCollapsed,
        tabOrders,
        paneGroups,
        splitState,
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToPersist));
    } catch (err) {
      console.warn("Failed to persist workspace to localStorage:", err);
    }

    const timer = setTimeout(() => {
      chats.forEach((chat) => {
        const messages = chatHistories[chat.id] || [];
        api
          .saveProjectChat(projectId, {
            id: chat.id,
            lane_id: chat.laneId,
            title: chat.title,
            harness: chat.harness,
            model: chat.model,
            state: chat.state || "idle",
            messages,
          })
          .catch(() => {});
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    projectId,
    chats,
    chatHistories,
    activeChatId,
    activeLaneId,
    activeTab,
    mode,
    sidebarCollapsed,
    actorSidebarCollapsed,
    tabOrders,
    paneGroups,
    splitState,
  ]);

  const refreshProjectData = useCallback(async () => {
    if (!currentTenant?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentTenant.id}/projects`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped: ProjectData[] = rows.map((r: any) => {
            const connectedRepos = Array.isArray(r.connected_repo_ids)
              ? r.connected_repo_ids
              : [];
            const repoFullName = connectedRepos[0] || r.name;
            return {
              id: r.id,
              name: r.name,
              slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              repo_full_name: repoFullName,
              default_branch: "main",
              host: {
                id: `host-${r.id.slice(0, 6)}`,
                state: "awake",
                backend_type: "docker",
              },
            };
          });
          setProjects(mapped);
          const currentOrFirst = mapped.find((p) => p.id === projectId) || mapped[0];
          setProject(currentOrFirst);
          setProjectId(currentOrFirst.id);
          await loadProjectDetails(currentOrFirst.id);
        } else {
          setProjects([]);
          setProject(null);
          setProjectId(null);
          setLanes([]);
          setChats([]);
          setActiveLaneId(null);
          setActiveChatId(null);
        }
      }
    } catch (e) {
      console.warn("Failed to refresh workspace projects:", e);
    }
  }, [currentTenant?.id, projectId, loadProjectDetails]);

  // Load workspace-specific projects whenever currentTenant.id changes
  useEffect(() => {
    async function loadTenantProjects() {
      if (!currentTenant?.id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/workspaces/${currentTenant.id}/projects`);
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const mapped: ProjectData[] = rows.map((r: any) => {
              const connectedRepos = Array.isArray(r.connected_repo_ids)
                ? r.connected_repo_ids
                : [];
              const repoFullName = connectedRepos[0] || r.name;
              return {
                id: r.id,
                name: r.name,
                slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                repo_full_name: repoFullName,
                default_branch: "main",
                host: {
                  id: `host-${r.id.slice(0, 6)}`,
                  state: "awake",
                  backend_type: "docker",
                },
              };
            });
            setProjects(mapped);
            setProject(mapped[0]);
            setProjectId(mapped[0].id);
            await loadProjectDetails(mapped[0].id);
          } else {
            // Workspace is empty (0 projects)
            setProjects([]);
            setProject(null);
            setProjectId(null);
            setLanes([]);
            setChats([]);
            setActiveLaneId(null);
            setActiveChatId(null);
          }
        } else {
          setProjects([]);
          setProject(null);
          setProjectId(null);
          setLanes([]);
          setChats([]);
          setActiveLaneId(null);
          setActiveChatId(null);
        }
      } catch (err) {
        console.warn("Could not load projects for tenant:", err);
        setProjects([]);
        setProject(null);
        setProjectId(null);
        setLanes([]);
        setChats([]);
        setActiveLaneId(null);
        setActiveChatId(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadTenantProjects();
  }, [currentTenant?.id, loadProjectDetails]);

  const createProject = useCallback(
    async (name: string, repoUrl?: string, repoFullName?: string) => {
      if (!currentTenant?.id) return null;
      try {
        const res = await fetch(`/api/workspaces/${currentTenant.id}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            repoFullName: repoFullName || name,
            description: repoUrl || "",
          }),
        });
        if (res.ok) {
          const row = await res.json();
          const newProj: ProjectData = {
            id: row.id,
            name: row.name,
            slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            repo_full_name: repoFullName || row.name,
            default_branch: row.default_branch || "main",
            host: {
              id: `host-${row.id.slice(0, 6)}`,
              state: "awake",
              backend_type: "docker",
            },
          };
          setProjects((prev) => [...prev, newProj]);
          setProject(newProj);
          setProjectId(newProj.id);
          await loadProjectDetails(newProj.id);
          logActivity(`Created project ${newProj.name} (${newProj.repo_full_name})`);
          return newProj;
        }
      } catch (err) {
        console.error("Failed to create workspace project:", err);
      }
      return null;
    },
    [currentTenant?.id, loadProjectDetails]
  );

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

  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const closeChat = useCallback(
    (chatId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setChats((prev) => {
        const remaining = prev.filter((c) => c.id !== chatId);
        if (activeChatId === chatId && remaining.length > 0) {
          setActiveChatId(remaining[0].id);
        } else if (activeChatId === chatId) {
          setActiveChatId(null);
        }
        return remaining;
      });
      setPaneGroups((prev) => {
        const updateGroup = (group: PaneGroup): PaneGroup => {
          const remainingTabs = group.tabIds.filter((id) => id !== chatId);
          let nextActive = group.activeTabId;
          if (group.activeTabId === chatId) {
            nextActive = remainingTabs[0] || "preview";
          }
          return {
            ...group,
            tabIds: remainingTabs.length > 0 ? remainingTabs : ["preview"],
            activeTabId: nextActive,
          };
        };
        return {
          primary: updateGroup(prev.primary),
          secondary: updateGroup(prev.secondary),
        };
      });
      setChatHistories((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });
      if (projectId) {
        api.deleteProjectChat(projectId, chatId).catch(() => {});
      }
    },
    [activeChatId, projectId]
  );

  const clearChatHistory = useCallback(
    (chatId: string) => {
      setChatHistories((prev) => ({
        ...prev,
        [chatId]: [],
      }));
      setChatState(chatId, "idle", { activeTool: undefined, question: null });
      if (projectId) {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          api
            .saveProjectChat(projectId, {
              id: chat.id,
              lane_id: chat.laneId,
              title: chat.title,
              harness: chat.harness,
              model: chat.model,
              state: "idle",
              messages: [],
            })
            .catch(() => {});
        }
      }
    },
    [projectId, chats, setChatState]
  );

  const updateChatModel = useCallback((chatId: string, model: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, model } : c))
    );
  }, []);

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
      const isPython =
        project?.repo_full_name?.toLowerCase().includes("meridian") ||
        project?.name?.toLowerCase().includes("meridian") ||
        project?.name?.toLowerCase().includes("backend") ||
        project?.name?.toLowerCase().includes("python");

      const devPort = isPython ? 8001 : 3000;
      const devCmd = isPython
        ? "uv run uvicorn meridian_api.main:app --reload --port 8001"
        : "npm run dev";

      const activeLaneObj = lanes.find((l) => l.id === activeLaneId);
      const laneService: ServiceData = {
        id: `srv-${activeLaneId || "default"}`,
        lane_id: activeLaneId || undefined,
        port: devPort,
        protocol: "http",
        address_subdomain: `${activeLaneObj?.slug || (isPython ? "meridian-api" : "ecommerce-app")}.preview`,
        access_mode: "private",
        is_active: true,
        url: `/preview/${activeLaneId || "lane-pair"}/${devPort}/`,
      };
      setServices((prev) => {
        const existing = prev.findIndex((s) => s.lane_id === activeLaneId);
        if (existing >= 0) {
          const copy = [...prev];
          copy[existing] = {
            ...copy[existing],
            is_active: true,
            port: devPort,
            url: `/preview/${activeLaneId || "lane-pair"}/${devPort}/`,
          };
          return copy;
        }
        return [...prev, laneService];
      });
      executeTerminalCommand(devCmd);
      logActivity(
        `Started live dev server on port ${devPort} -> \`${devCmd}\``
      );
    }
  };

  // Load the lane's current write lease whenever the active lane changes.
  useEffect(() => {
    if (!projectId || !activeLaneId) {
      setCurrentLease(null);
      return;
    }
    let cancelled = false;
    api
      .getLaneGrant(projectId, activeLaneId)
      .then((grant) => {
        if (!cancelled) setCurrentLease(grant);
      })
      .catch(() => {
        if (!cancelled) setCurrentLease(null);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, activeLaneId]);

  const grantControl = async (actorId: string) => {
    if (!projectId || !activeLaneId) return;
    try {
      const grant = await api.grantLaneControl(projectId, activeLaneId, actorId, "write");
      setCurrentLease(grant);
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
      setCurrentLease(await api.getLaneGrant(projectId, activeLaneId));
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
      
      // Provision physical git worktree directory on disk
      fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "new_worktree", branch: branchName, projectId, laneSlug: slug }),
      }).catch(() => {});

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

      setPaneGroups((prev) => ({
        ...prev,
        primary: {
          ...prev.primary,
          tabIds: prev.primary.tabIds.includes(newChat.id)
            ? prev.primary.tabIds
            : [...prev.primary.tabIds, newChat.id],
          activeTabId: newChat.id,
          agentView: harness === "Shell" || harness === "Pair" ? "pty" : "chat",
        },
      }));

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

  const createWorktree = useCallback(
    async (
      branchName: string,
      targetProjectId?: string,
      harness: "Claude" | "Codex" | "Antigravity" | "Shell" = "Claude"
    ) => {
      const activeProjId = targetProjectId || projectId;
      if (!activeProjId) throw new Error("No active project selected");

      const cleanBranch = branchName.trim();
      const slug = cleanBranch
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24) || "task";

      try {
        const createdLane = await api.createLane(activeProjId, {
          name: cleanBranch,
          slug: `lane-${slug}`,
          branch_name: cleanBranch,
          is_pair_lane: false,
        });

        await refreshProjectData();
        setActiveLaneId(createdLane.id);

        // Provision physical git worktree directory on disk
        await fetch("/api/git", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "new_worktree", branch: cleanBranch, projectId: activeProjId, laneSlug: slug }),
        }).catch(() => {});

        // Create initial chat inside this new worktree
        const newChat: WorktreeChat = {
          id: `chat-${createdLane.id}-${Date.now().toString().slice(-4)}`,
          laneId: createdLane.id,
          title: `${harness} · ${cleanBranch}`,
          harness: harness as any,
          createdAt: "just now",
        };
        setChats((prev) => [...prev, newChat]);
        setActiveChatId(newChat.id);

        setPaneGroups((prev) => ({
          ...prev,
          primary: {
            ...prev.primary,
            tabIds: prev.primary.tabIds.includes(newChat.id)
              ? prev.primary.tabIds
              : [...prev.primary.tabIds, newChat.id],
            activeTabId: newChat.id,
            agentView: harness === "Shell" ? "pty" : "chat",
          },
        }));

        setMode("deck");
        logActivity(`Created new Git worktree on branch "${cleanBranch}"`);
      } catch (err: any) {
        console.error("Failed to create worktree on backend, adding locally:", err);
        const newLaneId = `lane-${slug}-${Date.now().toString().slice(-4)}`;
        const newLane: WorkLaneData = {
          id: newLaneId,
          name: cleanBranch,
          slug: `lane-${slug}`,
          branch: cleanBranch,
          branch_name: cleanBranch,
          is_pair_lane: false,
          status: "ready",
          harness: harness.toLowerCase().includes("claude")
            ? "claude"
            : harness.toLowerCase().includes("codex")
            ? "codex"
            : harness.toLowerCase().includes("antigravity")
            ? "antigravity"
            : "shell",
        };

        setLanes((prev) => [...prev, newLane]);
        setActiveLaneId(newLaneId);

        const newChat: WorktreeChat = {
          id: `chat-${newLaneId}-${Date.now().toString().slice(-4)}`,
          laneId: newLaneId,
          title: `${harness} · ${cleanBranch}`,
          harness: harness as any,
          createdAt: "just now",
        };
        setChats((prev) => [...prev, newChat]);
        setActiveChatId(newChat.id);

        setPaneGroups((prev) => ({
          ...prev,
          primary: {
            ...prev.primary,
            tabIds: prev.primary.tabIds.includes(newChat.id)
              ? prev.primary.tabIds
              : [...prev.primary.tabIds, newChat.id],
            activeTabId: newChat.id,
            agentView: harness === "Shell" ? "pty" : "chat",
          },
        }));

        setMode("deck");
        logActivity(`Created local Git worktree on branch "${cleanBranch}"`);
      }
    },
    [projectId, refreshProjectData, logActivity]
  );

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
        currentTenant,
        tenants,
        switchTenant,
        createTenant,
        isNewWorkspaceOpen,
        setIsNewWorkspaceOpen,
        projectId,
        project,
        projects,
        switchProject,
        createProject,
        mode,
        setMode,
        hostState,
        activeLaneId,
        activeLane,
        lanes,
        chats,
        activeChatId,
        chatHistories,
        addChatMessage,
        updateChatMessage,
        setChatState,
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
        isNewWorktreeOpen,
        setIsNewWorktreeOpen,
        worktreeTargetProjectId,
        setWorktreeTargetProjectId,
        openNewWorktreeModal,
        createWorktree,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        actorSidebarCollapsed,
        setActorSidebarCollapsed,
        toggleActorSidebar,
        isLoading,
        tabOrders,
        setLaneTabOrder,
        splitState,
        setSplitState,
        openSplit,
        closeSplit,
        toggleSplitDirection,
        swapSplitPanes,
        setSplitRatio,
        setPaneView,
        paneGroups,
        setGroupActiveTab,
        setGroupAgentView,
        closeTabInGroup,
        closeTabsToTheRight,
        closeOtherTabs,
        closeAllTabs,
        addTabToGroup,
        reorderGroupTabs,
        moveTabBetweenGroups,
        createChatInGroup,
        openSplitWithTab,
        openFileTab,

        refreshProjectData,
        toggleSleepWake,
        switchLane,
        closeLane,
        createChat,
        switchChat,
        closeChat,
        clearChatHistory,
        updateChatModel,
        toggleDevServer,
        grantControl,
        revokeControl,
        currentLease,
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
