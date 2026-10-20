// Integration tests for TimelineStory rendered in a real browser.
// Checks that each event category gets its own TimelineBadge color.
import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { TimelineStory } from "@/components/storytelling/timeline-story"
import type { TimelineCategory, TimelineEvent } from "@/types/timeline"

const expectedBadgeTextClass: Record<TimelineCategory, string> = {
  "Research Breakthroughs": "text-emerald-400",
  "Models & Architectures": "text-blue-400",
  "Public Releases": "text-purple-400",
  "Ethics & Policy": "text-orange-400",
  "Hardware Advances": "text-cyan-400",
  "Companies & Investments": "text-indigo-400",
  "AI Tools": "text-pink-400",
  "Bombshell News": "text-red-400",
  Agents: "text-violet-400",
}

const categories = Object.keys(expectedBadgeTextClass) as TimelineCategory[]

const events: TimelineEvent[] = categories.map((category, index) => ({
  year: 2000 + index,
  month: "January",
  title: `Event ${index}`,
  description: `An event in ${category}`,
  category,
  link: "https://example.com",
}))

test.each(categories)("renders the %s badge in its own color", (category) => {
  render(<TimelineStory events={events} />)

  const badgeLabel = screen.getByText(category, { selector: "span" })
  expect(badgeLabel.parentElement).toHaveClass(expectedBadgeTextClass[category])
})
