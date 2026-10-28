// Root layout for the AI Timeline: loads the Work Sans and Open Sans fonts and the global styles.
// Wraps every page with the skip link and main landmark.
import type React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SkipToContent } from '@/components/accessibility/skip-to-content';
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

export const metadata: Metadata = {
  title:
    'The AI Timeline - Journey Through Artificial Intelligence History',
  description:
    'An immersive exploration of artificial intelligence milestones from the 1940s to the present day',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${openSans.variable} antialiased`}
    >
      <body className="overflow-x-clip">
        <SkipToContent />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
