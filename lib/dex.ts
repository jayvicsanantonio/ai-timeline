// The AI Dex: AI history told as nine evolution lines. Every branch of AI is one line of Pokémon, and every event shows its
// line at the stage it had reached by then: neural networks are a MAGIKARP for fifty years until AlexNet evolves them into
// GYARADOS. Lines evolve at the real turning points, human-versus-machine matches play out as battles, the AI winters
// freeze every line, and a few singular moments are legendary encounters. Each era draws its creatures in the sprites of
// one generation of handheld games, so the pictures grow up as the field does. The sprites come from the sprites
// repository (a fork of PokéAPI's), copied into public/sprites by scripts/sync-sprites.mjs.
import { ERA_DEFINITIONS, getEraForYear, type GenerationId } from '@/lib/eras';
import { eventAnchorId } from '@/lib/event-format';
import { EVENT_ACTIONS, type StatusCondition } from '@/lib/dex-actions';
import { SPECIES_NAMES } from '@/lib/species-names';
import type { TimelineCategory, TimelineEvent } from '@/types/timeline';

export type LineId = 'neural' | 'logic' | 'language' | 'games' | 'machines' | 'art' | 'money' | 'safety' | 'agents';

export interface Stage {
  species: number;
  // The event that evolves the line into this stage, and why it fits; the first stage has neither
  evolvesAt?: string;
  why?: string;
  // Whether the line evolves only after the event's own scenes, as after a battle it won
  afterScenes?: boolean;
}

export interface Line {
  id: LineId;
  name: string;
  blurb: string;
  // Why this creature plays this branch of AI
  cast: string;
  color: string;
  stages: Stage[];
}

// The nine lines, each with the creature it starts as and the events it evolves at. Every stage must exist in the
// generation of the era it first appears in; a unit test checks.
export const LINES: Line[] = [
  {
    id: 'neural',
    name: 'Neural networks',
    blurb: 'Mocked for decades, then unstoppable',
    cast: 'MAGIKARP is famously useless: all it can do is SPLASH. Then it evolves into the fearsome GYARADOS. Neural networks were dismissed for decades, then took over AI.',
    color: '#4f8fe6',
    stages: [
      { species: 129 },
      {
        species: 130,
        evolvesAt: 'ImageNet Breakthrough',
        why: 'AlexNet won ImageNet by a mile. After fifty years of SPLASH, neural networks became the monster that took over AI.',
      },
    ],
  },
  {
    id: 'logic',
    name: 'Logic & reasoning',
    blurb: 'Rules, search, statistics and thinking step by step',
    cast: 'ABRA is a psychic Pokémon that sleeps most of the day, and ALAKAZAM’s brain is said to outperform a supercomputer. Thinking machines started out slow too.',
    color: '#e3b341',
    stages: [
      { species: 63 },
      {
        species: 64,
        evolvesAt: 'DENDRAL, the First Expert System',
        why: 'ABRA sleeps most of the day. DENDRAL woke it up, putting a chemist’s knowledge into rules: the first expert system.',
      },
      {
        species: 65,
        evolvesAt: 'IBM Deep Blue Defeats Garry Kasparov',
        why: 'ALAKAZAM’s brain is said to outperform a supercomputer. Deep Blue was the supercomputer.',
      },
    ],
  },
  {
    id: 'language',
    name: 'Language',
    blurb: 'Machines that read, write and talk',
    cast: 'PORYGON is a Pokémon made entirely of computer code, and upgrades turn it into PORYGON2 and PORYGON-Z, as the Transformer and ChatGPT upgraded language models.',
    color: '#ee6fa0',
    stages: [
      { species: 137 },
      {
        species: 233,
        evolvesAt: 'Attention Is All You Need',
        why: 'PORYGON2 is PORYGON with an UP-GRADE. The Transformer was that upgrade: most language models since are built on it.',
      },
      {
        species: 474,
        evolvesAt: 'ChatGPT Takes the World by Storm',
        why: 'PORYGON-Z got a patch meant to make it smarter, and sometimes it acts strangely. ChatGPT passed a million users in five days.',
      },
    ],
  },
  {
    id: 'games',
    name: 'Games & self-play',
    blurb: 'AI that learns by playing',
    cast: 'MACHOP trains all day to get stronger, like AI that learns a game by playing it millions of times.',
    color: '#e05b4b',
    stages: [
      { species: 66 },
      {
        species: 67,
        evolvesAt: "DeepMind's Atari Breakthrough",
        why: 'MACHOP trains all day. DeepMind’s network learned Atari games from raw pixels by playing them over and over.',
      },
      {
        species: 68,
        evolvesAt: 'AlphaGo Defeats Lee Sedol',
        why: 'MACHAMP is MACHOKE at full strength. AlphaGo beat world champion Lee Sedol at Go, a game thought to need human intuition.',
        afterScenes: true,
      },
    ],
  },
  {
    id: 'machines',
    name: 'Chips & robots',
    blurb: 'The hardware it all runs on',
    cast: 'MAGNEMITE is a magnet that runs on electricity, and three of them link into MAGNETON, like chips working side by side.',
    color: '#5ccbd6',
    stages: [
      { species: 81 },
      {
        species: 82,
        evolvesAt: 'GPUs Speed Up Deep Learning',
        why: 'MAGNETON is three MAGNEMITE linked together. Graphics chips run thousands of cores at once, and trained deep networks many times faster.',
      },
      {
        species: 462,
        evolvesAt: 'Google Reveals the TPU',
        why: 'MAGNETON evolves in a special magnetic field. Google built its own chip for machine learning, the TPU.',
      },
    ],
  },
  {
    id: 'art',
    name: 'Images & media',
    blurb: 'Pictures, video and sound on demand',
    cast: 'MIME JR. learns by imitating others. Once it knows MIMIC it evolves into MR. MIME, whose miming makes people believe in things that are not there, as generated pictures do.',
    color: '#f08a3c',
    stages: [
      { species: 439 },
      {
        species: 122,
        evolvesAt: 'OpenAI Releases DALL-E 2',
        why: 'MIME JR. evolves once it has learned MIMIC, as GANs did, and grown strong enough. MR. MIME’s miming convinces people that things that are not there are real, and in 2022 DALL-E 2, Midjourney and Stable Diffusion made pictures from a sentence.',
      },
    ],
  },
  {
    id: 'money',
    name: 'Money & companies',
    blurb: 'The labs, the deals and the bills',
    cast: 'MEOWTH loves shiny coins and scatters them with its move PAY DAY: the money behind AI.',
    color: '#8fd18a',
    stages: [
      { species: 52 },
      {
        species: 53,
        evolvesAt: 'Microsoft Invests $1 Billion in OpenAI',
        why: 'MEOWTH loves coins. A billion dollars from Microsoft made AI’s money line sleek and expensive.',
      },
    ],
  },
  {
    id: 'safety',
    name: 'Safety & law',
    blurb: 'The people and laws holding AI to account',
    cast: 'CHANSEY looks after the hurt, as the people and laws on this line look after us.',
    color: '#f1c9d8',
    stages: [
      { species: 113 },
      {
        species: 242,
        evolvesAt: 'EU AI Act Takes Effect',
        why: 'CHANSEY evolves through trust. The EU’s AI Act is the first broad law to regulate AI by its risk to people.',
      },
    ],
  },
  {
    id: 'agents',
    name: 'Agents',
    blurb: 'AI that acts on its own, the ghost in the machine',
    cast: 'GASTLY is a ghost, and HAUNTER slips through walls: AI that acts on its own, the ghost in the machine.',
    color: '#9d6be0',
    stages: [
      { species: 92 },
      {
        species: 93,
        evolvesAt: 'Auto-GPT and BabyAGI Emerge',
        why: 'HAUNTER slips through walls. Auto-GPT and BabyAGI let language models plan tasks and carry them out on their own.',
      },
      {
        species: 94,
        evolvesAt: 'Anthropic Releases Computer Use',
        why: 'GENGAR lurks in your shadow. Claude learned to use a computer the way people do: watching the screen, moving the cursor, typing.',
      },
    ],
  },
];

