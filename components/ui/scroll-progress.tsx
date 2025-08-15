"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50" style={{ scaleX, transformOrigin: "0%" }}>
      <motion.div className="h-full bg-gradient-to-r from-primary to-chart-3" style={{ scaleX }} />
    </motion.div>
  )
}
