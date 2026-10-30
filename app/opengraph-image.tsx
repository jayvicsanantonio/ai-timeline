// Draws the link preview image: the title, the years, event and era counts, and the events-per-year chart in each era's color.
// Next.js renders it once at build time and points the page's og:image tag at it.
import { ImageResponse } from 'next/og';
import timelineData from '@/data/timeline-events.json';
import { ERA_DEFINITIONS } from '@/lib/eras';
import { SITE_NAME } from '@/lib/site';
import { countEventsByYear } from '@/lib/timeline-activity';
import { parseTimelineEvents } from '@/lib/timeline-events';

const events = parseTimelineEvents(timelineData);
const activity = countEventsByYear(events);
const firstYear = activity[0].year;
const lastYear = activity[activity.length - 1].year;
const busiest = Math.max(...activity.map((year) => year.total));
const eraColors = new Map(ERA_DEFINITIONS.map((era) => [era.id, era.color]));

export const alt = `${SITE_NAME}: ${events.length} events from ${firstYear} to ${lastYear}, above a chart of how many happened each year, colored by era`;

export const size = { width: 1200, height: 630 };

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 72px',
          backgroundColor: '#0a0a0b',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, color: '#a1a1aa' }}>
          {`${firstYear} – ${lastYear} · ${events.length} EVENTS · ${ERA_DEFINITIONS.length} ERAS`}
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 128, lineHeight: 1, letterSpacing: -5 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', marginTop: 28, maxWidth: 900, fontSize: 34, lineHeight: 1.35, color: '#d4d4d8' }}>
          A history of artificial intelligence, each era drawn in the interface of its day.
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 150, marginTop: 'auto' }}>
          {activity.map((year) => (
            <div
              key={year.year}
              style={{
                flex: 1,
                height: `${(year.total / busiest) * 100}%`,
                minHeight: year.total > 0 ? 2 : 0,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                backgroundColor: (year.eraId && eraColors.get(year.eraId)) || '#71717a',
              }}
            />
          ))}
        </div>
      </div>
    ),
    size
  );
}
