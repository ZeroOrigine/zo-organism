// #297: The ZO Economy at /economy. Gate meters and the anchor strip read
// live; the allocation renders the founder's recorded ruling.
import EconomyPage from '@/components/EconomyPage';
import { getEconomyData, getProofSummary } from '@/lib/siteState';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The ZO Economy',
  description: 'A token that refuses to exist until it earns to: four phases, four gates, live meters read from chain-anchored books.',
};

export default async function Economy() {
  const [econ, proof] = await Promise.all([getEconomyData(), getProofSummary()]);
  return (
    <EconomyPage
      gates={econ?.gates ?? null}
      targets={econ?.targets ?? null}
      creditsLive={econ?.credits?.live ?? false}
      anchorSig={proof?.latest_anchored?.solana_sig ?? null}
      anchorDay={proof?.latest_anchored?.day ?? null}
    />
  );
}
