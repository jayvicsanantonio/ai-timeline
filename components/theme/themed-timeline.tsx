// Shows the timeline in the reader's theme: the classic timeline by default, or the Pokémon theme once they press
// Pokémon-ify. A bar at the top of the page offers the other theme, and on wide screens a button stays at hand while
// reading. Switching keeps the reader at the event they were reading, since both themes give every event the same id, and
// remembers the choice for their next visit.
'use client';

import { useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react';
import { StoryEngine } from '@/components/storytelling/story-engine';
import { PokemonStoryEngine } from '@/components/pokemon/storytelling/story-engine';
import { readingLineY } from '@/lib/timeline-scroll';
import {
  DEFAULT_THEME,
  preferredTheme,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  type TimelineTheme,
} from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';

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
  // The page is prerendered in the default theme, and learns the reader's once it runs in the browser. Until then the mark
  // the boot script left on <html> stands, so a page coming up in the Pokémon theme keeps the classic one hidden.
  const [chosen, setChosen] = useState<TimelineTheme | null>(null);
  const theme = chosen ?? DEFAULT_THEME;
  const placeRef = useRef<{ eventId: string | null } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // The button kept at hand appears only once the bar at the top has scrolled away, so the two never show together
  const [barInView, setBarInView] = useState(true);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setBarInView(entry.isIntersecting));
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setChosen(preferredTheme(window.location.search, storedTheme()));
  }, []);

  useEffect(() => {
    if (chosen) {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, chosen);
    }
  }, [chosen]);

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
  }, [theme]);

  const switchTo = (next: TimelineTheme) => {
    placeRef.current = { eventId: eventAtReadingLine() };
    storeTheme(next);
    setChosen(next);
  };

  const pokemon = theme === 'pokemon';

  return (
    <div data-theme-root={theme} className={cn(pokemon && 'pokemon-theme')}>
      <ThemeBar ref={barRef} theme={theme} onSwitch={switchTo} />
      {pokemon ? <PokemonStoryEngine events={events} /> : <StoryEngine events={events} />}
      <FloatingSwitch theme={theme} onSwitch={switchTo} shown={!barInView} />
    </div>
  );
}

interface SwitchProps {
  theme: TimelineTheme;
  onSwitch: (theme: TimelineTheme) => void;
}

// The bar at the top of the page that offers the other theme
function ThemeBar({ theme, onSwitch, ref }: SwitchProps & { ref: Ref<HTMLDivElement> }) {
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
        <p className={cn('min-w-0 text-xs sm:text-sm', pokemon ? 'text-[#c9cde6]' : 'text-zinc-400')}>
          {pokemon ? (
            'You’re playing the Pokémon edition of the AI timeline.'
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
        'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold sm:px-4 transition-colors focus-visible:outline-none focus-visible:ring-2',
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
