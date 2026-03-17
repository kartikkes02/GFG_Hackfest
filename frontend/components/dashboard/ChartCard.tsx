"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { type ChartConfig } from "@/lib/api";
import { cn } from "@/lib/utils";

const COLORS = ["#f97316", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#e4e4e7",
  fontSize: "12px",
  fontFamily: "var(--font-geist-mono)",
};

interface ChartCardProps {
  config: ChartConfig;
  data: Record<string, any>[];
  index: number;
  fullWidth?: boolean;
  compact?: boolean;
}

export function ChartCard({ config, data, index, fullWidth, compact }: ChartCardProps) {
  const xKey = config.x_axis || (data[0] ? Object.keys(data[0])[0] : "");
  const yKey = config.y_axis || (data[0] ? Object.keys(data[0])[1] : "");

  const chartEl = renderChart(config.type, data, xKey, yKey, config.group_by);

  // Compact mode — bare chart, no card wrapper (used for inline preview)
  if (compact) {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartEl}
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 overflow-hidden hover:border-zinc-700 transition-colors duration-200",
        fullWidth && "lg:col-span-2"
      )}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold text-white">{config.title}</h3>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
            {xKey} · {yKey}
          </p>
        </div>
        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 border border-zinc-700/50 px-2 py-0.5 rounded-lg">
          {config.type}
        </span>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chartEl}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function renderChart(
  type: string,
  data: Record<string, any>[],
  xKey: string,
  yKey: string,
  groupBy: string | null
): React.ReactElement {
  const axisStyle = {
    fontSize: 10,
    fontFamily: "var(--font-geist-mono)",
    fill: "#52525b",
  };

  const gridProps = {
    strokeDasharray: "3 3" as const,
    stroke: "rgba(255,255,255,0.04)",
    vertical: false,
  };

  switch (type) {
    case "line":
      return (
        <LineChart data={data}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(249,115,22,0.15)" }} />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f97316", stroke: "#18181b", strokeWidth: 2 }}
          />
        </LineChart>
      );

    case "area":
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#grad-area)"
            dot={false}
          />
        </AreaChart>
      );

    case "bar":
      return (
        <BarChart data={data} barSize={20}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(249,115,22,0.05)" }} />
          <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
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
            outerRadius={85}
            innerRadius={45}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: "11px",
              fontFamily: "var(--font-geist-mono)",
              color: "#71717a",
            }}
          />
        </PieChart>
      );

    case "scatter":
      return (
        <ScatterChart>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} type="number" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis dataKey={yKey} type="number" tick={axisStyle} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill="#f97316" opacity={0.7} />
        </ScatterChart>
      );

    default:
      return (
        <BarChart data={data} barSize={20}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey={yKey} fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
  }
}