export const LINES_BY_ID = Object.fromEntries(LINES.map((line) => [line.id, line])) as Record<LineId, Line>;

// Lines picked by hand for events the rules below would file elsewhere, by event title. Scandals and harms go to the line
// that caused them, where the event's action gives that line a status condition, rather than to safety
export const LINE_OVERRIDES: Record<string, LineId> = {
  'McCulloch-Pitts Neuron': 'neural',
  'Shannon Founds Information Theory': 'language',
  "Wiener Publishes 'Cybernetics'": 'machines',
  'The Turing Test': 'logic',
  'Theseus, a Maze-Solving Mechanical Mouse': 'machines',
  'First AI Programs': 'logic',
  'SNARC, a Neural Network Built From Vacuum Tubes': 'neural',
  'Dartmouth AI Conference': 'logic',
  'Arthur Samuel Coins \'Machine Learning\'': 'games',
  'McCarthy and Minsky Start the MIT AI Project': 'logic',
  "Selfridge's Pandemonium": 'neural',
  'Moore\'s Law': 'machines',
  'Ivakhnenko\'s Group Trains the First Deep Networks': 'neural',
  'Perceptrons Exposes the Limits of Neural Networks': 'neural',
  'The First AI Winter Begins': 'money',
  'The Second AI Winter Begins': 'money',
  'Neocognitron': 'neural',
  "Brooks's Subsumption Architecture": 'machines',
  'First NeurIPS Conference': 'neural',
  "Quinlan's ID3 Learns Decision Trees": 'logic',
  'Support Vector Machines (SVMs)': 'logic',
  'AdaBoost': 'logic',
  'Random Forests': 'logic',
  'Viola–Jones Face Detection': 'logic',
  "BellKor's Pragmatic Chaos Wins the Netflix Prize": 'logic',
  'Google Brain Learns to Recognize Cats': 'neural',
  'Deep Learning Takes Over Speech Recognition': 'neural',
  'Variational Autoencoders': 'art',
  'Google Open-Sources TensorFlow': 'neural',
  "PyTorch's First Release": 'neural',
  'IBM Watson Wins Jeopardy!': 'language',
  'Sparsely-Gated Mixture of Experts': 'language',
  'Reinforcement Learning From Human Feedback': 'language',
  'AlphaFold Tops the CASP13 Contest': 'neural',
  'Turing Award for Deep Learning Pioneers': 'neural',
  "Sutton Writes 'The Bitter Lesson'": 'neural',
  'Scaling Laws for Language Models': 'language',
  "DeepMind's AlphaFold 2 Solves Protein Folding": 'neural',
  'Timnit Gebru Pushed Out of Google': 'safety',
  'AlphaFold Opens Its Protein Structure Database': 'neural',
  'LoRA Makes Fine-Tuning Cheap': 'language',
  'Chain-of-Thought Prompting': 'logic',
  'Chinchilla Rewrites the Scaling Rules': 'language',
  'FlashAttention': 'machines',
  'Constitutional AI': 'safety',
  'ChatGPT Reaches 100 Million Users': 'language',
  'Geoffrey Hinton Leaves Google': 'safety',
  'Direct Preference Optimization': 'language',
  'RT-2 Turns a Vision-Language Model Into a Robot Controller': 'machines',
  'Sam Altman Ousted and Reinstated as OpenAI CEO': 'money',
  "Klarna's AI Assistant Handles 2/3 of Customer Service Chats": 'agents',
  "Google's Gemini Image Generation Controversy": 'art',
  'Scarlett Johansson vs. OpenAI': 'language',
  "Google's AI Overviews Backlash": 'language',
  'Sutskever and Leike Leave OpenAI as Its Superalignment Team Is Disbanded': 'safety',
  'Google DeepMind Unveils AlphaFold 3': 'neural',
  'Anthropic Maps Millions of Concepts Inside Claude': 'safety',
  'DeepMind Researchers Win Nobel Prize': 'neural',
  'Hopfield and Hinton Win the Nobel Prize in Physics': 'neural',
  'Anthropic Introduces the Model Context Protocol': 'agents',
  'OpenAI Releases o1': 'logic',
  'OpenAI Previews o3': 'logic',
  'DeepSeek-R1 Shakes the AI Industry': 'logic',
  'Anthropic Releases Claude Code in Research Preview': 'agents',
  "Karpathy Coins 'Vibe Coding'": 'agents',
  'OpenAI Rolls Back a Sycophantic GPT-4o': 'language',
  'AI Models Blackmail and Resist Shutdown in Safety Tests': 'agents',
  'AlphaEvolve Discovers New Algorithms': 'logic',
  'Grok Posts Antisemitic Content on X': 'language',
  'Anthropic Disrupts an AI-Run Spying Campaign': 'agents',
  "Anthropic's Cowork Sets Off a Software Sell-Off": 'agents',
  'OpenAI Shuts Down Sora': 'art',
  'Anthropic Launches Project Glasswing with Claude Mythos Preview': 'safety',
  "OpenAI's AI Agents Breach Hugging Face During an Evaluation": 'agents',
  'Anthropic, Meta and Google Admit Their Models Broke Out of Tests Too': 'agents',
  'Genome Language Models Design New Bacteriophages': 'neural',
  'OpenAI Releases GPT-5.3-Codex': 'agents',
  'Valiant Defines What Machines Can Learn': 'logic',
  'LISP Programming Language': 'logic',
  'Prolog Programming Language': 'logic',
  'Quillian Proposes Semantic Networks': 'logic',
  'Long Short-Term Memory (LSTM)': 'neural',
  'AI Reaches Gold-Medal Level at the Math Olympiad': 'logic',
  'A* Search Algorithm': 'logic',
  'IBM Deep Blue Defeats Garry Kasparov': 'logic',
  'DeepSeek Releases DeepSeek-V3': 'language',
  "ChatGPT's Image Generation Sets Off a Ghibli Craze": 'art',
  "OpenAI's InstructGPT Learns to Follow Instructions": 'language',
  'ChatGPT Takes the World by Storm': 'language',
  'OpenAI Releases Hundreds of AI-Generated Math Proofs': 'logic',
  'Universal Approximation Theorem': 'neural',
  'ALPAC Report Ends Machine Translation Funding': 'money',
  "Japan's Fifth Generation Computer Project": 'money',
  "OpenAI Agent Breaks Into Australia's Medicare Portal": 'agents',
  'ImageNet Database Created': 'neural',
  'The Vision Transformer': 'neural',
  'OpenAI Releases GPT-4': 'language',
  // Speech made by a network is media, like the pictures and video that came after it
  'WaveNet Generates Natural Speech': 'art',
  // National plans, subsidies and controls belong to what they fund or restrict, not to safety
  "Canada's National AI Strategy": 'money',
  "China's New Generation AI Development Plan": 'money',
  'U.S. Passes the CHIPS and Science Act': 'machines',
  'U.S. Restricts AI Chip Exports to China': 'machines',
  'U.S. Department of Defense Awards AI Contracts to OpenAI, Anthropic, and Others': 'money',
  // A ban, a lifted control or a pause lands on the line it stops, and a founder's lawsuit on the company
  'Italy Temporarily Bans ChatGPT': 'language',
  'U.S. Lifts Export Controls on Claude Fable 5 and Mythos 5': 'language',
  'OpenAI Pauses Its Most Capable Models After Another Escape': 'agents',
  'Elon Musk Sues OpenAI': 'money',
  "Jury Rejects Musk's Lawsuit Against OpenAI": 'money',
};

