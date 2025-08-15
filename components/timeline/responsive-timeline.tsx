"use client"

import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { RevealAnimation } from "@/components/animations/reveal-animation"
import { ParallaxContainer } from "@/components/animations/parallax-container"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { TimelineBadge } from "@/components/ui/timeline-badge"
import { SectionHeader } from "@/components/ui/section-header"
import type { TimelineEvent } from "@/types/timeline"
import { cn } from "@/lib/utils"

interface ResponsiveTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const categoryVariants = {
  "Research Breakthroughs": "research" as const,
  "Models & Architectures": "model" as const,
  "Public Releases": "release" as const,
  "Ethics & Policy": "ethics" as const,
  "Hardware Advances": "hardware" as const,
}

export function ResponsiveTimeline({ events, className }: ResponsiveTimelineProps) {
  const { ref } = useScrollAnimation()

  return (
    <section ref={ref} className={cn("relative py-12 md:py-20 overflow-hidden", className)}>
      {/* Background elements */}
      <ParallaxContainer speed="slow" className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealAnimation direction="up" className="mb-12 md:mb-16">
          <SectionHeader
            title="The Journey Unfolds"
            subtitle="From the first spark of artificial intelligence to the transformative breakthroughs of today, witness the evolution of humanity's greatest technological achievement."
            centered
          />
        </RevealAnimation>

        {/* Desktop and Tablet Timeline */}
        <div className="hidden md:block">
          <DesktopTimeline events={events} />
        </div>

        {/* Mobile Timeline */}
        <div className="block md:hidden">
          <MobileTimeline events={events} />
        </div>
      </div>
    </section>
  )
}

function DesktopTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {/* Timeline spine */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/20 via-primary to-primary/20" />

      <div className="space-y-16 lg:space-y-20">
        {events.map((event, index) => (
          <DesktopTimelineItem
            key={`${event.year}-${event.month}`}
            event={event}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  )
}

function MobileTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {/* Mobile timeline spine */}
      <div className="absolute left-6 w-0.5 h-full bg-gradient-to-b from-primary/20 via-primary to-primary/20" />

      <div className="space-y-8">
        {events.map((event, index) => (
          <MobileTimelineItem key={`${event.year}-${event.month}`} event={event} index={index} />
        ))}
      </div>
    </div>
  )
}

interface TimelineItemProps {
  event: TimelineEvent
  index: number
  isLeft?: boolean
}

function DesktopTimelineItem({ event, index, isLeft }: TimelineItemProps) {
  return (
    <RevealAnimation
      direction={isLeft ? "left" : "right"}
      delay={index * 0.1}
      className={`relative flex items-center ${isLeft ? "justify-start" : "justify-end"}`}
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
      <div className={`w-full max-w-md lg:max-w-lg ${isLeft ? "pr-8 lg:pr-12" : "pl-8 lg:pl-12"}`}>
        <CinematicCard className="relative group" glowEffect hoverEffect>
          <TimelineEventContent event={event} />
        </CinematicCard>
      </div>
    </RevealAnimation>
  )
}

function MobileTimelineItem({ event, index }: Omit<TimelineItemProps, "isLeft">) {
  return (
    <RevealAnimation direction="left" delay={index * 0.1} className="relative flex items-start">
      {/* Mobile timeline node */}
      <div className="absolute left-6 transform -translate-x-1/2 z-20 mt-6">
        <motion.div
          className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-lg"
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </div>

      {/* Mobile event card */}
      <div className="ml-12 w-full">
        <CinematicCard className="relative" glowEffect>
          <TimelineEventContent event={event} />
        </CinematicCard>
      </div>
    </RevealAnimation>
  )
}

function TimelineEventContent({ event }: { event: TimelineEvent }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-muted-foreground font-mono">
          {event.month} {event.year}
        </div>
        <TimelineBadge variant={categoryVariants[event.category] || "research"}>{event.category}</TimelineBadge>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{event.title}</h3>

      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{event.description}</p>
    </div>
  )
}
