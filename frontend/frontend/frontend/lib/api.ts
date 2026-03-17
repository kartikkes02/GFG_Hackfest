const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface UploadResponse {
  dataset_id: string;
  table_name: string;
  filename: string;
  row_count: number;
  schema: Record<string, { pg_type: string; sample: string[] }>;
  schema_text: string;
}

export interface ChatResponse {
  session_id: string;
  prompt: string;
  sql: string;
  dashboard: DashboardConfig;
  row_count: number;
}

export interface DashboardConfig {
  title: string;
  prompt: string;
  sql: string;
  row_count: number;
  charts: ChartConfig[];
  data: Record<string, any>[];
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "area" | "scatter" | "kpi";
  title: string;
  x_axis: string | null;
  y_axis: string | null;
  group_by: string | null;
  metric: string | null;
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/upload-csv`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export async function sendChatMessage(
  sessionId: string,
  datasetId: string,
  prompt: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      dataset_id: datasetId,
      prompt,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail;
    if (typeof detail === "object") {
      throw new Error(detail.error || `Chat failed: ${res.status}`);
    }
    throw new Error(detail || `Chat failed: ${res.status}`);
  }

  return res.json();
}

export async function listDatasets() {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error("Failed to load datasets");
  return res.json();
}
