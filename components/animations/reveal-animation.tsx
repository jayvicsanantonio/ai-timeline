"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useIntersectionAnimation } from "@/hooks/use-intersection-animation"
import { cn } from "@/lib/utils"

interface RevealAnimationProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export function RevealAnimation({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
}: RevealAnimationProps) {
  const { ref, slideVariants, animate } = useIntersectionAnimation({ once })

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={slideVariants[direction]}
      initial="hidden"
      animate={animate}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}
