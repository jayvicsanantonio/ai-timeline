// The journey's way of teaching: what each region holds before the reader walks into it, and the gym challenge that ends
// it, one question on what the region just told, asked through its creatures. Every answer comes from the event the
// question names, so a reader who has read the region can answer, and one who has not learns it from the explanation.
import {
  GENERATION_SPRITES,
  LINES_BY_ID,
  requiredSprites,
  speciesOf,
  spritePath,
  type DexEntry,
  type Line,
  type Species,
} from '@/lib/dex';
import { ERA_DEFINITIONS, getEraForYear, type Era } from '@/lib/eras';
import { eventAnchorId } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

export interface GymChallenge {
  // The creature that asks, drawn in the region's generation
  species: number;
  question: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
  // Why the answer is right, from the event's description
  explanation: string;
  // The event the question is about, by title, which the explanation links to
  event: string;
}

// One challenge for each region, by era id
export const GYM_CHALLENGES: Record<string, GymChallenge> = {
  'the-foundation-era': {
    species: 129,
    question:
      'In 1969 MAGIKARP used SPLASH, and nothing happened. Which book showed what simple neural networks could not learn?',
    choices: [
      '“Perceptrons,” by Marvin Minsky and Seymour Papert',
      '“Cybernetics,” by Norbert Wiener',
      '“Computing Machinery and Intelligence,” by Alan Turing',
    ],
    answer: 0,
    explanation:
      'Minsky and Papert’s “Perceptrons” laid out the limits of simple neural networks and helped start a long decline in neural network research.',
    event: 'Perceptrons Exposes the Limits of Neural Networks',
  },
  'the-knowledge-era': {
    species: 144,
    question: 'In 1974 it started to hail, and every branch froze. What set off the first AI winter?',
    choices: [
      'A ban on computers in universities',
      'Governments cut AI funding after it fell short of its promises',
      'A shortage of the transistors computers needed',
    ],
    answer: 1,
    explanation:
      'James Lighthill’s 1973 report told the British government that AI had not delivered what it promised. The UK dismantled most AI research, DARPA stopped funding undirected research, and the money dried up until around 1980.',
    event: 'The First AI Winter Begins',
  },
  'the-learning-era': {
    species: 65,
    question: 'KADABRA evolved into ALAKAZAM in 1997. Which match set it off?',
    choices: [
      'Chinook against the checkers world champion',
      'TD-Gammon teaching itself backgammon',
      'IBM’s Deep Blue against Garry Kasparov',
    ],
    answer: 2,
    explanation:
      'Deep Blue became the first computer to beat a reigning world chess champion in a match under standard tournament time controls.',
    event: 'IBM Deep Blue Defeats Garry Kasparov',
  },
  'the-deep-learning-revolution': {
    species: 130,
    question: 'After fifty years of SPLASH, what finally evolved MAGIKARP into GYARADOS in 2012?',
    choices: ['AlphaGo beating Lee Sedol', 'AlexNet winning the ImageNet competition', 'Google buying DeepMind'],
    answer: 1,
    explanation:
      'AlexNet won ImageNet with a drastically lower error rate, proving the power of deep learning. Google bought DeepMind in 2014, and AlphaGo beat Lee Sedol in 2016.',
    event: 'ImageNet Breakthrough',
  },
  'the-generative-ai-era': {
    species: 474,
    question: 'PORYGON2 evolved into PORYGON-Z when ChatGPT came out in 2022. How long did ChatGPT take to pass a million users?',
    choices: ['Five days', 'Five weeks', 'Five months'],
    answer: 0,
    explanation:
      'ChatGPT, a GPT-3.5 model fine-tuned with reinforcement learning from human feedback, passed a million users in five days and set off the generative AI boom.',
    event: 'ChatGPT Takes the World by Storm',
  },
  'the-agentic-era': {
    species: 384,
    question: 'A wild RAYQUAZA came down in January 2025. Which release knocked almost $600 billion off NVIDIA in a day?',
    choices: ['OpenAI’s GPT-5', 'Anthropic’s Claude 4', 'DeepSeek’s R1'],
    answer: 2,
    explanation:
      'DeepSeek’s open-source reasoning model matched OpenAI’s o1, and fears of cheaper competition gave NVIDIA the biggest one-day drop for any company in U.S. history.',
    event: 'DeepSeek-R1 Shakes the AI Industry',
  },
};

// The sprite of the creature that asks a region's challenge, in the region's generation
export function challengeSprite(era: Pick<Era, 'generation'>, challenge: GymChallenge) {
  return spritePath(era.generation, challenge.species);
}

export interface RegionPreview {
  // The lines whose first entry is in the region, with the creature they start as
  newLines: { line: Line; species: Species; anchorId: string }[];
  // The region's landmarks, in the order they happened
  turningPoints: { title: string; year: number; anchorId: string }[];
  // The evolutions the region holds
  evolutions: { line: Line; from: Species; to: Species; year: number; sceneId: string }[];
}

// What a region holds, from every event of the timeline and its dex, for its signpost and its recap
export function previewRegion(era: Pick<Era, 'id'>, events: TimelineEvent[], dex: Map<string, DexEntry>): RegionPreview {
  const preview: RegionPreview = { newLines: [], turningPoints: [], evolutions: [] };
  for (const event of events) {
    if (getEraForYear(event.year)?.id !== era.id) {
      continue;
    }
    const anchorId = eventAnchorId(event);
    const entry = dex.get(anchorId);
    if (!entry) {
      continue;
    }
    if (entry.firstOfLine) {
      preview.newLines.push({ line: entry.line, species: entry.species, anchorId });
    }
    if (event.landmark) {
      preview.turningPoints.push({ title: event.title, year: event.year, anchorId });
    }
    for (const played of entry.scenes) {
      if (played.scene.kind === 'evolution') {
        preview.evolutions.push({
          line: LINES_BY_ID[played.scene.line],
          from: speciesOf(played.scene.from),
          to: speciesOf(played.scene.to),
          year: event.year,
          sceneId: played.id,
        });
      }
    }
  }
  return preview;
}

// Every file in public/sprites the page shows, the dex's and the challenges', which scripts/sync-sprites.mjs copies and a
// unit test checks for
export function pageSprites(events: TimelineEvent[]) {
  const challenges = ERA_DEFINITIONS.flatMap((era) => {
    const challenge = GYM_CHALLENGES[era.id];
    return challenge ? [challengeSprite(era, challenge)] : [];
  });
  return [...new Set([...requiredSprites(events), ...challenges])].sort();
}

// Whether every challenge's creature exists in its region's generation, for a unit test
export function challengeFitsGeneration(era: Pick<Era, 'id' | 'generation'>) {
  const challenge = GYM_CHALLENGES[era.id];
  return challenge !== undefined && challenge.species <= GENERATION_SPRITES[era.generation].lastSpecies;
}

