// #309 A4: the route crawl — every deploy, deterministic, $0.
// Boots the production build and asserts, as a hostile stranger would:
//   1. every canonical nav route answers 200 AND carries the one SiteNav;
//   2. the plural route variant redirects to the birth record (#4517);
//   3. a garbage route renders the BRANDED 404, never the framework white;
//   4. the #4512 mobile nav-wrap CSS survived the build.
// Fails the build loudly on any miss. No browser, no flake: fetch + grep.
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const PORT = 3789;
const BASE = `http://127.0.0.1:${PORT}`;

// the same source of truth check-nav.mjs parses — the SiteNav constant
const navSrc = readFileSync('src/components/SiteNav.tsx', 'utf8');
const links = [...navSrc.matchAll(/\['[^']+',\s*'([^']+)'\]/g)].map((m) => m[1]);
if (links.length < 5) { console.error(`crawl: parsed only ${links.length} nav links — parser broken`); process.exit(1); }

const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});
let serverOut = '';
server.stdout.on('data', (d) => { serverOut += d; });
server.stderr.on('data', (d) => { serverOut += d; });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/', { redirect: 'manual' }); if (r.status < 500) return; } catch { /* booting */ }
    await sleep(1000);
  }
  console.error('crawl: server never became ready\n' + serverOut.slice(-800));
  process.exit(1);
}

const failures = [];
async function check(name, fn) {
  try { await fn(); console.log(`  ok ${name}`); }
  catch (e) { failures.push(`${name}: ${e.message}`); console.error(`  FAIL ${name}: ${e.message}`); }
}

try {
  await waitReady();

  for (const href of links) {
    await check(`nav route ${href}`, async () => {
      const r = await fetch(BASE + href);
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      const body = await r.text();
      // the one header: every page carries SiteNav's canonical link set
      if (!body.includes('href="/books"') || !body.includes('href="/graveyard"')) {
        throw new Error('SiteNav links missing from the rendered page');
      }
    });
  }

  await check('plural redirect /products/<slug> (#4517)', async () => {
    const r = await fetch(BASE + '/products/lienclock', { redirect: 'manual' });
    if (![301, 302, 307, 308].includes(r.status)) throw new Error(`status ${r.status}, expected a redirect`);
    const loc = r.headers.get('location') || '';
    if (!loc.includes('/product/lienclock')) throw new Error(`redirects to ${loc}`);
  });

  await check('branded 404, never the framework white (#4517)', async () => {
    const r = await fetch(BASE + '/definitely-not-a-page-' + Date.now());
    if (r.status !== 404) throw new Error(`status ${r.status}`);
    const body = await r.text();
    if (!body.includes('Nothing was ever born at this address')) throw new Error('the branded 404 did not render');
  });

  await check('mobile nav wrap CSS present (#4512)', async () => {
    const cssDir = path.join('.next', 'static', 'css');
    const css = readdirSync(cssDir).map((f) => readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
    if (!/max-width:\s*768px/.test(css) || !css.includes('flex-wrap:wrap')) {
      throw new Error('the under-768px nav wrap block is missing from built CSS');
    }
  });

  await check('native controls themed at the element level (#4539)', async () => {
    // the construction guarantee: bare input/select/textarea carry the dark
    // theme in the built CSS, so a page that forgets a class cannot render
    // a white box on the void (the /support-crypto white-on-white class)
    const cssDir = path.join('.next', 'static', 'css');
    const css = readdirSync(cssDir).map((f) => readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
    if (!/(^|})\s*input,\s*select,\s*textarea\s*\{[^}]*background:/m.test(css.replace(/\n/g, ''))) {
      throw new Error('the bare-element input theming rule is missing from built CSS');
    }
    // and no page ships an inline white background on a native control
    for (const href of links.concat(['/support-crypto', '/credits', '/credits/account'])) {
      const r = await fetch(BASE + href);
      if (r.status !== 200) continue;
      const body = await r.text();
      const bad = body.match(/<(input|select|textarea)[^>]*style="[^"]*background(?:-color)?:\s*(?:#fff|#ffffff|white)[^"]*"/i);
      if (bad) throw new Error(`${href} ships an inline white control: ${bad[0].slice(0, 90)}`);
    }
  });
} finally {
  server.kill('SIGTERM');
}

if (failures.length) {
  console.error(`\nsite crawl: ${failures.length} failure(s) — the deploy gate is red`);
  process.exit(1);
}
console.log(`\nsite crawl: ${links.length} nav routes + redirect + 404 + responsive CSS all green`);
// npx's child server can outlive the SIGTERM in CI and hold the step open
// forever; the verdict is printed, so end the process unconditionally.
process.exit(0);
