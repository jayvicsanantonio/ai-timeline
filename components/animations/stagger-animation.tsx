"use client"

import React from "react"

import type { ReactNode } from "react"

import { motion } from "framer-motion"
import { useIntersectionAnimation } from "@/hooks/use-intersection-animation"
import { cn } from "@/lib/utils"

interface StaggerAnimationProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  childDelay?: number
}

export function StaggerAnimation({ children, className, staggerDelay = 0.1, childDelay = 0.2 }: StaggerAnimationProps) {
  const { ref, isInView } = useIntersectionAnimation()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  }

  const itemVariants = {
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
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
