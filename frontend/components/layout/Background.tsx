"use client";

import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-[#0B0B0F] dark:bg-[#0B0B0F] light:bg-white" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Light mode dot grid override */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-0 [.light_&]:opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow orb 1 — orange, top-left */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
          top: "-200px",
          left: "-100px",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.05, 0.97, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glow orb 2 — blue, bottom-right */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 70%)",
          bottom: "-300px",
          right: "-200px",
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 30, -40, 0],
          scale: [1, 1.03, 0.98, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glow orb 3 — orange subtle, center */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(11,11,15,0.6) 100%)",
        }}
      />
    </div>
  );
}
