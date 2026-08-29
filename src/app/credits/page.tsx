// #299: ZO CREDITS. The first way the public puts value in — product
// prepayment under gift-card accounting, recorded in the append-only
// credits ledger, every entry a leaf in the daily proof chain.
import CreditsPage from '@/components/CreditsPage';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ZO Credits',
  description: 'Product prepayment, spendable across every ZeroOrigine product. Converts 1:1 into ZO only at token birth. No resale, no yield, not an investment.',
};

export default function Credits() {
  return <CreditsPage />;
}
