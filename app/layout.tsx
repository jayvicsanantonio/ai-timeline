// Root layout for the AI Timeline: loads the Work Sans font, global styles and theme provider.
// Wraps every page with the skip link, custom cursor and main landmark.
import type React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { SkipToContent } from '@/components/accessibility/skip-to-content';
import { FuturisticCursor } from '@/components/ui/futuristic-cursor';
import './globals.css';

// Work Sans ships with the app (latin subset, variable weight 300-700), so `next build` never fetches it from Google Fonts.
const workSans = localFont({
  src: './fonts/WorkSans-Latin.woff2',
  display: 'swap',
  variable: '--font-work-sans',
  weight: '300 700',
});

export const metadata: Metadata = {
  title:
    'The AI Timeline - Journey Through Artificial Intelligence History',
  description:
    'An immersive exploration of artificial intelligence milestones from the 1950s to the present day',
  generator: 'v0.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SkipToContent />
          <FuturisticCursor />
          <main id="main-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
