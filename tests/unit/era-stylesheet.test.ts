// Unit tests for the era layout rules in the global stylesheet, read from its source by the browser's own CSS parser.
// From 1024px a punch card stamps its category and source beside its title, and on a phone a notebook output has no prompt row.
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

describe("era layouts in the global stylesheet", () => {
  it("lays a punch card out from 1024px with its category and source beside its date and title, and its description last", () => {
    const card = styleOf(".punch-card", "(min-width: 1024px)")

    expect(card?.display).toBe("grid")
    expect(card?.gridTemplateAreas).toBe('"stripe stripe" "heading fields" "holes holes" "description description"')
  })

  it("leaves out a notebook output's prompt on a phone, where prompts stack above their boxes, and shows it from 640px", () => {
    const outputPrompt = ".notebook-prompt:has(+ .notebook-output)"

    expect(styleOf(outputPrompt)?.display).toBe("none")
    expect(styleOf(outputPrompt, "(min-width: 640px)")?.display).toBe("block")
  })
})