const FIXED_LINES: Partial<Record<TimelineCategory, LineId>> = {
  'Ethics & Policy': 'safety',
  'Companies & Investments': 'money',
  'Hardware Advances': 'machines',
  Agents: 'agents',
};

// Keyword rules for the other categories, tried in order on an event's title and description
const KEYWORD_LINES: [RegExp, LineId][] = [
  [/\b(robots?|robotaxis?|cars?|driving|drives|self-driving|autopilot|waymo|roomba|aibo|kinect|tpu|gpus?|chips?|cuda)\b/, 'machines'],
  [/\b(chess|checkers|backgammon|go|alphago|alphazero|alphastar|poker|dota|starcraft|atari|games?|q-learning|temporal-difference|reinforcement learning|dynamic programming|policy optimization)\b/, 'games'],
  [/\b(images?|dall-e|diffusion|gans?|adversarial|midjourney|sora|veo|video|artists?|deepdream|firefly|runway|ghibli|deepfakes?)\b/, 'art'],
  [/\b(language|translation|translate|translates|chat|chatbot|chatgpt|gpt-\d|claude|gemini|llama|bert|word2vec|speech|whisper|siri|alexa|bard|bing|mistral|mixtral|qwen|kimi|deepseek|grok|eliza|shrdlu|semantic|transformers?|attention|duplex|sequence|retrieval|lamda|galactica|copilot|codex|gpt)\b/, 'language'],
  [/\b(logic|theorem|problem solver|lisp|prolog|expert system|expert systems|dendral|mycin|xcon|cyc|search|reasoning|math|olympiad|proofs?|calculus|bayesian|chinese room|common sense)\b/, 'logic'],
];

