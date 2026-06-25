"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import { APP_CONFIG } from "@/config";
import { useAuthStore } from "@/stores/auth/store";

export interface DocumentCreatedPayload {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
}

export interface UseDocumentSocketOptions {
  onDocumentCreated?: (document: DocumentCreatedPayload) => void;
}

/**
 * Manages a Socket.io connection to the /documents namespace.
 * Only connects when the current user is a MODERATOR or ADMIN.
 * Automatically disconnects on unmount or when the user logs out.
 */
export function useDocumentSocket({
  onDocumentCreated,
}: UseDocumentSocketOptions = {}): void {
  const { accessToken, role } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  // Keep a stable ref of the callback so we don't reconnect on every render
  const onDocumentCreatedRef = useRef(onDocumentCreated);
  useEffect(() => {
    onDocumentCreatedRef.current = onDocumentCreated;
  }, [onDocumentCreated]);

  const handleDocumentCreated = useCallback(
    (payload: DocumentCreatedPayload) => {
      onDocumentCreatedRef.current?.(payload);
    },
    [],
  );

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

    socket.on("connect", () => {
      // Connected to document gateway
    });

    socket.on("document_created", handleDocumentCreated);

    socket.on("disconnect", () => {
      // Disconnected from document gateway
    });

    return () => {
      socket.off("document_created", handleDocumentCreated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, role, handleDocumentCreated]);
}
