"use client";

import { motion } from "framer-motion";
import { type ChartConfig } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface KPICardProps {
  config: ChartConfig;
  data: Record<string, any>[];
  index: number;
}

export function KPICard({ config, data, index }: KPICardProps) {
  const key = config.metric || config.y_axis || (data[0] ? Object.keys(data[0])[1] : null);
  const rawValue = key && data[0] ? data[0][key] : null;

  const value =
    typeof rawValue === "number"
      ? formatNumber(rawValue)
      : rawValue?.toString() ?? "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 overflow-hidden group hover:border-zinc-700 transition-colors duration-200"
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

      <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-3 truncate">
        {config.title}
      </p>
      <p className="text-3xl font-bold text-white tracking-tight">
        {value}
      </p>
    </motion.div>
  );
}
