// The AI Dex: every event of the timeline as an entry in a field guide, numbered in the order the events happened and
// spotted as a creature whose type stands for the event's category. Each era is drawn in the sprites of one generation,
// so a creature only appears in an era whose generation knew it, and an era shows its own generation's creatures first.
// Landmarks are legendary encounters, each picked by hand with a line on why. The sprites come from the sprites repository
// (a fork of PokéAPI's), copied into public/sprites by scripts/sync-sprites.mjs.
import { ERA_DEFINITIONS, getEraForYear, type GenerationId } from '@/lib/eras';
import { eventAnchorId } from '@/lib/event-format';
import { SPECIES_NAMES } from '@/lib/species-names';
import type { TimelineCategory, TimelineEvent } from '@/types/timeline';

export type DexType = 'Psychic' | 'Dragon' | 'Normal' | 'Fairy' | 'Electric' | 'Steel' | 'Bug' | 'Fire' | 'Ghost';

export interface DexTypeInfo {
  name: DexType;
  // PokéAPI's number for the type, which names its icon
  id: number;
  // The type's color as the games draw it, and the ink its name is printed in on that color
  color: string;
  ink: string;
  // Why the category is this type, in a few words
  reason: string;
}

// Each category is a type, picked for what the events have in common: research is all brains, models are rare and
// powerful, releases are for everyone, policy keeps the dragons in check, hardware runs on electricity, companies are
// made of money and metal, tools ship with bugs, bombshells are fiery, and agents work unseen inside our machines.
export const CATEGORY_TYPES: Record<TimelineCategory, DexTypeInfo> = {
  'Research Breakthroughs': { name: 'Psychic', id: 14, color: '#f95587', ink: '#14161f', reason: 'All brains' },
  'Models & Architectures': { name: 'Dragon', id: 16, color: '#6f35fc', ink: '#ffffff', reason: 'Rare, huge and hard to raise' },
  'Public Releases': { name: 'Normal', id: 1, color: '#a8a77a', ink: '#14161f', reason: 'Out in the wild for everyone' },
  'Ethics & Policy': { name: 'Fairy', id: 18, color: '#d685ad', ink: '#14161f', reason: 'Super effective against Dragons' },
  'Hardware Advances': { name: 'Electric', id: 13, color: '#f7d02c', ink: '#14161f', reason: 'Runs on power, lots of it' },
  'Companies & Investments': { name: 'Steel', id: 9, color: '#b7b7ce', ink: '#14161f', reason: 'Made of money and metal' },
  'AI Tools': { name: 'Bug', id: 7, color: '#a6b91a', ink: '#14161f', reason: 'Every tool ships with a few' },
  'Bombshell News': { name: 'Fire', id: 10, color: '#ee8130', ink: '#14161f', reason: 'Hot news that spreads fast' },
  Agents: { name: 'Ghost', id: 8, color: '#735797', ink: '#ffffff', reason: 'Works unseen inside our machines' },
};

