/**
 * Last-screen snapshots for terminal tabs.
 *
 * tmux keeps the process and pane alive across a reload, but reattaching is
 * asynchronous (ticket request, WebSocket, possibly waking the devbox). Painting
 * the previous screen from storage first means the terminal looks untouched the
 * moment the page renders; tmux's repaint then replaces it with the real state.
 */

const KEY_PREFIX = "congruence.terminal-snapshot.v1";

function key(projectId: string, sessionId: string): string {
  return `${KEY_PREFIX}.${projectId}.${sessionId}`;
}

export function readSnapshot(
  projectId: string,
  sessionId: string,
): string | null {
  try {
    const stored = window.localStorage.getItem(key(projectId, sessionId));
    return stored ? stored : null;
  } catch {
    return null;
  }
}

export function writeSnapshot(
  projectId: string,
  sessionId: string,
  data: string,
): void {
  if (!data) return;
  try {
    window.localStorage.setItem(key(projectId, sessionId), data);
  } catch {
    // Storage disabled or full: the terminal simply reconnects without a preview.
  }
}

export function clearSnapshot(projectId: string, sessionId: string): void {
  try {
    window.localStorage.removeItem(key(projectId, sessionId));
  } catch {
    // Nothing to clean up.
  }
}
