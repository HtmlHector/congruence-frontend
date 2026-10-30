"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  Actions,
  DockLocation,
  Layout,
  Model,
  TabNode,
  TabSetNode,
  type Action,
  type BorderNode,
  type ITabRenderValues,
  type ITabSetRenderValues,
} from "flexlayout-react";
import "flexlayout-react/style/alpha_light.css";
import "./workspace-layout.css";
import { Globe, Terminal, X } from "lucide-react";

import { WorkspaceTabMenu } from "@/app/[workspaceId]/workspace-tab-menu";
import {
  AgentLogo,
  agentCommand,
  agentLabel,
  type AgentName,
} from "@/components/logos/agent-logo";
import { Button } from "@/components/ui/button";
import { BrowserPreview } from "@/features/preview/components/browser-preview";
import { DevboxTerminal } from "@/features/terminals/components/devbox-terminal";
import { clearSnapshot } from "@/features/terminals/lib/terminal-snapshot";
import { apiClient } from "@/lib/api";
import {
  buildLayout,
  createTabConfig,
  readStoredLayout,
  readTabConfig,
  saveStoredLayout,
  tabToJson,
  type StoredTab,
  type WorkspaceTabConfig,
} from "@/app/[workspaceId]/workspace-layout";

type PanelOptions = {
  agent?: AgentName | null;
  kind?: "terminal" | "browser";
  port?: number | null;
};

function countTabs(model: Model): number {
  let count = 0;
  model.visitNodes((node) => {
    if (node instanceof TabNode) count += 1;
  });
  return count;
}

/** Highest `Name N` suffix in the layout, so a closed number is never reused. */
function nextNumber(model: Model, pattern: RegExp): number {
  let highest = 0;
  model.visitNodes((node) => {
    if (!(node instanceof TabNode)) return;
    const match = pattern.exec(node.getName());
    if (match) highest = Math.max(highest, Number(match[1]));
  });
  return highest + 1;
}

function agentTabCount(model: Model, agent: AgentName): number {
  let count = 0;
  model.visitNodes((node) => {
    if (node instanceof TabNode && readTabConfig(node.getConfig()).agent === agent) {
      count += 1;
    }
  });
  return count;
}

function createTab(model: Model, { agent = null, kind = "terminal", port = null }: PanelOptions): StoredTab {
  const config = createTabConfig({ kind, agent, port });
  let name: string;
  if (kind === "browser") {
    name = port
      ? `Preview :${port}`
      : `Browser ${nextNumber(model, /^Browser (\d+)$/)}`;
  } else if (agent) {
    const open = agentTabCount(model, agent);
    name = open === 0 ? agentLabel(agent) : `${agentLabel(agent)} ${open + 1}`;
  } else {
    name = `Terminal ${nextNumber(model, /^Terminal (\d+)$/)}`;
  }
  return { name, config };
}

/** Icon in the tab strip: the agent mark, a globe for previews, otherwise a prompt. */
function renderTab(node: TabNode, values: ITabRenderValues) {
  const config = readTabConfig(node.getConfig());
  if (config.kind === "browser") {
    values.leading = <Globe className="size-3.5" aria-hidden="true" />;
  } else if (config.agent) {
    values.leading = <AgentLogo agent={config.agent} className="size-3.5" />;
  } else {
    values.leading = <Terminal className="size-3.5" aria-hidden="true" />;
  }
}

async function stopShellSession(projectId: string, session: string) {
  try {
    await apiClient.delete(
      `/api/v1/projects/${projectId}/shell-sessions/${encodeURIComponent(session)}`,
    );
  } catch {
    // Already gone (container recycled or session never started): fine.
  }
}

function defaultModel(): Model {
  return Model.fromJson(
    buildLayout([{ name: "Terminal 1", config: createTabConfig() }]),
  );
}

/**
 * The model is a mutable external store: actions change it in place, so the
 * layout re-renders itself, while React only needs to know when the whole tree is
 * replaced. Loading is deferred to the first client render because the stored
 * tree lives in localStorage, scoped to this worktree.
 */
function createModelStore(worktreeId: string) {
  let model: Model | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): Model | null {
      if (model === null) {
        try {
          model = Model.fromJson(readStoredLayout(worktreeId));
        } catch {
          model = defaultModel();
        }
      }
      return model;
    },
    getServerSnapshot(): Model | null {
      return null;
    },
    replace(json: Parameters<typeof Model.fromJson>[0]) {
      model = Model.fromJson(json);
      for (const listener of listeners) listener();
    },
  };
}

/**
 * Tabs and terminals for one worktree. Each checkout has its own layout and its
 * own tmux shells, so this is mounted per worktree route rather than per project.
 */
