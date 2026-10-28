export const TIMELINE_CATEGORIES = [
  "Models & Architectures",
  "Research Breakthroughs",
  "Public Releases",
  "Ethics & Policy",
  "Hardware Advances",
  "Companies & Investments",
  "AI Tools",
  "Bombshell News",
  "Agents",
] as const

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number]

export interface TimelineEvent {
  year: number
  month: string
  title: string
  description: string
  category: TimelineCategory
  link: string
  // One of the handful of turning points that every era interface sets apart
  landmark?: boolean
  // One of the few events of a busy year that the chat thread keeps in full beside its landmarks
  highlight?: boolean
}
