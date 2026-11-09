// Unit tests for the AI Dex's rules in the global stylesheet, read from its source by the browser's own CSS parser.
// Every generation's backdrop fades into the page at its seams, the two-screen generation stacks its screens, and every
// animation waits for the reader to allow motion.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"
import globalStyles from "@/app/globals.css?raw"

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

// The parser drops Tailwind's own at-rules as unknown ones, but a constructed stylesheet refuses @import
const sheet = new CSSStyleSheet()
sheet.replaceSync(globalStyles.replace(/^@import .*$/gm, ""))
const rules = styleRules(sheet.cssRules)

function styleOf(selector: string, media = "") {
  return rules.find((placed) => placed.rule.selectorText === selector && placed.media === media)?.rule.style
}

const BACKDROPS = [".gen-1-backdrop", ".gen-2-backdrop", ".gen-3-backdrop", ".gen-4-backdrop", ".gen-5-backdrop", ".modern-backdrop"]

describe("the AI Dex in the global stylesheet", () => {
  it("starts every generation's backdrop with the seam that fades it into the page", () => {
    for (const backdrop of BACKDROPS) {
      expect(styleOf(backdrop)?.backgroundImage, backdrop).toMatch(/^var\(--era-seam\)/)
    }
  })

  it("stacks the two-screen generation's creature above its entry", () => {
    const card = styleOf('.dex-era[data-gen="gen-4"] .dex-card')

    expect(card?.gridTemplateAreas).toBe('"stage" "body"')
  })

  it("maps the first generation's sprites onto the four greens of its screen", () => {
    expect(styleOf('.dex-era[data-gen="gen-1"] .dex-stage > img')?.filter).toBe("url(\"#dmg-palette\")")
  })

  it("prints in the pixel font even before the font's variable is set, falling back to monospace", () => {
    expect(styleOf(".font-pixel")?.fontFamily).toMatch(/^var\(--font-press-start, "Press Start 2P"\), ui-monospace, monospace$/)
  })

  it("moves the sprites, the Poké Ball and the legends' sheen only while motion is allowed", () => {
    const motion = "(prefers-reduced-motion: no-preference)"

    for (const selector of [".sprite-bob", ".ball-wobble", ".dex-lens", ".dex-card[data-landmark] .dex-stage::after"]) {
      expect(styleOf(selector, motion)?.animationName, selector).not.toBe("")
      expect(styleOf(selector)?.animationName ?? "", selector).toBe("")
    }
  })
})
