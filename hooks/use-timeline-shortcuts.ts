// Adds the timeline's keyboard shortcuts: J and K step between events, 1 to 6 jump to an era and / focuses search.
// The keys are left alone while the reader types in a field or holds a modifier key.
'use client';

import { useEffect, type RefObject } from 'react';
import { scrollToEra, stepEvent } from '@/lib/timeline-scroll';

interface TimelineShortcutsOptions {
  eraIds: string[];
  searchInputRef: RefObject<HTMLInputElement | null>;
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  );
}

export function useTimelineShortcuts({ eraIds, searchInputRef }: TimelineShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'j' || key === 'k') {
        event.preventDefault();
        stepEvent(key === 'j' ? 1 : -1);
        return;
      }

      if (key === '/') {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      const eraNumber = Number(key);
      if (Number.isInteger(eraNumber) && eraNumber >= 1 && eraNumber <= eraIds.length) {
        event.preventDefault();
        scrollToEra(eraIds[eraNumber - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [eraIds, searchInputRef]);
}
