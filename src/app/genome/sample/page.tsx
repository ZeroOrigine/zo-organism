// #306 T5(c): THE FREE SAMPLE GENE — one gene fully open to everyone, so
// the lock on the rest of the library is credible. The content comes from
// the same table supporters read; nothing is dressed up for the sample.
import Link from 'next/link';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Free Sample Gene',
  description: 'One gene from the machine\'s library, fully open: the production-tested Supabase RLS patterns every product inherits.',
};

async function getSample() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/zo_genome_free_sample`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      next: { revalidate: 3600 },
    });
    if (!r.ok) return null;
    return (await r.json()) as { id: string; name: string; content: string; used: number; q: number };
  } catch {
    return null;
  }
}

export default async function SampleGene() {
  const s = await getSample();
  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">FREE SAMPLE · ONE GENE, FULLY OPEN</span>
            <h2>{s ? s.name : 'The free sample gene'}</h2></div>
          {s ? (
            <>
              <p className="eco-lede">This is a real gene from the library, exactly as products inherit it: used
                {' '}{s.used} times, quality score {s.q}. It is open to everyone so the lock on the other genes is
                credible. Supporters read the whole library the same way: the proven genes, the failures, the fixes.</p>
              <div className="ledger" style={{ padding: '18px 20px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--mono, monospace)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--bone-dim)', margin: 0, overflowX: 'auto' }}>{s.content}</pre>
              </div>
              <p className="caveat">Gene id {s.id} · served from the same table supporters read; nothing dressed up.</p>
            </>
          ) : (
            <p className="eco-lede">The sample is not answering right now. Refresh in a minute.</p>
          )}
          <Link className="viewall" href="/genome" style={{ marginRight: 12 }}>back to the playground</Link>
          <Link className="viewall" href="/#support">become a supporter</Link>
        </div>
      </section>
      <footer>
        <span>the lessons are the product; the code is the artifact</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
