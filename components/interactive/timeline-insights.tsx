// Timeline Insights section: four stat tiles with numbers computed from the timeline events.
// Each tile leads with its number, then names what the number says about AI's history.
"use client"

import { Lightbulb, TrendingUp, Users, Zap } from "lucide-react"
import type { TimelineEvent } from "@/types/timeline"

interface TimelineInsightsProps {
  events: TimelineEvent[]
}

function countEvents(events: TimelineEvent[], matches: (event: TimelineEvent) => boolean) {
  return events.filter(matches).length
}

// The year with the most events. On a tie, the year that comes first in events wins.
function findBusiestYear(events: TimelineEvent[]) {
  const countsByYear = new Map<number, number>()
  for (const event of events) {
    countsByYear.set(event.year, (countsByYear.get(event.year) ?? 0) + 1)
  }

  let busiest = { year: 0, count: 0 }
  for (const [year, count] of countsByYear) {
    if (count > busiest.count) busiest = { year, count }
  }
  return busiest
}

// Every stat is computed from the events, so the cards stay true to the timeline data.
function getInsights(events: TimelineEvent[]) {
  const recentShare = countEvents(events, (event) => event.year >= 2010) / events.length
  const busiestYear = findBusiestYear(events)

  return [
    {
      id: "acceleration",
      icon: TrendingUp,
      title: "Accelerating Progress",
      description:
        "AI development has exponentially accelerated, with more breakthroughs in the last decade than the previous 50 years.",
      stat: `${Math.round(recentShare * 100)}%`,
      statLabel: `of the ${events.length} events happened in 2010 or later`,
    },
    {
      id: "busiest-year",
      icon: Lightbulb,
      title: "Busiest Year",
      description: "Each breakthrough builds upon previous discoveries, creating cascading waves of innovation.",
      stat: String(busiestYear.year),
      statLabel: `${busiestYear.count} events, more than any other year`,
    },
    {
      id: "industry",
      icon: Users,
      title: "Industry Momentum",
      description:
        "Modern AI advances are built on international collaboration between researchers, institutions, and companies.",
      stat: String(countEvents(events, (event) => event.category === "Companies & Investments")),
      statLabel: "Companies & Investments events",
    },
    {
      id: "impact",
      icon: Zap,
      title: "Societal Impact",
      description: "AI is transforming every aspect of society, from healthcare to education to creative industries.",
      stat: String(countEvents(events, (event) => event.category === "Ethics & Policy")),
      statLabel: "Ethics & Policy events",
    },
  ]
}

export function TimelineInsights({ events }: TimelineInsightsProps) {
  const insights = getInsights(events)

  return (
    <section aria-labelledby="insights-title" className="border-t border-white/10 bg-[#0a0a0b] px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">By the numbers</p>
        <h2 id="insights-title" className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Timeline Insights
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
          Discover the patterns and trends that emerge from decades of AI development
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => {
            const Icon = insight.icon

            return (
              <div
                key={insight.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
              >
                <Icon aria-hidden="true" className="size-5 text-zinc-400" />
                <div className="mt-8 text-5xl font-semibold tracking-tight text-white">{insight.stat}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">{insight.statLabel}</div>
                <h3 className="mt-8 text-base font-semibold text-white">{insight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{insight.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
