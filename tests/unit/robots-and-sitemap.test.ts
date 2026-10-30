// Unit tests for the files crawlers read first: robots.txt, which lets every crawler in and points to the sitemap,
// and the sitemap, which lists the site's one page at its production address.
import { describe, expect, it } from "vitest"
import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import { SITE_URL } from "@/lib/site"

describe("robots", () => {
  it("lets every crawler read the whole site", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" })
  })

  it("points crawlers to the sitemap at the production address", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`)
  })
})

describe("sitemap", () => {
  it("lists the home page at the production address", () => {
    expect(sitemap()).toEqual([{ url: `${SITE_URL}/` }])
  })
})
