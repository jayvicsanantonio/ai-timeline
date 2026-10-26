"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Keep in sync with the media query in app/globals.css that hides the system cursor.
const CUSTOM_CURSOR_MEDIA_QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)"

// Precision archival reticle cursor with near-instantaneous tracking (high stiffness, critical damping)
export function FuturisticCursor() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(CUSTOM_CURSOR_MEDIA_QUERY)
    const updateIsEnabled = () => setIsEnabled(mediaQuery.matches)

    updateIsEnabled()
    mediaQuery.addEventListener("change", updateIsEnabled)

    return () => mediaQuery.removeEventListener("change", updateIsEnabled)
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setIsHovering(
        target.closest("button, a, [role='button'], .cursor-pointer") !== null || target.style.cursor === "pointer",
      )
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [isEnabled])

  if (!isEnabled) {
    return null
  }

  return (
    <div aria-hidden="true" data-testid="futuristic-cursor">
      <motion.div
        className="fixed top-0 left-0 z-50 h-2 w-2 rounded-full bg-primary pointer-events-none mix-blend-difference"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovering ? 1.4 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 1000,
          damping: 50,
          scale: { duration: 0.12 },
        }}
      />

      <motion.div
        className="fixed top-0 left-0 z-50 h-6 w-6 rounded-full border border-primary/50 pointer-events-none mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.45 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 650,
          damping: 38,
          scale: { duration: 0.15 },
        }}
      />
    </div>
  )
}
