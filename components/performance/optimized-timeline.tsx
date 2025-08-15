"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { ReducedMotionWrapper } from "@/components/accessibility/reduced-motion-wrapper"
import { ErrorBoundary } from "@/components/performance/error-boundary"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { TimelineBadge } from "@/components/ui/timeline-badge"
import type { TimelineEvent } from "@/types/timeline"

interface OptimizedTimelineItemProps {
  event: TimelineEvent
  index: number
  isLeft?: boolean
}

const categoryVariants = {
  "Research Breakthroughs": "research" as const,
  "Models & Architectures": "model" as const,
  "Public Releases": "release" as const,
  "Ethics & Policy": "ethics" as const,
  "Hardware Advances": "hardware" as const,
}

// Memoized timeline item to prevent unnecessary re-renders
const OptimizedTimelineItem = memo(function OptimizedTimelineItem({
  event,
  index,
  isLeft = true,
}: OptimizedTimelineItemProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.2,
    rootMargin: "50px",
    triggerOnce: true,
  })

  // Memoize the animation variants to prevent recreation
  const animationVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        x: isLeft ? -50 : 50,
        y: 20,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.6,
          delay: index * 0.1,
          ease: "easeOut",
        },
      },
    }),
    [isLeft, index],
  )

  const staticContent = (
    <div className={`relative flex items-center ${isLeft ? "justify-start" : "justify-end"}`}>
      <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg" />
      </div>

      <div className={`w-full max-w-md ${isLeft ? "pr-8" : "pl-8"}`}>
        <CinematicCard>
          <TimelineEventContent event={event} />
        </CinematicCard>
      </div>
    </div>
  )

  return (
    <ErrorBoundary>
      <div ref={ref}>
        <ReducedMotionWrapper fallback={staticContent}>
          <motion.div
            className={`relative flex items-center ${isLeft ? "justify-start" : "justify-end"}`}
            variants={animationVariants}
            initial="hidden"
            animate={isIntersecting ? "visible" : "hidden"}
          >
            {/* Timeline node */}
            <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
              <motion.div
                className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>

            {/* Event card */}
            <div className={`w-full max-w-md ${isLeft ? "pr-8" : "pl-8"}`}>
              <CinematicCard className="relative group" glowEffect hoverEffect>
                <TimelineEventContent event={event} />
              </CinematicCard>
            </div>
          </motion.div>
        </ReducedMotionWrapper>
      </div>
    </ErrorBoundary>
  )
})

// Memoized event content to prevent unnecessary re-renders
const TimelineEventContent = memo(function TimelineEventContent({ event }: { event: TimelineEvent }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-muted-foreground font-mono" aria-label={`Date: ${event.month} ${event.year}`}>
          {event.month} {event.year}
        </div>
        <TimelineBadge
          variant={categoryVariants[event.category] || "research"}
          aria-label={`Category: ${event.category}`}
        >
          {event.category}
        </TimelineBadge>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{event.title}</h3>

      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{event.description}</p>
    </div>
  )
})

export { OptimizedTimelineItem }
