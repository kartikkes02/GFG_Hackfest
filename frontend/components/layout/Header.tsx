"use client";

import { motion } from "framer-motion";
import { BarChart3, Moon, Sun, Zap, LayoutDashboard, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Tab } from "@/types";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasData: boolean;
}

export function Header({ activeTab, onTabChange, hasData }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-14"
    >
      {/* Glass panel */}
      <div className="animated-border h-full mx-4 mt-3 rounded-2xl bg-zinc-900/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-black/20">
      <div className="h-full max-w-6xl mx-auto px-5 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[14px] text-white tracking-tight">
              DataPilot
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              <Zap className="w-2.5 h-2.5" />
              AI
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-800/60 rounded-xl p-1">
            {(["chat", "dashboard"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
                  activeTab === tab
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-zinc-700 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {tab === "chat" ? (
                    <MessageSquare className="w-3.5 h-3.5" />
                  ) : (
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  )}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "dashboard" && hasData && activeTab !== "dashboard" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-white bg-zinc-800/80 border border-zinc-700/50 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-zinc-700"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
