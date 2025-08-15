"use client"

import type React from "react"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useState, useRef } from "react"
import { Calendar, Zap, Users, Brain, Rocket, Shield } from "lucide-react"
import type { TimelineEvent } from "@/types/timeline"

interface InteractiveTimelineNodeProps {
  event: TimelineEvent
  index: number
  onNodeClick?: (event: TimelineEvent) => void
}

const categoryIcons = {
  "Research Breakthroughs": Brain,
  "Models & Architectures": Zap,
  "Public Releases": Rocket,
  "Ethics & Policy": Shield,
  "Hardware Advances": Users,
  "Companies & Investments": Users,
  "AI Tools": Zap,
  "Bombshell News": Shield,
  Agents: Brain,
}

const categoryColors = {
  "Research Breakthroughs": "from-emerald-400 to-teal-500",
  "Models & Architectures": "from-blue-400 to-indigo-500",
  "Public Releases": "from-purple-400 to-pink-500",
  "Ethics & Policy": "from-orange-400 to-red-500",
  "Hardware Advances": "from-cyan-400 to-blue-500",
  "Companies & Investments": "from-green-400 to-emerald-500",
  "AI Tools": "from-violet-400 to-purple-500",
  "Bombshell News": "from-red-400 to-pink-500",
  Agents: "from-indigo-400 to-blue-500",
}

export function InteractiveTimelineNode({ event, index, onNodeClick }: InteractiveTimelineNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(springY, [-100, 100], [10, -10])
  const rotateY = useTransform(springX, [-100, 100], [-10, 10])

  const Icon = categoryIcons[event.category] || Brain
  const colorGradient = categoryColors[event.category] || categoryColors["Research Breakthroughs"]

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) * 0.1)
    y.set((e.clientY - centerY) * 0.1)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  const handleClick = () => {
    onNodeClick?.(event)
  }

  return (
    <motion.div
      ref={ref}
      className="relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleClick}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow ring */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorGradient} opacity-0 blur-md`}
        animate={{
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.4 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Pulsing background */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorGradient} opacity-20`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
      />

      {/* Main node */}
      <motion.div
        className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${colorGradient} border-2 border-background shadow-lg flex items-center justify-center`}
        animate={{
          boxShadow: isHovered
            ? "0 0 30px rgba(5, 150, 105, 0.6), 0 0 60px rgba(5, 150, 105, 0.3)"
            : "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{
            rotate: isHovered ? 360 : 0,
            scale: isPressed ? 0.8 : 1,
          }}
          transition={{
            rotate: { duration: 0.6, ease: "easeInOut" },
            scale: { duration: 0.1 },
          }}
        >
          <Icon className="w-5 h-5 text-white drop-shadow-sm" />
        </motion.div>
      </motion.div>

      {/* Hover tooltip */}
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg min-w-max">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" />
            <span>
              {event.month} {event.year}
            </span>
          </div>
          <div className="text-sm font-medium text-foreground max-w-48 truncate">{event.title}</div>
        </div>
      </motion.div>

      {/* Connection lines */}
      <motion.div
        className="absolute top-1/2 left-full w-8 h-px bg-gradient-to-r from-primary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  )
}
