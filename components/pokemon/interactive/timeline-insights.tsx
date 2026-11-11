// Timeline Insights section, drawn as the dex's stats: four stat tiles with numbers computed from the timeline events, each
// leading with its number and then naming what it says about AI's history, beside a bar for every line with how many
// entries it holds and the stage it has reached, and the case of badges the reader has earned through every era.
"use client"

import { Lightbulb, TrendingUp, Users, Zap } from "lucide-react"
import { Sprite } from "@/components/pokemon/ui/sprite"
import { badgePath, iconPath, lineOf, LINES, speciesOf } from "@/lib/dex"
import { ERA_DEFINITIONS, groupEventsByEra, type Era } from "@/lib/eras"
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
      title: "Faster every era",
      description: "How many milestones a year the newest region logs, against the region before it.",
      stat: formatMultiple(latestRate, previousRate),
      statLabel: `${rateLabel(latestRate)} in the ${latest.label}, against ${oneDecimal(previousRate)} in the ${previous.label}`,
    },
    {
      id: "most-common",
      icon: Lightbulb,
      title: "Most common milestone",
      description: `More of AI's milestones are ${mostCommon} than any other kind.`,
      stat: String(counts[mostCommon]),
      statLabel: `${mostCommon} events`,
    },
    {
      id: "industry",
      icon: Users,
      title: "Money behind it",
      description: "Labs founded, bought and funded: the deals that pay for AI's progress.",
      stat: String(counts["Companies & Investments"]),
      statLabel: "Companies & Investments events",
    },
    {
      id: "impact",
      icon: Zap,
      title: "Rules and pushback",
      description: "Laws, court rulings, warnings and protests: people setting limits on AI.",
      stat: String(counts["Ethics & Policy"]),
      statLabel: "Ethics & Policy events",
    },
  ]
}

export function TimelineInsights({ events }: TimelineInsightsProps) {
  const insights = getInsights(events)
  // Each line with its events and its last stage among them, the busiest first
  const byLine = LINES.map((line) => {
    const count = events.filter((event) => lineOf(event) === line.id).length
    const stage = line.stages.filter((stage) => !stage.evolvesAt || events.some((event) => event.title === stage.evolvesAt)).at(-1)!
    return { line, count, species: stage.species }
  }).sort((a, b) => b.count - a.count)
  const mostInLine = Math.max(1, ...byLine.map(({ count }) => count))

  return (
    <section aria-labelledby="insights-title" className="bg-background px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="trainer-card-head flex flex-wrap items-end justify-between gap-4 rounded-2xl px-5 py-4 sm:px-6">
          <div>
            <p className="font-pixel text-[0.625rem] uppercase text-[#3b2a00]">Trainer card</p>
            <h2 id="insights-title" className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2433] sm:text-4xl">
              Timeline Insights
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#3b3f52]">
            Your journey by the numbers: what AI&rsquo;s milestones add up to.
          </p>
        </div>

        {/* Each tile's five rows share the row's tracks, so titles and descriptions line up across a row
            however long the label above them runs */}
        <div data-insight-tiles="" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => {
            const Icon = insight.icon

            return (
              <div
                key={insight.id}
                className="row-span-5 grid grid-rows-subgrid gap-y-0 rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              >
                <Icon aria-hidden="true" className="size-5 text-[#ffcb05]" />
                <div className="mt-8 font-pixel text-4xl leading-none text-white">{insight.stat}</div>
                <div className="mt-3 text-sm leading-6 text-[#a7acc8]">{insight.statLabel}</div>
                <h3 className="mt-8 text-base font-semibold text-white">{insight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#a7acc8]">{insight.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <figure data-line-chart="" className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <figcaption>
              <h3 className="text-base font-semibold text-white">Events by branch</h3>
              <p className="mt-1 text-sm leading-6 text-[#a7acc8]">
                How many events each branch holds, and the Pokémon it has evolved into today.
              </p>
            </figcaption>
            <ol className="mt-6 grid gap-3">
              {byLine.map(({ line, count, species }) => (
                <li key={line.id} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <Sprite src={iconPath(species)} pixelated className="size-7 shrink-0 object-contain" />
                    <span className="truncate text-[#e4e6f5]">{line.name}</span>
                  </span>
                  <span aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(count / mostInLine) * 100}%`, backgroundColor: line.color }}
                    />
                  </span>
                  <span className="text-right font-pixel text-[0.625rem] tabular-nums text-white">
                    {count}
                    <span className="sr-only"> events, now {speciesOf(species).name}</span>
                  </span>
                </li>
              ))}
            </ol>
          </figure>

          <div data-badge-case="" className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-base font-semibold text-white">Badge case</h3>
            <p className="mt-1 text-sm leading-6 text-[#a7acc8]">
              One badge for each region, {ERA_DEFINITIONS.length} in all, earned by answering its gym challenge.
            </p>
            <ol className="mt-6 grid grid-cols-3 gap-3">
              {ERA_DEFINITIONS.map((era) => (
                <li
                  key={era.id}
                  className="flex flex-col items-center gap-2 rounded-xl bg-black/20 px-2 py-3 text-center"
                >
                  <Sprite src={badgePath(era.badge)} className="size-10 object-contain" />
                  <span className="text-xs leading-tight text-[#d9dcef]">{era.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
