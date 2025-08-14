"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, useTransform, useSpring } from "framer-motion"
import { ExternalLink, Calendar, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimelineEvent, TimelineCategory } from "@/types/timeline"

function CustomBadge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline"
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variantClasses =
    variant === "outline"
      ? "border text-foreground bg-transparent"
      : "border-transparent bg-primary text-primary-foreground"

  return <div className={`${baseClasses} ${variantClasses} ${className || ""}`}>{children}</div>
}

const categoryColors: Record<TimelineCategory, string> = {
  "Models & Architectures": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Research Breakthroughs": "bg-green-500/20 text-green-300 border-green-500/30",
  "Public Releases": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Ethics & Policy": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Hardware Advances": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
}

const categoryIcons: Record<TimelineCategory, string> = {
  "Models & Architectures": "🧠",
  "Research Breakthroughs": "🔬",
  "Public Releases": "🚀",
  "Ethics & Policy": "⚖️",
  "Hardware Advances": "💻",
}

function TimelineItem({ event, index, progress }: { event: TimelineEvent; index: number; progress: any }) {
  const ref = useRef(null)

  const totalEvents = 9
  const itemStart = index * 0.1 // Events start every 10% of scroll
  const itemEnd = itemStart + 0.4 // Each event visible for 40% of scroll range
  const itemProgress = useTransform(progress, [itemStart, itemEnd], [0, 1])

  const y = useTransform(itemProgress, [0, 0.5, 1], [80, 0, -20])
  const opacity = useTransform(itemProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.8])
  const scale = useTransform(itemProgress, [0, 0.3, 1], [0.9, 1, 1])

  const isPresent = event.year === new Date().getFullYear()
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      style={{
        y: useSpring(y, { stiffness: 80, damping: 25 }),
        opacity,
        scale,
      }}
      className={`relative flex ${isLeft ? "justify-start" : "justify-end"} mb-12 md:mb-16`}
    >
      <motion.div
        className={`absolute left-1/2 top-8 w-3 h-3 rounded-full transform -translate-x-1/2 z-20 hidden md:block border-2 border-background ${
          isPresent ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-primary"
        }`}
        style={{
          scale: useTransform(itemProgress, [0, 0.3, 0.7], [0, 1.3, 1]),
          opacity: useTransform(itemProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.8]),
        }}
      />

      <motion.div
        className={`w-full md:w-5/12 ${isLeft ? "md:pr-8" : "md:pl-8"}`}
        style={{
          x: useTransform(itemProgress, [0, 0.5], [isLeft ? -30 : 30, 0]),
        }}
      >
        <Card className="relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm shadow-lg">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent"
            style={{
              opacity: useTransform(itemProgress, [0, 0.5], [0, 1]),
            }}
          />

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-mono font-medium">
                  {event.month} {event.year}
                </span>
                {isPresent && (
                  <CustomBadge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10">
                    Present Day
                  </CustomBadge>
                )}
              </div>
              <CustomBadge className={categoryColors[event.category]} variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {event.category}
              </CustomBadge>
            </div>

            <CardTitle className="text-xl md:text-2xl leading-tight text-foreground">{event.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <CardDescription className="text-base leading-relaxed mb-4 text-foreground/90">
              {event.description}
            </CardDescription>

            {event.link && (
              <motion.a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors group"
                whileHover={{ x: 5 }}
              >
                Learn More
                <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            )}
          </CardContent>

          <motion.div
            className="absolute top-4 right-4 text-2xl opacity-30"
            style={{
              rotate: useTransform(itemProgress, [0, 1], [0, 180]),
            }}
          >
            {categoryIcons[event.category]}
          </motion.div>
        </Card>
      </motion.div>

      <div className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-primary/60 to-primary/30 h-full md:hidden" />
      <div className="absolute left-4 top-8 w-2 h-2 rounded-full bg-primary transform -translate-x-1/2 border border-background md:hidden" />
    </motion.div>
  )
}

function ParallaxBackground({ progress }: { progress: any }) {
  const y1 = useTransform(progress, [0, 1], [0, -200])
  const y2 = useTransform(progress, [0, 1], [0, -400])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`bg-layer1-${i}`}
            className="absolute w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            style={{
              left: `${15 + i * 15}%`,
              top: `${50 + Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`bg-layer2-${i}`}
            className="absolute w-px h-16 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 150}%`,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function ContinuousSpine({ progress }: { progress: any }) {
  const spineHeight = useTransform(progress, [0, 0.9], [0, 100])
  const spineOpacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0.6])

  return (
    <motion.div
      className="absolute left-1/2 top-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/30 transform -translate-x-1/2 z-10 hidden md:block"
      style={{
        height: "100%",
        scaleY: spineHeight,
        opacity: spineOpacity,
        transformOrigin: "top",
      }}
    />
  )
}

export function TimelineCore({ events, progress }: { events: TimelineEvent[]; progress: any }) {
  const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([])

  const headerOpacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
  const headerY = useTransform(progress, [0, 0.2], [50, 0])

  useEffect(() => {
    const sortedEvents = [...events].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      const monthOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    })
    setVisibleEvents(sortedEvents)
  }, [events])

  return (
    <section className="min-h-screen py-16 pt-24 relative overflow-hidden">
      <ParallaxBackground progress={progress} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
            The Journey Unfolds
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            From the first spark of artificial intelligence to the transformative breakthroughs of today, witness the
            evolution of humanity's greatest technological achievement.
          </p>
        </motion.div>

        <div className="relative space-y-8">
          <ContinuousSpine progress={progress} />

          {visibleEvents.map((event, index) => (
            <TimelineItem
              key={`${event.year}-${event.month}-${event.title}`}
              event={event}
              index={index}
              progress={progress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
