"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedBackgroundProps {
  variant?: "dots" | "grid" | "neural"
  className?: string
}

export function AnimatedBackground({ variant = "dots", className }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (variant === "dots") {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
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
