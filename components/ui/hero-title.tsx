"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HeroTitleProps {
  children: React.ReactNode
  className?: string
  gradient?: boolean
  glitch?: boolean
}

export function HeroTitle({ children, className, gradient = true, glitch = false }: HeroTitleProps) {
  return (
    <div className="relative">
      {glitch && (
        <>
          <motion.h1
            className={cn(
              "absolute text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-red-500/20",
              className,
            )}
            animate={{
              x: [-2, 2, -1, 1, 0],
              opacity: [0, 0.3, 0, 0.2, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 3,
            }}
          >
            {children}
          </motion.h1>
          <motion.h1
            className={cn(
              "absolute text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-cyan-500/20",
              className,
            )}
            animate={{
              x: [1, -1, 2, -2, 0],
              opacity: [0, 0.2, 0, 0.3, 0],
            }}
            transition={{
              duration: 0.15,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 4,
            }}
          >
            {children}
          </motion.h1>
        </>
      )}

      <motion.h1
        className={cn(
          "relative text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight",
          gradient &&
            "bg-gradient-to-r from-foreground via-primary via-accent to-primary bg-clip-text text-transparent",
          className,
        )}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          backgroundSize: gradient ? "200% 200%" : undefined,
          filter: "drop-shadow(0 0 20px rgba(5, 150, 105, 0.3))",
        }}
      >
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl -z-10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}
        {children}
      </motion.h1>
    </div>
  )
}
