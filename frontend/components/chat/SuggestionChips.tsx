"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (s: string) => void;
  compact?: boolean;
}

export function SuggestionChips({ suggestions, onSelect, compact }: SuggestionChipsProps) {
  return (
    <div className={cn("px-5 py-3", compact ? "py-2" : "py-3")}>
      {!compact && (
        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Try asking
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={() => onSelect(s)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "text-[11px] font-medium px-3 rounded-xl border transition-all duration-150 whitespace-nowrap",
              compact
                ? "py-1 text-zinc-500 border-zinc-800 bg-zinc-900/40 hover:text-zinc-300 hover:border-zinc-700"
                : "py-1.5 text-zinc-400 border-zinc-800/80 bg-zinc-900/60 hover:text-orange-300 hover:border-orange-500/30 hover:bg-orange-500/5"
            )}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