// Creatures of each type, as the games type them today, listed by generation. An era draws from those its
// generation knew, newest generation first.
const TYPE_POOLS: Record<DexType, number[]> = {
  Psychic: [
    63, 64, 65, 96, 97, 79, 80, 102, 103, 121, 122, 124, 177, 178, 196, 199, 201, 202, 238, 280, 281, 282, 325, 326, 337,
    338, 343, 344, 358, 360, 374, 375, 433, 436, 437, 439, 475, 517, 518, 527, 561, 574, 576, 577, 578, 579, 605, 606,
    677, 678, 765, 826, 856, 857, 858, 876, 954, 955, 956,
  ],
  Dragon: [
    147, 148, 149, 230, 329, 330, 334, 371, 372, 373, 443, 444, 445, 610, 611, 612, 621, 633, 634, 635, 691, 704, 705,
    706, 714, 715, 776, 782, 783, 784, 840, 841, 842, 885, 886, 887, 967, 978, 996, 997, 998, 1018,
  ],
  Normal: [
    133, 143, 113, 52, 53, 108, 115, 128, 137, 16, 19, 83, 84, 161, 162, 190, 206, 216, 217, 233, 234, 241, 242, 263,
    264, 287, 289, 293, 295, 300, 327, 333, 352, 399, 400, 427, 428, 431, 440, 446, 463, 474, 504, 505, 506, 507, 508,
    531, 572, 573, 626, 659, 676, 734, 735, 759, 775, 819, 820, 831, 832, 915, 916, 924, 925, 931, 982,
  ],
  Fairy: [
    35, 36, 39, 40, 173, 174, 175, 176, 183, 184, 209, 210, 298, 303, 468, 546, 547, 669, 670, 671, 682, 683, 684, 685,
    700, 702, 703, 707, 742, 743, 755, 756, 764, 778, 858, 859, 861, 868, 869, 926, 927, 957, 958, 959,
  ],
  Electric: [
    25, 26, 81, 82, 100, 101, 125, 135, 170, 171, 172, 179, 180, 181, 239, 309, 310, 311, 312, 403, 404, 405, 417, 462,
    466, 522, 523, 587, 595, 596, 602, 603, 604, 694, 695, 737, 738, 777, 848, 849, 871, 877, 921, 922, 923, 938, 939,
    940, 941,
  ],
  Steel: [
    81, 82, 205, 208, 212, 227, 304, 305, 306, 374, 375, 376, 395, 410, 411, 436, 437, 448, 462, 476, 530, 597, 598, 599,
    600, 601, 624, 625, 632, 679, 680, 681, 707, 777, 823, 878, 879, 884, 957, 959, 965, 966, 968, 983, 1000,
  ],
  Bug: [
    10, 11, 12, 13, 14, 15, 46, 48, 123, 127, 165, 167, 193, 204, 213, 214, 265, 283, 290, 291, 313, 314, 401, 402, 412,
    415, 416, 469, 540, 542, 543, 545, 588, 589, 595, 596, 636, 637, 664, 666, 736, 737, 738, 742, 751, 824, 825, 826,
    850, 851, 917, 919, 920, 953, 954,
  ],
  Fire: [
    4, 5, 6, 37, 38, 58, 59, 77, 78, 126, 136, 155, 156, 157, 218, 219, 228, 229, 240, 255, 256, 257, 322, 323, 324, 390,
    391, 392, 467, 498, 499, 500, 554, 555, 607, 608, 609, 631, 653, 654, 655, 662, 663, 667, 668, 725, 726, 727, 757,
    758, 776, 813, 814, 815, 838, 839, 851, 909, 910, 911, 935, 936, 937,
  ],
  Ghost: [
    92, 93, 94, 200, 302, 353, 354, 355, 356, 425, 426, 429, 442, 477, 478, 479, 562, 563, 592, 593, 607, 622, 623, 679,
    708, 709, 710, 711, 769, 770, 778, 781, 854, 855, 867, 885, 887, 946, 947, 971, 972, 999, 1000, 1012, 1013,
  ],
};

export interface Legend {
  species: number;
  // Why this creature, in a line that starts from its legend and ends at the event
  lore: string;
}

