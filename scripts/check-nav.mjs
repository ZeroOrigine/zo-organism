// #4505(2): THE NAV LAW, enforced pre-deploy. Exactly ONE primary nav may
// exist (SiteNav), the root layout must mount it, every canonical route must
// have a page file, and no page may hand-roll its own primary nav — the
// forking disease that produced 13 divergent headers ends here.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = decodeURIComponent(new URL('..', import.meta.url).pathname);
const fail = (msg) => { console.error(`NAV LAW FAIL: ${msg}`); process.exitCode = 1; };

// 1) the canonical list lives in SiteNav and every route in it must exist
const siteNav = readFileSync(join(ROOT, 'src/components/SiteNav.tsx'), 'utf8');
const links = [...siteNav.matchAll(/\['([^']+)', '([^']+)'\]/g)].map((m) => m[2]);
if (links.length < 5) fail(`canonical list unreadable (${links.length} links)`);
for (const href of links) {
  const page = href === '/' ? 'src/app/page.tsx' : `src/app${href}/page.tsx`;
  if (!existsSync(join(ROOT, page))) fail(`canonical route ${href} has no page file (${page})`);
}

// 2) the root layout mounts SiteNav once
const layout = readFileSync(join(ROOT, 'src/app/layout.tsx'), 'utf8');
if (!layout.includes('<SiteNav />')) fail('root layout does not mount SiteNav');

// 3) NO other file may render a primary nav
const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|jsx)$/.test(f)) out.push(p);
  }
  return out;
};
for (const f of walk(join(ROOT, 'src'))) {
  if (f.endsWith('components/SiteNav.tsx')) continue;
  const s = readFileSync(f, 'utf8');
  if (s.includes('aria-label="Primary"')) fail(`${f.replace(ROOT, '')} renders a page-local primary nav`);
  // 2026-09-23: SubNav ("Registry / Logbook / Join Us") sat under this check for a month
  // because it was labelled "Site navigation", and seven pages rendered TWO navs. Any
  // <nav element outside SiteNav, Footer and the (app) template island's Header (which
  // 404s on the public site) is a page-local nav, whatever it calls itself.
  if (!/components\/(Footer|Header)\.tsx$/.test(f) && /<nav[\s>]/.test(s)) fail(`${f.replace(ROOT, '')} renders a <nav> outside SiteNav`);
}

// 4) the home page's birth fade may never be a bare `main` rule again: /privacy, /terms,
// /contact, /join, /refund, /logbook and /story rendered as black screens under it.
const organism = readFileSync(join(ROOT, 'src/app/organism.css'), 'utf8');
if (/(^|[\s}])main\s*\{[^}]*opacity\s*:\s*0/.test(organism)) fail('organism.css fades a bare <main>; the birth fade must be scoped to main#page');

if (process.exitCode) process.exit(1);
console.log(`nav law: 1 primary nav (SiteNav), ${links.length} canonical routes all present, 0 page-local navs`);
