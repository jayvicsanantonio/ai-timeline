// Tracks where the reader is in the timeline: the era and the event year at the reading line, and whether
// the reading line is inside the timeline at all. Measures once per animation frame while the page scrolls.
'use client';

import { useEffect, useState } from 'react';
import { lastIndexAbove, readingLineY } from '@/lib/timeline-scroll';

export interface TimelinePosition {
  eraId: string;
  // The year of the last event in the era that the reading line has passed, or null while the
  // era's introduction is still being read
  year: number | null;
  inTimeline: boolean;
}

// contentKey re-measures when the shown events change without the page scrolling
export function useTimelinePosition(eraIds: string[], contentKey?: unknown): TimelinePosition {
  const [position, setPosition] = useState<TimelinePosition>({
    eraId: eraIds[0] ?? '',
    year: null,
    inTimeline: false,
  });

  useEffect(() => {
    const sections = eraIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    let frameId = 0;

    const measure = () => {
      frameId = 0;
      const line = readingLineY();
      const eraIndex = lastIndexAbove(sections, line);
      const section = sections[Math.max(eraIndex, 0)];
      const cards = section.querySelectorAll('article[data-year]');
      const cardIndex = eraIndex === -1 ? -1 : lastIndexAbove(cards, line);
      const next: TimelinePosition = {
        eraId: section.id,
        year: cardIndex === -1 ? null : Number((cards[cardIndex] as HTMLElement).dataset.year),
        inTimeline: eraIndex !== -1 && sections[sections.length - 1].getBoundingClientRect().bottom > line,
      };

      setPosition((current) =>
        current.eraId === next.eraId &&
        current.year === next.year &&
        current.inTimeline === next.inTimeline
          ? current
          : next
      );
    };

    const scheduleMeasure = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [eraIds, contentKey]);

  return position;
}
