"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatResponse } from "@/lib/api";

export interface SavedDashboard {
  id: string;
  title: string;
  prompt: string;
  response: ChatResponse;
  savedAt: Date;
}

export function useDashboardHistory() {
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);

  const saveDashboard = useCallback((response: ChatResponse): SavedDashboard => {
    const dash: SavedDashboard = {
      id: uuidv4(),
      title: response.dashboard.title || response.prompt,
      prompt: response.prompt,
      response,
      savedAt: new Date(),
    };
    setDashboards((prev) => [dash, ...prev]);
    setActiveDashboardId(dash.id);
    return dash;
  }, []);

  const deleteDashboard = useCallback((id: string) => {
    setDashboards((prev) => prev.filter((d) => d.id !== id));
    setActiveDashboardId((prev) => (prev === id ? null : prev));
  }, []);

  const activeDashboard =
    dashboards.find((d) => d.id === activeDashboardId) ?? null;

  return {
    dashboards,
    activeDashboard,
    activeDashboardId,
    setActiveDashboardId,
    saveDashboard,
    deleteDashboard,
  };
}
