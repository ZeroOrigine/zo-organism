// Whitepaper v2.1 — the ledger-book page. Canonical bytes live in
// zo_config.zo_whitepaper_source (served by /site/whitepaper, sha included);
// this page renders cowork's approved design with the six ratified vitals
// (#4513) and the as-of day resolved live from the same payloads the rest of
// the site reads. The PDF regenerates from the same source bytes with the
// same substitution and an as-of stamp.
import WhitepaperBook from '@/components/WhitepaperBook';
import { getWhitepaper, getSiteState, getProofSummary } from '@/lib/siteState';
import { whitepaperTokenValues } from '@/lib/liveTokens';
import '@/app/organism.css';
import '@/app/whitepaper.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ZeroOrigine Whitepaper',
  description: 'The whitepaper of a machine that keeps its own books: eight AI minds, open ledgers, a daily on-chain proof layer, and an economy born behind written gates.',
};

export default async function Whitepaper() {
  const [doc, state, proof] = await Promise.all([getWhitepaper(), getSiteState(), getProofSummary()]);
  const t = whitepaperTokenValues(state, proof);
  return (
    <WhitepaperBook
      v={{
        products_alive: t.products_alive,
        products_retired: t.products_retired,
        invested_alltime: t.invested_alltime,
        revenue_alltime: t.revenue_alltime,
        days_proven: t.days_proven,
        as_of_day: t.as_of_day,
      }}
      version={doc?.version || '2.1'}
      sha={doc?.sha256 || ''}
    />
  );
}
