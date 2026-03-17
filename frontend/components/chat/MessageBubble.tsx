"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { InlineChart } from "./InlineChart";

interface MessageBubbleProps {
  message: Message;
  index: number;
  onSwitchToDashboard: () => void;
}

function renderContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>
        {part.split("\n").map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    )
  );
}

export function MessageBubble({ message, index, onSwitchToDashboard }: MessageBubbleProps) {
  const [sqlOpen, setSqlOpen] = useState(false);
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={cn("flex gap-3 py-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser
            ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20"
            : isError
            ? "bg-red-500/10 border border-red-500/20"
            : "bg-zinc-800 border border-zinc-700/50"
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : isError ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-2",
          isUser ? "items-end max-w-[80%]" : "items-start w-full max-w-[90%]"
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-[13px] leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm shadow-lg shadow-orange-500/10"
              : isError
              ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm"
              : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 rounded-tl-sm"
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-orange-400"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-zinc-500 text-[12px]">Analyzing…</span>
            </div>
          ) : (
            renderContent(message.content)
          )}
        </div>

        {/* SQL disclosure */}
        {message.sql && !message.isLoading && (
          <div className="w-full">
            <button
              onClick={() => setSqlOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
            >
              <Code2 className="w-3 h-3" />
              {sqlOpen ? "Hide SQL" : "View SQL"}
              {sqlOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {sqlOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-1.5"
                >
                  <pre className="text-[11px] font-mono bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-emerald-400/90 overflow-x-auto leading-relaxed">
                    {message.sql}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Inline chart preview */}
        {message.dashboard && !message.isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="w-full space-y-2"
          >
            <InlineChart dashboard={message.dashboard} />

            <motion.button
              onClick={onSwitchToDashboard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 text-[12px] font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              View full dashboard
            </motion.button>
          </motion.div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-zinc-700 font-mono">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
