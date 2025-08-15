"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TimelineBadgeProps {
  children: React.ReactNode
  variant?: "research" | "model" | "release" | "ethics" | "hardware" | "company" | "tool" | "bombshell" | "agent"
  className?: string
  animated?: boolean
}

const variantStyles = {
  research: {
    bg: "bg-gradient-to-r from-emerald-500/10 to-emerald-600/5",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  model: {
    bg: "bg-gradient-to-r from-blue-500/10 to-blue-600/5",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
  },
  release: {
    bg: "bg-gradient-to-r from-purple-500/10 to-purple-600/5",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
  },
  ethics: {
    bg: "bg-gradient-to-r from-orange-500/10 to-orange-600/5",
    text: "text-orange-400",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
  },
  hardware: {
    bg: "bg-gradient-to-r from-cyan-500/10 to-cyan-600/5",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
  },
  company: {
    bg: "bg-gradient-to-r from-indigo-500/10 to-indigo-600/5",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/20",
  },
  tool: {
    bg: "bg-gradient-to-r from-pink-500/10 to-pink-600/5",
    text: "text-pink-400",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20",
  },
  bombshell: {
    bg: "bg-gradient-to-r from-red-500/10 to-red-600/5",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
  },
  agent: {
    bg: "bg-gradient-to-r from-violet-500/10 to-violet-600/5",
    text: "text-violet-400",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
  },
}

export function TimelineBadge({ children, variant = "research", className, animated = true }: TimelineBadgeProps) {
  const styles = variantStyles[variant]

  return (
    <motion.span
      className={cn(
        "relative inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm overflow-hidden",
        styles.bg,
        styles.text,
        styles.border,
        className,
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 20px ${styles.glow.replace("shadow-", "rgba(").replace("/20", ", 0.3)")}`,
      }}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${styles.text.replace("text-", "rgba(").replace("-400", ", 0.1)")} 50%, transparent 70%)`,
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      )}

      <div className="absolute top-0 left-2 w-1 h-px bg-current opacity-30" />
      <div className="absolute bottom-0 right-2 w-1 h-px bg-current opacity-30" />

      <span className="relative z-10">{children}</span>
    </motion.span>
  )
}
