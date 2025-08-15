export interface TimelineEvent {
  year: number
  month: string
  title: string
  description: string
  category:
    | "Models & Architectures"
    | "Research Breakthroughs"
    | "Public Releases"
    | "Ethics & Policy"
    | "Hardware Advances"
  link: string
}

export interface ExtendedTimelineEvent extends TimelineEvent {
  details?: string
  impact?: string
  keyFigures?: string[]
  relatedEvents?: string[]
}

export type TimelineCategory = TimelineEvent["category"]

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
