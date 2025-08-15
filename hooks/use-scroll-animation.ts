"use client"

import { useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"

interface UseScrollAnimationOptions {
  offset?: [string, string]
  smooth?: boolean
  springConfig?: {
    stiffness: number
    damping: number
    mass?: number
  }
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const {
    offset = ["start end", "end start"],
    smooth = true,
    springConfig = { stiffness: 100, damping: 30, mass: 1 },
  } = options

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  })

  const smoothProgress = useSpring(scrollYProgress, springConfig)

  const opacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.8])
  const y = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [150, 0, 0, -150])
  const x = useTransform(smoothProgress, [0, 1], [0, 0])
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [15, 0, -15])
  const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-10, 0, 10])
  const rotateZ = useTransform(smoothProgress, [0, 1], [0, 5])

  const parallaxY = useTransform(smoothProgress, [0, 1], [0, -300])
  const parallaxSlow = useTransform(smoothProgress, [0, 1], [0, -100])
  const parallaxFast = useTransform(smoothProgress, [0, 1], [0, -600])
  const parallaxReverse = useTransform(smoothProgress, [0, 1], [0, 200])

  const morphScale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [1, 1.1, 0.9, 1])
  const blur = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0, 0, 5])
  const brightness = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 0.8])
  const hueRotate = useTransform(smoothProgress, [0, 1], [0, 30])

  const backgroundOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 0.1, 0.2, 0])
  const borderOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.3, 0.5, 0.1])

  return {
    ref,
    scrollYProgress: smooth ? smoothProgress : scrollYProgress,
    opacity,
    scale,
    y,
    x,
    rotateX,
    rotateY,
    rotateZ,
    parallaxY,
    parallaxSlow,
    parallaxFast,
    parallaxReverse,
    morphScale,
    blur,
    brightness,
    hueRotate,
    backgroundOpacity,
    borderOpacity,
  }
}
