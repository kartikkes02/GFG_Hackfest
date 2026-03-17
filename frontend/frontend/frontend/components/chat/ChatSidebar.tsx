"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/Hooks/useChatHistory";

interface ChatSidebarProps {
  open: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ChatSidebar({
  open,
  onToggle,
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
}: ChatSidebarProps) {
  return (
    <div className="relative flex-shrink-0 flex">
      {/* Sidebar panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            key="chat-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="className=w-[240px] h-full flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm mr-4">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Chats
                </span>
                <button
                  onClick={onNew}
                  className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                  title="New chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sessions list */}
              <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <MessageSquare className="w-5 h-5 text-zinc-700 mb-2" />
                    <p className="text-[11px] text-zinc-600">No chats yet</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150",
                        activeSessionId === session.id
                          ? "bg-orange-500/10 border border-orange-500/20"
                          : "hover:bg-zinc-800/60 border border-transparent"
                      )}
                      onClick={() => onSelect(session.id)}
                    >
                      <MessageSquare
                        className={cn(
                          "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                          activeSessionId === session.id
                            ? "text-orange-400"
                            : "text-zinc-600"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-[12px] font-medium truncate leading-tight",
                            activeSessionId === session.id
                              ? "text-orange-300"
                              : "text-zinc-400 group-hover:text-zinc-200"
                          )}
                        >
                          {session.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-zinc-700" />
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {timeAgo(session.updatedAt)}
                          </span>
                          {session.messages.length > 0 && (
                            <>
                              <span className="text-zinc-700">·</span>
                              <span className="text-[10px] text-zinc-700 font-mono">
                                {Math.floor(session.messages.length / 2)} msg
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all shadow-lg"
      >
        {open ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
