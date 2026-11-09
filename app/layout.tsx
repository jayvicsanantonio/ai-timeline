// Root layout for the AI Timeline: loads the Work Sans, Open Sans and Press Start 2P fonts and the global styles, and sets the
// metadata search engines and link previews read. Wraps every page with the skip link and main landmark.
import type React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SkipToContent } from '@/components/accessibility/skip-to-content';
import timelineData from '@/data/timeline-events.json';
import { siteMetadata } from '@/lib/site';
import { parseTimelineEvents } from '@/lib/timeline-events';
import './globals.css';

// Work Sans and Open Sans ship with the app (latin subsets, variable weight 300-700), so `next build` never fetches them from Google Fonts.
const workSans = localFont({
  src: './fonts/WorkSans-Latin.woff2',
  display: 'swap',
  variable: '--font-work-sans',
  weight: '300 700',
});

const openSans = localFont({
  src: './fonts/OpenSans-Latin.woff2',
  display: 'swap',
  variable: '--font-open-sans',
  weight: '300 700',
});

// The pixel font the AI Dex prints its numbers and labels in, from the handheld games' screens
const pressStart = localFont({
  src: './fonts/PressStart2P-Latin.woff2',
  display: 'swap',
  variable: '--font-press-start',
  weight: '400',
});

export const metadata: Metadata = siteMetadata(parseTimelineEvents(timelineData));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${openSans.variable} ${pressStart.variable} antialiased`}
    >
      <body className="overflow-x-clip">
        <SkipToContent />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
