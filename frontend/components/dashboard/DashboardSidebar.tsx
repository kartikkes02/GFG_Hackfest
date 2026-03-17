"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedDashboard } from "@/Hooks/useDashboardHistory";

interface DashboardSidebarProps {
  open: boolean;
  onToggle: () => void;
  dashboards: SavedDashboard[];
  activeDashboardId: string | null;
  onSelect: (id: string) => void;
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

function ChartTypeIcon({ type }: { type: string }) {
  const cls = "w-3 h-3";
  switch (type) {
    case "line": return <LineChart className={cls} />;
    case "pie": return <PieChart className={cls} />;
    case "area": return <TrendingUp className={cls} />;
    default: return <BarChart3 className={cls} />;
  }
}

export function DashboardSidebar({
  open,
  onToggle,
  dashboards,
  activeDashboardId,
  onSelect,
  onDelete,
}: DashboardSidebarProps) {
  return (
    <div className="relative flex-shrink-0 flex">
      {/* Toggle button — left side for dashboard sidebar */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all shadow-lg"
      >
        {open ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Sidebar panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            key="dash-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="w-[240px] h-full flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm ml-3">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Saved dashboards
                </span>
                <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700/50">
                  {dashboards.length}
                </span>
              </div>

              {/* Dashboard list */}
              <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                {dashboards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <LayoutDashboard className="w-5 h-5 text-zinc-700 mb-2" />
                    <p className="text-[11px] text-zinc-600 px-4">
                      Dashboards will appear here
                    </p>
                  </div>
                ) : (
                  dashboards.map((dash) => {
                    const firstChart = dash.response.dashboard.charts.find(
                      (c) => c.type !== "kpi"
                    );
                    return (
                      <motion.div
                        key={dash.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150",
                          activeDashboardId === dash.id
                            ? "bg-blue-500/10 border border-blue-500/20"
                            : "hover:bg-zinc-800/60 border border-transparent"
                        )}
                        onClick={() => onSelect(dash.id)}
                      >
                        {/* Chart type icon */}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                            activeDashboardId === dash.id
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-zinc-800 text-zinc-600"
                          )}
                        >
                          <ChartTypeIcon type={firstChart?.type ?? "bar"} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-[12px] font-medium truncate leading-tight",
                              activeDashboardId === dash.id
                                ? "text-blue-300"
                                : "text-zinc-400 group-hover:text-zinc-200"
                            )}
                          >
                            {dash.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-zinc-700" />
                            <span className="text-[10px] text-zinc-600 font-mono">
                              {timeAgo(dash.savedAt)}
                            </span>
                            <span className="text-zinc-700">·</span>
                            <span className="text-[10px] text-zinc-700 font-mono">
                              {dash.response.dashboard.charts.length} charts
                            </span>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(dash.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
