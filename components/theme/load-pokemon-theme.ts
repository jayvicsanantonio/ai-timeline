// Downloads the Pokémon theme only when a reader asks for it, so the classic page carries none of it: its code and its
// stylesheet come in one chunk, then its pixel font, then the sprites its first screen shows. The Poké Ball that fills the
// screen waits on these before it opens onto the theme.
import type { ComponentType } from 'react';
import type { TimelineEvent } from '@/types/timeline';

export type PokemonEngine = ComponentType<{ events: TimelineEvent[] }>;

let engine: Promise<PokemonEngine> | null = null;

// The theme's code and styles, fetched once; a failed download can be tried again
export function loadPokemonEngine() {
  engine ??= import('@/components/pokemon/storytelling/story-engine').then(
    (module) => module.PokemonStoryEngine,
    (error: unknown) => {
      engine = null;
      throw error;
    }
  );
  return engine;
}

export function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

// The theme's pixel font. next/font names the face itself, so its name comes from the variable the layout sets on <html>.
export async function loadPixelFont() {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-press-start').trim();
  if (!family || !('fonts' in document)) {
    return;
  }
  try {
    await document.fonts.load(`16px ${family}`);
  } catch {
    // The theme falls back to a monospace font
  }
}

function inViewport(element: Element) {
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth;
}

// Waits until every image the reader will see in the viewport has downloaded and decoded, but never longer than the time
// given, so a slow sprite cannot keep the ball shut
export async function imagesInView(root: HTMLElement, timeout: number) {
  const images = [...root.querySelectorAll('img')].filter(inViewport);
  const decoded = Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  await Promise.race([decoded, wait(timeout)]);
}
