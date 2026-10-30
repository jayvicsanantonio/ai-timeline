// Serves /llms-full.txt, every event of the timeline in Markdown for AI agents and language models.
// Next.js renders it once at build time from the timeline data.
import timelineData from '@/data/timeline-events.json';
import { llmsFullTxt } from '@/lib/llms';
import { SITE_URL } from '@/lib/site';
import { parseTimelineEvents } from '@/lib/timeline-events';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(parseTimelineEvents(timelineData)), {
    headers: {
      // Plain text, which browsers show instead of downloading, as they do text/markdown
      'Content-Type': 'text/plain; charset=utf-8',
      // It repeats the page's events, so search engines list the page in its place
      Link: `<${SITE_URL}/>; rel="canonical"`,
    },
  });
}
