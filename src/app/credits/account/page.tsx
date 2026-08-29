// #304: /credits/account — magic-link login, the full statement with a
// per-entry on-chain proof link, the wallet binding (conversion address),
// self-serve spend, and the refund policy door.
import CreditsAccount from '@/components/CreditsAccount';
import { getSiteState } from '@/lib/siteState';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ZO Credits Account',
  description: 'Your credits statement, verifiable against the chain-anchored books; optional wallet binding as your ZO conversion address.',
};

export default async function CreditsAccountPage() {
  const state = await getSiteState();
  const products = (state?.products || [])
    .map((p) => ({ slug: p.slug, name: p.name }));
  return <CreditsAccount products={products} />;
}
