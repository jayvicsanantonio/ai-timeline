// Timeline Insights section: four archival telemetry stat tiles computed from the timeline events,
// paired with a Category Spectral Distribution Matrix across all nine historical dimensions.
"use client"

import { Lightbulb, TrendingUp, Users, Zap } from "lucide-react"
import { CategoryIcon } from "@/components/ui/category-icon"
import { countEventsByCategory } from "@/lib/timeline-filter"
import { TIMELINE_CATEGORIES, type TimelineEvent } from "@/types/timeline"

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
  const recentShare = events.length > 0 ? countEvents(events, (event) => event.year >= 2010) / events.length : 0
  const busiestYear = findBusiestYear(events)

  return [
    {
      id: "acceleration",
      code: "TEL.01 // VELOCITY",
      icon: TrendingUp,
      title: "Accelerating Progress",
      description:
        "AI development has exponentially accelerated, with more breakthroughs in the last decade than the previous 50 years.",
      stat: `${Math.round(recentShare * 100)}%`,
      statLabel: `of the ${events.length} events happened in 2010 or later`,
    },
    {
      id: "busiest-year",
      code: "TEL.02 // PEAK DENSITY",
      icon: Lightbulb,
      title: "Busiest Year",
      description: "Each breakthrough builds upon previous discoveries, creating cascading waves of innovation.",
      stat: String(busiestYear.year),
      statLabel: `${busiestYear.count} events, more than any other year`,
    },
    {
      id: "industry",
      code: "TEL.03 // CAPITAL & SCALE",
      icon: Users,
      title: "Industry Momentum",
      description:
        "Modern AI advances are built on international collaboration between researchers, institutions, and companies.",
      stat: String(countEvents(events, (event) => event.category === "Companies & Investments")),
      statLabel: "Companies & Investments events",
    },
    {
      id: "impact",
      code: "TEL.04 // GOVERNANCE",
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
  const categoryCounts = countEventsByCategory(events)
  const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts))

  return (
    <section
      aria-labelledby="insights-title"
      className="archive-grid-bg border-t border-white/10 bg-[#09090b] px-4 py-24 text-white sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400/90">
              Archival Telemetry // By the numbers
            </p>
            <h2 id="insights-title" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Timeline Insights
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-400 sm:text-right">
            Discover the patterns and trends that emerge from decades of AI development
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => {
            const Icon = insight.icon

            return (
              <div
                key={insight.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-[#111116] p-6 transition-colors hover:border-white/25 hover:bg-[#15151c]"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
                  >
                    {insight.code}
                  </span>
                  <Icon aria-hidden="true" className="size-5 text-amber-400/80" />
                </div>
                <div className="mt-8 font-mono text-5xl font-semibold tracking-tight text-white tabular-nums">
                  {insight.stat}
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">{insight.statLabel}</div>
                <h3 className="mt-8 text-base font-semibold text-white">{insight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{insight.description}</p>
              </div>
            )
          })}
        </div>

        {/* Category Spectral Distribution Matrix */}
        <div
          aria-hidden="true"
          className="mt-8 rounded-2xl border border-white/10 bg-[#111116]/90 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
            <span>Fig. 02 // Category Distribution Across {events.length} Archive Records</span>
            <span>9 Taxonomic Vectors</span>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {TIMELINE_CATEGORIES.map((category) => {
              const count = categoryCounts[category]
              const widthPercent = Math.round((count / maxCategoryCount) * 100)

              return (
                <div
                  key={category}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 font-medium text-zinc-200">
                      <CategoryIcon category={category} className="size-3.5 text-amber-400/90" />
                      <span className="truncate">{category}</span>
                    </span>
                    <span className="font-mono text-zinc-400 tabular-nums">{count} rec</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-violet-400/80"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
