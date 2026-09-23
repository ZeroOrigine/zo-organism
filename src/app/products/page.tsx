// #255 W7: the full register of births. Home shows a preview; this page IS
// the registry, built for hundreds of rows (W2's search + pagination rails
// live here). ?scaletest=N exercises the rails with labeled synthetic rows.
import RegistryAll from '@/components/RegistryAll';
import { expandForScaleTest, getSiteState } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

export default async function ProductsRegistry({
  searchParams,
}: {
  searchParams?: { scaletest?: string };
}) {
  const state = await getSiteState();
  if (!state) {
    return (
      <main className="cert">
        <p style={{ fontFamily: 'var(--mono, monospace)' }}>
          The registry endpoint is not answering right now. Rather than show an
          invented list, this page waits. Refresh in a minute.
        </p>
      </main>
    );
  }
  const n = Number(searchParams?.scaletest || 0);
  const finalState = n > 0 && n <= 2000 ? expandForScaleTest(state, n) : state;
  return <RegistryAll products={finalState.products} adopted={finalState.adopted} />;
}
