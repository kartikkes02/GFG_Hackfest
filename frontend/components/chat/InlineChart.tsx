"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardConfig } from "@/lib/api";

interface InlineChartProps {
  dashboard: DashboardConfig;
}

const COLORS = ["#f97316", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "10px",
  color: "#e4e4e7",
  fontSize: "11px",
  fontFamily: "monospace",
};

const AXIS_STYLE = {
  fontSize: 10,
  fontFamily: "monospace",
  fill: "#52525b",
};

const GRID_PROPS = {
  strokeDasharray: "3 3" as const,
  stroke: "rgba(255,255,255,0.04)",
  vertical: false,
};

export function InlineChart({ dashboard }: InlineChartProps) {
  // Pick the first non-kpi chart to preview
  const chart = dashboard.charts.find((c) => c.type !== "kpi");
  if (!chart || !dashboard.data.length) return null;

  const xKey = chart.x_axis || Object.keys(dashboard.data[0])[0];
  const yKey = chart.y_axis || Object.keys(dashboard.data[0])[1];

  // Cap data at 20 points for the preview
  const data = dashboard.data.slice(0, 20);

  const renderChart = () => {
    switch (chart.type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(249,115,22,0.15)" }} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#f97316", stroke: "#18181b", strokeWidth: 2 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="inline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#inline-grad)"
              dot={false}
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={data} barSize={14}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(249,115,22,0.05)" }} />
            <Bar dataKey={yKey} radius={[3, 3, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={`rgba(249,115,22,${0.4 + (i / data.length) * 0.6})`}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={35}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", color: "#71717a" }}
            />
          </PieChart>
        );

      default:
        return (
          <BarChart data={data} barSize={14}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey={yKey} fill="#f97316" radius={[3, 3, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden">
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
        <span className="text-[11px] font-medium text-zinc-300 truncate">
          {chart.title}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-mono text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">
            {chart.type}
          </span>
          <span className="text-[9px] font-mono text-zinc-600">
            preview
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 px-2 py-3">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
