"use client"

import { motion, useTransform } from "framer-motion"

interface EpilogueSceneProps {
  progress: any // MotionValue from scroll progress
}

function StarField({ progress }: { progress: any }) {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.8 + 0.2,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => {
        return (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              y: [0, -100 - star.id * 2],
              opacity: [0, star.opacity, star.opacity * 0.8, star.opacity * 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}

function NeuralNetwork({ progress }: { progress: any }) {
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    connections: Math.floor(Math.random() * 3) + 1,
  }))

  const networkOpacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 0.3, 0.5, 0.2])
  const networkScale = useTransform(progress, [0, 0.5, 1], [0.8, 1, 1.2])

  return (
    <motion.div className="absolute inset-0" style={{ opacity: networkOpacity, scale: networkScale }}>
      <svg className="w-full h-full">
        {/* Neural connections */}
        {nodes.map((node) =>
          Array.from({ length: node.connections }).map((_, connIndex) => {
            const targetNode = nodes[Math.floor(Math.random() * nodes.length)]
            return (
              <motion.line
                key={`${node.id}-${connIndex}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke="url(#neuralGradient)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  repeatDelay: 1,
                }}
              />
            )
          }),
        )}

        {/* Neural nodes */}
        {nodes.map((node) => (
          <motion.circle key={node.id} cx={`${node.x}%`} cy={`${node.y}%`} r="4" fill="url(#nodeGradient)" />
        ))}

        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  )
}

function FloatingParticles({ progress }: { progress: any }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 30 }).map((_, i) => {
        const randomX = Math.random() * 100
        const randomY = Math.random() * 100

        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            animate={{
              y: [0, -200],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 1, 0.8, 0.3],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}

export function EpilogueScene({ progress }: EpilogueSceneProps) {
  const titleScale = useTransform(progress, [0, 0.3, 0.7, 1], [0.8, 1, 1.1, 1.2])
  const titleOpacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8])
  const messageOpacity = useTransform(progress, [0.2, 0.4, 0.8, 1], [0, 1, 1, 0.9])
  const backgroundShift = useTransform(progress, [0, 1], [0, 100])

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-background via-slate-900 to-black">
      <motion.div
        style={{
          opacity: useTransform(progress, [0, 0.3], [0, 1]),
          y: backgroundShift,
        }}
        className="absolute inset-0"
      >
        <StarField progress={progress} />
      </motion.div>

      <motion.div
        style={{
          opacity: useTransform(progress, [0.2, 0.5], [0, 1]),
          scale: useTransform(progress, [0, 1], [0.9, 1.1]),
        }}
        className="absolute inset-0"
      >
        <NeuralNetwork progress={progress} />
      </motion.div>

      <FloatingParticles progress={progress} />

      {/* Content with scroll-driven animations */}
      <div className="text-center z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div style={{ scale: titleScale, opacity: titleOpacity }}>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            The Future Awaits
          </motion.h2>
        </motion.div>

        <motion.div style={{ opacity: messageOpacity }} className="space-y-12">
          <motion.p className="text-lg sm:text-2xl md:text-3xl text-white/80 leading-relaxed font-light max-w-4xl mx-auto px-4">
            {"The story of AI is still being written. What happens next… depends on us.".split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          <motion.div
            style={{
              opacity: useTransform(progress, [0.6, 0.8], [0, 1]),
              y: useTransform(progress, [0.6, 0.8], [50, 0]),
            }}
            className="mt-16 text-center"
          >
            <p className="text-xs sm:text-sm text-white/50 mb-4">
              Built with passion for the future of artificial intelligence
            </p>
            <motion.div
              style={{
                y: useTransform(progress, [0.7, 1], [0, -20]),
                scale: useTransform(progress, [0.7, 1], [1, 1.2]),
              }}
              className="text-xl sm:text-2xl"
            >
              🚀
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            progress,
            [0, 0.33, 0.66, 1],
            [
              "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 60% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
            ],
          ),
        }}
      />
    </section>
  )
}
