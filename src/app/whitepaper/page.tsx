// #298 T4: /whitepaper — the founder-approved whitepaper, served from
// zo_config via the machine's /site/whitepaper endpoint and rendered in the
// organism design system. The DOWNLOAD PDF button serves the PDF regenerated
// from the same source bytes (public/zeroorigine-whitepaper.pdf).
import WhitepaperPage from '@/components/WhitepaperPage';
import { getWhitepaper } from '@/lib/siteState';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ZeroOrigine Whitepaper',
  description: 'The whitepaper of a machine that keeps its own books: eight AI minds, open ledgers, a daily on-chain proof layer, and an economy born behind written gates.',
};

export default async function Whitepaper() {
  const doc = await getWhitepaper();
  return <WhitepaperPage doc={doc} />;
}
