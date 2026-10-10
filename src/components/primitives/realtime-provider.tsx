"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

interface RealtimeContextValue {
  socket: Socket | null;
  isConnected: boolean;
  workspaceId: string | null;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  socket: null,
  isConnected: false,
  workspaceId: null,
});

export interface RealtimeProviderProps {
  workspaceId?: string | null;
  serverUrl?: string;
  authToken?: string | null;
  children: React.ReactNode;
}

/**
 * Headless Socket.IO realtime connection provider scoped to a workspace room.
 * Allows consumers to listen to workspace-scoped server events cleanly.
 */
export function RealtimeProvider({
  workspaceId = null,
  serverUrl,
  authToken = null,
  children,
}: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);

  const targetUrl =
    serverUrl ||
    process.env.NEXT_PUBLIC_REALTIME_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:8001`
      : "http://localhost:8001");

  const socketInstance = useMemo(() => {
    if (typeof window === "undefined") return null;

    return io(targetUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      auth: {
        token: authToken,
        workspace_id: workspaceId,
      },
    });
  }, [targetUrl, workspaceId, authToken]);

  useEffect(() => {
    if (!socketInstance) return;

    const onConnect = () => {
      setIsConnected(true);
      if (workspaceId) {
        socketInstance.emit("join_workspace", { workspace_id: workspaceId });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.disconnect();
    };
  }, [socketInstance, workspaceId]);

  const value = useMemo(
    () => ({
      socket: socketInstance,
      isConnected,
      workspaceId,
    }),
    [socketInstance, isConnected, workspaceId]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeContext(): RealtimeContextValue {
  return useContext(RealtimeContext);
}

/**
 * Headless event listener hook for any workspace-scoped Socket.IO event.
 *
 * Example:
 *   useWorkspaceEvent("project:updated", (payload) => {
 *     console.log("Updated:", payload);
 *   });
 */
export function useWorkspaceEvent<T = unknown>(
  eventName: string,
  handler: (payload: T) => void
): void {
  const { socket } = useRealtimeContext();

  useEffect(() => {
    if (!socket || !eventName) return;

    const wrappedHandler = (payload: T) => {
      handler(payload);
    };

    socket.on(eventName, wrappedHandler);

    return () => {
      socket.off(eventName, wrappedHandler);
    };
  }, [socket, eventName, handler]);
}
