// Shows the timeline in the reader's theme: the classic timeline by default, or the Pokémon theme once they press
// Pokémon-ify. A bar at the top of the page offers the other theme, and on wide screens a button stays at hand while
// reading. The Pokémon theme downloads only when asked for: a Poké Ball shuts over the page, wobbles while the theme's code,
// styles, font and first sprites arrive, and bursts open onto it. Switching keeps the reader at the event they were reading,
// since both themes give every event the same id, and remembers the choice for their next visit.
//
// The ball is moved straight on its element rather than through React state: React holds back every commit while a
// stylesheet it manages is loading, which the Pokémon theme's is, so a ball drawn from state would freeze just when it
// should be wobbling.
'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react';
import { StoryEngine } from '@/components/storytelling/story-engine';
import { readingLineY } from '@/lib/timeline-scroll';
import { preferredTheme, THEME_ATTRIBUTE, THEME_STORAGE_KEY, type TimelineTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import { imagesInView, loadPixelFont, loadPokemonEngine, wait, type PokemonEngine } from './load-pokemon-theme';

// Where the Poké Ball is: on the server and until the page runs, shut only if the boot script marked the Pokémon theme;
// then idle, or shutting, loading and opening while the Pokémon theme comes in. It sits in the ball's data-phase.
export type PokeballPhase = 'boot' | 'idle' | 'closing' | 'loading' | 'opening';

// The ball stays shut at least a moment, with motion and for readers who prefer less, so a theme already downloaded still
// reads as a catch rather than a flicker
const LEAST_SHUT_MS = { motion: 900, still: 300 };

// The animations in app/theme-switch.css that end the ball's shutting and its opening, with motion and without, and how
// long to wait for them should they never run
const SHUT_ANIMATIONS = ['pokeball-shut-bottom', 'pokeball-fade-in'];
const OPEN_ANIMATIONS = ['pokeball-open-bottom', 'pokeball-fade-out'];
const ANIMATION_WAIT_MS = 1500;

// The longest the ball waits for the first screen's sprites before opening anyway
const IMAGE_WAIT_MS = 8000;

const LOADING = 'Loading the Pokémon edition…';
const LOAD_FAILED = 'The Pokémon edition couldn’t load. Check your connection and try again.';

function storedTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme: TimelineTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The choice still applies until the page is left
  }
}

function prefersLessMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Resolves when one of the named animations ends on the element or inside it, or after the time given if none does
function animationEnd(element: HTMLElement | null, names: string[], timeout: number) {
  return new Promise<void>((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    const done = () => {
      element.removeEventListener('animationend', onEnd);
      window.clearTimeout(timer);
      resolve();
    };
    const onEnd = (event: AnimationEvent) => {
      if (names.includes(event.animationName)) {
        done();
      }
    };
    const timer = window.setTimeout(done, timeout);
    element.addEventListener('animationend', onEnd);
  });
}

// Resolves once React has committed and the browser has painted the frame after
function afterPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

// The id of the last event card above the reading line, which the reader is reading
function eventAtReadingLine() {
  const line = readingLineY();
  let reading: string | null = null;
  for (const card of document.querySelectorAll<HTMLElement>('article[data-year][id]')) {
    if (card.getBoundingClientRect().top <= line) {
      reading = card.id;
    }
  }
  return reading;
}

