"use client"

import { useEffect, useState } from "react"
import type React from "react"

interface ReducedMotionWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ReducedMotionWrapper({ children, fallback }: ReducedMotionWrapperProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (prefersReducedMotion && fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
