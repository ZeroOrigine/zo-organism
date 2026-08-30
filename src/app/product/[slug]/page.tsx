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