export function ThemedTimeline({ events }: { events: TimelineEvent[] }) {
  // The page is prerendered in the classic theme, and learns the reader's once it runs in the browser. The Pokémon theme
  // shows once its code has arrived.
  const [theme, setTheme] = useState<TimelineTheme>('classic');
  const [Pokemon, setPokemon] = useState<PokemonEngine | null>(null);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const placeRef = useRef<{ eventId: string | null } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<PokeballPhase>('boot');
  // Called once the Pokémon theme has replaced the classic page in the document
  const swappedRef = useRef<(() => void) | null>(null);
  // Counts the catches begun, so one the page has since left behind does nothing more
  const catchRef = useRef(0);
  // The button kept at hand appears only once the bar at the top has scrolled away, so the two never show together
  const [barInView, setBarInView] = useState(true);
  const pokemon = theme === 'pokemon' && Pokemon !== null;

  // Moves the ball, and keeps the page behind it from taking focus while it is shut
  const showBall = useCallback((phase: PokeballPhase) => {
    phaseRef.current = phase;
    if (ballRef.current) {
      ballRef.current.dataset.phase = phase;
    }
    // Only once the page is covered: making the whole page inert costs a frame the shutting ball would stutter on
    if (rootRef.current) {
      rootRef.current.inert = phase === 'loading';
    }
  }, []);

  // Shuts the ball (unless it already is, as when the page comes up in the Pokémon theme), downloads the theme, swaps it in
  // behind the ball, waits for the sprites the reader will see first, and opens the ball onto it
  const catchPokemon = useCallback(
    async (shutFirst: boolean) => {
      const run = ++catchRef.current;
      const stale = () => run !== catchRef.current;
      const leastShut = prefersLessMotion() ? LEAST_SHUT_MS.still : LEAST_SHUT_MS.motion;
      const shut = shutFirst ? animationEnd(ballRef.current, SHUT_ANIMATIONS, ANIMATION_WAIT_MS) : Promise.resolve();
      showBall(shutFirst ? 'closing' : 'loading');
      setFailed(false);
      setAnnouncement(LOADING);
      const files = Promise.all([loadPokemonEngine(), loadPixelFont()]);
      // Settled below, once the ball has shut
      files.catch(() => undefined);

      if (shutFirst) {
        await shut;
        if (stale()) {
          return;
        }
        showBall('loading');
      }

      let shown: TimelineTheme = 'pokemon';
      try {
        const [[engine]] = await Promise.all([files, wait(leastShut)]);
        if (stale()) {
          return;
        }
        const swapped = new Promise<void>((resolve) => {
          swappedRef.current = resolve;
        });
        setPokemon(() => engine);
        setTheme('pokemon');
        await swapped;
        await afterPaint();
        if (rootRef.current) {
          await imagesInView(rootRef.current, IMAGE_WAIT_MS);
        }
        setAnnouncement('The Pokémon edition is ready.');
      } catch {
        if (stale()) {
          return;
        }
        shown = 'classic';
        // Undo only the choice this catch saved; a returning reader's saved choice stays, so a reload tries again
        if (shutFirst) {
          storeTheme('classic');
        }
        setFailed(true);
        setAnnouncement(LOAD_FAILED);
      }

      if (stale()) {
        return;
      }
      document.documentElement.setAttribute(THEME_ATTRIBUTE, shown);
      const opened = animationEnd(ballRef.current, OPEN_ANIMATIONS, ANIMATION_WAIT_MS);
      showBall('opening');
      await opened;
      if (!stale()) {
        showBall('idle');
      }
    },
    [showBall]
  );

  useEffect(() => {
    if (preferredTheme(window.location.search, storedTheme()) === 'pokemon') {
      void catchPokemon(false);
    } else {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, 'classic');
      showBall('idle');
    }
    return () => {
      catchRef.current += 1;
    };
  }, [catchPokemon, showBall]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setBarInView(entry.isIntersecting));
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // After a switch, brings back the event the reader was on, or the top of the page if they had not reached one
  useLayoutEffect(() => {
    const place = placeRef.current;
    if (!place) {
      return;
    }
    placeRef.current = null;
    const card = place.eventId ? document.getElementById(place.eventId) : null;
    if (card) {
      card.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pokemon]);

  useLayoutEffect(() => {
    if (pokemon && swappedRef.current) {
      swappedRef.current();
      swappedRef.current = null;
    }
  }, [pokemon]);

  const switchTo = (next: TimelineTheme) => {
    if (phaseRef.current !== 'idle') {
      return;
    }
    placeRef.current = { eventId: eventAtReadingLine() };
    storeTheme(next);
    if (next === 'pokemon') {
      void catchPokemon(true);
    } else {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, 'classic');
      setTheme('classic');
      setAnnouncement('Back to the classic timeline.');
    }
  };

  const shown: TimelineTheme = pokemon ? 'pokemon' : 'classic';
  // The same element from one render to the next, so the switch's own updates never re-render the whole timeline
  const classicTimeline = useMemo(() => <StoryEngine events={events} />, [events]);
  const pokemonTimeline = useMemo(() => (Pokemon ? <Pokemon events={events} /> : null), [Pokemon, events]);

  return (
    <>
      <div
        ref={rootRef}
        data-theme-root={shown}
        className={cn(pokemon && 'pokemon-theme')}
      >
        <ThemeBar ref={barRef} theme={shown} failed={failed} onSwitch={switchTo} />
        {pokemon ? pokemonTimeline : classicTimeline}
        <FloatingSwitch theme={shown} onSwitch={switchTo} shown={!barInView} />
      </div>
      <PokeballOverlay ref={ballRef} />
      <p aria-live="polite" aria-atomic="true" data-theme-status="" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

interface SwitchProps {
  theme: TimelineTheme;
  onSwitch: (theme: TimelineTheme) => void;
}

// The bar at the top of the page that offers the other theme
function ThemeBar({ theme, failed, onSwitch, ref }: SwitchProps & { failed: boolean; ref: Ref<HTMLDivElement> }) {
  const pokemon = theme === 'pokemon';

  return (
    <div
      ref={ref}
      data-theme-bar=""
      className={cn(
        'relative z-10 border-b px-4 py-2 sm:px-6',
        pokemon ? 'border-[#e3263b]/40 bg-[#11142a]' : 'border-white/10 bg-[#0a0a0b]'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4">
        <p className={cn('min-w-0 text-xs sm:text-sm', pokemon ? 'text-[#c9cde6]' : failed ? 'text-[#ff8a96]' : 'text-zinc-400')}>
          {pokemon ? (
            'You’re playing the Pokémon edition of the AI timeline.'
          ) : failed ? (
            LOAD_FAILED
          ) : (
            <>
              <span className="hidden sm:inline">New: </span>Travel through AI history as a Pokémon adventure.
            </>
          )}
        </p>
        <SwitchButton theme={theme} onSwitch={onSwitch} />
      </div>
    </div>
  );
}

// The same choice, kept at hand on wide screens while reading, once the bar at the top is out of view
function FloatingSwitch({ theme, onSwitch, shown }: SwitchProps & { shown: boolean }) {
  return (
    <div
      data-theme-floating={shown ? 'shown' : 'hidden'}
      className={cn(
        'fixed bottom-5 left-5 z-40 hidden transition-opacity duration-200 motion-reduce:transition-none xl:block',
        shown ? 'opacity-100' : 'invisible opacity-0'
      )}
    >
      <SwitchButton theme={theme} onSwitch={onSwitch} floating />
    </div>
  );
}

function SwitchButton({ theme, onSwitch, floating = false }: SwitchProps & { floating?: boolean }) {
  const pokemon = theme === 'pokemon';

  return (
    <button
      type="button"
      data-theme-switch={floating ? 'floating' : 'bar'}
      onClick={() => onSwitch(pokemon ? 'classic' : 'pokemon')}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 sm:px-4',
        pokemon
          ? 'border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12] focus-visible:ring-[#ffcb05]'
          : 'bg-[#ffcb05] text-[#14161f] hover:bg-[#ffd84a] focus-visible:ring-white/70',
        floating && 'shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]'
      )}
    >
      {pokemon ? null : (
        // The Poké Ball is drawn in CSS so the classic page loads no sprite
        <span aria-hidden="true" className="theme-ball" />
      )}
      {pokemon ? 'Back to classic' : 'Pokémon-ify'}
    </button>
  );
}

// The Poké Ball that fills the screen while the Pokémon theme comes in, drawn in app/theme-switch.css. It is only a picture:
// the status line above says what it shows. React renders it at boot and never again; showBall moves it from there.
function PokeballOverlay({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} data-pokeball-overlay="" data-phase="boot" aria-hidden="true" className="pokeball-overlay">
      <div className="pokeball">
        <div className="pokeball-top" />
        <div className="pokeball-bottom" />
        <div className="pokeball-button" />
      </div>
      <div className="pokeball-flash" />
      <p className="pokeball-caption">{LOADING}</p>
    </div>
  );
}
