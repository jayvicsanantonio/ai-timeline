"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Lightbulb, TrendingUp, Users, Zap } from "lucide-react"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { RevealAnimation } from "@/components/animations/reveal-animation"
import { StaggerAnimation } from "@/components/animations/stagger-animation"
import type { TimelineEvent } from "@/types/timeline"

interface TimelineInsightsProps {
  events: TimelineEvent[]
}

export function TimelineInsights({ events }: TimelineInsightsProps) {
  const [activeInsight, setActiveInsight] = useState<string | null>(null)

  const insights = [
    {
      id: "acceleration",
      icon: TrendingUp,
      title: "Accelerating Progress",
      description:
        "AI development has exponentially accelerated, with more breakthroughs in the last decade than the previous 50 years.",
      stat: "70%",
      statLabel: "of major AI breakthroughs occurred after 2010",
    },
    {
      id: "collaboration",
      icon: Users,
      title: "Global Collaboration",
      description:
        "Modern AI advances are built on international collaboration between researchers, institutions, and companies.",
      stat: "15+",
      statLabel: "countries contributing to major AI research",
    },
    {
      id: "innovation",
      icon: Lightbulb,
      title: "Innovation Cycles",
      description: "Each breakthrough builds upon previous discoveries, creating cascading waves of innovation.",
      stat: "3-5",
      statLabel: "year cycles between major paradigm shifts",
    },
    {
      id: "impact",
      icon: Zap,
      title: "Societal Impact",
      description: "AI is transforming every aspect of society, from healthcare to education to creative industries.",
      stat: "∞",
      statLabel: "potential applications across all sectors",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation direction="up" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
            Timeline Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the patterns and trends that emerge from decades of AI development
          </p>
        </RevealAnimation>

        <StaggerAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight) => {
            const Icon = insight.icon
            const isActive = activeInsight === insight.id

            return (
              <motion.div
                key={insight.id}
                onHoverStart={() => setActiveInsight(insight.id)}
                onHoverEnd={() => setActiveInsight(null)}
                whileHover={{ y: -5 }}
                className="h-[32rem] flex" // increased height to h-[32rem] (512px) to accommodate all content
              >
                <CinematicCard
                  className={`w-full transition-all duration-300 ${
                    isActive ? "ring-2 ring-primary/50 shadow-lg shadow-primary/20" : ""
                  }`}
                  glowEffect={isActive}
                >
                  <div className="flex flex-col h-full text-center p-6">
                    <div className="h-80 flex flex-col">
                      {/* Icon section - fixed height */}
                      <div className="flex-shrink-0 mb-4">
                        <motion.div
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto"
                          animate={{ scale: isActive ? 1.1 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>
                      </div>

                      {/* Title section - fixed height */}
                      <div className="flex-shrink-0 mb-4">
                        <h3 className="font-bold text-foreground text-lg leading-tight">{insight.title}</h3>
                      </div>

                      {/* Description section - flexible height within fixed container */}
                      <div className="flex-1 flex items-start justify-center">
                        <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 pt-4 border-t border-border/50">
                      <div className="text-2xl font-bold text-primary">{insight.stat}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-tight">{insight.statLabel}</div>
                    </div>
                  </div>
                </CinematicCard>
              </motion.div>
            )
          })}
        </StaggerAnimation>
      </div>
    </section>
  )
}
