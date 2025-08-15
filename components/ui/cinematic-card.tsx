"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CinematicCardProps {
  children: React.ReactNode
  className?: string
  glowEffect?: boolean
  hoverEffect?: boolean
  variant?: "default" | "premium" | "neural"
}

export function CinematicCard({
  children,
  className,
  glowEffect = false,
  hoverEffect = true,
  variant = "default",
}: CinematicCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "premium":
        return "bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-md border-2 border-primary/20"
      case "neural":
        return "bg-gradient-to-br from-card/70 via-primary/5 to-accent/5 backdrop-blur-lg border border-primary/30"
      default:
        return "bg-card/50 backdrop-blur-sm border border-border/50"
    }
  }

  return (
    <motion.div
      className={cn(
        "relative rounded-xl p-6 overflow-hidden group",
        getVariantStyles(),
        glowEffect && "shadow-2xl shadow-primary/20",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={
        hoverEffect
          ? {
              y: -8,
              scale: 1.02,
              boxShadow: glowEffect
                ? "0 25px 50px rgba(5, 150, 105, 0.25), 0 0 0 1px rgba(5, 150, 105, 0.1)"
                : "0 25px 50px rgba(0,0,0,0.15)",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 rounded-xl" />

      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(45deg, transparent 30%, rgba(5, 150, 105, 0.1) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
        initial={{ y: "100%" }}
        animate={{ y: "-100%" }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(5, 150, 105, 0.1) 50%, transparent 100%)",
          height: "200%",
        }}
      />

      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
