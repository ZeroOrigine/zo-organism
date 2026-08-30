// #306 T1: /genome — THE GENOME GALAXY (cowork's approved prototype ported
// onto live SELECTs). Server-fetches the library so the intro renders with
// real counts before any canvas boots (the slow-connection fallback), and
// the text section below the stage keeps the page legible with JS off.
import Link from 'next/link';
import GenomeGalaxy, { type GalaxyData } from '@/components/GenomeGalaxy';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Genome Galaxy',
  description: 'Every gene the machine has harvested, as a playable galaxy: births as suns, genes in orbit, the founding pool at the core. Every body is a ledger row.',
};

async function getGalaxy(): Promise<GalaxyData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/zo_genome_playground`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      next: { revalidate: 300 },
    });
    if (!r.ok) return null;
    return (await r.json()) as GalaxyData;
  } catch {
    return null;
  }
}

export default async function GenomePage() {
  const data = await getGalaxy();
  return (
    <main style={{ opacity: 1 }}>
      {data ? (
        <GenomeGalaxy data={data} />
      ) : (
        <section className="eco-section registry-head"><div className="eco-wrap">
          <p className="eco-lede">The genome is not answering right now. Rather than show an invented galaxy, this
            page waits. The registry table at <Link href="/genes">/genes</Link> may still be serving.</p>
        </div></section>
      )}
      {data && (
        <section className="eco-section"><div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">THE GENOME · IN WORDS</span>
            <h2>{data.counts.modules} genes. {data.counts.inheritances} inheritances recorded.</h2></div>
          <p className="eco-lede">The machine keeps its lessons here. {data.counts.pushed} genes are in the genome,
            {' '}{data.counts.queued} are queued for graduation review, {data.counts.gestation} are in gestation, and
            {' '}{data.counts.blocked} are held back until their findings clear. {data.grad_rule.text}. Graduations are
            public status-change events; the next one happens in public. Supporters read everything: the proven genes,
            the failures, the fixes. Any amount. Same access. One{' '}
            <Link href="/genome/sample" style={{ color: 'var(--life)' }}>sample gene is fully open</Link> so the lock is
            credible; the depth lives in the <Link href="/library" style={{ color: 'var(--life)' }}>supporter library</Link>.</p>
          <Link className="viewall" href="/genes" style={{ marginRight: 12 }}>the registry, as a table</Link>
          <Link className="viewall" href="/#support">become a supporter</Link>
        </div></section>
      )}
      <footer>
        <span>every failure becomes a gene; every gene is a lesson the dead paid for</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
