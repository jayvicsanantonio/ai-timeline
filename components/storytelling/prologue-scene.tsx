"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"
import { HeroTitle } from "@/components/ui/hero-title"
import { AnimatedBackground } from "@/components/ui/animated-background"

export function PrologueScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 1 })
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 1, 0.3, 0])
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.05, 0.7])
  const y = useTransform(smoothProgress, [0, 1], [0, -200])
  const rotateX = useTransform(smoothProgress, [0, 1], [0, -10])

  const backgroundY1 = useTransform(smoothProgress, [0, 1], [0, -100])
  const backgroundY2 = useTransform(smoothProgress, [0, 1], [0, -200])
  const backgroundY3 = useTransform(smoothProgress, [0, 1], [0, -400])

  const blur = useTransform(smoothProgress, [0, 0.8, 1], [0, 0, 8])
  const brightness = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.1, 0.6])

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        opacity,
        scale,
        y,
        rotateX,
        filter: `blur(${blur}px) brightness(${brightness})`,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div className="absolute inset-0" style={{ y: backgroundY1 }}>
        <AnimatedBackground variant="neural" className="opacity-20" />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: backgroundY2 }}>
        <AnimatedBackground variant="dots" className="opacity-10" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => {
          const randomDelay = i * 0.3
          const randomDuration = 6 + Math.random() * 4
          const randomAmplitude = 30 + Math.random() * 40

          return (
            <motion.div
              key={i}
              className="absolute text-xs font-mono text-primary/30 select-none"
              style={{
                left: `${5 + i * 8}%`,
                top: `${15 + (i % 3) * 25}%`,
                transformStyle: "preserve-3d",
              }}
              animate={{
                y: [-randomAmplitude, randomAmplitude, -randomAmplitude],
                x: [-10, 10, -10],
                opacity: [0.1, 0.8, 0.3, 0.1],
                rotateZ: [-5, 5, -5],
                scale: [0.8, 1.2, 0.8],
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
                  "if (intelligence)",
                  "neural.network()",
                  "machine.learn()",
                  "ai.evolve()",
                  "human.dream()",
                  "future.unfold()",
                  "algorithm.think()",
                  "consciousness.emerge()",
                  "data.transform()",
                  "mind.simulate()",
                  "logic.reason()",
                  "pattern.recognize()",
                ][i]
              }
            </motion.div>
          )
        })}
      </div>

      <motion.div className="absolute inset-0" style={{ y: backgroundY3 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-100, 100, -100],
              x: [-20, 20, -20],
              scale: [0.5, 1.5, 0.5],
              opacity: [0, 0.6, 0],
              rotateZ: [0, 360, 720],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="mb-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <HeroTitle className="mb-6">The AI Timeline</HeroTitle>

          <motion.div className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            {[
              "For",
              "decades,",
              "humanity",
              "has",
              "dreamed",
              "of",
              "building",
              "minds.",
              "This",
              "is",
              "the",
              "story",
              "of",
              "that",
              "dream",
              "—",
              "from",
              "its",
              "first",
              "spark",
              "to",
              "its",
              "living,",
              "breathing",
              "forms",
              "today.",
            ].map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-2"
                initial={{ opacity: 0, y: 20, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1 + i * 0.08,
                  ease: "easeOut",
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center space-y-3 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Scroll to begin the journey
          </motion.span>

          <motion.div
            className="flex flex-col items-center space-y-1"
            animate={{
              y: [0, 8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary to-transparent" />
            <motion.div
              className="text-lg"
              animate={{ rotateZ: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              ↓
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            smoothProgress,
            [0, 0.3, 0.7, 1],
            [
              "radial-gradient(circle at 30% 70%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.2) 0%, transparent 70%)",
              "radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 80%)",
            ],
          ),
        }}
      />
    </motion.section>
  )
}
