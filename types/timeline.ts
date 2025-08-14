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

export type TimelineCategory = TimelineEvent["category"]

export interface TimelineSection {
  decade: string
  events: TimelineEvent[]
}

export interface TimelineCoreProps {
  events: TimelineEvent[]
  progress: any // MotionValue from scroll progress
}
