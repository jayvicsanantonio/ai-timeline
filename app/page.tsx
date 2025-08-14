"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { PrologueScene } from "@/components/prologue-scene"
import { TimelineCore } from "@/components/timeline-core"
import { EpilogueScene } from "@/components/epilogue-scene"

export default function AITimelinePage() {
  const [events] = useState<TimelineEvent[]>(timelineData as TimelineEvent[])
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const prologueProgress = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const timelineProgress = useTransform(scrollYProgress, [0.15, 0.85], [0, 1]) // Extended from [0.2, 0.8] to [0.15, 0.85]
  const epilogueProgress = useTransform(scrollYProgress, [0.8, 1], [0, 1])

  const prologueOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0])
  const timelineOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0])
  const epilogueOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1])

  return (
    <main ref={containerRef} className="relative bg-background text-foreground overflow-x-hidden">
      <div className="relative" style={{ height: "500vh" }}>
        {/* Prologue Section */}
        <motion.div className="fixed inset-0 z-10" style={{ opacity: prologueOpacity }}>
          <PrologueScene progress={prologueProgress} />
        </motion.div>

        {/* Timeline Section */}
        <motion.div className="fixed inset-0 z-20" style={{ opacity: timelineOpacity }}>
          <TimelineCore events={events} progress={timelineProgress} />
        </motion.div>

        {/* Epilogue Section */}
        <motion.div className="fixed inset-0 z-30" style={{ opacity: epilogueOpacity }}>
          <EpilogueScene progress={epilogueProgress} />
        </motion.div>
      </div>
    </main>
  )
}
