"use client"

import { motion } from "framer-motion"
import { useIntersectionAnimation } from "@/hooks/use-intersection-animation"
import { cn } from "@/lib/utils"

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
  as?: "div" | "h1" | "h2" | "h3" | "p"
}

export function TextReveal({ text, className, delay = 0, staggerDelay = 0.05, as = "div" }: TextRevealProps) {
  const { ref, isInView } = useIntersectionAnimation()
  const MotionElement = motion[as] as typeof motion.div

  const words = text.split(" ")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <MotionElement
      ref={ref}
      className={cn("overflow-hidden", className)}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Screen readers get the whole text once instead of one animated word at a time */}
      <span className="sr-only">{text}</span>
      {words.map((word, index) => (
        <motion.span key={index} aria-hidden="true" className="inline-block mr-2" variants={wordVariants}>
          {word}
        </motion.span>
      ))}
    </MotionElement>
  )
}
