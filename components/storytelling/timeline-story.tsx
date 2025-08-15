"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import type { TimelineEvent } from "@/types/timeline"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { TimelineBadge } from "@/components/ui/timeline-badge"
import { AnimatedBackground } from "@/components/ui/animated-background"

interface TimelineStoryProps {
  events: TimelineEvent[]
}

const categoryVariants = {
  "Research Breakthroughs": "research" as const,
  "Models & Architectures": "model" as const,
  "Public Releases": "release" as const,
  "Ethics & Policy": "ethics" as const,
  "Hardware Advances": "hardware" as const,
  "Companies & Investments": "research" as const,
  "AI Tools": "model" as const,
  "Bombshell News": "ethics" as const,
  Agents: "hardware" as const,
}

export function TimelineStory({ events }: TimelineStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -300])
  const midgroundY = useTransform(scrollYProgress, [0, 1], [0, -150])
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0 opacity-10" style={{ y: backgroundY }}>
        <AnimatedBackground variant="dots" className="opacity-30" />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-accent/5"
        style={{ y: midgroundY }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"
        style={{ y: foregroundY }}
      />

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.1, 0.4, 0.1],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-8 leading-tight">
            The Journey Unfolds
          </h2>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            From the first spark of artificial intelligence to the transformative breakthroughs of today, witness the
            evolution of humanity's greatest technological achievement.
          </motion.p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/30 via-primary to-accent/30 shadow-lg shadow-primary/20"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ originY: 0 }}
          />

          <div className="space-y-24">
            {events.map((event, index) => (
              <TimelineEventCard
                key={`${event.year}-${event.month}-${index}`}
                event={event}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface TimelineEventCardProps {
  event: TimelineEvent
  index: number
  isLeft: boolean
}

function TimelineEventCard({ event, index, isLeft }: TimelineEventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [isLeft ? -200 : 200, 0, 0, isLeft ? -100 : 100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.8])
  const rotateY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [isLeft ? -15 : 15, 0, 0, isLeft ? -5 : 5])

  return (
    <motion.div
      ref={cardRef}
      className={`relative flex items-center ${isLeft ? "justify-start" : "justify-end"}`}
      style={{ x, opacity, scale, rotateY }}
    >
      <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
        <motion.div
          className="relative"
          whileInView={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-xl shadow-primary/30"
            animate={{
              boxShadow: [
                "0 0 10px rgba(5, 150, 105, 0.3)",
                "0 0 20px rgba(5, 150, 105, 0.6)",
                "0 0 10px rgba(5, 150, 105, 0.3)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 w-6 h-6 bg-primary/20 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      <div className={`w-full max-w-lg ${isLeft ? "pr-12" : "pl-12"}`}>
        <motion.div
          whileHover={{
            y: -10,
            rotateY: isLeft ? 5 : -5,
            scale: 1.02,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <CinematicCard className="relative group overflow-hidden" glowEffect>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <motion.div
                  className="text-sm text-muted-foreground font-mono tracking-wider"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {event.month} {event.year}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                >
                  <TimelineBadge variant={categoryVariants[event.category] || "research"}>
                    {event.category}
                  </TimelineBadge>
                </motion.div>
              </div>

              <motion.h3
                className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.1 }}
                viewport={{ once: true }}
              >
                {event.title}
              </motion.h3>

              <motion.p
                className="text-muted-foreground leading-relaxed text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                {event.description}
              </motion.p>

              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                viewport={{ once: true }}
              />
            </div>
          </CinematicCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
