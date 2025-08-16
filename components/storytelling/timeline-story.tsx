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

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200])
  const midgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0 opacity-30" style={{ y: backgroundY }}>
        <AnimatedBackground variant="neural" className="opacity-50" />
      </motion.div>

      <motion.div className="absolute inset-0 opacity-20" style={{ y: midgroundY }}>
        <AnimatedBackground variant="dots" className="opacity-40" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => {
          const size = Math.random() * 3 + 1
          const duration = 8 + Math.random() * 4
          const delay = Math.random() * 6

          return (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: "rgba(5, 150, 105, 0.4)",
                boxShadow: `0 0 ${size * 2}px rgba(5, 150, 105, 0.3)`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                y: [0, -100],
              }}
              transition={{
                duration,
                repeat: Number.POSITIVE_INFINITY,
                delay,
                ease: "linear",
              }}
            />
          )
        })}
      </div>

      <div className="absolute inset-0 overflow-hidden opacity-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`connection-${i}`}
            className="absolute"
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + ((i * 15) % 80)}%`,
              width: `${40 + Math.random() * 60}%`,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.5), transparent)",
              transformOrigin: "left center",
            }}
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => {
          const randomDelay = i * 0.8
          const randomDuration = 12 + Math.random() * 6

          return (
            <motion.div
              key={`code-${i}`}
              className="absolute text-sm font-mono text-primary/40 select-none"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: randomDuration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: randomDelay,
              }}
            >
              {
                [
                  "neural.evolve()",
                  "ai.breakthrough()",
                  "machine.learn()",
                  "deep.think()",
                  "algorithm.adapt()",
                  "intelligence.emerge()",
                  "pattern.recognize()",
                  "model.train()",
                ][i]
              }
            </motion.div>
          )
        })}
      </div>

      <div className="absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className="absolute border border-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + ((i * 25) % 60)}%`,
              width: "60px",
              height: "60px",
              borderRadius: i % 2 === 0 ? "50%" : "0%",
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-radial from-primary/20 via-primary/10 to-transparent blur-2xl"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + ((i * 25) % 50)}%`,
              width: "200px",
              height: "200px",
            }}
            animate={{
              x: [-50, 50, -50],
              y: [-30, 30, -30],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 25 + i * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [
              "radial-gradient(circle at 30% 70%, rgba(5, 150, 105, 0.15) 0%, transparent 70%)",
              "radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.2) 0%, transparent 80%)",
              "radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.1) 0%, transparent 90%)",
            ],
          ),
        }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-accent/5"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

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
