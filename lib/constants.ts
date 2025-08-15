export const APP_CONFIG = {
  name: "The AI Timeline",
  description: "Journey Through Artificial Intelligence History",
  version: "2.0.0",
  author: "AI Timeline Team",
} as const

export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  easing: {
    smooth: [0.25, 0.1, 0.25, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    sharp: [0.4, 0, 0.2, 1],
  },
} as const

export const SCROLL_CONFIG = {
  sections: {
    hero: { start: 0, end: 0.25 },
    timeline: { start: 0.15, end: 0.85 },
    epilogue: { start: 0.8, end: 1 },
  },
  smoothness: 0.1,
} as const
