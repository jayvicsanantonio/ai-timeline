"use client"

import { motion, useTransform, useSpring } from "framer-motion"

interface PrologueSceneProps {
  progress: any // MotionValue from scroll progress
}

const codeFragments = [
  "if (intelligence == artificial)",
  "neural_network.train()",
  "def think():",
  "machine.learn()",
  "consciousness = ?",
  "while (dreaming):",
  "AI.evolve()",
  "human + machine",
  "future.predict()",
  "mind = Matter()",
]

const abstractShapes = [
  { type: "circle", size: "w-4 h-4" },
  { type: "square", size: "w-3 h-3" },
  { type: "triangle", size: "w-5 h-5" },
  { type: "hexagon", size: "w-6 h-6" },
]

export function PrologueScene({ progress }: PrologueSceneProps) {
  const titleScale = useTransform(progress, [0, 0.3, 0.7, 1], [0.8, 1, 1.1, 1.2])
  const titleOpacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3])
  const messageOpacity = useTransform(progress, [0.3, 0.5, 0.8, 1], [0, 1, 1, 0])
  const fragmentsOpacity = useTransform(progress, [0.2, 0.4, 0.9, 1], [0, 1, 0.8, 0])

  const springProgress = useSpring(progress, { stiffness: 100, damping: 30 })

  const shapeY = useTransform(springProgress, [0, 1], [0, -200])
  const shapeRotate = useTransform(springProgress, [0, 1], [0, 360])
  const shapeOpacity = useTransform(progress, [0, 0.3, 0.7, 1], [0.1, 0.3, 0.2, 0])

  const connectionY = useTransform(springProgress, [0, 1], [0, -100])
  const connectionOpacity = useTransform(progress, [0, 0.4, 0.8, 1], [0, 0.5, 0.3, 0])

  const fragmentY = useTransform(springProgress, [0, 1], [50, -100])
  const fragmentRotate = useTransform(springProgress, [0, 1], [-10, 20])

  const particleY = useTransform(springProgress, [0, 1], [0, -200])
  const particleOpacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 0.5, 0])

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => {
          const shape = abstractShapes[i % abstractShapes.length]
          const randomX = Math.random() * 100
          const randomY = Math.random() * 100
          const randomDelay = i * 20
          const randomRotateOffset = i * 45

          return (
            <motion.div
              key={`shape-${i}`}
              className={`absolute ${shape.size}`}
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                background: `linear-gradient(${Math.random() * 360}deg, hsl(${220 + Math.random() * 60}, 70%, 60%), hsl(${280 + Math.random() * 60}, 70%, 70%))`,
                borderRadius: shape.type === "circle" ? "50%" : shape.type === "triangle" ? "0" : "4px",
                clipPath:
                  shape.type === "triangle"
                    ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                    : shape.type === "hexagon"
                      ? "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)"
                      : "none",
              }}
              animate={{
                y: [0, -200 - randomDelay],
                rotate: [0, 360 + randomRotateOffset],
                opacity: [0.1, 0.3, 0.2, 0],
              }}
              transition={{
                duration: 8,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          )
        })}

        {Array.from({ length: 8 }).map((_, i) => {
          const randomDelay = i * 15

          return (
            <motion.div
              key={`connection-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
              style={{
                left: `${20 + i * 10}%`,
                height: "100vh",
              }}
              animate={{
                y: [0, -100 - randomDelay],
                opacity: [0, 0.5, 0.3, 0],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          )
        })}
      </div>

      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: fragmentsOpacity }}>
        {codeFragments.map((fragment, i) => {
          const randomX = Math.random() * 80 + 10
          const randomY = Math.random() * 80 + 10
          const randomDelay = i * 30
          const randomRotate = Math.random() * 40 - 20

          return (
            <motion.div
              key={`fragment-${i}`}
              className="absolute font-mono text-xs sm:text-sm text-primary/60"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                transform: `translate(-50%, -50%)`,
              }}
              animate={{
                y: [50, -100 - randomDelay],
                rotate: [Math.random() * 20 - 10, randomRotate],
                opacity: [0, 0.8, 0.4, 0],
              }}
              transition={{
                duration: 6,
                ease: "easeOut",
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.4,
              }}
            >
              {fragment}
            </motion.div>
          )
        })}
      </motion.div>

      <div className="text-center z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div style={{ scale: titleScale, opacity: titleOpacity }}>
          <motion.h1
            className="text-5xl sm:text-7xl md:text-9xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            The AI Timeline
          </motion.h1>
        </motion.div>

        <motion.div style={{ opacity: messageOpacity }} className="space-y-8">
          <motion.p className="text-lg sm:text-xl md:text-3xl text-foreground/90 leading-relaxed font-light tracking-wide px-4">
            {"For decades, humanity has dreamed of building minds. This is the story of that dream — from its first spark to its living, breathing forms today."
              .split(" ")
              .map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  {word}
                </motion.span>
              ))}
          </motion.p>
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => {
          const randomX = Math.random() * 100
          const randomY = Math.random() * 100
          const randomDelay = i * 10

          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
              }}
              animate={{
                y: [0, -200 - randomDelay],
                opacity: [0, 1, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                delay: Math.random() * 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </div>
    </section>
  )
}
