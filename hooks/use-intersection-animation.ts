"use client"

import { useInView } from "framer-motion"
import { useRef } from "react"

interface UseIntersectionAnimationOptions {
  threshold?: number
  once?: boolean
  margin?: string
}

export function useIntersectionAnimation(options: UseIntersectionAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const { threshold = 0.1, once = true, margin = "0px" } = options

  const isInView = useInView(ref, {
    threshold,
    once,
    margin,
  })

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const staggerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const slideVariants = {
    left: {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    },
    right: {
      hidden: { opacity: 0, x: 100 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    },
    up: {
      hidden: { opacity: 0, y: 100 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    },
    down: {
      hidden: { opacity: 0, y: -100 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    },
  }

  return {
    ref,
    isInView,
    variants,
    staggerVariants,
    slideVariants,
    animate: isInView ? "visible" : "hidden",
  }
}
