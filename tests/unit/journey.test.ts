// Unit tests for the journey's teaching: the gym challenge that ends each region and the preview of what each region
// holds. Every challenge must ask about an event of its own region, through a creature its generation knew.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { buildDex } from "@/lib/dex"
import { ERA_DEFINITIONS, getEraForYear } from "@/lib/eras"
import { challengeFitsGeneration, GYM_CHALLENGES, pageSprites, previewRegion } from "@/lib/journey"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const dex = buildDex(events)

describe("GYM_CHALLENGES", () => {
  it("ends every region with a challenge", () => {
    expect(Object.keys(GYM_CHALLENGES).sort()).toEqual(ERA_DEFINITIONS.map((era) => era.id).sort())
  })

  it.each(ERA_DEFINITIONS.map((era) => [era.place, era] as const))(
    "asks %s about an event of its own region, through a creature its generation knew",
    (_, era) => {
      const challenge = GYM_CHALLENGES[era.id]
      const event = events.find((candidate) => candidate.title === challenge.event)
      expect(event, challenge.event).toBeDefined()
      expect(getEraForYear(event!.year)?.id).toBe(era.id)
      expect(challengeFitsGeneration(era)).toBe(true)
    },
  )

  it("offers three different answers, ends its question with a question mark and explains the answer", () => {
    for (const [id, challenge] of Object.entries(GYM_CHALLENGES)) {
      expect(new Set(challenge.choices).size, id).toBe(3)
      expect(challenge.question, id).toMatch(/\?$/)
      expect(challenge.explanation, id).toMatch(/\.$/)
    }
  })

  it("does not always put the right answer in the same place", () => {
    const answers = new Set(Object.values(GYM_CHALLENGES).map((challenge) => challenge.answer))
    expect(answers.size).toBe(3)
  })
})

describe("previewRegion", () => {
  it("names the lines first met in a region and its landmarks, in the order they happened", () => {
    const foundation = previewRegion(ERA_DEFINITIONS[0], events, dex)

    expect(foundation.newLines[0].species.name).toBe("Magikarp")
    expect(foundation.turningPoints.map((point) => point.title)).toEqual(
      events.filter((event) => event.landmark && event.year < 1970).map((event) => event.title),
    )
  })

  it("lists every evolution a region holds", () => {
    const deep = previewRegion(ERA_DEFINITIONS[3], events, dex)

    expect(deep.evolutions.map((evolution) => `${evolution.from.name} → ${evolution.to.name}`)).toContain("Magikarp → Gyarados")
    const all = ERA_DEFINITIONS.flatMap((era) => previewRegion(era, events, dex).evolutions)
    expect(all).toHaveLength([...dex.values()].flatMap((entry) => entry.scenes).filter((played) => played.scene.kind === "evolution").length)
  })
})

describe("pageSprites", () => {
  it("includes every challenge's creature", () => {
    const sprites = pageSprites(events)
    for (const era of ERA_DEFINITIONS) {
      const species = GYM_CHALLENGES[era.id].species
      expect(sprites.some((path) => path.startsWith(`/sprites/${era.generation}/`) && path.includes(`/${species}.`))).toBe(true)
    }
  })
})
