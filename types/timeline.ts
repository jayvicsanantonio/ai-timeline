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
}

export interface ExtendedTimelineEvent extends TimelineEvent {
  details?: string
  impact?: string
  keyFigures?: string[]
  relatedEvents?: string[]
}

export interface TimelineSection {
  decade: string
  events: TimelineEvent[]
}

export interface TimelineCoreProps {
  events: TimelineEvent[]
  progress: any // MotionValue from scroll progress
}

export interface AnimationConfig {
  duration: number
  delay?: number
  ease?: string | number[]
}

export interface ScrollProgress {
  value: number
  direction: "up" | "down"
}
