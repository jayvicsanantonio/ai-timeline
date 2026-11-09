// Copies the sprites the page shows from a checkout of the sprites repository into public/sprites, and removes any it no
// longer shows. The list comes from requiredSprites in lib/dex.ts, so run this after adding events or changing creatures:
//
//   git clone --depth 1 --filter=blob:none --no-checkout https://github.com/jayvicsanantonio/sprites ../sprites
//   node scripts/sync-sprites.mjs ../sprites
//
// The clone can be blobless: git fetches each file it is asked for, so only the few hundred needed are downloaded.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const spritesRepo = process.argv[2];
if (!spritesRepo) {
  console.error('Usage: node scripts/sync-sprites.mjs <path to a clone of the sprites repository>');
  process.exit(1);
}

// Where each published folder's files come from in the sprites repository, tried in order
const SOURCES = [
  [/^gen-1\/(\d+)\.png$/, ['sprites/pokemon/versions/generation-i/red-blue/transparent/gray/$1.png']],
  [/^gen-2\/(\d+)\.png$/, ['sprites/pokemon/versions/generation-ii/crystal/transparent/$1.png']],
  [/^gen-2\/animated\/(\d+)\.gif$/, ['sprites/pokemon/versions/generation-ii/crystal/animated/$1.gif']],
  [/^gen-3\/(\d+)\.png$/, ['sprites/pokemon/versions/generation-iii/emerald/$1.png']],
  [/^gen-3\/animated\/(\d+)\.png$/, ['sprites/pokemon/versions/generation-iii/emerald/animated/$1.png']],
  [/^gen-4\/(\d+)\.png$/, ['sprites/pokemon/versions/generation-iv/platinum/$1.png']],
  [/^gen-4\/animated\/(\d+)\.png$/, ['sprites/pokemon/versions/generation-iv/platinum/animated/$1.png']],
  [/^gen-5\/(\d+)\.gif$/, ['sprites/pokemon/versions/generation-v/black-white/animated/$1.gif']],
  [/^modern\/(\d+)\.gif$/, ['sprites/pokemon/other/showdown/$1.gif']],
  [
    /^icons\/(\d+)\.png$/,
    [
      'sprites/pokemon/versions/generation-vii/icons/$1.png',
      'sprites/pokemon/versions/generation-viii/sword-shield/icons/$1.png',
      'sprites/pokemon/versions/generation-ix/scarlet-violet/icons/$1.png',
    ],
  ],
  [/^types\/(\d+)\.png$/, ['sprites/types/generation-ix/scarlet-violet/small/$1.png']],
  [/^badges\/(\d+)\.png$/, ['sprites/badges/$1.png']],
  [/^items\/([a-z-]+)\.png$/, ['sprites/items/$1.png']],
];

function readFromRepo(file) {
  return execFileSync('git', ['-C', spritesRepo, 'show', `HEAD:${file}`], { maxBuffer: 64 * 1024 * 1024 });
}

function copy(publicPath) {
  const relative = publicPath.replace(/^\/sprites\//, '');
  const match = SOURCES.find(([pattern]) => pattern.test(relative));
  if (!match) {
    throw new Error(`No source for ${publicPath}; add one to SOURCES`);
  }
  const [pattern, candidates] = match;
  for (const candidate of candidates) {
    try {
      const data = readFromRepo(relative.replace(pattern, candidate));
      const target = path.join(root, 'public', publicPath);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, data);
      return;
    } catch {
      // Try the next source
    }
  }
  throw new Error(`None of the sources for ${publicPath} exist in ${spritesRepo}`);
}

function listFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const file = path.join(directory, name);
    return statSync(file).isDirectory() ? listFiles(file) : [file];
  });
}

const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  resolve: { tsconfigPaths: true },
  server: { middlewareMode: true, hmr: false },
});

try {
  const { requiredSprites } = await server.ssrLoadModule('/lib/dex.ts');
  const { parseTimelineEvents } = await server.ssrLoadModule('/lib/timeline-events.ts');
  const { default: data } = await server.ssrLoadModule('/data/timeline-events.json');
  const required = requiredSprites(parseTimelineEvents(data));

  for (const publicPath of required) {
    copy(publicPath);
  }

  const kept = new Set(required.map((publicPath) => path.join(root, 'public', publicPath)));
  const spritesDirectory = path.join(root, 'public', 'sprites');
  let removed = 0;
  for (const file of listFiles(spritesDirectory)) {
    if (!kept.has(file)) {
      rmSync(file);
      removed += 1;
    }
  }

  console.log(`Copied ${required.length} sprites into public/sprites and removed ${removed} the page no longer shows.`);
} finally {
  await server.close();
}
