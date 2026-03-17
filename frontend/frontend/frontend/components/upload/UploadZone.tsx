"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, X, Database } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { uploadCSV, type UploadResponse } from "@/lib/api";

interface UploadZoneProps {
  onUpload: (data: UploadResponse) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [uploadedData, setUploadedData] = useState<UploadResponse | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Only .csv files are supported.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setError("");

    try {
      const data = await uploadCSV(file);
      setUploadedData(data);
      setStatus("done");
      onUpload(data);
    } catch (e: any) {
      setError(e.message || "Upload failed. Please try again.");
      setStatus("error");
    }
  }, [onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setError("");
    setUploadedData(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "done" && uploadedData ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4"
          >
            {/* Green glow */}
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 pointer-events-none" />

            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{uploadedData.filename}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {uploadedData.row_count.toLocaleString()} rows
                </span>
                <span className="text-[11px] text-zinc-600">·</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {Object.keys(uploadedData.schema).length} columns
                </span>
                <span className="text-[11px] text-zinc-600">·</span>
                <span className="text-[11px] font-medium text-emerald-400">Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                {Object.entries(uploadedData.schema).slice(0, 4).map(([col, info]) => (
                  <span
                    key={col}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                  >
                    {col}
                    <span className="text-zinc-600 ml-1">{info.pg_type.toLowerCase()}</span>
                  </span>
                ))}
                {Object.keys(uploadedData.schema).length > 4 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                    +{Object.keys(uploadedData.schema).length - 4}
                  </span>
                )}
              </div>

              <button
                onClick={reset}
                className="ml-2 w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              "relative flex items-center gap-4 px-5 py-4 rounded-2xl border cursor-pointer transition-all duration-200 group",
              isDragging
                ? "border-orange-500/60 bg-orange-500/5"
                : status === "error"
                ? "border-red-500/40 bg-red-500/5"
                : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
            )}
          >
            <input
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={onInputChange}
            />

            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              isDragging
                ? "bg-orange-500/20 border border-orange-500/30"
                : "bg-zinc-800 border border-zinc-700/50 group-hover:border-zinc-600"
            )}>
              {status === "uploading" ? (
                <Loader2 className="w-4.5 h-4.5 text-orange-400 animate-spin" />
              ) : (
                <Upload className={cn(
                  "w-4 h-4 transition-colors",
                  isDragging ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300"
                )} />
              )}
            </div>

            <div className="flex-1">
              {status === "uploading" ? (
                <p className="text-sm text-zinc-400">
                  Uploading <span className="text-white font-medium">{fileName}</span>…
                </p>
              ) : status === "error" ? (
                <>
                  <p className="text-sm font-medium text-red-400">{error}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Click to try again</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    <span className="text-white font-medium">Drop a CSV</span> or click to browse
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">
                    Max 50MB · .csv only
                  </p>
                </>
              )}
            </div>

            <Database className="w-4 h-4 text-zinc-700 flex-shrink-0" />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
