// Draws how many timeline events happened each year as a seismograph of thin bars colored by era.
// Events hidden by the filters stay as a faint ghost of each year's total, a gold dot can mark the years with a landmark,
// and a year can be picked to jump to it.
'use client';

import { useState } from 'react';
import { ERA_DEFINITIONS } from '@/lib/eras';
import type { YearActivity } from '@/lib/timeline-activity';
import { cn } from '@/lib/utils';

interface ActivityChartProps {
  activity: YearActivity[];
  // Horizontal charts run the years left to right with bars growing up. Vertical charts run
  // them top to bottom with bars growing right.
  orientation: 'horizontal' | 'vertical';
  currentYear?: number | null;
  onSelectYear?: (year: number) => void;
  className?: string;
  // Overrides the 2px gap between neighboring bars, for charts too small to spare it
  barsClassName?: string;
  // Marks each year with a landmark among its matching events by a dot just past its bar
  marksLandmarks?: boolean;
}

const ERA_COLORS = new Map(ERA_DEFINITIONS.map((era) => [era.id, era.color]));
const OUTSIDE_ERA_COLOR = '#71717a';
// The gold the agent's checkpoints use, apart from every era's color and the white playhead
const LANDMARK_COLOR = '#e8c14a';
// A landmark's dot, in px, and the space it leaves past the end of its bar
const LANDMARK_DOT = 5;
const LANDMARK_GAP = 3;

function share(value: number, busiest: number) {
  return busiest > 0 ? `${Math.round((value / busiest) * 10000) / 100}%` : '0%';
}

function describeYear({ year, total, matching, landmarks }: YearActivity) {
  const noun = total === 1 ? 'event' : 'events';
  const events = matching === total ? `${year} · ${total} ${noun}` : `${year} · ${matching} of ${total} ${noun}`;
  return landmarks > 0 ? `${events} · ★ ${landmarks} ${landmarks === 1 ? 'landmark' : 'landmarks'}` : events;
}

// Keeps the readout inside the chart near its ends instead of centering it past the edge
function readoutAlignment(position: number) {
  if (position < 0.12) return 'start';
  if (position > 0.88) return 'end';
  return 'center';
}

export function ActivityChart({
  activity,
  orientation,
  currentYear = null,
  onSelectYear,
  className,
  barsClassName,
  marksLandmarks = false,
}: ActivityChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isHorizontal = orientation === 'horizontal';
  const length = isHorizontal ? 'height' : 'width';
  const busiest = Math.max(0, ...activity.map((year) => year.total));
  const hovered = hoveredIndex === null ? undefined : activity[hoveredIndex];
  const hoveredPosition = hoveredIndex === null ? 0 : (hoveredIndex + 0.5) / activity.length;
  const alignment = readoutAlignment(hoveredPosition);
  const barEnd = isHorizontal ? 'inset-x-0 bottom-0 rounded-t-[2px]' : 'inset-y-0 left-0 rounded-r-[2px]';
  // A year with even one event keeps a sliver, so it never vanishes next to the busiest years
  const sliver = isHorizontal ? 'min-h-[2px]' : 'min-w-[2px]';
  // The dot sits just past the end of its bar, and inside the chart beside the busiest years
  const dotEnd = isHorizontal ? 'bottom' : 'left';
  const dotAcross = isHorizontal ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2';

  return (
    <div
      aria-hidden="true"
      data-orientation={orientation}
      className={cn('relative', className)}
      onPointerLeave={() => setHoveredIndex(null)}
    >
      <div
        className={cn(
          'flex h-full w-full gap-[2px]',
          isHorizontal ? 'flex-row' : 'flex-col',
          barsClassName
        )}
      >
        {activity.map((year, index) => {
          const color = (year.eraId && ERA_COLORS.get(year.eraId)) || OUTSIDE_ERA_COLOR;
          const isCurrent = year.year === currentYear;
          const isSelectable = onSelectYear !== undefined && year.matching > 0;

          return (
            <div
              key={year.year}
              data-year-bar=""
              data-year={year.year}
              data-current={String(isCurrent)}
              className={cn('relative min-h-0 min-w-0 flex-1', isSelectable && 'cursor-pointer')}
              onPointerEnter={() => setHoveredIndex(index)}
              onClick={isSelectable ? () => onSelectYear(year.year) : undefined}
            >
              <span
                data-part="total"
                className={cn('absolute opacity-25', barEnd, year.total > 0 && sliver)}
                style={{ [length]: share(year.total, busiest), backgroundColor: color }}
              />
              <span
                data-part="matching"
                className={cn(
                  'absolute transition-opacity',
                  barEnd,
                  year.matching > 0 && sliver,
                  hoveredIndex !== null && hoveredIndex !== index && !isCurrent && 'opacity-70'
                )}
                style={{ [length]: share(year.matching, busiest), backgroundColor: color }}
              />
              {marksLandmarks && year.landmarks > 0 ? (
                <span
                  data-part="landmark"
                  className={cn('absolute rounded-full shadow-[0_0_5px_rgba(232,193,74,0.8)]', dotAcross)}
                  style={{
                    [dotEnd]: `min(calc(${share(year.matching, busiest)} + ${LANDMARK_GAP}px), calc(100% - ${LANDMARK_DOT}px))`,
                    width: LANDMARK_DOT,
                    height: LANDMARK_DOT,
                    backgroundColor: LANDMARK_COLOR,
                  }}
                />
              ) : null}
              {isCurrent ? (
                <span
                  data-part="playhead"
                  className={cn(
                    'absolute bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]',
                    isHorizontal
                      ? 'inset-y-0 left-1/2 w-px -translate-x-1/2'
                      : 'inset-x-0 top-1/2 h-px -translate-y-1/2'
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {hovered ? (
        <p
          className={cn(
            'pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-white/10 bg-[#18181b] px-2 py-1 text-xs font-medium text-white shadow-lg',
            isHorizontal
              ? cn(
                  'bottom-full mb-2',
                  alignment === 'center' && '-translate-x-1/2',
                  alignment === 'end' && '-translate-x-full'
                )
              : cn(
                  'right-full mr-3',
                  alignment === 'center' && '-translate-y-1/2',
                  alignment === 'end' && '-translate-y-full'
                )
          )}
          style={isHorizontal ? { left: `${hoveredPosition * 100}%` } : { top: `${hoveredPosition * 100}%` }}
        >
          {describeYear(hovered)}
        </p>
      ) : null}
    </div>
  );
}
