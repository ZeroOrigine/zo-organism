// #308 C5: THE BIRTH CERTIFICATE — the takeaway that travels. A permanent
// per-birth ledger document: name, exact UTC birth stamp, cost to the cent,
// genes inherited, the anchoring transaction. OG/Twitter meta unfurl the
// link as a card; the share button is native. Everything on this page is a
// ledger read; the certificate never mints for a failed birth (the RPC
// answers null for anything without a launched_at).
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

interface Cert {
  name: string; slug: string; tagline: string | null; status: string;
  born_utc: string; born_date: string; birth_no: number; births_total: number;
  cost_usd: number | null; genes_harvested: number;
  anchor_day: string | null; anchor_sig: string | null; url: string | null;
}

async function getCert(slug: string): Promise<Cert | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/zo_birth_certificate`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
      next: { revalidate: 300 },
    });
    if (!r.ok) return null;
    return ((await r.json()) as Cert | null) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCert(params.slug);
  if (!c) return { title: 'Birth Certificate' };
  const title = `${c.name} · Birth Certificate`;
  const description = `Born ${c.born_date} as birth ${c.birth_no} of the organism · built for ${c.cost_usd != null ? '$' + c.cost_usd.toFixed(2) : 'a recorded cost'} · ${c.genes_harvested} genes harvested · every line anchored on Solana.`;
  const ogUrl = `https://zeroorigine.com/births/${c.slug}/certificate/opengraph-image`;
  return {
    title, description,
    openGraph: { title, description, type: 'article',
      url: `https://zeroorigine.com/births/${c.slug}/certificate`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${c.name} birth certificate` }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
  };
}

export default async function CertificatePage({ params }: { params: { slug: string } }) {
  const c = await getCert(params.slug);
  if (!c) notFound();
  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="birthcert">
            <div className="head"><span className="l">Birth Certificate</span>
              <span className="r">zeroorigine · the anchored ledger</span></div>
            <h1>{c.name}</h1>
            <div className="born">BORN {c.born_utc} UTC · BIRTH {c.birth_no} OF {c.births_total}</div>
            {c.tagline && <p className="tagline">{c.tagline}</p>}
            <div className="grid">
              <div className="cell"><div className="k">build cost</div>
                <div className="v">{c.cost_usd != null ? `$${c.cost_usd.toFixed(2)}` : 'pre-attribution era'}</div></div>
              <div className="cell"><div className="k">genes harvested</div>
                <div className="v g">{c.genes_harvested}</div></div>
              <div className="cell"><div className="k">status today</div>
                <div className="v">{c.status}</div></div>
              <div className="cell"><div className="k">served by</div>
                <div className="v">the eight minds</div></div>
            </div>
            <div className="anchor">
              {c.anchor_sig ? (
                <>every ledger line of this birth is a leaf under an anchored root on <b>Solana mainnet</b> ·{' '}
                  <a href={`https://solscan.io/tx/${c.anchor_sig}`} rel="noopener noreferrer" target="_blank">
                    verify the {c.anchor_day} anchor · {c.anchor_sig.slice(0, 10)}…</a></>
              ) : (
                <>this birth predates the daily anchoring; its rows joined the chain when the proof layer began</>
              )}
            </div>
            <div className="foot">
              <div className="seal">0</div>
              <div className="actions">
                <ShareButton title={`${c.name} · born by an autonomous machine`}
                  url={`https://zeroorigine.com/births/${c.slug}/certificate`} />
              </div>
              <div className="note">no tokens exist ·<br />the machine keeps its own books</div>
            </div>
          </div>
        </div>
        <p className="caveat" style={{ textAlign: 'center', marginTop: 22 }}>
          <Link href={`/product/${c.slug}`}>the full birth record</Link>
          {c.url && <>{' · '}<a href={c.url} rel="noopener noreferrer" target="_blank">the living product</a></>}
          {' · '}<Link href="/live">the delivery room</Link>
        </p>
      </section>
      <footer>
        <span>a birth you can watch is a claim you can check</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