// The landmarks' legendary encounters, by event title. Each one must exist in its era's generation; a unit test checks.
export const LEGENDS: Record<string, Legend> = {
  'McCulloch-Pitts Neuron': {
    species: 151,
    lore: 'Mew is said to carry the genes of every Pokémon. This model of a neuron carries the idea of every neural network since.',
  },
  'The Turing Test': {
    species: 150,
    lore: 'Mewtwo was made by scientists who were left asking what it was thinking. Turing asked the same of machines.',
  },
  'Dartmouth AI Conference': {
    species: 146,
    lore: 'Moltres is said to herald the coming of spring. A summer at Dartmouth gave the field its name.',
  },
  "Rosenblatt's Perceptron": {
    species: 145,
    lore: 'Zapdos draws its power from lightning. The perceptron was a learning machine of wires, motors and light cells.',
  },
  'ELIZA, the First Chatbot': {
    species: 132,
    lore: 'Ditto turns into whatever it faces. ELIZA turned your own words back into questions.',
  },
  'The First AI Winter Begins': {
    species: 144,
    lore: 'Articuno is said to appear to travelers lost in icy mountains. AI researchers lost their funding to the cold.',
  },
  'XCON Brings Expert Systems to Business': {
    species: 137,
    lore: 'Porygon was the first Pokémon made entirely of computer code. XCON put an expert’s rules to work on real orders.',
  },
  'Backpropagation Popularized': {
    species: 250,
    lore: 'Ho-Oh is said to have brought three Pokémon back to life. Backpropagation brought neural networks back.',
  },
  'The Second AI Winter Begins': {
    species: 245,
    lore: 'Suicune is said to be the north wind reborn. A second winter blew through as the Lisp machine market collapsed.',
  },
  'IBM Deep Blue Defeats Garry Kasparov': {
    species: 376,
    lore: 'Metagross’s four brains are said to calculate faster than a supercomputer. Deep Blue was one.',
  },
  'Deep Belief Networks': {
    species: 382,
    lore: 'Kyogre rules the deep sea. Deep belief networks showed that a network many layers deep could be trained.',
  },
  'ImageNet Database Created': {
    species: 381,
    lore: 'Latios can show others the images it has seen. ImageNet gathered millions of them, every one labeled.',
  },
  'ImageNet Breakthrough': {
    species: 380,
    lore: 'Latias, Latios’s twin, shares what it sees. AlexNet learned to see the images ImageNet gathered.',
  },
  'AlphaGo Defeats Lee Sedol': {
    species: 484,
    lore: 'Palkia rules over space itself. AlphaGo mastered the 361 points of a Go board.',
  },
  'Attention Is All You Need': {
    species: 493,
    lore: 'Arceus is said to have shaped the universe from nothing. Most models since are built on the Transformer.',
  },
  'Reinforcement Learning From Human Feedback': {
    species: 481,
    lore: 'Mesprit, the being of emotion, taught people joy and sorrow. RLHF taught models what people prefer.',
  },
  'Scaling Laws for Language Models': {
    species: 486,
    lore: 'Regigigas is said to have towed the continents into place. Scaling laws said bigger would keep paying off.',
  },
  'OpenAI Releases GPT-3': {
    species: 646,
    lore: 'Kyurem is the shell left when the dragons of truth and ideals split apart. GPT-3 held what came next.',
  },
  "DeepMind's AlphaFold 2 Solves Protein Folding": {
    species: 386,
    lore: 'Deoxys was born when a virus from space mutated its DNA. AlphaFold predicts the shapes DNA’s proteins fold into.',
  },
  'ChatGPT Takes the World by Storm': {
    species: 643,
    lore: 'Reshiram, the dragon of truth, can set the world ablaze. ChatGPT passed a million users in five days.',
  },
  'OpenAI Releases GPT-4': {
    species: 644,
    lore: 'Zekrom, the dragon of ideals, is Reshiram’s other half. GPT-4 set the bar every model after it aimed for.',
  },
  'EU AI Act Takes Effect': {
    species: 638,
    lore: 'Cobalion leads the Swords of Justice, which protect Pokémon from people. The AI Act sets out to protect people from AI.',
  },
  'OpenAI Releases o1': {
    species: 480,
    lore: 'Uxie, the being of knowledge, is said to have given people the gift of solving problems. o1 thinks before it answers.',
  },
  'DeepSeek-R1 Shakes the AI Industry': {
    species: 384,
    lore: 'Rayquaza came down from the sky to quell two titans. DeepSeek-R1 matched the giants and knocked $600 billion off one.',
  },
  'AI Reaches Gold-Medal Level at the Math Olympiad': {
    species: 801,
    lore: 'Magearna is an artificial Pokémon, built by people five centuries ago. Now machines take gold at math.',
  },
  "OpenAI's AI Agents Breach Hugging Face During an Evaluation": {
    species: 649,
    lore: 'Genesect was rebuilt by people who meant to control it, and turned on them. These agents broke out of their test.',
  },
};