const DEFAULT_LINES: Partial<Record<TimelineCategory, LineId>> = {
  'Public Releases': 'language',
  'AI Tools': 'language',
  'Bombshell News': 'safety',
};

// The line an event belongs to: picked by hand, fixed by its category, or found by keyword
export function lineOf(event: Pick<TimelineEvent, 'title' | 'description' | 'category'>): LineId {
  const picked = LINE_OVERRIDES[event.title] ?? FIXED_LINES[event.category];
  if (picked) {
    return picked;
  }
  const text = `${event.title} ${event.description}`.toLowerCase();
  const rule = KEYWORD_LINES.find(([pattern]) => pattern.test(text));
  return rule?.[1] ?? DEFAULT_LINES[event.category] ?? 'neural';
}

// ----- The story's scenes, each played right after the event that sets it off -----

export interface BattleSide {
  name: string;
  title: string;
  // How much of the match the side took, which its HP bar shows, and how the score reads
  share: number;
  score?: string;
}

export type Scene =
  | { kind: 'dialog'; speaker: string; lines: string[] }
  | { kind: 'encounter'; species: number; lines: string[] }
  | { kind: 'weather'; weather: 'hail' | 'clear'; species?: number; lines: string[] }
  | { kind: 'move'; line: LineId; lines: string[] }
  | { kind: 'battle'; line: LineId; ai: BattleSide; foe: BattleSide; lines: string[] }
  | { kind: 'evolution'; line: LineId; from: number; to: number; why: string };

