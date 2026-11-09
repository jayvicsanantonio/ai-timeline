// Unit tests for the AI Dex: AI history as nine evolution lines. Every event is numbered in the order the events happened
// and filed under its line at the stage the line had reached, lines evolve at their turning points, the winters freeze them,
// and scripted scenes play after the events that set them off.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import {
  buildDex,
  CATEGORY_ITEMS,
  formatDexNumber,
  GENERATION_SPRITES,
  isWinterYear,
  LINE_OVERRIDES,
  lineOf,
  LINES,
  LINES_BY_ID,
  partyAfter,
  requiredSprites,
  SCENES,
  speciesOf,
} from "@/lib/dex"
import { getEraForYear } from "@/lib/eras"
import { eventAnchorId } from "@/lib/event-format"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

const events = parseTimelineEvents(timelineData)
const dex = buildDex(events)
const entryOf = (title: string) => dex.get(eventAnchorId(events.find((event) => event.title === title)!))!

describe("LINES", () => {
  it("tells AI history as nine lines, each a real evolution line", () => {
    expect(LINES.map((line) => line.stages.map((stage) => speciesOf(stage.species).name))).toEqual([
      ["Magikarp", "Gyarados"],
      ["Abra", "Kadabra", "Alakazam"],
      ["Porygon", "Porygon2", "Porygon-Z"],
      ["Machop", "Machoke", "Machamp"],
      ["Magnemite", "Magneton", "Magnezone"],
      ["Smeargle"],
      ["Meowth", "Persian"],
      ["Chansey", "Blissey"],
      ["Gastly", "Haunter", "Gengar"],
    ])
  })

  it("evolves every line at an event in the timeline, in time order, with a reason", () => {
    for (const line of LINES) {
      const at = line.stages.slice(1).map((stage) => events.findIndex((event) => event.title === stage.evolvesAt))
      expect(at.every((index) => index >= 0), line.name).toBe(true)
      expect([...at].sort((a, b) => a - b), line.name).toEqual(at)
      for (const stage of line.stages.slice(1)) {
        expect(stage.why, line.name).toMatch(/\.$/)
      }
    }
  })

  it("evolves neural networks from MAGIKARP to GYARADOS when AlexNet wins ImageNet", () => {
    expect(LINES_BY_ID.neural.stages[1].evolvesAt).toBe("ImageNet Breakthrough")
  })
})

describe("lineOf", () => {
  it("files every event under one of the lines", () => {
    const ids = new Set(LINES.map((line) => line.id))
    for (const event of events) {
      expect(ids.has(lineOf(event)), event.title).toBe(true)
    }
  })

  it("files the turning points under the lines they changed", () => {
    expect(lineOf(events.find((event) => event.title === "ChatGPT Takes the World by Storm")!)).toBe("language")
    expect(lineOf(events.find((event) => event.title === "IBM Deep Blue Defeats Garry Kasparov")!)).toBe("logic")
    expect(lineOf(events.find((event) => event.title === "AlphaGo Defeats Lee Sedol")!)).toBe("games")
    expect(lineOf(events.find((event) => event.title === "Anthropic Releases Computer Use")!)).toBe("agents")
  })

  it("names only events in the timeline among its hand-picked lines", () => {
    const titles = new Set(events.map((event) => event.title))
    expect(Object.keys(LINE_OVERRIDES).filter((title) => !titles.has(title))).toEqual([])
  })
})

