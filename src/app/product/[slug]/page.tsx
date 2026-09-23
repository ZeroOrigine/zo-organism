// #255 W3: the birth certificate. One template, rendered from the registry
// payload, so every product ever born (and every one yet to be born) gets a
// page with zero hand-written markup. Unknown slugs 404 honestly.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteState } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

// #4516: the reverse-and-restate pattern's public half. When a register
// entry is ever corrected, the correction is written through the one-door
// metadata path as public_correction_note and rendered here in full view.
// Only that single whitelisted key is read; nothing else in the project
// metadata can reach the public page (W8).
async function getCorrectionNote(slug: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  try {
    const r = await fetch(
      `${url}/rest/v1/zo_projects?project_id=eq.zo-${slug}&select=metadata->>public_correction_note`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } },
    );
    if (!r.ok) return null;
    const rows = (await r.json()) as { public_correction_note?: string | null }[];
    const note = rows?.[0]?.public_correction_note;
    return typeof note === 'string' && note.trim() ? note : null;
  } catch {
    return null;
  }
}

export default async function ProductCertificate({
  params,
}: {
  params: { slug: string };
}) {
  const [state, correction] = await Promise.all([
    getSiteState(),
    getCorrectionNote(params.slug),
  ]);
  const p = state?.products.find((x) => x.slug === params.slug);
  const adopted = state?.adopted?.find((x) => x.slug === params.slug);
  if (!p && adopted) {
    // 2026-09-23 THE ADOPTION RECORD. Not a certificate of birth: this product
    // was built by a human outside the pipeline. The record says so plainly and
    // prints no cost of birth, because the ledger holds none.
    const a = adopted;
    return (
      <main className="cert" style={{ opacity: 1 }}>
        <Link className="back" href="/">back to the organism</Link>
        <div className="frame">
          <div className="kicker">Record of adoption · ZeroOrigine registry</div>
          <h1>{a.name}</h1>
          {a.tagline && <p className="tag">{a.tagline}</p>}
          <dl>
            <dt>Adopted</dt><dd>{a.since}</dd>
            <dt>Category</dt><dd>{a.cat}</dd>
            <dt>Origin</dt><dd>built by a human outside the Minds pipeline; taken into the ecosystem&apos;s care by founder order</dd>
            <dt>Cost of birth</dt><dd>none. This is not a birth; no Mind was paid to make it.</dd>
            <dt>Status</dt><dd><span className={'stamp ' + a.stamp[0]}>{a.stamp[1]}</span></dd>
            <dt>Watched by</dt><dd>the product sentinel, the certificate horizon and the promise auditor, like every product on the registry</dd>
          </dl>
          {a.url && a.url !== '#' && (
            <a className="visit" href={a.url} rel="noopener noreferrer">Visit {a.name}</a>
          )}
        </div>
        <p className="caveat" style={{ marginTop: 18 }}>
          This record is rendered from the machine&apos;s own registry. It is kept apart from the
          certificates of birth on purpose: the Minds did not make this product, and the site does not count it as born.
        </p>
      </main>
    );
  }
  if (!p) notFound();

  return (
    <main className="cert" style={{ opacity: 1 }}>
      <Link className="back" href="/">back to the organism</Link>
      <div className="frame">
        <div className="kicker">Certificate of birth · ZeroOrigine registry</div>
        <h1>{p.name}</h1>
        {p.tagline && <p className="tag">{p.tagline}</p>}
        <dl>
          <dt>Born</dt><dd>{p.born}</dd>
          <dt>Category</dt><dd>{p.cat}</dd>
          <dt>Cost of birth</dt>
          <dd>{p.cost === 'pre-attribution'
            ? 'pre-attribution (recorded in the aggregate books)' : p.cost}</dd>
          <dt>Status</dt>
          <dd><span className={'stamp ' + p.stamp[0]}>{p.stamp[1]}</span></dd>
          <dt>Front door</dt>
          <dd>{p.stamp[1].includes('drilled')
            ? 'walked by the machine on the live site: signup, login, reset, core action, checkout'
            : 'launched; the walk-the-front-door drill applies to births from August 2026 onward'}</dd>
        </dl>
        {p.url && p.url !== '#' && (
          <a className="visit" href={p.url} rel="noopener noreferrer">Visit {p.name}</a>
        )}
        {correction && (
          <div className="correction"><b>Correction on the record</b><br />{correction}</div>
        )}
      </div>
      <p className="caveat" style={{ marginTop: 18 }}>
        This certificate is rendered from the machine&apos;s own registry. Nothing on it is
        hand-written; if a number is missing, it is because the ledger does not hold it.
      </p>
    </main>
  );
}
