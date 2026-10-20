// Category pill shown on each timeline event card.
// Each variant has its own colors, a hover glow and a shimmer that only animates while hovered.
"use client"

import type React from "react"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
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
    glow: "rgba(16, 185, 129, 0.3)",
    shimmer: "rgba(52, 211, 153, 0.1)",
  },
  model: {
    bg: "bg-gradient-to-r from-blue-500/10 to-blue-600/5",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "rgba(59, 130, 246, 0.3)",
    shimmer: "rgba(96, 165, 250, 0.1)",
  },
  release: {
    bg: "bg-gradient-to-r from-purple-500/10 to-purple-600/5",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "rgba(168, 85, 247, 0.3)",
    shimmer: "rgba(192, 132, 252, 0.1)",
  },
  ethics: {
    bg: "bg-gradient-to-r from-orange-500/10 to-orange-600/5",
    text: "text-orange-400",
    border: "border-orange-500/30",
    glow: "rgba(249, 115, 22, 0.3)",
    shimmer: "rgba(251, 146, 60, 0.1)",
  },
  hardware: {
    bg: "bg-gradient-to-r from-cyan-500/10 to-cyan-600/5",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "rgba(6, 182, 212, 0.3)",
    shimmer: "rgba(34, 211, 238, 0.1)",
  },
  company: {
    bg: "bg-gradient-to-r from-indigo-500/10 to-indigo-600/5",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    glow: "rgba(99, 102, 241, 0.3)",
    shimmer: "rgba(129, 140, 248, 0.1)",
  },
  tool: {
    bg: "bg-gradient-to-r from-pink-500/10 to-pink-600/5",
    text: "text-pink-400",
    border: "border-pink-500/30",
    glow: "rgba(236, 72, 153, 0.3)",
    shimmer: "rgba(244, 114, 182, 0.1)",
  },
  bombshell: {
    bg: "bg-gradient-to-r from-red-500/10 to-red-600/5",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "rgba(239, 68, 68, 0.3)",
    shimmer: "rgba(248, 113, 113, 0.1)",
  },
  agent: {
    bg: "bg-gradient-to-r from-violet-500/10 to-violet-600/5",
    text: "text-violet-400",
    border: "border-violet-500/30",
    glow: "rgba(139, 92, 246, 0.3)",
    shimmer: "rgba(167, 139, 250, 0.1)",
  },
}

export function TimelineBadge({ children, variant = "research", className, animated = true }: TimelineBadgeProps) {
  const styles = variantStyles[variant]
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  // The shimmer is only visible on hover, so it only loops while hovered.
  const runShimmer = isHovered && !shouldReduceMotion

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
        boxShadow: `0 0 20px ${styles.glow}`,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${styles.shimmer} 50%, transparent 70%)`,
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: runShimmer ? ["0% 0%", "100% 100%"] : "0% 0%",
          }}
          transition={
            runShimmer
              ? {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }
              : { duration: 0 }
          }
        />
      )}

      <div className="absolute top-0 left-2 w-1 h-px bg-current opacity-30" />
      <div className="absolute bottom-0 right-2 w-1 h-px bg-current opacity-30" />

      <span className="relative z-10">{children}</span>
    </motion.span>
  )
}
