// Unit tests for choosing the page's theme: the Pokémon theme unless a link asks for the classic timeline or the reader
// picked it last time, and the script that marks <html> with that choice before the first paint.
import { afterEach, describe, expect, it } from "vitest"
import {
  DEFAULT_THEME,
  isTimelineTheme,
  preferredTheme,
  THEME_ATTRIBUTE,
  THEME_BOOT_SCRIPT,
  THEME_STORAGE_KEY,
} from "@/lib/theme"

describe("preferredTheme", () => {
  it("shows the Pokémon theme by default", () => {
    expect(DEFAULT_THEME).toBe("pokemon")
    expect(preferredTheme("", null)).toBe("pokemon")
  })

  it("follows the theme the reader picked last time", () => {
    expect(preferredTheme("", "pokemon")).toBe("pokemon")
    expect(preferredTheme("", "classic")).toBe("classic")
  })

  it("lets a link ask for a theme, over the reader's last pick", () => {
    expect(preferredTheme("?theme=pokemon", "classic")).toBe("pokemon")
    expect(preferredTheme("?q=1&theme=classic", "pokemon")).toBe("classic")
  })

  it("ignores a theme it does not know, in the link or in storage", () => {
    expect(preferredTheme("?theme=pikachu", "classic")).toBe("classic")
    expect(preferredTheme("?theme=", "dark")).toBe("pokemon")
    expect(isTimelineTheme("Pokemon")).toBe(false)
  })
})

describe("THEME_BOOT_SCRIPT", () => {
  afterEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
    document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  })

  it("marks <html> with the theme the reader picked last time", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "classic")
    new Function(THEME_BOOT_SCRIPT)()

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("classic")
  })

  it("marks <html> pokemon when nothing was picked, or when the pick is not a theme", () => {
    new Function(THEME_BOOT_SCRIPT)()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("pokemon")

    window.localStorage.setItem(THEME_STORAGE_KEY, "<script>")
    new Function(THEME_BOOT_SCRIPT)()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("pokemon")
  })

  it("agrees with preferredTheme on what a link and the last pick ask for", () => {
    const cases: [string, string | null][] = [
      ["", null],
      ["", "classic"],
      ["", "pokemon"],
      ["?theme=classic", "pokemon"],
      ["?theme=pokemon", "classic"],
      ["?theme=pikachu", "classic"],
    ]
    for (const [search, stored] of cases) {
      if (stored) window.localStorage.setItem(THEME_STORAGE_KEY, stored)
      else window.localStorage.removeItem(THEME_STORAGE_KEY)
      const script = THEME_BOOT_SCRIPT.replace("location.search", JSON.stringify(search))
      new Function(script)()
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE), `${search} ${stored}`).toBe(preferredTheme(search, stored))
    }
  })
})
