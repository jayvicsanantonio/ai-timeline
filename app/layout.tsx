// Root layout for the AI Timeline: loads the Work Sans and Open Sans fonts, declares the Pokémon theme's pixel font, loads the
// global styles and the theme switch's, and sets the metadata search engines and link previews read. Wraps every page with
// the skip link and main landmark.
import type React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SkipToContent } from '@/components/accessibility/skip-to-content';
import timelineData from '@/data/timeline-events.json';
import { siteMetadata } from '@/lib/site';
import { parseTimelineEvents } from '@/lib/timeline-events';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';
import './globals.css';
import './theme-switch.css';

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

// The pixel font the Pokémon theme prints its numbers and labels in, from the handheld games' screens. Only that theme uses
// it, so the classic page never downloads it: the theme loads it while its Poké Ball fills the screen.
const pressStart = localFont({
  src: './fonts/PressStart2P-Latin.woff2',
  display: 'swap',
  variable: '--font-press-start',
  weight: '400',
  preload: false,
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
      suppressHydrationWarning
      className={`${workSans.variable} ${openSans.variable} ${pressStart.variable} antialiased`}
    >
      <head>
        {/* Marks the reader's theme before the page paints, so a returning Pokémon fan never sees the classic page flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="overflow-x-clip">
        <SkipToContent />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