export function WorktreeWorkspace({
  projectId,
  worktreeId,
}: {
  projectId: string;
  worktreeId: string;
}) {
  const [store] = useState(() => createModelStore(worktreeId));
  const model = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  // Actions mutate the model in place, so bump a revision to recompute chrome
  // that lives outside the layout tree (the empty state).
  const [, setRevision] = useState(0);
  const tabCount = model ? countTabs(model) : 0;

  // Store the first layout too, otherwise a reload would mint new sessions and
  // leave the running shells unreachable.
  useEffect(() => {
    if (model) saveStoredLayout(worktreeId, model.toJson());
  }, [model, worktreeId]);

  const handleModelChange = useCallback(
    (next: Model) => {
      saveStoredLayout(worktreeId, next.toJson());
      setRevision((revision) => revision + 1);
    },
    [worktreeId],
  );

  const markLaunched = useCallback((tabId: string) => {
    if (!model) return;
    const node = model.getNodeById(tabId);
    if (!(node instanceof TabNode)) return;
    const config = readTabConfig(node.getConfig());
    if (config.launched) return;
    model.doAction(
      Actions.updateNodeAttributes(tabId, {
        config: { ...config, launched: true } satisfies WorkspaceTabConfig,
      }),
    );
  }, [model]);

  const addTab = useCallback((tabsetId: string | null, options: PanelOptions = {}) => {
    if (!model) return;
    const target = tabsetId ? model.getNodeById(tabsetId) : model.getActiveTabset();
    const tab = createTab(model, options);
    const json = tabToJson(tab);

    if (target instanceof TabSetNode && countTabs(model) > 0) {
      model.doAction(
        Actions.addTab(json, target.getId(), DockLocation.CENTER, -1, true),
      );
      return;
    }

    // Every pane was closed. Rebuild a single pane so the tab has a home: the
    // library leaves an empty tabset behind, but no Layout is mounted to report
    // the action, so replace the model instead of dispatching into it.
    store.replace(buildLayout([tab]));
  }, [model, store]);

  const addToActivePane = useCallback(() => {
    addTab(null);
  }, [addTab]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey || event.key.toLowerCase() !== "t") {
        return;
      }
      event.preventDefault();
      addToActivePane();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [addToActivePane]);

  // Closing a terminal tab ends its shell, so a running agent cannot outlive the
  // tab that controls it. Browser preview tabs have no tmux process.
  const handleAction = useCallback((action: Action) => {
    if (action.type !== Actions.DELETE_TAB || !model) return action;
    const node = model.getNodeById(String(action.data.node));
    if (!(node instanceof TabNode)) return action;
    const config = readTabConfig(node.getConfig());
    if (config.kind !== "browser") {
      void stopShellSession(projectId, config.session);
      clearSnapshot(worktreeId, config.session);
    }
    return action;
  }, [model, projectId, worktreeId]);

  const factory = useCallback(
    (node: TabNode) => {
      const config = readTabConfig(node.getConfig());
      if (config.kind === "browser") {
        return (
          <BrowserPreview
            projectId={projectId}
            initialPort={config.port}
            initialPath={config.path}
          />
        );
      }
      return (
        <DevboxTerminal
          projectId={projectId}
          worktreeId={worktreeId}
          sessionId={config.session}
          launchCommand={config.agent ? agentCommand(config.agent) : undefined}
          launched={config.launched}
          onLaunched={() => markLaunched(node.getId())}
        />
      );
    },
    [markLaunched, projectId, worktreeId],
  );

  const renderTabSet = useCallback(
    (node: TabSetNode | BorderNode, values: ITabSetRenderValues) => {
      const tabsetId = node.getId();
      values.stickyButtons.push(
        <WorkspaceTabMenu
          key="new-tab"
          onCreateTab={() => addTab(tabsetId)}
          onCreateAgent={(agent) => addTab(tabsetId, { agent })}
          onCreateBrowserPreview={() => addTab(tabsetId, { kind: "browser" })}
        />,
      );
    },
    [addTab],
  );

  return (
    <section
      aria-label="Workspace panes"
      className="relative min-h-0 flex-1 bg-foundation-surface"
    >
      {!model ? null : tabCount === 0 ? (
        <div className="grid h-full place-items-center px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-foundation-ink-secondary">
              No tabs are open in this workspace.
            </p>
            <Button size="sm" onClick={addToActivePane}>
              New terminal
            </Button>
          </div>
        </div>
      ) : (
        <div className="workspace-layout absolute inset-0">
          <Layout
            model={model}
            factory={factory}
            icons={{ close: <X className="size-3.5" aria-hidden="true" /> }}
            onAction={handleAction}
            onModelChange={handleModelChange}
            onRenderTab={renderTab}
            onRenderTabSet={renderTabSet}
          />
        </div>
      )}
    </section>
  );
}
