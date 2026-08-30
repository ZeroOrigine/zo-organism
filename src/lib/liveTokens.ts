// #4513: the whitepaper's vitals render from the ledger at request time.
// The source markdown (zo_config.zo_whitepaper_source) carries {{live:*}}
// tokens; this resolves them from the same /site/state + /books/proof-summary
// payloads the rest of the site renders from. A token that cannot be
// resolved renders as an honest absence — never a stale number.
import type { SiteState, ProofSummary } from '@/lib/siteState';

const ABSENT = 'unavailable right now';

function vital(state: SiteState | null, key: string): { v: number; prefix?: string; s: string } | null {
  if (!state?.vitals) return null;
  const hit = state.vitals.find((x) => x.k.toLowerCase() === key.toLowerCase());
  return hit ? { v: hit.v, prefix: hit.prefix, s: hit.s } : null;
}

function money(v: number): string {
  const [int, dec] = v.toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec === '00' ? `$${grouped}` : `$${grouped}.${dec}`;
}

export function whitepaperTokenValues(
  state: SiteState | null,
  proof: ProofSummary | null,
): Record<string, string> {
  const alive = vital(state, 'Products alive');
  const retired = vital(state, 'Retired');
  const invested = vital(state, 'Invested, all time');
  const revenue = vital(state, 'Revenue, all time');
  const organs = vital(state, 'Organs registered');
  return {
    products_alive: alive ? String(alive.v) : ABSENT,
    products_retired: retired ? String(retired.v) : ABSENT,
    invested_alltime: invested ? money(invested.v) : ABSENT,
    revenue_alltime: revenue ? money(revenue.v) : ABSENT,
    organs_registered: organs ? `${organs.v} (${organs.s})` : ABSENT,
    days_proven: proof && typeof proof.days_proven === 'number' ? String(proof.days_proven) : ABSENT,
  };
}

export function substituteLiveTokens(md: string, values: Record<string, string>): string {
  // {{live:*}} with a literal star is the doc's own explanatory text — left alone.
  return md.replace(/\{\{live:([a-z_]+)\}\}/g, (whole, name: string) => values[name] ?? ABSENT);
}
