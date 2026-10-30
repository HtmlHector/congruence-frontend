import type {
  IGlobalAttributes,
  IJsonModel,
  IJsonRowNode,
  IJsonTabNode,
  IJsonTabSetNode,
} from "flexlayout-react";

import { isAgentName, type AgentName } from "@/components/logos/agent-logo";

export type WorkspaceTabKind = "terminal" | "browser";

export interface WorkspaceTabConfig {
  kind: WorkspaceTabKind;
  // Stable across reloads, so the shell reattaches to its existing tmux session.
  session: string;
  agent: AgentName | null;
  // The agent CLI is typed into the shell once; reloads must not retype it.
  launched: boolean;
  port: number | null;
  path: string;
}

export interface StoredTab {
  name: string;
  config: WorkspaceTabConfig;
}

// The layout tree, tab names and session ids all live in one record. Splitting a
// pane is just a model change, so it persists with the tabs it created. Each
// worktree owns its record: tabs are scoped to a checkout, so opening one in
// another worktree would attach to the wrong directory.
export const LAYOUT_STORAGE_PREFIX = "congruence.worktree-layout.v1";

export function layoutStorageKey(worktreeId: string): string {
  return `${LAYOUT_STORAGE_PREFIX}.${worktreeId}`;
}

const GLOBAL_ATTRIBUTES: IGlobalAttributes = {
  // Terminals and preview iframes must stay mounted when another tab is shown,
  // otherwise switching tabs would tear down a running shell or reload a page.
  tabEnableRenderOnDemand: false,
  // An emptied tabset is deleted, so closing (or dragging out) the last tab
  // dismisses the pane instead of leaving a blank one. The library only removes
  // empties when the tabset is closable, so `enableClose` must stay true; the
  // pane close button itself is hidden.
  tabSetEnableDeleteWhenEmpty: true,
  tabSetEnableClose: true,
  tabSetEnableCloseButton: false,
  tabSetEnableMaximize: false,
  tabEnableRename: false,
};

export function newSession(): string {
  const unique =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `tab-${unique.replace(/[^A-Za-z0-9_-]/g, "")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

/** Reads a tab config, filling in anything a stored or hand-edited tree left out. */
export function readTabConfig(value: unknown): WorkspaceTabConfig {
  const raw = isRecord(value) ? value : {};
  const kind: WorkspaceTabKind = raw.kind === "browser" ? "browser" : "terminal";
  return {
    kind,
    session: readString(raw.session, newSession()),
    agent: kind === "terminal" && isAgentName(raw.agent) ? raw.agent : null,
    launched: raw.launched === true,
    port: typeof raw.port === "number" ? raw.port : null,
    path: readString(raw.path, "/"),
  };
}

export function createTabConfig({
  kind = "terminal",
  agent = null,
  port = null,
}: {
  kind?: WorkspaceTabKind;
  agent?: AgentName | null;
  port?: number | null;
} = {}): WorkspaceTabConfig {
  return {
    kind,
    session: newSession(),
    agent: kind === "browser" ? null : agent,
    launched: false,
    port,
    path: "/",
  };
}

export function tabToJson(tab: StoredTab): IJsonTabNode {
  return {
    type: "tab",
    name: tab.name,
    component: tab.config.kind,
    config: tab.config,
  };
}

export function buildLayout(tabs: StoredTab[], selected = 0): IJsonModel {
  const children: IJsonTabNode[] = tabs.map(tabToJson);

  const tabset: IJsonTabSetNode = {
    type: "tabset",
    // Accessible name for the strip (the library maps it to aria-label).
    name: "Terminal tabs",
    weight: 100,
    selected: Math.min(Math.max(selected, 0), Math.max(children.length - 1, 0)),
    children,
  };

  return {
    global: GLOBAL_ATTRIBUTES,
    borders: [],
    layout: {
      type: "row",
      weight: 100,
      children: [tabset],
    },
  };
}

function sanitizeChildren(
  value: unknown,
  depth: number,
): (IJsonRowNode | IJsonTabSetNode)[] {
  if (!Array.isArray(value) || depth > 12) return [];
  const children: IJsonRowNode["children"] = [];

  for (const child of value) {
    if (!isRecord(child)) continue;
    if (child.type === "row") {
      const rows = sanitizeChildren(child.children, depth + 1);
      children.push({
        type: "row",
        weight: typeof child.weight === "number" ? child.weight : 100,
        children: rows,
      });
      continue;
    }
    if (child.type !== "tabset") continue;

    const tabs: IJsonTabNode[] = [];
    if (Array.isArray(child.children)) {
      for (const tab of child.children) {
        if (!isRecord(tab) || typeof tab.name !== "string") continue;
        if (tab.component !== "terminal" && tab.component !== "browser") continue;
        tabs.push({
          type: "tab",
          name: tab.name,
          component: tab.component,
          config: readTabConfig(tab.config),
        });
      }
    }
    children.push({
      type: "tabset",
      name: typeof child.name === "string" ? child.name : "Terminal tabs",
      weight: typeof child.weight === "number" ? child.weight : 100,
      selected: typeof child.selected === "number" ? child.selected : 0,
      children: tabs,
    });
  }

  return children;
}

function readStoredJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function readLayout(value: unknown): IJsonModel | null {
  if (!isRecord(value) || !isRecord(value.layout)) return null;
  const root = value.layout;
  if (root.type !== "row") return null;
  const children = sanitizeChildren(root.children, 0);
  if (children.length === 0) return null;
  return {
    global: GLOBAL_ATTRIBUTES,
    borders: [],
    layout: { type: "row", weight: 100, children },
  };
}

/**
 * The worktree's stored pane layout, or a single fresh terminal when this browser
 * has none. Runs in the browser only: the server has no localStorage and renders
 * a placeholder.
 */
export function readStoredLayout(worktreeId: string): IJsonModel {
  const stored = readLayout(readStoredJson(layoutStorageKey(worktreeId)));
  if (stored) return stored;

  return buildLayout([{ name: "Terminal 1", config: createTabConfig() }]);
}

export function saveStoredLayout(worktreeId: string, json: IJsonModel): void {
  try {
    window.localStorage.setItem(layoutStorageKey(worktreeId), JSON.stringify(json));
  } catch {
    // Storage disabled or full: the layout still works for this visit.
  }
}