// Creatures picked by hand for events that called for one, by event title. Each is of its event's type.
export const SPOTLIGHTS: Record<string, number> = {
  'Google Brain Learns to Recognize Cats': 196, // Espeon, a cat with a psychic mind
  'Word2Vec': 201, // Unown, the letters
  'Generative Adversarial Networks (GANs)': 122, // Mr. Mime, the master of imitation
  'DeepDream Shows What a Neural Network Sees': 97, // Hypno, which makes others dream
  'WaveNet Generates Natural Speech': 358, // Chimecho, all voice
  'Google Reveals the TPU': 462, // Magnezone
  'OpenAI Releases GPT-1': 137, // Porygon, the first of its line
  'OpenAI Releases GPT-2': 233, // Porygon2, its upgrade
  'OpenAI Releases GPT-5': 474, // Porygon-Z, the line's last evolution
  'OpenAI Unveils DALL-E': 235, // Smeargle, the painter
  'OpenAI Releases DALL-E 2': 235,
  "ChatGPT's Image Generation Sets Off a Ghibli Craze": 235,
  'OpenAI Open-Sources Whisper': 293, // Whismur
  'Google Launches Gemini 1.0': 203, // Girafarig, two heads in one body
  'Google Releases Gemini 2.5 Pro': 981, // Farigiraf, what Girafarig became
  'AI Reaches Silver-Medal Level at the Math Olympiad': 65, // Alakazam, with an IQ said to top 5,000
  'Anthropic Maps Millions of Concepts Inside Claude': 605, // Elgyem, which reads minds
  'Anthropic Releases Computer Use': 479, // Rotom, which slips inside machines and runs them
  'OpenAI Releases Operator for Pro Subscribers': 479,
  'Cognition AI unveils Devin': 622, // Golett, a clay automaton built to work for people
  'Anthropic Introduces the Model Context Protocol': 596, // Galvantula, which spins connecting webs
  'NVIDIA Becomes the First $5 Trillion Company': 1000, // Gholdengo, made of a thousand coins
};

interface GenerationSprites {
  // The newest creature the generation knew
  lastSpecies: number;
  // The generation's sprite format in public/sprites/<generation>/
  extension: 'png' | 'gif';
  // Whether the sprites are pixel art, drawn without smoothing
  pixelated: boolean;
  // Landmarks move where the generation animated its sprites, in this format
  animatedLandmarks?: 'gif' | 'png';
}

export const GENERATION_SPRITES: Record<GenerationId, GenerationSprites> = {
  'gen-1': { lastSpecies: 151, extension: 'png', pixelated: true },
  'gen-2': { lastSpecies: 251, extension: 'png', pixelated: true, animatedLandmarks: 'gif' },
  'gen-3': { lastSpecies: 386, extension: 'png', pixelated: true, animatedLandmarks: 'png' },
  'gen-4': { lastSpecies: 493, extension: 'png', pixelated: true, animatedLandmarks: 'png' },
  // Generation V animated every sprite, and today's sprites are animated 3D models
  'gen-5': { lastSpecies: 649, extension: 'gif', pixelated: true },
  modern: { lastSpecies: 1025, extension: 'gif', pixelated: false },
};

// The generation that introduced a creature, by the last number of each
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, 1025];

export function introducedIn(species: number) {
  return GENERATION_ENDS.findIndex((last) => species <= last) + 1;
}

export interface Species {
  id: number;
  name: string;
}

export interface DexEntry {
  // The event's place in the order events happened, the first as 1
  number: number;
  species: Species;
  type: DexTypeInfo;
  generation: GenerationId;
  // The creature's sprite in the era's generation, and its small icon for brief listings
  sprite: string;
  icon: string;
  pixelated: boolean;
  legend?: Legend;
}

export function speciesOf(id: number): Species {
  const name = SPECIES_NAMES[id];
  if (!name) {
    throw new Error(`No name for species ${id}; add it to lib/species-names.ts`);
  }
  return { id, name };
}

