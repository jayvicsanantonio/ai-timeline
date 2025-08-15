"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingAnimationProps {
  children: React.ReactNode
  duration?: number
  intensity?: number
  delay?: number
  className?: string
}

export function FloatingAnimation({
  children,
  duration = 6,
  intensity = 10,
  delay = 0,
  className,
}: FloatingAnimationProps) {
  return (
    <motion.div
      className={cn(className)}
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
