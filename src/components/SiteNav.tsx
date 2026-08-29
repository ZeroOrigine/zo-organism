'use client';

// #4505: THE ONE HEADER. Thirteen divergent hand-rolled navs (and eight
// headerless pages) grew out of page-local copies — every fast ship wave
// forked the nav further. This is now the ONLY primary nav on the site,
// mounted once in the root layout. Adding a route here is the one and only
// way a link enters the header; page files may not render their own.
// The canonical list is also asserted by scripts/check-nav.mjs in CI.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const CANONICAL_LINKS: ReadonlyArray<readonly [string, string]> = [
  ['Organism', '/'],
  ['Live', '/live'],
  ['Births', '/products'],
  ['Graveyard', '/graveyard'],
  ['Genome', '/genome'],
  ['Books', '/books'],
  ['Economy', '/economy'],
  ['Law', '/law'],
  ['Paper', '/whitepaper'],
];

export default function SiteNav() {
  const pathname = usePathname() || '/';
  // #302 D3: the LIVE dot breathes ONLY while a birth is actually in flight
  const [liveNow, setLiveNow] = useState(false);
  useEffect(() => {
    let stop = false;
    const check = async () => {
      try {
        const r = await fetch('/api/live', { cache: 'no-store' });
        const j = await r.json();
        if (!stop) setLiveNow(!!j?.in_flight);
      } catch { /* the dot stays off */ }
    };
    check();
    const iv = setInterval(check, 60000);
    return () => { stop = true; clearInterval(iv); };
  }, []);

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav aria-label="Primary">
      <Link className="wordmark" href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        Zero<b>Origine</b>
      </Link>
      <span className="links">
        {CANONICAL_LINKS.map(([label, href]) => (
          <Link key={href} href={href}
            style={active(href) ? { color: 'var(--life)' } : undefined}
            aria-current={active(href) ? 'page' : undefined}>
            {label}
            {href === '/live' && liveNow && <span className="livedot" aria-label="a birth is in flight" />}
          </Link>
        ))}
      </span>
    </nav>
  );
}
