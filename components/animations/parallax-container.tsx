"use client"

import type React from "react"

import { motion } from "framer-motion"
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

  const getTransform = () => {
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
    return intensity !== 1 ? baseTransform.to((value) => value * intensity) : baseTransform
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{
        y: getTransform(),
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  )
}
