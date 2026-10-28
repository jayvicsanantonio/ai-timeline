// Timeline Insights section: four stat tiles with numbers computed from the timeline events.
// Each tile leads with its number, then names what the number says about AI's history.
"use client"

import { Lightbulb, TrendingUp, Users, Zap } from "lucide-react"
import { groupEventsByEra, type Era } from "@/lib/eras"
import { countEventsByCategory } from "@/lib/timeline-filter"
import { TIMELINE_CATEGORIES, type TimelineEvent } from "@/types/timeline"

interface TimelineInsightsProps {
  events: TimelineEvent[]
}

function oneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

// Events a year across an era's years. The latest era is still under way, so its years run only up to its
// latest event, and the years it has not reached yet do not dilute its rate.
function eventsPerYear(era: Era, isLatest: boolean) {
  const lastYear = isLatest && era.events.length > 0 ? Math.max(...era.events.map((event) => event.year)) + 1 : era.range[1]
  return era.events.length / (lastYear - era.range[0])
}

// How many times more events a year the latest era has than the one before it, to one decimal place.
// A dash stands in when the era before has no events to compare against.
function formatMultiple(latest: number, previous: number) {
  return previous > 0 ? `${oneDecimal(latest / previous)}×` : "—"
}

function rateLabel(rate: number) {
  return `${oneDecimal(rate)} ${rate === 1 ? "event" : "events"} a year`
}

// The category with the most events. On a tie, the category listed first in TIMELINE_CATEGORIES wins.
function findMostCommonCategory(counts: ReturnType<typeof countEventsByCategory>) {
  return TIMELINE_CATEGORIES.reduce((best, category) => (counts[category] > counts[best] ? category : best))
}

// Every stat is computed from the events, so the tiles stay true to the timeline data. None of them
// repeats the opening chart, which already shows the busiest year and the climb since 2020.
function getInsights(events: TimelineEvent[]) {
  const eras = groupEventsByEra(events)
  const latest = eras[eras.length - 1]
  const previous = eras[eras.length - 2]
  const latestRate = eventsPerYear(latest, true)
  const previousRate = eventsPerYear(previous, false)
  const counts = countEventsByCategory(events)
  const mostCommon = findMostCommonCategory(counts)

  return [
    {
      id: "era-over-era",
      icon: TrendingUp,
      title: "Era Over Era",
      description: "How the newest era of AI compares, in milestones a year, with the era that made it possible.",
      stat: formatMultiple(latestRate, previousRate),
      statLabel: `${rateLabel(latestRate)} in the ${latest.label}, against ${oneDecimal(previousRate)} in the ${previous.label}`,
    },
    {
      id: "most-common",
      icon: Lightbulb,
      title: "Most Common Milestone",
      description: `More of the timeline is ${mostCommon} than any other kind of milestone.`,
      stat: String(counts[mostCommon]),
      statLabel: `${mostCommon} events`,
    },
    {
      id: "industry",
      icon: Users,
      title: "Industry Momentum",
      description:
        "Modern AI advances are built on international collaboration between researchers, institutions, and companies.",
      stat: String(counts["Companies & Investments"]),
      statLabel: "Companies & Investments events",
    },
    {
      id: "impact",
      icon: Zap,
      title: "Societal Impact",
      description: "AI is transforming every aspect of society, from healthcare to education to creative industries.",
      stat: String(counts["Ethics & Policy"]),
      statLabel: "Ethics & Policy events",
    },
  ]
}

export function TimelineInsights({ events }: TimelineInsightsProps) {
  const insights = getInsights(events)

  return (
    <section aria-labelledby="insights-title" className="bg-[#0a0a0b] px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">By the numbers</p>
        <h2 id="insights-title" className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Timeline Insights
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
          Discover the patterns and trends that emerge from decades of AI development
        </p>

        {/* Each tile's five rows share the row's tracks, so titles and descriptions line up across a row
            however long the label above them runs */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => {
            const Icon = insight.icon

            return (
              <div
                key={insight.id}
                className="row-span-5 grid grid-rows-subgrid gap-y-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
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
