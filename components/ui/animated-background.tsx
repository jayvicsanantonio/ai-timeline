"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface AnimatedBackgroundProps {
  variant?: "dots" | "grid" | "neural"
  className?: string
}

export function AnimatedBackground({ variant = "dots", className }: AnimatedBackgroundProps) {
  // Memoize dot positions to prevent hydration mismatches
  const dotPositions = useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      left: (i * 2.37) % 100, // Deterministic positioning
      top: (i * 3.14) % 100,
      duration: 3 + ((i * 0.04) % 2),
      delay: (i * 0.04) % 2,
    })), []
  )

  if (variant === "dots") {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-20">
          {dotPositions.map((dot, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: dot.duration,
                repeat: Number.POSITIVE_INFINITY,
                delay: dot.delay,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === "neural") {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="neural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="hsl(var(--primary))" />
              <circle cx="80" cy="20" r="2" fill="hsl(var(--primary))" />
              <circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" />
              <circle cx="20" cy="80" r="2" fill="hsl(var(--primary))" />
              <circle cx="80" cy="80" r="2" fill="hsl(var(--primary))" />
              <path d="M20 20 L50 50 L80 20" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" />
              <path d="M20 80 L50 50 L80 80" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural)" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  )
}