describe("buildDex", () => {
  it("gives every event an entry, numbered from 1 in the order the events happened", () => {
    expect(dex.size).toBe(events.length)
    events.forEach((event, index) => {
      expect(dex.get(eventAnchorId(event))!.number).toBe(index + 1)
    })
  })

  it("shows each event's line at the stage it had reached, before the event's own evolution", () => {
    expect(entryOf("Rosenblatt's Perceptron").species.name).toBe("Magikarp")
    expect(entryOf("ImageNet Breakthrough").species.name).toBe("Magikarp")
    expect(entryOf("Deep Learning Takes Over Speech Recognition").species.name).toBe("Gyarados")
    expect(entryOf("OpenAI Releases GPT-2").species.name).toBe("Porygon2")
    expect(entryOf("OpenAI Releases GPT-5").species.name).toBe("Porygon-Z")
  })

  it("levels a line up by one with each of its events", () => {
    for (const line of LINES) {
      const levels = events.map((event) => dex.get(eventAnchorId(event))!).filter((entry) => entry.line.id === line.id).map((entry) => entry.level)
      expect(levels, line.name).toEqual(levels.map((_, index) => index + 1))
    }
  })

  it("marks the first event of each line, and only that one", () => {
    const firsts = [...dex.values()].filter((entry) => entry.firstOfLine)
    expect(firsts.map((entry) => entry.line.id).sort()).toEqual(LINES.map((line) => line.id).sort())
  })

  it("draws each creature in its era's generation, which must already know it", () => {
    for (const event of events) {
      const entry = dex.get(eventAnchorId(event))!
      const era = getEraForYear(event.year)!
      expect(entry.generation, event.title).toBe(era.generation)
      expect(entry.species.id, event.title).toBeLessThanOrEqual(GENERATION_SPRITES[era.generation].lastSpecies)
      expect(entry.sprite, event.title).toMatch(new RegExp(`^/sprites/${era.generation}/`))
      for (const played of entry.scenes) {
        for (const id of [played.species?.id, played.from?.id, played.to?.id]) {
          if (id !== undefined) expect(id, event.title).toBeLessThanOrEqual(GENERATION_SPRITES[era.generation].lastSpecies)
        }
      }
    }
  })

  it("freezes every entry of the AI winters, and only those", () => {
    for (const event of events) {
      expect(dex.get(eventAnchorId(event))!.frozen, event.title).toBe(isWinterYear(event.year))
    }
    expect(entryOf("MYCIN Medical Expert System").frozen).toBe(true)
    expect(entryOf("XCON Brings Expert Systems to Business").frozen).toBe(false)
  })

  it("plays an evolution at every turning point, before the event's scripted scenes", () => {
    const deepBlue = entryOf("IBM Deep Blue Defeats Garry Kasparov").scenes
    expect(deepBlue.map((played) => played.scene.kind)).toEqual(["evolution", "battle"])
    expect(deepBlue[0].lines).toEqual(["What? KADABRA is evolving!", "Congratulations! KADABRA evolved into ALAKAZAM!"])
    expect(deepBlue[1].species?.name).toBe("Alakazam")
    expect(deepBlue[1].backSprite).toBe("/sprites/gen-3/back/65.png")

    const evolutions = [...dex.values()].flatMap((entry) => entry.scenes).filter((played) => played.scene.kind === "evolution")
    expect(evolutions).toHaveLength(LINES.reduce((sum, line) => sum + line.stages.length - 1, 0))
  })

  it("names the creature in a scene's lines as it stands at that point in the story", () => {
    expect(entryOf("Perceptrons Exposes the Limits of Neural Networks").scenes[0].lines.slice(0, 2)).toEqual([
      "MAGIKARP used SPLASH!",
      "But nothing happened!",
    ])
    expect(entryOf("AlphaGo Defeats Lee Sedol").scenes[0].lines[1]).toBe("MACHAMP used MOVE 37! No human would have played it.")
    expect(entryOf("OpenAI Releases o1").scenes[0].lines[0]).toBe("ALAKAZAM used CALM MIND!")
  })

  it("gives every scene an id of its own on the page", () => {
    const ids = [...dex.values()].flatMap((entry) => entry.scenes.map((played) => played.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("keeps an event's entry the same however many times the dex is built", () => {
    const again = buildDex(events)
    for (const [id, entry] of dex) {
      expect(again.get(id)).toEqual(entry)
    }
  })
})

describe("SCENES", () => {
  it("plays only after events in the timeline", () => {
    const titles = new Set(events.map((event) => event.title))
    expect(Object.keys(SCENES).filter((title) => !titles.has(title))).toEqual([])
  })

  it("plays a scene after most landmarks", () => {
    const landmarks = events.filter((event) => event.landmark)
    const withScenes = landmarks.filter((event) => dex.get(eventAnchorId(event))!.scenes.length > 0)
    expect(withScenes.length).toBeGreaterThanOrEqual(landmarks.length - 3)
  })

  it("gives each battle a winner, and the AI side the larger share", () => {
    for (const [title, scenes] of Object.entries(SCENES)) {
      for (const scene of scenes) {
        if (scene.kind === "battle") {
          expect(scene.ai.share, title).toBeGreaterThan(scene.foe.share)
          expect(scene.ai.share + scene.foe.share, title).toBeLessThanOrEqual(1)
        }
      }
    }
  })
})

describe("partyAfter", () => {
  it("has no line before the first event, and every line at its latest stage after the last", () => {
    expect(partyAfter(dex, events, null).every((member) => member.species === undefined)).toBe(true)
    const today = partyAfter(dex, events, eventAnchorId(events.at(-1)!))
    expect(today.map((member) => member.species?.name)).toEqual(
      LINES.map((line) => speciesOf(line.stages.at(-1)!.species).name),
    )
  })

  it("evolves a line once its turning point has played", () => {
    const at = (title: string) =>
      partyAfter(dex, events, eventAnchorId(events.find((event) => event.title === title)!)).find(
        (member) => member.line.id === "neural",
      )!.species!.name
    expect(at("Deep Belief Networks")).toBe("Magikarp")
    expect(at("ImageNet Breakthrough")).toBe("Gyarados")
  })
})

describe("CATEGORY_ITEMS", () => {
  it("gives every category its own item from the bag", () => {
    const items = TIMELINE_CATEGORIES.map((category) => CATEGORY_ITEMS[category].item)
    expect(new Set(items).size).toBe(TIMELINE_CATEGORIES.length)
  })
})

describe("formatDexNumber", () => {
  it("pads the number to three digits, as a dex does", () => {
    expect(formatDexNumber(1)).toBe("No. 001")
    expect(formatDexNumber(42)).toBe("No. 042")
    expect(formatDexNumber(340)).toBe("No. 340")
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
