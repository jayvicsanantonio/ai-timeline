"use client"

import { motion } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileTimelineControlsProps {
  currentIndex: number
  totalEvents: number
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export function MobileTimelineControls({
  currentIndex,
  totalEvents,
  onPrevious,
  onNext,
  className,
}: MobileTimelineControlsProps) {
  return (
    <div className={cn("fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden", className)}>
      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-full p-2 flex items-center space-x-4">
        <motion.button
          className="p-2 rounded-full bg-primary/10 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="w-4 h-4" />
        </motion.button>

        <div className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} / {totalEvents}
        </div>

        <motion.button
          className="p-2 rounded-full bg-primary/10 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={currentIndex === totalEvents - 1}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}
