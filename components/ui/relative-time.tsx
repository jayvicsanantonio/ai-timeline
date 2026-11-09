// How long ago an event happened, to the month, beside its date: "last month", "8 months ago". The label appears once the
// page runs in the browser, which knows today's date, and stays away for events a year old or more.
'use client';

import { useCurrentMonth } from '@/hooks/use-current-month';
import { relativeMonthLabel } from '@/lib/relative-time';
import type { TimelineEvent } from '@/types/timeline';

interface RelativeTimeProps {
  event: Pick<TimelineEvent, 'year' | 'month'>;
  className?: string;
  // Drawn ahead of the label, such as a separating dot, and left out of what screen readers hear
  before?: string;
}

export function RelativeTime({ event, className, before }: RelativeTimeProps) {
  const now = useCurrentMonth();
  const label = now === null ? null : relativeMonthLabel(event, now);
  if (!label) {
    return null;
  }

  return (
    <span data-relative-time="" className={className}>
      {before ? <span aria-hidden="true">{before}</span> : null}
      {label}
    </span>
  );
}
