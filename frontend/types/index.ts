export type Tab = "chat" | "dashboard";

export interface Dataset {
  dataset_id: string;
  table_name: string;
  filename: string;
  row_count: number;
  schema: Record<string, { pg_type: string; sample: string[] }>;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  sql?: string;
  dashboard?: any;
  timestamp: Date;
  isLoading?: boolean;
}
