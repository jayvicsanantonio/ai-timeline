// Unit tests for what the Pokémon theme adds to the era definitions: each era drawn in the sprites of one generation, as a
// place of its own on the journey's route, with a badge of its own.
import { describe, expect, it } from "vitest"
import { ERA_DEFINITIONS } from "@/lib/eras"

describe("ERA_DEFINITIONS in the Pokémon theme", () => {
  it("draws the six eras in the sprites of one generation each, from the first to today's", () => {
    expect(ERA_DEFINITIONS.map((era) => [era.name, era.generation, era.generationName])).toEqual([
      ["The Foundation Era", "gen-1", "Generation I sprites"],
      ["The Knowledge Era", "gen-2", "Generation II sprites"],
      ["The Learning Era", "gen-3", "Generation III sprites"],
      ["The Deep Learning Revolution", "gen-4", "Generation IV sprites"],
      ["The Generative AI Era", "gen-5", "Generation V animated sprites"],
      ["The Agentic Era", "modern", "Animated 3D sprites"],
    ])
  })

  it("draws every era as a place of its own on the journey's route, in its own biome", () => {
    expect(ERA_DEFINITIONS.map((era) => [era.place, era.biome])).toEqual([
      ["Origin Meadow", "meadow"],
      ["Frostbite Pass", "snow"],
      ["Learning Woods", "forest"],
      ["Deep Cavern", "cave"],
      ["Prompt City", "city"],
      ["Frontier Peak", "summit"],
    ])
  })

  it("gives every era its own badge", () => {
    const badges = ERA_DEFINITIONS.map((era) => era.badge)
    expect(new Set(badges).size).toBe(ERA_DEFINITIONS.length)
  })
})
