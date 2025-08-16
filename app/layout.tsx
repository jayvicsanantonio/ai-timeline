import type React from 'react';
import type { Metadata } from 'next';
import { Work_Sans, Open_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { SkipToContent } from '@/components/accessibility/skip-to-content';
import { FuturisticCursor } from '@/components/ui/futuristic-cursor';
import './globals.css';

const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-work-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
  weight: ['300', '400', '500', '600', '700'],
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
      className={`${workSans.variable} ${openSans.variable} antialiased dark`}
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
