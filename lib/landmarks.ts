// Temporal clustering and Keystone Landmark classification for the Turing Archive redesign.
// Groups events into YearClusters with temporal gap telemetry, 12-month heatmaps, and landmark tiering.
import { MONTHS } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

export interface YearCluster {
  year: number;
  events: TimelineEvent[];
  landmarkCount: number;
  // Years elapsed since the previous active year in the same sequence (null for the first year)
  yearGap: number | null;
  // 12-slot array (Jan..Dec) counting events per month in this year
  monthCounts: number[];
}

// Curated patterns for historical inflection points ("Keystone Milestones") across the 83-year archive
const LANDMARK_TITLE_PATTERNS = [
  /mcculloch|artificial neurons/i,
  /turing test|computing machinery/i,
  /dartmouth/i,
  /perceptron/i,
  /eliza/i,
  /shakey/i,
  /mycin/i,
  /backpropagation/i,
  /deep blue/i,
  /lstm|long short-term memory/i,
  /imagenet|alexnet/i,
  /word2vec/i,
  /generative adversarial|gans/i,
  /deepmind.*atari|dqn/i,
  /resnet/i,
  /alphago/i,
  /attention is all you need|transformer/i,
  /\bbert\b/i,
  /\bgpt-2\b/i,
  /\bgpt-3\b/i,
  /alphafold/i,
  /dall-e|copilot/i,
  /chatgpt|stable diffusion/i,
  /\bgpt-4\b|\bllama\b|claude 2|gemini/i,
  /sora|\bgpt-4o\b|claude 3\.5|openai o1|nobel prize|model context protocol|\bmcp\b/i,
  /deepseek-r1|claude code|\bgpt-5\b|gemini 2\.5/i,
];

export function isLandmarkEvent(event: TimelineEvent): boolean {
  return LANDMARK_TITLE_PATTERNS.some((pattern) => pattern.test(event.title));
}

export function groupEventsByYear(events: TimelineEvent[]): YearCluster[] {
  const clusters: YearCluster[] = [];

  for (const event of events) {
    let current = clusters.at(-1);
    if (!current || current.year !== event.year) {
      const previousYear = current?.year ?? null;
      current = {
        year: event.year,
        events: [],
        landmarkCount: 0,
        yearGap: previousYear === null ? null : event.year - previousYear,
        monthCounts: Array.from({ length: 12 }, () => 0),
      };
      clusters.push(current);
    }

    current.events.push(event);
    if (isLandmarkEvent(event)) {
      current.landmarkCount += 1;
    }

    const monthIndex = MONTHS.indexOf(event.month as (typeof MONTHS)[number]);
    if (monthIndex !== -1) {
      current.monthCounts[monthIndex] += 1;
    }
  }

  return clusters;
}

// Conversational prompts that break up the 207-event Generative AI Era into annual exchanges
export const GENERATIVE_ERA_YEAR_PROMPTS: Record<number, { prompt: string; summary: string }> = {
  2020: {
    prompt: 'How did the scaling hypothesis prove itself in 2020?',
    summary: 'Foundation scale & scientific grand challenges (GPT-3, AlphaFold 2)',
  },
  2021: {
    prompt: 'When did multimodal generation and code synthesis emerge in 2021?',
    summary: 'Vision-language bridges & developer copilots (CLIP, DALL-E, Codex)',
  },
  2022: {
    prompt: 'What sparked the public generative AI explosion in 2022?',
    summary: 'Open-weights diffusion & the conversational inflection point (Stable Diffusion, ChatGPT)',
  },
  2023: {
    prompt: 'What happened in 2023 as frontier labs and open-weight models raced ahead?',
    summary: 'Frontier multimodal models, open-source catalysis & global AI governance',
  },
  2024: {
    prompt: 'Why was 2024 the busiest year in AI history?',
    summary: 'Test-time reasoning, native omni-modality, Nobel recognition & agentic protocols',
  },
  2025: {
    prompt: 'How did reasoning models and autonomous coding agents reshape 2025?',
    summary: 'Open reasoning weights, terminal-native software agents & world models',
  },
  2026: {
    prompt: 'Where does the frontier stand in 2026?',
    summary: 'Long-horizon autonomous workflows, scientific discovery & next-gen architectures',
  },
};