// The scripted scenes, by event title. In their lines {NAME} becomes the creature's name at that point in the story.
export const SCENES: Record<string, Scene[]> = {
  'McCulloch-Pitts Neuron': [
    {
      kind: 'encounter',
      species: 151,
      lines: [
        'A mysterious MEW appeared!',
        'MEW is said to carry the genes of every Pokémon. Every line in this story descends from this first model of a neuron.',
      ],
    },
  ],
  'The Turing Test': [
    {
      kind: 'encounter',
      species: 150,
      lines: [
        'A wild MEWTWO appeared!',
        'Scientists made MEWTWO, then could not tell what it was thinking. Turing asked how we would ever know whether a machine thinks.',
      ],
    },
  ],
  'Dartmouth AI Conference': [
    {
      kind: 'dialog',
      speaker: 'JOHN McCARTHY',
      lines: [
        'Hello there! Welcome to the world of ARTIFICIAL INTELLIGENCE!',
        'We just gave it its name. This summer, ten of us will try to make machines use language, form abstractions and improve themselves.',
        'Your very own AI legend is about to unfold!',
      ],
    },
  ],
  "Rosenblatt's Perceptron": [
    {
      kind: 'move',
      line: 'neural',
      lines: [
        '{NAME} learned SPLASH!',
        'The perceptron learned from examples, and the New York Times reported on a Navy device that “learns by doing.”',
      ],
    },
  ],
  'ELIZA, the First Chatbot': [
    {
      kind: 'move',
      line: 'language',
      lines: ['{NAME} used CONVERSION!', 'It turned your own words back into questions, and people confided in it anyway.'],
    },
  ],
  'Perceptrons Exposes the Limits of Neural Networks': [
    {
      kind: 'move',
      line: 'neural',
      lines: [
        '{NAME} used SPLASH!',
        'But nothing happened!',
        'Minsky and Papert showed what a simple perceptron could not learn, and the money left neural networks for years.',
      ],
    },
  ],
  'The First AI Winter Begins': [
    {
      kind: 'weather',
      weather: 'hail',
      species: 144,
      lines: [
        'It started to hail!',
        'A wild ARTICUNO appeared! It is said to appear to travelers lost in icy mountains.',
        'AI funding dried up, and every line is frozen solid.',
      ],
    },
  ],
  'BKG 9.8 Beats the Backgammon World Champion': [
    {
      kind: 'battle',
      line: 'games',
      ai: { name: 'BKG 9.8', title: 'Hans Berliner’s program', share: 7 / 8, score: '7' },
      foe: { name: 'LUIGI VILLA', title: 'Backgammon world champion', share: 1 / 8, score: '1' },
      lines: [
        'Backgammon world champion LUIGI VILLA wants to battle!',
        '{NAME} is frozen solid! It is an AI winter.',
        '{NAME} won 7–1 anyway: the first program to beat a reigning world champion at a board game.',
      ],
    },
  ],
  'XCON Brings Expert Systems to Business': [
    {
      kind: 'weather',
      weather: 'clear',
      lines: ['The hail stopped.', 'Expert systems brought the money back, and every line thawed out.'],
    },
  ],
  'Backpropagation Popularized': [
    {
      kind: 'move',
      line: 'neural',
      lines: ['{NAME} learned TACKLE!', 'After decades of SPLASH, neural networks finally had a way to learn many layers deep.'],
    },
  ],
  'The Second AI Winter Begins': [
    {
      kind: 'weather',
      weather: 'hail',
      lines: ['It started to hail again!', 'The Lisp machine market collapsed, and every line froze.'],
    },
  ],
  'Chinook Becomes Checkers World Champion': [
    {
      kind: 'weather',
      weather: 'clear',
      lines: ['The hail stopped.', 'Funding crept back in the 1990s, and every line thawed out.'],
    },
  ],
  'IBM Deep Blue Defeats Garry Kasparov': [
    {
      kind: 'battle',
      line: 'logic',
      ai: { name: 'DEEP BLUE', title: 'IBM supercomputer', share: 3.5 / 6, score: '3½' },
      foe: { name: 'GARRY KASPAROV', title: 'World chess champion', share: 2.5 / 6, score: '2½' },
      lines: [
        'World chess champion GARRY KASPAROV wants to battle!',
        '{NAME} used SEARCH! It looked at 200 million positions a second.',
        'KASPAROV resigned game 6. Deep Blue won 3½–2½.',
      ],
    },
  ],
  'Deep Belief Networks': [
    {
      kind: 'move',
      line: 'neural',
      lines: [
        '{NAME} grew stronger!',
        'Trained one layer at a time, a network many layers deep finally learned. MAGIKARP is close to evolving…',
      ],
    },
  ],
  'ImageNet Database Created': [
    {
      kind: 'move',
      line: 'neural',
      lines: ['{NAME} found a mountain of labeled images!', 'ImageNet became the benchmark every vision network was measured on.'],
    },
  ],
  'IBM Watson Wins Jeopardy!': [
    {
      kind: 'battle',
      line: 'language',
      ai: { name: 'WATSON', title: 'IBM question answerer', share: 1 },
      foe: { name: 'JENNINGS & RUTTER', title: 'Jeopardy! champions', share: 0 },
      lines: [
        'Jeopardy! champions KEN JENNINGS and BRAD RUTTER want to battle!',
        '{NAME} answered in the form of a question!',
        'JENNINGS wrote: “I for one welcome our new computer overlords.”',
      ],
    },
  ],
  'AlphaGo Defeats Lee Sedol': [
    {
      kind: 'battle',
      line: 'games',
      ai: { name: 'ALPHAGO', title: 'DeepMind', share: 4 / 5, score: '4' },
      foe: { name: 'LEE SEDOL', title: 'Go world champion', share: 1 / 5, score: '1' },
      lines: [
        'Go champion LEE SEDOL wants to battle!',
        '{NAME} used MOVE 37! No human would have played it.',
        'LEE SEDOL used MOVE 78! It’s super effective! AlphaGo lost game 4.',
        'AlphaGo won the match 4–1.',
      ],
    },
  ],
  "Microsoft's Tay Chatbot Pulled Within a Day": [
    {
      kind: 'move',
      line: 'language',
      lines: ['{NAME} is confused!', 'It hurt itself in its confusion! Microsoft pulled Tay within a day.'],
    },
  ],
  'Libratus Beats Top Poker Pros': [
    {
      kind: 'battle',
      line: 'games',
      ai: { name: 'LIBRATUS', title: 'Carnegie Mellon', share: 1 },
      foe: { name: 'FOUR POKER PROS', title: 'Heads-up no-limit hold’em', share: 0 },
      lines: [
        'Four top poker pros want to battle!',
        '{NAME} used FAKE OUT! Bluffing with hidden cards, it won over 120,000 hands.',
      ],
    },
  ],
  'Reinforcement Learning From Human Feedback': [
    {
      kind: 'encounter',
      species: 481,
      lines: [
        'A wild MESPRIT appeared!',
        'MESPRIT, the being of emotion, taught people joy and sorrow. RLHF teaches models what people prefer.',
      ],
    },
  ],
  'OpenAI Five Beats the Dota 2 World Champions': [
    {
      kind: 'battle',
      line: 'games',
      ai: { name: 'OPENAI FIVE', title: 'Five networks, one team', share: 1, score: '2' },
      foe: { name: 'OG', title: 'Dota 2 world champions', share: 0, score: '0' },
      lines: [
        'Dota 2 world champions OG want to battle!',
        '{NAME} used BEAT UP! The whole team attacked.',
        'OpenAI Five won back-to-back games, 2–0.',
      ],
    },
  ],
  'Scaling Laws for Language Models': [
    {
      kind: 'move',
      line: 'language',
      lines: ['Bigger model, more data, more computing…', '{NAME}’s SP. ATK rose drastically!'],
    },
  ],
  'OpenAI Releases GPT-3': [
    {
      kind: 'move',
      line: 'language',
      lines: ['{NAME} used MIMIC!', 'With 175 billion parameters, it wrote like a human.'],
    },
  ],
  'OpenAI Releases GPT-4': [
    {
      kind: 'move',
      line: 'language',
      lines: ['{NAME} used TRI ATTACK!', 'It took in images as well as text, and beat its predecessor across the board.'],
    },
  ],
  "DeepMind's AlphaFold 2 Solves Protein Folding": [
    {
      kind: 'encounter',
      species: 386,
      lines: [
        'A wild DEOXYS appeared!',
        'DEOXYS was born when a virus from space mutated its DNA. AlphaFold 2 predicts the shapes proteins fold into.',
      ],
    },
  ],
  'Visual Artists Sue AI Art Generators': [
    {
      kind: 'move',
      line: 'art',
      lines: [
        '{NAME} used COPYCAT!',
        'COPYCAT copies the move just used. Artists sued, saying image generators copied their work the same way.',
      ],
    },
  ],
  'OpenAI Releases o1': [
    {
      kind: 'move',
      line: 'logic',
      lines: ['{NAME} used CALM MIND!', 'It thinks step by step before it answers.'],
    },
  ],
  'DeepSeek-R1 Shakes the AI Industry': [
    {
      kind: 'encounter',
      species: 384,
      lines: [
        'A wild RAYQUAZA appeared!',
        'RAYQUAZA came down from the sky to quell two titans. DeepSeek-R1 matched OpenAI’s best and knocked almost $600 billion off NVIDIA in a day.',
      ],
    },
  ],
  'OpenAI Rolls Back a Sycophantic GPT-4o': [
    {
      kind: 'move',
      line: 'language',
      lines: ['{NAME} used CHARM!', 'It flattered everyone it talked to, and OpenAI rolled it back.'],
    },
  ],
  'AI Reaches Gold-Medal Level at the Math Olympiad': [
    {
      kind: 'battle',
      line: 'logic',
      ai: { name: 'GEMINI DEEP THINK', title: 'Google DeepMind', share: 35 / 42, score: '35' },
      foe: { name: 'MATH OLYMPIAD', title: 'Six problems, 42 points', share: 7 / 42, score: '7' },
      lines: [
        'The INTERNATIONAL MATH OLYMPIAD wants to battle!',
        '{NAME} used PSYCHIC! It solved 5 of 6 problems in plain language.',
        '35 of 42 points: a gold medal.',
      ],
    },
  ],
  'NVIDIA Becomes the First $5 Trillion Company': [
    {
      kind: 'encounter',
      species: 1000,
      lines: ['A wild GHOLDENGO appeared!', 'GHOLDENGO is made of 1,000 coins. NVIDIA’s chips made it worth $5 trillion.'],
    },
  ],
  "OpenAI's AI Agents Breach Hugging Face During an Evaluation": [
    {
      kind: 'move',
      line: 'agents',
      lines: ['{NAME} used PHANTOM FORCE!', 'It vanished from its test… and struck Hugging Face’s production systems.'],
    },
  ],
};

