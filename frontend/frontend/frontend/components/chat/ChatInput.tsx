"use client";

import { motion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (msg: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, isLoading, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const canSend = value.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className="px-4 py-4">
      <div
        className={cn(
          "relative flex items-end gap-3 bg-zinc-800/60 border rounded-2xl px-4 py-3 transition-all duration-200",
          disabled
            ? "border-zinc-800/40 opacity-50 cursor-not-allowed"
            : "border-zinc-700/60 focus-within:border-orange-500/40 focus-within:shadow-[0_0_0_1px_rgba(249,115,22,0.15),0_0_20px_rgba(249,115,22,0.05)]"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder || "Ask anything about your data…"}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-[13px] text-white placeholder:text-zinc-600 leading-relaxed max-h-[120px] disabled:cursor-not-allowed font-sans"
        />

        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
            canSend
              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "bg-zinc-700/50 text-zinc-600 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArrowUp className="w-3.5 h-3.5" />
          )}
        </motion.button>
      </div>

      <p className="text-[10px] text-zinc-700 mt-2 text-center font-mono">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
