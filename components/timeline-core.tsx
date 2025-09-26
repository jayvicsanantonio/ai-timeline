"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, useTransform, useSpring } from "framer-motion"
import { Calendar, Tag } from "lucide-react"
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

function TimelineItem({
  event,
  index,
  progress,
  totalEvents,
}: {
  event: TimelineEvent
  index: number
  progress: any
  totalEvents: number
}) {
  const ref = useRef(null)

  const eventSpacing = 0.8 / totalEvents
  const itemStart = index * eventSpacing
  const itemEnd = Math.min(itemStart + 0.6, 1)
  const itemProgress = useTransform(progress, [itemStart, itemEnd], [0, 1])

  const y = useTransform(itemProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -50])
  const opacity = useTransform(itemProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.7])
  const scale = useTransform(itemProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.95])
  const rotateY = useTransform(itemProgress, [0, 0.5, 1], [15, 0, -5])

  const isPresent = event.year === new Date().getFullYear()
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      style={{
        y: useSpring(y, { stiffness: 60, damping: 20 }),
        opacity,
        scale,
        rotateY,
      }}
      className={`relative flex ${isLeft ? "justify-start" : "justify-end"} mb-16 md:mb-20`}
    >
      <motion.div
        className={`absolute left-1/2 top-8 w-4 h-4 rounded-full transform -translate-x-1/2 z-20 hidden md:block border-2 border-background ${
          isPresent ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-primary"
        }`}
        style={{
          scale: useTransform(itemProgress, [0, 0.2, 0.8], [0, 1.5, 1]),
          opacity: useTransform(itemProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.8]),
        }}
        animate={{
          boxShadow: isPresent
            ? [
                "0 0 10px rgba(251, 191, 36, 0.5)",
                "0 0 30px rgba(251, 191, 36, 0.8)",
                "0 0 10px rgba(251, 191, 36, 0.5)",
              ]
            : [
                "0 0 5px rgba(59, 130, 246, 0.3)",
                "0 0 15px rgba(59, 130, 246, 0.6)",
                "0 0 5px rgba(59, 130, 246, 0.3)",
              ],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.div
        className={`w-full md:w-5/12 ${isLeft ? "md:pr-8" : "md:pl-8"}`}
        style={{
          x: useTransform(itemProgress, [0, 0.4], [isLeft ? -50 : 50, 0]),
        }}
      >
        <Card className="relative overflow-hidden border-border/60 bg-card/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/12 via-blue-500/8 to-purple-500/6"
            style={{
              opacity: useTransform(itemProgress, [0, 0.3, 0.7], [0, 1, 0.8]),
            }}
          />

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-mono font-medium text-base">
                  {event.month} {event.year}
                </span>
                {isPresent && (
                  <CustomBadge
                    variant="outline"
                    className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10 animate-pulse"
                  >
                    Present Day
                  </CustomBadge>
                )}
              </div>
              <CustomBadge className={categoryColors[event.category]} variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {event.category}
              </CustomBadge>
            </div>

            <CardTitle className="text-xl md:text-2xl lg:text-3xl leading-tight text-foreground font-bold">
              {event.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <CardDescription className="text-base md:text-lg leading-relaxed mb-6 text-foreground/90">
              {event.description}
            </CardDescription>
          </CardContent>

          <motion.div
            className="absolute top-6 right-6 text-3xl opacity-20"
            style={{
              rotate: useTransform(itemProgress, [0, 1], [0, 360]),
              scale: useTransform(itemProgress, [0, 0.5, 1], [0.8, 1.2, 1]),
            }}
          >
            {categoryIcons[event.category]}
          </motion.div>
        </Card>
      </motion.div>

      <div className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-primary/60 to-primary/30 h-full md:hidden" />
      <div className="absolute left-4 top-8 w-3 h-3 rounded-full bg-primary transform -translate-x-1/2 border-2 border-background md:hidden" />
    </motion.div>
  )
}

function ParallaxBackground({ progress }: { progress: any }) {
  const y1 = useTransform(progress, [0, 1], [0, -300])
  const y2 = useTransform(progress, [0, 1], [0, -600])
  const y3 = useTransform(progress, [0, 1], [0, -150])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`bg-layer1-${i}`}
            className="absolute w-px h-40 bg-gradient-to-b from-transparent via-primary/15 to-transparent"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + ((i * 30) % 200)}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`bg-layer2-${i}`}
            className="absolute w-0.5 h-24 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"
            style={{
              left: `${15 + i * 12}%`,
              top: `${40 + ((i * 50) % 300)}%`,
            }}
            animate={{
              scaleY: [0.5, 1.5, 0.5],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 6 + i * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.div>

      <motion.div style={{ y: y3 }} className="absolute inset-0 opacity-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`bg-layer3-${i}`}
            className="absolute w-2 h-2 rounded-full bg-primary/10"
            style={{
              left: `${20 + i * 15}%`,
              top: `${60 + ((i * 80) % 400)}%`,
            }}
            animate={{
              scale: [0.5, 1.2, 0.5],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.6,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function ContinuousSpine({ progress }: { progress: any }) {
  const spineHeight = useTransform(progress, [0, 0.95], [0, 100])
  const spineOpacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0.8])
  const spineGlow = useTransform(progress, [0, 0.5, 1], [0, 1, 0.6])

  return (
    <motion.div
      className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/40 transform -translate-x-1/2 z-10 hidden md:block rounded-full"
      style={{
        height: "100%",
        scaleY: spineHeight,
        opacity: spineOpacity,
        transformOrigin: "top",
        boxShadow: useTransform(spineGlow, (v) => `0 0 ${v * 20}px rgba(59, 130, 246, ${v * 0.5})`),
      }}
    />
  )
}

export function TimelineCore({ events, progress }: { events: TimelineEvent[]; progress: any }) {
  const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([])

  const headerOpacity = useTransform(progress, [0, 0.08, 0.92, 1], [0, 1, 1, 0])
  const headerY = useTransform(progress, [0, 0.15], [80, 0])
  const headerScale = useTransform(progress, [0, 0.1, 0.9, 1], [0.9, 1, 1, 0.95])

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
    <section className="min-h-screen py-20 pt-32 relative overflow-hidden">
      <ParallaxBackground progress={progress} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div style={{ y: headerY, opacity: headerOpacity, scale: headerScale }} className="text-center mb-24">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            The Journey Unfolds
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 font-light">
            From the first spark of artificial intelligence to the transformative breakthroughs of today, witness the
            evolution of humanity&rsquo;s greatest technological achievement.
          </p>
        </motion.div>

        <div className="relative space-y-12 md:space-y-16">
          <ContinuousSpine progress={progress} />

          {visibleEvents.map((event, index) => (
            <TimelineItem
              key={`${event.year}-${event.month}-${event.title}`}
              event={event}
              index={index}
              progress={progress}
              totalEvents={visibleEvents.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
