// Unit tests for the AI Dex: every event numbered in the order the events happened and spotted as a creature of its
// category's type, in the sprites of its era's generation, with a legend picked by hand for every landmark.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import {
  ART,
  buildDex,
  CATEGORY_TYPES,
  formatDexNumber,
  GENERATION_SPRITES,
  introducedIn,
  LEGENDS,
  requiredSprites,
  SPOTLIGHTS,
} from "@/lib/dex"
import { ERA_DEFINITIONS, getEraForYear } from "@/lib/eras"
import { eventAnchorId } from "@/lib/event-format"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

const events = parseTimelineEvents(timelineData)
const dex = buildDex(events)

describe("CATEGORY_TYPES", () => {
  it("makes every category its own type", () => {
    const types = TIMELINE_CATEGORIES.map((category) => CATEGORY_TYPES[category].name)
    expect(new Set(types).size).toBe(TIMELINE_CATEGORIES.length)
  })

  it("has policy beat models, as Fairy beats Dragon", () => {
    expect(CATEGORY_TYPES["Ethics & Policy"].name).toBe("Fairy")
    expect(CATEGORY_TYPES["Models & Architectures"].name).toBe("Dragon")
  })
})

describe("buildDex", () => {
  it("gives every event an entry, numbered from 1 in the order the events happened", () => {
    expect(dex.size).toBe(events.length)
    events.forEach((event, index) => {
      expect(dex.get(eventAnchorId(event))!.number).toBe(index + 1)
    })
  })

  it("spots each event as a creature its era's generation knew, in that generation's sprites", () => {
    for (const event of events) {
      const entry = dex.get(eventAnchorId(event))!
      const era = getEraForYear(event.year)!
      expect(entry.generation, event.title).toBe(era.generation)
      expect(entry.species.id, event.title).toBeLessThanOrEqual(GENERATION_SPRITES[era.generation].lastSpecies)
      expect(entry.sprite, event.title).toMatch(new RegExp(`^/sprites/${era.generation}/`))
      expect(entry.icon).toBe(`/sprites/icons/${entry.species.id}.png`)
    }
  })

  it("gives each event its category's type", () => {
    for (const event of events) {
      expect(dex.get(eventAnchorId(event))!.type).toBe(CATEGORY_TYPES[event.category])
    }
  })

  it("never spots the same creature twice in a row within an era and type, unless picked by hand", () => {
    for (const era of ERA_DEFINITIONS) {
      for (const category of TIMELINE_CATEGORIES) {
        const ofType = events.filter(
          (event) =>
            getEraForYear(event.year)?.id === era.id &&
            event.category === category &&
            !event.landmark &&
            SPOTLIGHTS[event.title] === undefined,
        )
        const species = ofType.map((event) => dex.get(eventAnchorId(event))!.species.id)
        species.slice(1).forEach((id, index) => {
          // A generation with fewer creatures of a type than the era has events comes round again
          if (ofType.length > 1 && new Set(species).size > 1) {
            expect(id, `${era.label} ${category}`).not.toBe(species[index])
          }
        })
      }
    }
  })

  it("shows an era's own generation's creatures before older ones", () => {
    const learning = events.filter((event) => getEraForYear(event.year)?.generation === "gen-3")
    const firstResearch = learning.find(
      (event) => event.category === "Research Breakthroughs" && !event.landmark && !SPOTLIGHTS[event.title],
    )!
    expect(introducedIn(dex.get(eventAnchorId(firstResearch))!.species.id)).toBe(3)
  })

  it("keeps an event's entry the same however many times the dex is built", () => {
    const again = buildDex(events)
    for (const [id, entry] of dex) {
      expect(again.get(id)).toEqual(entry)
    }
  })
})

describe("LEGENDS", () => {
  const landmarks = events.filter((event) => event.landmark)

  it("picks a legend for every landmark, and for nothing else", () => {
    expect(Object.keys(LEGENDS).sort()).toEqual(landmarks.map((event) => event.title).sort())
  })

  it("spots each landmark as its legend, with its lore", () => {
    for (const event of landmarks) {
      const entry = dex.get(eventAnchorId(event))!
      expect(entry.species.id, event.title).toBe(LEGENDS[event.title].species)
      expect(entry.legend).toBe(LEGENDS[event.title])
    }
  })

  it("never uses one legend twice", () => {
    const species = Object.values(LEGENDS).map((legend) => legend.species)
    expect(new Set(species).size).toBe(species.length)
  })

  it("tells each lore in a sentence or two", () => {
    for (const [title, { lore }] of Object.entries(LEGENDS)) {
      expect(lore, title).toMatch(/\.$/)
      expect(lore.length, title).toBeLessThanOrEqual(140)
    }
  })
})

describe("SPOTLIGHTS", () => {
  it("names only events in the timeline, none of them landmarks", () => {
    for (const title of Object.keys(SPOTLIGHTS)) {
      const event = events.find((candidate) => candidate.title === title)
      expect(event, title).toBeDefined()
      expect(event!.landmark, title).toBeUndefined()
    }
  })
})

describe("formatDexNumber", () => {
  it("pads the number to three digits, as a dex does", () => {
    expect(formatDexNumber(1)).toBe("No. 001")
    expect(formatDexNumber(42)).toBe("No. 042")
    expect(formatDexNumber(340)).toBe("No. 340")
  })
})

describe("ART", () => {
  it("draws Porygon's line, the creatures made of code, in today's sprites", () => {
    expect(ART.evolutionLine.map(({ species }) => species.name)).toEqual(["Porygon", "Porygon2", "Porygon-Z"])
  })
})

// The sprites ship in public/sprites, copied there by scripts/sync-sprites.mjs, and the test server serves that folder
describe("the sprites in public/sprites", () => {
  it("include every sprite the page shows", async () => {
    const missing: string[] = []
    await Promise.all(
      requiredSprites(events).map(async (path) => {
        const response = await fetch(path, { method: "HEAD" })
        const type = response.headers.get("content-type") ?? ""
        if (!response.ok || !type.startsWith("image/")) {
          missing.push(path)
        }
      }),
    )
    expect(missing, "Run node scripts/sync-sprites.mjs <sprites checkout>").toEqual([])
  })
})

// Relative luminance and contrast as WCAG 2 defines them
function luminance(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

describe("the types' chips", () => {
  it.each(TIMELINE_CATEGORIES)("print the %s type's name legibly on its color", (category) => {
    const { color, ink } = CATEGORY_TYPES[category]
    expect(contrast(color, ink)).toBeGreaterThanOrEqual(4.5)
  })
})
