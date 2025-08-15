"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown, Calendar, Tag } from "lucide-react"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { TimelineBadge } from "@/components/ui/timeline-badge"
import { MagneticHover } from "@/components/animations/magnetic-hover"
import type { TimelineEvent } from "@/types/timeline"
import { cn } from "@/lib/utils"

interface ExpandableTimelineCardProps {
  event: TimelineEvent & {
    details?: string
    impact?: string
    keyFigures?: string[]
    relatedEvents?: string[]
  }
  className?: string
}

const categoryVariants = {
  "Research Breakthroughs": "research" as const,
  "Models & Architectures": "model" as const,
  "Public Releases": "release" as const,
  "Ethics & Policy": "ethics" as const,
  "Hardware Advances": "hardware" as const,
}

export function ExpandableTimelineCard({ event, className }: ExpandableTimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <MagneticHover strength={0.1}>
      <CinematicCard className={cn("relative group cursor-pointer", className)} glowEffect hoverEffect>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground font-mono">
              <Calendar className="w-4 h-4" />
              <span>
                {event.month} {event.year}
              </span>
            </div>
            <TimelineBadge variant={categoryVariants[event.category] || "research"}>
              <Tag className="w-3 h-3 mr-1" />
              {event.category}
            </TimelineBadge>
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{event.description}</p>
          </div>

          {/* Expand Button */}
          <motion.button
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ x: 5 }}
          >
            <span>{isExpanded ? "Show Less" : "Show More"}</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-border/50 space-y-4">
                  {/* Additional Details */}
                  {event.details && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Details</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{event.details}</p>
                    </div>
                  )}

                  {/* Impact */}
                  {event.impact && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Impact</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{event.impact}</p>
                    </div>
                  )}

                  {/* Key Figures */}
                  {event.keyFigures && event.keyFigures.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Key Figures</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.keyFigures.map((figure, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                          >
                            {figure}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CinematicCard>
    </MagneticHover>
  )
}
