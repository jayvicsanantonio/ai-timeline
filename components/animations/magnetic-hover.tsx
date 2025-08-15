"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface MagneticHoverProps {
  children: React.ReactNode
  strength?: number
  className?: string
  rotationStrength?: number
  scaleOnHover?: boolean
  glowEffect?: boolean
}

export function MagneticHover({
  children,
  strength = 0.3,
  className,
  rotationStrength = 0.1,
  scaleOnHover = true,
  glowEffect = false,
}: MagneticHoverProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      className={cn("cursor-pointer", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
        scale: isHovered && scaleOnHover ? 1.02 : 1,
        rotateX: position.y * rotationStrength * -1,
        rotateY: position.x * rotationStrength,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        scale: { duration: 0.2 },
      }}
      style={{
        transformStyle: "preserve-3d",
        filter: glowEffect && isHovered ? "drop-shadow(0 0 20px rgba(5, 150, 105, 0.3))" : "none",
      }}
    >
      {children}
    </motion.div>
  )
}
