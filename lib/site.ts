// How the site describes itself to search engines and link previews: its address, title, description,
// page metadata and schema.org structured data, with the event count and years taken from the timeline events.
import type { Metadata } from 'next';
import type { TimelineEvent } from '@/types/timeline';

// The one address search engines index. Every deployment, Vercel's and the Workers previews included,
// names it as the canonical page and links to its preview image there.
export const SITE_URL = 'https://ai-timeline.pokemoncenter.dev';

export const SITE_NAME = 'The AI Timeline';

function yearSpan(events: TimelineEvent[]) {
  const years = events.map((event) => event.year);
  return { first: Math.min(...years), last: Math.max(...years) };
}

export function siteTitle(events: TimelineEvent[]) {
  const { first, last } = yearSpan(events);
  return `${SITE_NAME}: A History of Artificial Intelligence, ${first}–${last}`;
}

export function siteDescription(events: TimelineEvent[]) {
  const { first, last } = yearSpan(events);
  return `Explore ${events.length} milestones in the history of artificial intelligence from ${first} to ${last}, each era drawn in the interface of its day, from punch cards to AI agents.`;
}

// The root layout's metadata. The preview image comes from app/opengraph-image.tsx, which Next.js adds on its own.
export function siteMetadata(events: TimelineEvent[]): Metadata {
  const title = siteTitle(events);
  const description = siteDescription(events);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: '/',
      siteName: SITE_NAME,
      title,
      description,
      locale: 'en_US',
    },
    twitter: { card: 'summary_large_image' },
  };
}

// The home page's schema.org WebSite, which search engines read for the site's name
export function websiteStructuredData(events: TimelineEvent[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: siteDescription(events),
    inLanguage: 'en',
  };
}

// Serializes structured data for a <script type="application/ld+json">. JSON.stringify leaves < alone,
// so a value holding </script> would close the tag; < reads back as the same character.
export function jsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
