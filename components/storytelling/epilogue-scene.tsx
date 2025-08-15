"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { TextReveal } from "@/components/animations/text-reveal"

export function EpilogueScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 1])
  const scale = useTransform(smoothProgress, [0, 0.2], [0.8, 1])
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, -200])

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-slate-900/20 to-background"
      style={{ opacity, scale }}
    >
      <motion.div style={{ y: backgroundY }}>
        <AnimatedBackground variant="neural" className="opacity-30" />
      </motion.div>

      <div className="absolute inset-0">
        {Array.from({ length: 150 }).map((_, i) => {
          const size = Math.random() * 3 + 1
          const duration = 3 + Math.random() * 4
          const delay = Math.random() * 3

          return (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              animate={{
                opacity: [0, 0.8, 0.3, 0],
                scale: [0, 1, 1.2, 0],
                y: [0, -50 - i * 0.5],
              }}
              transition={{
                duration,
                repeat: Number.POSITIVE_INFINITY,
                delay,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`connection-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            style={{
              left: `${10 + i * 4}%`,
              height: "60vh",
              top: "20%",
            }}
            animate={{
              opacity: [0, 0.3, 0.1, 0],
              scaleY: [0, 1, 0.8, 0],
              y: [100, -100],
            }}
            transition={{
              duration: 8 + i * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <SectionHeader
            title="The Story Continues"
            subtitle="The story of AI is still being written. What happens next… depends on us."
            centered
            className="mb-16"
          />

          <motion.div
            className="space-y-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="space-y-8">
              <TextReveal
                text="From the visionary dreams of the 1950s to the transformative breakthroughs of today, artificial intelligence has evolved from science fiction to science fact."
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto"
                staggerDelay={0.03}
              />

              <TextReveal
                text="Each milestone represents not just technological progress, but humanity's relentless pursuit of understanding and augmenting intelligence itself."
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto"
                staggerDelay={0.03}
                delay={2}
              />

              <TextReveal
                text="As we stand at the threshold of an AI-powered future, we carry the responsibility of shaping this technology for the benefit of all humanity."
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto"
                staggerDelay={0.03}
                delay={4}
              />
            </div>

            <motion.div
              className="pt-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 6 }}
              viewport={{ once: true }}
            >
              <p className="text-2xl md:text-3xl font-light text-primary leading-relaxed">
                The next chapter of this story is ours to write.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-20 flex flex-col items-center space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 7 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="flex items-center space-x-3"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              />
              <span className="text-sm text-muted-foreground">The future is being written...</span>
            </motion.div>

            <motion.div
              className="text-xs text-muted-foreground/60"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              Built with passion for the future of artificial intelligence
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            smoothProgress,
            [0, 0.25, 0.5, 0.75, 1],
            [
              "radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.2) 0%, transparent 70%)",
              "radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)",
              "radial-gradient(circle at 70% 30%, rgba(5, 150, 105, 0.05) 0%, transparent 80%)",
            ],
          ),
        }}
      />
    </motion.section>
  )
}
