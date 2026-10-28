// Tracks where the reader is in the timeline: the era, event date and progress through the era at the reading line,
// and whether that line is inside the timeline at all. Measures once per animation frame while the page scrolls.
'use client';

import { useEffect, useState } from 'react';
import { lastIndexAbove, readingLineY } from '@/lib/timeline-scroll';

export interface TimelinePosition {
  eraId: string;
  // The year of the last event in the era that the reading line has passed, or null while the
  // era's introduction is still being read
  year: number | null;
  // That event's month, or null when its month is unknown
  month: string | null;
  inTimeline: boolean;
  // How far the reading line has come through the current era, from 0 to 1 in hundredths
  eraProgress: number;
}

const START: Omit<TimelinePosition, 'eraId'> = {
  year: null,
  month: null,
  inTimeline: false,
  eraProgress: 0,
};

function samePosition(a: TimelinePosition, b: TimelinePosition) {
  return (
    a.eraId === b.eraId &&
    a.year === b.year &&
    a.month === b.month &&
    a.inTimeline === b.inTimeline &&
    a.eraProgress === b.eraProgress
  );
}

// contentKey re-measures when the shown events change without the page scrolling
export function useTimelinePosition(eraIds: string[], contentKey?: unknown): TimelinePosition {
  const [position, setPosition] = useState<TimelinePosition>({ eraId: eraIds[0] ?? '', ...START });

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
      const cards = section.querySelectorAll<HTMLElement>('article[data-year]');
      const cardIndex = eraIndex === -1 ? -1 : lastIndexAbove(cards, line);
      const card = cardIndex === -1 ? null : cards[cardIndex];
      const month = card?.dataset.month;
      const box = section.getBoundingClientRect();
      const progress = eraIndex === -1 ? 0 : Math.min(Math.max((line - box.top) / box.height, 0), 1);
      const next: TimelinePosition = {
        eraId: section.id,
        year: card ? Number(card.dataset.year) : null,
        month: month && month !== 'Unknown' ? month : null,
        inTimeline: eraIndex !== -1 && sections[sections.length - 1].getBoundingClientRect().bottom > line,
        eraProgress: Math.round(progress * 100) / 100,
      };

      setPosition((current) => (samePosition(current, next) ? current : next));
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
