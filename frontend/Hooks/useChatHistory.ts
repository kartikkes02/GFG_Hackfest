"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/types";
import type { ChatResponse } from "@/lib/api";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  dataset: any | null;
  response: ChatResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const createSession = useCallback((): ChatSession => {
    const session: ChatSession = {
      id: uuidv4(),
      title: "New chat",
      messages: [],
      dataset: null,
      response: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    return session;
  }, []);

  const updateSession = useCallback(
    (id: string, updates: Partial<ChatSession>) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
        )
      );
    },
    []
  );

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      return remaining;
    });
    setActiveSessionId((prev) => {
      if (prev !== id) return prev;
      const remaining = sessions.filter((s) => s.id !== id);
      return remaining[0]?.id ?? null;
    });
  }, [sessions]);

  const setTitle = useCallback((id: string, title: string) => {
    updateSession(id, { title });
  }, [updateSession]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    updateSession,
    deleteSession,
    setTitle,
  };
}
