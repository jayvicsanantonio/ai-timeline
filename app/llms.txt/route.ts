// Serves /llms.txt, the Markdown summary of the site that AI agents and language models read first.
// Next.js renders it once at build time from the timeline data.
import timelineData from '@/data/timeline-events.json';
import { llmsTxt } from '@/lib/llms';
import { parseTimelineEvents } from '@/lib/timeline-events';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(parseTimelineEvents(timelineData)), {
    // Plain text, which browsers show instead of downloading, as they do text/markdown
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
