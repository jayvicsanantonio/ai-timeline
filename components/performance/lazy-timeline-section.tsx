"use client"

import { lazy, Suspense } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// Lazy load heavy components
const TimelineInsights = lazy(() =>
  import("@/components/interactive/timeline-insights").then((mod) => ({ default: mod.TimelineInsights })),
)
const AIQuoteCarousel = lazy(() =>
  import("@/components/interactive/ai-quote-carousel").then((mod) => ({ default: mod.AIQuoteCarousel })),
)

interface LazyTimelineSectionProps {
  component: "insights" | "quotes"
  events?: any[]
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-primary" />
      </motion.div>
    </div>
  )
}

export function LazyTimelineSection({ component, events }: LazyTimelineSectionProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {component === "insights" && events && <TimelineInsights events={events} />}
      {component === "quotes" && <AIQuoteCarousel />}
    </Suspense>
  )
}
