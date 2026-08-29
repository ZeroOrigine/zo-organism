import type { Metadata } from 'next';
import '@/app/globals.css';
import '@/app/organism.css';
import ZoBeacon from '@/components/ZoBeacon';
import SiteNav from '@/components/SiteNav';
import ChunkReload from '@/components/ChunkReload';

export const metadata: Metadata = {
  title: 'ZeroOrigine: The Organism',
  description: 'An autonomous software organism. Eight AI minds research, judge, build, test, launch, and retire real software products. Every number on the site is read from the machine’s own books.',
  // #255 W11: canonical + og still of the organism on the void (1200x630).
  alternates: { canonical: 'https://zeroorigine.com' },
  openGraph: {
    title: 'ZeroOrigine: The Organism',
    description: 'An autonomous software organism. Every number on this site is read from the machine’s own books.',
    type: 'website',
    url: 'https://zeroorigine.com',
    images: [{ url: '/og-organism.png', width: 1200, height: 630, alt: 'The ZeroOrigine organism: everything here begins at zero and earns its existence.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZeroOrigine: The Organism',
    description: 'An autonomous software organism. Every number on this site is read from the machine’s own books.',
    images: ['/og-organism.png'],
  },
  metadataBase: new URL('https://zeroorigine.com'),
  themeColor: '#0A0F0D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Self-hosted fonts (public/fonts). No Google Fonts network dependency
            at build or runtime: the #113-font failure class ends here, and every
            product born from this template inherits the same font files. */}
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/space-grotesk-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link href="/fonts/fonts.css" rel="stylesheet" />
      </head>
      <body>
        {/* #199: the skip link QA files on every build — born in the template now */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>
        {/* #219 P1: THE BEACON LIVES IN THE ROOT LAYOUT, NOT IN (app).
            It used to be mounted only in src/app/(app)/layout.tsx, so every
            marketing page — the landing page, pricing, the pages a stranger
            actually lands on — emitted nothing. Ten of fifteen live products
            had never recorded a single row, /purpose read them dormant, and the
            birth-window gatekeeper was standing on that silence. Mounted here
            it cannot be omitted by a layout that forgets it. */}
        <ZoBeacon />
        {/* #4505: THE ONE HEADER — mounted once here, for every route. Page
            files may not render their own primary nav (CI asserts it), so a
            ship wave can never fork the nav again. ChunkReload heals a tab
            left open across a deploy (stale chunks -> one reload). */}
        <SiteNav />
        <ChunkReload />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
