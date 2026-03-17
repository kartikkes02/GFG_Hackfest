"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, MessageSquare, ArrowRight } from "lucide-react";

interface EmptyDashboardProps {
  onGoToChat: () => void;
}

export function EmptyDashboard({ onGoToChat }: EmptyDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[480px] text-center"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <LayoutDashboard className="w-7 h-7 text-zinc-600" />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-orange-500/5 blur-xl" />
      </div>

      <h3 className="text-[15px] font-semibold text-white mb-2">
        No dashboard yet
      </h3>
      <p className="text-[13px] text-zinc-500 max-w-xs leading-relaxed mb-8">
        Upload a CSV in the Chat tab and ask a question.
        DataPilot will generate your dashboard automatically.
      </p>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { step: "1", label: "Upload CSV" },
          { step: "2", label: "Ask a question" },
          { step: "3", label: "Get dashboard" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-[11px] font-mono font-bold text-zinc-400">
                {item.step}
              </div>
              <span className="text-[11px] text-zinc-600 whitespace-nowrap">
                {item.label}
              </span>
            </div>
            {i < 2 && (
              <ArrowRight className="w-3.5 h-3.5 text-zinc-700 mb-4 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <motion.button
        onClick={onGoToChat}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
      >
        <MessageSquare className="w-4 h-4" />
        Go to Chat
      </motion.button>
    </motion.div>
  );
}
