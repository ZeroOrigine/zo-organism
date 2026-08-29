// #302: /live — the Delivery Room. A birth in flight renders as it happens
// (whitelisted public lines, the pulsing stage, the unedited ethics verdict,
// the cost ticker); between births the last birth replays.
import LiveRoom from '@/components/LiveRoom';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Delivery Room',
  description: 'Watch a software product be researched, judged, built, tested and launched by machine minds, live, against chain-anchored books.',
};

export default function LivePage() {
  return <LiveRoom />;
}
