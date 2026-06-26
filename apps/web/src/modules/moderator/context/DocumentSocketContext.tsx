"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

import { APP_CONFIG } from "@/config";
import { useAuthStore } from "@/stores/auth/store";
import type { DocumentCreatedPayload } from "@/hooks/useDocumentSocket";

type Listener = (payload: DocumentCreatedPayload) => void;

interface DocumentSocketContextValue {
  /** Subscribe to document_created events. Returns an unsubscribe function. */
  onDocumentCreated: (listener: Listener) => () => void;
}

const DocumentSocketContext = createContext<DocumentSocketContextValue>({
  onDocumentCreated: () => () => undefined,
});

/**
 * Provides a single shared Socket.io connection for the entire Moderator portal.
 * Components subscribe to events without creating extra connections.
 */
export function DocumentSocketProvider({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const { accessToken, role } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());

  useEffect(() => {
    const isModerator = role === "moderator" || role === "admin";

    if (!isModerator || !accessToken) {
      return;
    }

    const socket = io(`${APP_CONFIG.api.baseUrl}/documents`, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("document_created", (payload: DocumentCreatedPayload) => {
      listenersRef.current.forEach((listener) => listener(payload));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, role]);

  const onDocumentCreated = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return (
    <DocumentSocketContext.Provider value={{ onDocumentCreated }}>
      {children}
    </DocumentSocketContext.Provider>
  );
}

/** Use inside any component within DocumentSocketProvider to react to new documents. */
export function useDocumentSocketContext(listener: Listener): void {
  const { onDocumentCreated } = useContext(DocumentSocketContext);

  // Keep a stable ref of the listener so the subscriber identity never changes
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  const stableListener = useCallback(
    (payload: DocumentCreatedPayload) => listenerRef.current(payload),
    [],
  );

  useEffect(() => {
    const unsub = onDocumentCreated(stableListener);
    return unsub;
  }, [onDocumentCreated, stableListener]);
}
