// Unit tests for the theme switch's stylesheet, which every page loads, read from its source by the browser's own CSS
// parser: the prerendered classic page hides while a page comes up in the Pokémon theme, and the Poké Ball that fills the
// screen shuts, wobbles and opens only while the reader allows motion, and fades in and out otherwise.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"
import switchStyles from "@/app/theme-switch.css?raw"

interface PlacedRule {
  media: string
  rule: CSSStyleRule
}

// Every style rule in the stylesheet with the media query it sits in, however deeply layers nest it
function styleRules(rules: CSSRuleList, media = ""): PlacedRule[] {
  return [...rules].flatMap((rule) => {
    if (rule instanceof CSSMediaRule) return styleRules(rule.cssRules, rule.conditionText)
    if (rule instanceof CSSGroupingRule) return styleRules(rule.cssRules, media)
    return rule instanceof CSSStyleRule ? [{ media, rule }] : []
  })
}

const sheet = new CSSStyleSheet()
sheet.replaceSync(switchStyles)
const rules = styleRules(sheet.cssRules)

function styleOf(selector: string, media = "") {
  return rules.find((placed) => placed.rule.selectorText === selector && placed.media === media)?.rule.style
}

const MOTION = "(prefers-reduced-motion: no-preference)"
const STILL = "(prefers-reduced-motion: reduce)"

describe("the theme switch's stylesheet", () => {
  it("hides the prerendered classic page while the page comes up in the Pokémon theme, and shows it if scripts never run", () => {
    const hidden = styleOf('html[data-timeline-theme="pokemon"] [data-theme-root="classic"]')

    expect(hidden?.visibility).toBe("hidden")
    expect(hidden?.animationName).toBe("theme-fallback")
    expect(hidden?.animationDelay).toBe("2s")
  })

  it("shuts the ball over a page coming up in the Pokémon theme from its first paint, and lifts it if scripts never run", () => {
    const boot = styleOf('html[data-timeline-theme="pokemon"] .pokeball-overlay[data-phase="boot"]')

    expect(styleOf(".pokeball-overlay")?.display).toBe("none")
    expect(boot?.display).toBe("block")
    expect(boot?.animationName).toBe("pokeball-fallback")
    expect(boot?.animationDelay).toBe("2s")
  })

  it("covers the whole screen above everything while the ball shuts, loads and opens, and lets clicks through as it opens", () => {
    const overlay = styleOf(".pokeball-overlay")

    expect(overlay?.position).toBe("fixed")
    expect(overlay?.inset).toBe("0px")
    expect(Number(overlay?.zIndex)).toBeGreaterThanOrEqual(100)
    for (const phase of ["closing", "loading", "opening"]) {
      expect(rules.some((placed) => placed.rule.selectorText.includes(`[data-phase="${phase}"]`) && placed.rule.style.display === "block"), phase).toBe(true)
    }
    expect(styleOf('.pokeball-overlay[data-phase="opening"]')?.pointerEvents).toBe("none")
  })

  it("shuts, wobbles and bursts the ball open only while motion is allowed", () => {
    const animation = (selector: string, media: string) => styleOf(selector, media)?.animationName ?? ""

    expect(animation('.pokeball-overlay[data-phase="closing"] .pokeball-top', MOTION)).toBe("pokeball-shut-top")
    expect(animation('.pokeball-overlay[data-phase="closing"] .pokeball-bottom', MOTION)).toBe("pokeball-shut-bottom")
    expect(animation('.pokeball-overlay[data-phase="loading"] .pokeball', MOTION)).toBe("pokeball-wobble")
    expect(animation('.pokeball-overlay[data-phase="loading"] .pokeball-button::after', MOTION)).toBe("pokeball-blink")
    expect(animation('.pokeball-overlay[data-phase="opening"] .pokeball-top', MOTION)).toBe("pokeball-open-top")
    expect(animation('.pokeball-overlay[data-phase="opening"] .pokeball-bottom', MOTION)).toBe("pokeball-open-bottom")
    for (const placed of rules.filter((candidate) => candidate.rule.selectorText.startsWith(".pokeball"))) {
      if (placed.media === "") expect(placed.rule.style.animationName, placed.rule.selectorText).toBe("")
    }
  })

  it("only fades the ball in and out for readers who prefer less motion", () => {
    expect(styleOf('.pokeball-overlay[data-phase="closing"]', STILL)?.animationName).toBe("pokeball-fade-in")
    expect(styleOf('.pokeball-overlay[data-phase="opening"]', STILL)?.animationName).toBe("pokeball-fade-out")
    expect(styleOf('.pokeball-overlay[data-phase="loading"] .pokeball', STILL)).toBeUndefined()
  })
})
