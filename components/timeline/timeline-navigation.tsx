"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TimelineNavigationProps {
  events: Array<{ year: number; title: string }>
  activeIndex?: number
  onNavigate?: (index: number) => void
  className?: string
}

export function TimelineNavigation({ events, activeIndex = 0, onNavigate, className }: TimelineNavigationProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <nav className={cn("fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block", className)}>
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-2 space-y-1">
        {events.map((event, index) => (
          <motion.button
            key={index}
            className={cn(
              "relative w-3 h-3 rounded-full transition-all duration-300",
              index === activeIndex ? "bg-primary" : "bg-muted-foreground/30",
              "hover:bg-primary/70",
            )}
            onClick={() => onNavigate?.(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Tooltip */}
            {hoveredIndex === index && (
              <motion.div
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-md text-sm whitespace-nowrap shadow-lg border"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="font-medium">{event.year}</div>
                <div className="text-xs text-muted-foreground">{event.title}</div>
                {/* Arrow */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover border-l border-b border-border rotate-45" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  )
}