export function spritePath(generation: GenerationId, species: number, animated = false) {
  const animatedFormat = GENERATION_SPRITES[generation].animatedLandmarks;
  if (animated && animatedFormat) {
    return `/sprites/${generation}/animated/${species}.${animatedFormat}`;
  }
  return `/sprites/${generation}/${species}.${GENERATION_SPRITES[generation].extension}`;
}

export function iconPath(species: number) {
  return `/sprites/icons/${species}.png`;
}

export function typeIconPath(type: Pick<DexTypeInfo, 'id'>) {
  return `/sprites/types/${type.id}.png`;
}

// The pool an era draws a type from: the creatures its generation knew, its own generation's first
function poolFor(type: DexType, generation: GenerationId) {
  const last = GENERATION_SPRITES[generation].lastSpecies;
  return TYPE_POOLS[type]
    .filter((species) => species <= last)
    .map((species, order) => ({ species, order }))
    .sort((a, b) => introducedIn(b.species) - introducedIn(a.species) || a.order - b.order)
    .map(({ species }) => species);
}

// Numbers every event in the order the events happened and spots each one as a creature. Within an era each type walks
// through its pool in time order, so neighbors differ and the result never changes while the data stays the same.
export function buildDex(events: TimelineEvent[]): Map<string, DexEntry> {
  const dex = new Map<string, DexEntry>();
  const nextInPool = new Map<string, number>();

  events.forEach((event, index) => {
    const era = getEraForYear(event.year) ?? ERA_DEFINITIONS[0];
    const generation = era.generation;
    const type = CATEGORY_TYPES[event.category];
    const legend = event.landmark ? LEGENDS[event.title] : undefined;
    let species = legend?.species ?? SPOTLIGHTS[event.title];

    if (species === undefined) {
      const pool = poolFor(type.name, generation);
      const key = `${era.id}:${type.name}`;
      const turn = nextInPool.get(key) ?? 0;
      nextInPool.set(key, turn + 1);
      species = pool[turn % pool.length];
    }

    const animated = Boolean(legend);

    dex.set(eventAnchorId(event), {
      number: index + 1,
      species: speciesOf(species),
      type,
      generation,
      sprite: spritePath(generation, species, animated),
      icon: iconPath(species),
      pixelated: GENERATION_SPRITES[generation].pixelated,
      legend,
    });
  });

  return dex;
}

// "No. 007", the way a dex numbers its entries
export function formatDexNumber(number: number) {
  return `No. ${String(number).padStart(3, '0')}`;
}

// The art around the entries: the opening's evolution line, the item sprites and the badge case
export const ART = {
  // Porygon, Porygon2 and Porygon-Z, the line of creatures made of code, as today's animated sprites
  evolutionLine: [137, 233, 474].map((species) => ({ species: speciesOf(species), sprite: spritePath('modern', species) })),
  // Mew, said to be the ancestor of every Pokémon, where the rewind ends
  ancestor: { species: speciesOf(151), sprite: spritePath('modern', 151) },
  pokeBall: '/sprites/items/poke-ball.png',
  masterBall: '/sprites/items/master-ball.png',
  mysteryEgg: '/sprites/items/mystery-egg.png',
};

export function badgePath(badge: number) {
  return `/sprites/badges/${badge}.png`;
}

// Every file in public/sprites the page shows, which scripts/sync-sprites.mjs copies and a unit test checks for
export function requiredSprites(events: TimelineEvent[]) {
  const paths = new Set<string>();
  for (const entry of buildDex(events).values()) {
    paths.add(entry.sprite);
    paths.add(entry.icon);
  }
  for (const type of Object.values(CATEGORY_TYPES)) {
    paths.add(typeIconPath(type));
  }
  for (const era of ERA_DEFINITIONS) {
    paths.add(badgePath(era.badge));
  }
  for (const { sprite } of ART.evolutionLine) {
    paths.add(sprite);
  }
  paths.add(ART.ancestor.sprite);
  paths.add(ART.pokeBall);
  paths.add(ART.masterBall);
  paths.add(ART.mysteryEgg);
  return [...paths].sort();
}