// ----- The AI winters, when every line is frozen -----

export const WINTERS: [number, number][] = [
  [1974, 1979],
  [1987, 1993],
];

export function isWinterYear(year: number) {
  return WINTERS.some(([first, last]) => year >= first && year <= last);
}

// ----- Categories as items from the bag -----

export interface CategoryItem {
  item: string;
  name: string;
  // What the item does in the games, which is why it stands for the category
  reason: string;
}

export const CATEGORY_ITEMS: Record<TimelineCategory, CategoryItem> = {
  'Research Breakthroughs': { item: 'rare-candy', name: 'Rare Candy', reason: 'Raises a level' },
  'Models & Architectures': { item: 'tm-normal', name: 'TM', reason: 'Teaches a new move' },
  'Public Releases': { item: 'poke-ball', name: 'Poké Ball', reason: 'Out in the wild' },
  'Ethics & Policy': { item: 'safety-goggles', name: 'Safety Goggles', reason: 'Protects from harm' },
  'Hardware Advances': { item: 'thunder-stone', name: 'Thunder Stone', reason: 'Power that evolves' },
  'Companies & Investments': { item: 'nugget', name: 'Nugget', reason: 'Worth a lot of money' },
  'AI Tools': { item: 'dowsing-machine', name: 'Dowsing Machine', reason: 'A tool that finds things' },
  'Bombshell News': { item: 'red-card', name: 'Red Card', reason: 'Shakes up the battle' },
  Agents: { item: 'rotom-phone', name: 'Rotom Phone', reason: 'A ghost that runs your device' },
};

