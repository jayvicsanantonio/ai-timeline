"use client"

import type React from "react"

import { motion, useTransform } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface ParallaxContainerProps {
  children: React.ReactNode
  speed?: "reverse" | "slow" | "normal" | "fast"
  className?: string
  intensity?: number
}

export function ParallaxContainer({ children, speed = "normal", className, intensity = 1 }: ParallaxContainerProps) {
  const { ref, parallaxY, parallaxSlow, parallaxFast, parallaxReverse } = useScrollAnimation()

  const baseTransform = (() => {
    switch (speed) {
      case "reverse":
        return parallaxReverse
      case "slow":
        return parallaxSlow
      case "fast":
        return parallaxFast
      default:
        return parallaxY
    }
  })()

  // Apply intensity multiplier
  const y = useTransform(baseTransform, (value) => value * intensity)

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{
        y,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  )
}
