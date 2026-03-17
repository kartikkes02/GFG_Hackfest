"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendChatMessage, type ChatResponse, type UploadResponse } from "@/lib/api";
import { UploadZone } from "@/components/upload/UploadZone";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { SuggestionChips } from "./SuggestionChips";
import { ChatSidebar } from "./ChatSidebar";
import { useChatHistory } from "@/Hooks/useChatHistory";
import type { Message } from "@/types";

interface ChatInterfaceProps {
  onDataReceived: (data: ChatResponse) => void;
  onSwitchToDashboard: () => void;
}

const INITIAL_SUGGESTIONS = [
  "Show monthly revenue by region",
  "Top 5 products by sales",
  "Revenue trend over time",
  "Compare regions side by side",
  "Show average order value by category",
];

const FOLLOWUP_SUGGESTIONS = [
  "Only show Europe",
  "Compare top 3",
  "Show as monthly trend",
  "Filter last quarter",
];

export function ChatInterface({ onDataReceived, onSwitchToDashboard }: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dataset, setDataset] = useState<UploadResponse | null>(null);
  const [sessionUUID] = useState(() => uuidv4());

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    updateSession,
    deleteSession,
  } = useChatHistory();

  useEffect(() => {
    createSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = activeSession?.messages ?? [];
  const hasMessages = messages.length > 0;

  const handleUpload = useCallback(
    (data: UploadResponse) => {
      setDataset(data);
      if (!activeSessionId) return;
      const welcomeMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Dataset **${data.filename}** loaded — ${data.row_count.toLocaleString()} rows across ${Object.keys(data.schema).length} columns.\n\nColumns: ${Object.keys(data.schema).join(", ")}.\n\nAsk me anything about your data.`,
        timestamp: new Date(),
      };
      updateSession(activeSessionId, {
        dataset: data,
        messages: [welcomeMsg],
        title: data.filename.replace(".csv", ""),
      });
    },
    [activeSessionId, updateSession]
  );

  const handleNewChat = useCallback(() => {
    createSession();
    setDataset(null);
  }, [createSession]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setActiveSessionId(id);
      const session = sessions.find((s) => s.id === id);
      setDataset(session?.dataset ?? null);
    },
    [setActiveSessionId, sessions]
  );

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!dataset || isLoading || !prompt.trim() || !activeSessionId) return;

      const userMsg: Message = {
        id: uuidv4(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      const loadingMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      const currentMessages = activeSession?.messages ?? [];
      updateSession(activeSessionId, {
        messages: [...currentMessages, userMsg, loadingMsg],
        title:
          activeSession?.title === "New chat"
            ? prompt.slice(0, 32) + (prompt.length > 32 ? "…" : "")
            : activeSession?.title,
      });

      setIsLoading(true);

      try {
        const res = await sendChatMessage(sessionUUID, dataset.dataset_id, prompt);
        onDataReceived(res);

        const updatedMsg: Message = {
          ...loadingMsg,
          content: `Generated **${res.dashboard.charts.length}** chart${
            res.dashboard.charts.length !== 1 ? "s" : ""
          } from **${res.row_count.toLocaleString()} rows**.`,
          sql: res.sql,
          dashboard: res.dashboard,
          isLoading: false,
        };

        updateSession(activeSessionId, {
          messages: [...currentMessages, userMsg, updatedMsg],
          response: res,
        });
      } catch (e: any) {
        const errorMsg: Message = {
          ...loadingMsg,
          role: "error",
          content: e.message || "Something went wrong. Please try again.",
          isLoading: false,
        };
        updateSession(activeSessionId, {
          messages: [...currentMessages, userMsg, errorMsg],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dataset, isLoading, activeSessionId, activeSession, sessionUUID, updateSession, onDataReceived]
  );

  return (
    <div className="flex gap-0 w-full min-h-[600px]">
      {/* Left sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
        onDelete={deleteSession}
      />

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <UploadZone onUpload={handleUpload} key={activeSessionId} />
        </div>

        <div className="animated-border-slow flex-1 flex flex-col min-h-0 rounded-2xl bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 min-h-[420px] max-h-[520px]">
            <AnimatePresence initial={false}>
              {!hasMessages ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-zinc-800 flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-[14px] font-medium text-zinc-300">
                    Upload a CSV to get started
                  </p>
                  <p className="text-[12px] text-zinc-600 mt-1">
                    Then ask anything about your data in plain English
                  </p>
                </motion.div>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    index={i}
                    onSwitchToDashboard={onSwitchToDashboard}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="h-px bg-zinc-800/60" />

          {dataset && !hasMessages && (
            <SuggestionChips suggestions={INITIAL_SUGGESTIONS} onSelect={sendMessage} />
          )}
          {dataset && hasMessages && !isLoading && (
            <SuggestionChips suggestions={FOLLOWUP_SUGGESTIONS} onSelect={sendMessage} compact />
          )}

          <ChatInput
            onSend={sendMessage}
            disabled={!dataset || isLoading}
            isLoading={isLoading}
            placeholder={!dataset ? "Upload a CSV first…" : "Ask anything about your data…"}
          />
        </div>
      </div>
    </div>
  );
}