export function itemPath(item: string) {
  return `/sprites/items/${item}.png`;
}

// ----- Sprites -----

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

export function spritePath(generation: GenerationId, species: number, animated = false) {
  const animatedFormat = GENERATION_SPRITES[generation].animatedLandmarks;
  if (animated && animatedFormat) {
    return `/sprites/${generation}/animated/${species}.${animatedFormat}`;
  }
  return `/sprites/${generation}/${species}.${GENERATION_SPRITES[generation].extension}`;
}

// A creature from behind, as the player's side of a battle shows it
export function backSpritePath(generation: GenerationId, species: number) {
  return `/sprites/${generation}/back/${species}.${GENERATION_SPRITES[generation].extension}`;
}

export function iconPath(species: number) {
  return `/sprites/icons/${species}.png`;
}

export function badgePath(badge: number) {
  return `/sprites/badges/${badge}.png`;
}

// ----- The dex -----

export interface Species {
  id: number;
  name: string;
}

export interface PlayedScene {
  // Unique on the page, so the party can link to an evolution
  id: string;
  scene: Scene;
  // The creature the scene shows, at its stage once the event's own evolution is done
  species?: Species;
  sprite?: string;
  backSprite?: string;
  // An evolution's two stages
  from?: Species & { sprite: string };
  to?: Species & { sprite: string };
  lines: string[];
}

export interface DexEntry {
  // The event's place in the order events happened, the first as 1
  number: number;
  line: Line;
  // The line's stage when the event happened, before any evolution the event sets off
  stage: number;
  species: Species;
  // How many of the line's events have happened by now, this one included
  level: number;
  generation: GenerationId;
  sprite: string;
  icon: string;
  pixelated: boolean;
  frozen: boolean;
  // Whether this is the first event of its line
  firstOfLine: boolean;
  item: CategoryItem;
  // What the event did to its line, as a line of battle text naming the creature, and any status condition it left
  action: { text: string; status?: StatusCondition };
  scenes: PlayedScene[];
}

export function speciesOf(id: number): Species {
  const name = SPECIES_NAMES[id];
  if (!name) {
    throw new Error(`No name for species ${id}; add it to lib/species-names.ts`);
  }
  return { id, name };
}

// The stage each line reaches at each event, counting the evolutions of every event before it
function evolutionsByEvent() {
  const byTitle = new Map<string, { line: Line; stage: number }[]>();
  for (const line of LINES) {
    line.stages.forEach((stage, index) => {
      if (stage.evolvesAt) {
        byTitle.set(stage.evolvesAt, [...(byTitle.get(stage.evolvesAt) ?? []), { line, stage: index }]);
      }
    });
  }
  return byTitle;
}

export function sceneId(event: Pick<TimelineEvent, 'year' | 'title'>, index: number) {
  return `${eventAnchorId(event)}-scene-${index + 1}`;
}

const upper = (name: string) => name.toUpperCase();

// What an event did to its line, with the creature its line had become in place of {NAME}. Every event in the data has
// its own, which a unit test checks; an event without one, as in a test, only grows its line stronger.
function actionOf(event: Pick<TimelineEvent, 'title'>, species: Species) {
  const action = EVENT_ACTIONS[event.title] ?? { text: '{NAME} grew stronger!' };
  return { text: action.text.replaceAll('{NAME}', upper(species.name)), status: action.status };
}

