// #300 A1: the crypto support door. A pledge issues a memo code so the
// watcher can attach your name; an unannounced deposit still enters the
// books, as anonymous. Receive-only rail; every row joins the proof chain.
import CryptoSupport from '@/components/CryptoSupport';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Support in Crypto',
  description: 'Send SOL or USDC on Solana to the published machine wallet; every deposit enters the public, chain-anchored books.',
};

export default function SupportCrypto() {
  return <CryptoSupport />;
}
