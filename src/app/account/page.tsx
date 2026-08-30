// REC #310 P3: the passport's personal ledger. One identity that outlives
// products, rendered over the auth the ecosystem already has.
import PassportAccount from '@/components/PassportAccount';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your ZeroOrigine Passport',
  description: 'One identity that outlives products: how you have proven who you are, what you are entitled to, and every public ledger row that belongs to you, each with its own proof.',
};

export default function AccountPage() {
  return <PassportAccount />;
}