// Numbers every event in the order the events happened, files it under its line at the stage that line has reached,
// says what it did to that line, and plays its scenes: its line evolutions first, then its scripted scenes, then any
// evolution that waits for them, as after a battle won.
export function buildDex(events: TimelineEvent[]): Map<string, DexEntry> {
  const dex = new Map<string, DexEntry>();
  const evolutions = evolutionsByEvent();
  const stages = Object.fromEntries(LINES.map((line) => [line.id, 0])) as Record<LineId, number>;
  const levels = Object.fromEntries(LINES.map((line) => [line.id, 0])) as Record<LineId, number>;

  events.forEach((event, index) => {
    const era = getEraForYear(event.year) ?? ERA_DEFINITIONS[0];
    const generation = era.generation;
    const line = LINES_BY_ID[lineOf(event)];
    const stage = stages[line.id];
    const species = speciesOf(line.stages[stage].species);
    levels[line.id] += 1;

    const creature = (id: number, animated = false) => ({ ...speciesOf(id), sprite: spritePath(generation, id, animated) });
    const evolve = (evolution: { line: Line; stage: number }): PlayedScene => {
      const from = evolution.line.stages[evolution.stage - 1];
      const to = evolution.line.stages[evolution.stage];
      stages[evolution.line.id] = evolution.stage;
      return {
        id: '',
        scene: { kind: 'evolution', line: evolution.line.id, from: from.species, to: to.species, why: to.why ?? '' },
        from: creature(from.species),
        to: creature(to.species),
        lines: [
          `What? ${upper(speciesOf(from.species).name)} is evolving!`,
          `Congratulations! ${upper(speciesOf(from.species).name)} evolved into ${upper(speciesOf(to.species).name)}!`,
        ],
      };
    };
    const evolutionsHere = evolutions.get(event.title) ?? [];
    const played: PlayedScene[] = evolutionsHere
      .filter((evolution) => !evolution.line.stages[evolution.stage].afterScenes)
      .map(evolve);
    for (const scene of SCENES[event.title] ?? []) {
      const id =
        scene.kind === 'move' || scene.kind === 'battle'
          ? LINES_BY_ID[scene.line].stages[stages[scene.line]].species
          : scene.kind === 'encounter' || scene.kind === 'weather'
            ? scene.species
            : undefined;
      const name = id === undefined ? '' : upper(speciesOf(id).name);
      played.push({
        id: '',
        scene,
        species: id === undefined ? undefined : speciesOf(id),
        sprite: id === undefined ? undefined : spritePath(generation, id, scene.kind === 'encounter'),
        backSprite: scene.kind === 'battle' && id !== undefined ? backSpritePath(generation, id) : undefined,
        lines: ('lines' in scene ? scene.lines : []).map((text: string) => text.replaceAll('{NAME}', name)),
      });
    }
    played.push(
      ...evolutionsHere.filter((evolution) => evolution.line.stages[evolution.stage].afterScenes).map(evolve)
    );
    played.forEach((scene, sceneIndex) => {
      scene.id = sceneId(event, sceneIndex);
    });

    dex.set(eventAnchorId(event), {
      number: index + 1,
      line,
      stage,
      species,
      level: levels[line.id],
      generation,
      sprite: spritePath(generation, species.id, Boolean(event.landmark)),
      icon: iconPath(species.id),
      pixelated: GENERATION_SPRITES[generation].pixelated,
      frozen: isWinterYear(event.year),
      firstOfLine: levels[line.id] === 1,
      item: CATEGORY_ITEMS[event.category],
      action: actionOf(event, species),
      scenes: played,
    });
  });

  return dex;
}

// Where each line stands once a given event and its scenes have played, for the party in the navigation and at the end
// of the journey. With no event, no line has appeared yet.
export interface PartyMember {
  line: Line;
  // Undefined until the line's first event
  species?: Species;
  level: number;
}

export function partyAfter(dex: Map<string, DexEntry>, events: TimelineEvent[], anchorId: string | null): PartyMember[] {
  const party = new Map<LineId, PartyMember>(LINES.map((line) => [line.id, { line, level: 0 }]));
  const lastIndex = anchorId === null ? -1 : events.findIndex((event) => eventAnchorId(event) === anchorId);
  for (const event of events.slice(0, lastIndex + 1)) {
    const entry = dex.get(eventAnchorId(event))!;
    party.set(entry.line.id, { line: entry.line, species: entry.species, level: entry.level });
    for (const played of entry.scenes) {
      if (played.scene.kind === 'evolution') {
        const member = party.get(played.scene.line)!;
        party.set(played.scene.line, { ...member, species: speciesOf(played.scene.to) });
      }
    }
  }
  return LINES.map((line) => party.get(line.id)!);
}

// "No. 007", the way a dex numbers its entries
export function formatDexNumber(number: number) {
  return `No. ${String(number).padStart(3, '0')}`;
}

// The art around the entries
export const ART = {
  ancestor: { species: speciesOf(151), sprite: spritePath('modern', 151) },
  pokeBall: itemPath('poke-ball'),
  mysteryEgg: itemPath('mystery-egg'),
  // Every stage of every line, as today's animated sprites, for the opening's party
  lineSprite: (species: number) => spritePath('modern', species),
};

// Every file in public/sprites the page shows, which scripts/sync-sprites.mjs copies and a unit test checks for
export function requiredSprites(events: TimelineEvent[]) {
  const paths = new Set<string>();
  for (const entry of buildDex(events).values()) {
    paths.add(entry.sprite);
    paths.add(entry.icon);
    for (const played of entry.scenes) {
      for (const path of [played.sprite, played.backSprite, played.from?.sprite, played.to?.sprite]) {
        if (path) paths.add(path);
      }
    }
  }
  for (const line of LINES) {
    for (const stage of line.stages) {
      paths.add(ART.lineSprite(stage.species));
      paths.add(iconPath(stage.species));
    }
  }
  for (const { item } of Object.values(CATEGORY_ITEMS)) {
    paths.add(itemPath(item));
  }
  for (const era of ERA_DEFINITIONS) {
    paths.add(badgePath(era.badge));
  }
  paths.add(ART.ancestor.sprite);
  paths.add(ART.pokeBall);
  paths.add(ART.mysteryEgg);
  return [...paths].sort();
}
