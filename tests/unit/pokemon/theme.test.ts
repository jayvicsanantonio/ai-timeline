// Unit tests for choosing the page's theme: the classic timeline unless a link asks for the Pokémon theme or the reader
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
  it("shows the classic timeline by default", () => {
    expect(DEFAULT_THEME).toBe("classic")
    expect(preferredTheme("", null)).toBe("classic")
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
    expect(preferredTheme("?theme=pikachu", "pokemon")).toBe("pokemon")
    expect(preferredTheme("?theme=", "dark")).toBe("classic")
    expect(isTimelineTheme("Pokemon")).toBe(false)
  })
})

describe("THEME_BOOT_SCRIPT", () => {
  afterEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
    document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  })

  it("marks <html> with the theme the reader picked last time", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "pokemon")
    new Function(THEME_BOOT_SCRIPT)()

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("pokemon")
  })

  it("marks <html> classic when nothing was picked, or when the pick is not a theme", () => {
    new Function(THEME_BOOT_SCRIPT)()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("classic")

    window.localStorage.setItem(THEME_STORAGE_KEY, "<script>")
    new Function(THEME_BOOT_SCRIPT)()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("classic")
  })
})
