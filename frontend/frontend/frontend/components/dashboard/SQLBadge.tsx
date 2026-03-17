"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Code2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useState } from "react";

interface SQLBadgeProps {
  sql: string;
  rowCount: number;
}

export function SQLBadge({ sql, rowCount }: SQLBadgeProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
            <Code2 className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-zinc-400">Generated SQL</span>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700/50">
              {rowCount.toLocaleString()} rows
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
          >
            {open ? (
              <>Hide <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>View <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      </div>

      {/* SQL block */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <pre className="text-[11px] font-mono bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-emerald-400/90 overflow-x-auto leading-relaxed">
                {sql}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
