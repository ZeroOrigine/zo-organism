// #306 T3: /library — the supporter library portal (magic-link entry; the
// promise /genome makes, delivered).
import LibraryPortal from '@/components/LibraryPortal';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Supporter Gene Library',
  description: 'The full gene library for supporters: proven genes, harvest records, failures and fixes, read the way the machine reads them.',
};

export default function LibraryPage() {
  return <LibraryPortal />;
}
