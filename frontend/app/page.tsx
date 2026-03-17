"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Background } from "@/components/layout/Background";
import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useDashboardHistory } from "@/Hooks/useDashboardHistory";
import type { Tab } from "@/types";
import type { ChatResponse } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [dashSidebarOpen, setDashSidebarOpen] = useState(true);

  const {
    dashboards,
    activeDashboard,
    activeDashboardId,
    setActiveDashboardId,
    saveDashboard,
    deleteDashboard,
  } = useDashboardHistory();

  const handleDataReceived = (res: ChatResponse) => {
    saveDashboard(res);
  };

  const hasData = dashboards.length > 0;
  const displayedResponse = activeDashboard?.response ?? null;

  return (
    <>
      <Background />
      <div className="relative min-h-screen text-white">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasData={hasData}
        />

        {/* Hero */}
        {activeTab === "chat" && !hasData && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="pt-28 pb-6 text-center max-w-2xl mx-auto px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 text-[11px] font-medium text-orange-400/80 bg-orange-500/8 border border-orange-500/20 px-3 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              AI-powered data analysis
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
            >
              Your data,{" "}
              <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-blue-400 bg-clip-text text-transparent">
                understood instantly
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[15px] text-zinc-500 leading-relaxed max-w-lg mx-auto"
            >
              Upload a CSV. Ask anything in plain English. DataPilot generates
              SQL, runs it on your data, and builds interactive dashboards in
              seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 flex-wrap mt-6"
            >
              {["No-code", "Instant SQL", "Auto charts", "Follow-up queries"].map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-mono text-zinc-500 bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full"
                >
                  {f}
                </span>
              ))}
            </motion.div>
          </motion.section>
        )}

        <main
          className={`max-w-7xl mx-auto px-6 pb-20 ${
            activeTab === "chat" && !hasData ? "pt-2" : "pt-24"
          }`}
        >
          {/* ── CHAT TAB ── */}
          <div className={activeTab === "chat" ? "block" : "hidden"}>
            <ChatInterface
              onDataReceived={handleDataReceived}
              onSwitchToDashboard={() => setActiveTab("dashboard")}
            />
          </div>

          {/* ── DASHBOARD TAB ── */}
          <div className={activeTab === "dashboard" ? "flex gap-0 items-start" : "hidden"}>
            {/* Dashboard content */}
            <div className="flex-1 min-w-0 space-y-5">
              {hasData && displayedResponse && (
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {displayedResponse.dashboard.title}
                    </h2>
                    <p className="text-[12px] text-zinc-500 font-mono mt-1">
                      {displayedResponse.row_count.toLocaleString()} rows · AI generated
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
              )}

              <Dashboard
                response={displayedResponse}
                onGoToChat={() => setActiveTab("chat")}
              />
            </div>

            {/* Right sidebar */}
            <DashboardSidebar
              open={dashSidebarOpen}
              onToggle={() => setDashSidebarOpen((v) => !v)}
              dashboards={dashboards}
              activeDashboardId={activeDashboardId}
              onSelect={setActiveDashboardId}
              onDelete={deleteDashboard}
            />
          </div>
        </main>
      </div>
    </>
  );
}
