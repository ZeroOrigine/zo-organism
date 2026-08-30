// #4603(4) THE AUTH FLOW LAW.
//
// The founder clicked Continue with GitHub and landed on a page still showing
// the logged-out state, with a REAL access token sitting in the address bar:
// supabase-js defaults to the IMPLICIT flow, which returns a live bearer
// credential in the URL fragment. He screenshotted it while reporting the bug,
// which is exactly how implicit-flow tokens leak in practice.
//
// PKCE returns a short-lived ?code= exchanged for the session instead. This
// guard fails the build if any browser client in this site can be created
// without asking for it, because a default nobody wrote down is a default
// nobody notices coming back.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fail = (m) => { console.error(`AUTH FLOW LAW: ${m}`); process.exitCode = 1; };

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(f)) out.push(p);
  }
  return out;
};

let clients = 0;
for (const file of walk(join(ROOT, 'src'))) {
  const s = readFileSync(file, 'utf8');
  const rel = file.replace(ROOT, '');
  if (!s.includes("'use client'")) continue;  // the server never handles a redirect

  // A VALUE import of supabase-js, static or dynamic. `import type { User }
  // from '@supabase/supabase-js'` is not a client and must not be flagged:
  // the first version of this guard failed the dashboard for a type import,
  // which is how a guard teaches people to ignore it.
  const usesRawSdk =
    /import\s+\{[^}]*\bcreateClient\b[^}]*\}\s+from\s+'@supabase\/supabase-js'/.test(s) ||
    /await\s+import\('@supabase\/supabase-js'\)/.test(s);
  const usesSsrHelper = /createBrowserClient\s*[<(]/.test(s);
  if (!usesRawSdk && !usesSsrHelper) continue;
  clients += 1;

  // supabase-js DEFAULTS to implicit, so it must say pkce out loud.
  // @supabase/ssr defaults to pkce, but a default nobody wrote down is a
  // default nobody notices changing, so it says so too.
  if (!s.includes("flowType: 'pkce'"))
    fail(`${rel} creates a browser Supabase client without flowType 'pkce' `
       + `(supabase-js defaults to the implicit flow, which returns a live token in the URL)`);
  if (/location\.(href|hash)\s*=\s*[^;]*access_token/.test(s))
    fail(`${rel} puts an access token into the URL`);
}

if (clients === 0) fail('no browser Supabase client found: this guard is checking nothing');
if (process.exitCode) process.exit(1);
console.log(`auth flow law: ${clients} browser client(s), all PKCE, no token written to any URL`);
