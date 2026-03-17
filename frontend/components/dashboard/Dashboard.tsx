"use client";

import { motion } from "framer-motion";
import { type ChatResponse } from "@/lib/api";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { EmptyDashboard } from "./EmptyDashboard";
import { SQLBadge } from "./SQLBadge";

interface DashboardProps {
  response: ChatResponse | null;
  onGoToChat: () => void;
}

export function Dashboard({ response, onGoToChat }: DashboardProps) {
  if (!response) return <EmptyDashboard onGoToChat={onGoToChat} />;

  const { dashboard } = response;
  const kpis = dashboard.charts.filter((c) => c.type === "kpi");
  const charts = dashboard.charts.filter((c) => c.type !== "kpi");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* SQL badge */}
      <SQLBadge sql={dashboard.sql} rowCount={dashboard.row_count} />

      {/* KPI row */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <KPICard key={i} config={kpi} data={dashboard.data} index={i} />
          ))}
        </div>
      )}

      {/* Charts grid */}
      {charts.length > 0 && (
        <div className={`grid gap-4 ${charts.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
          {charts.map((chart, i) => (
            <ChartCard
              key={i}
              config={chart}
              data={dashboard.data}
              index={i}
              fullWidth={charts.length === 1 || (i === charts.length - 1 && charts.length % 2 !== 0)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
