// #308 C5: the certificate's unfurl card — rendered at request time from
// the same ledger RPC, so the shared image can never disagree with the page.
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ZeroOrigine birth certificate';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Cert {
  name: string; born_date: string; birth_no: number; births_total: number;
  cost_usd: number | null; genes_harvested: number; anchor_day: string | null;
}

export default async function OgImage({ params }: { params: { slug: string } }) {
  let c: Cert | null = null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key && /^[a-z0-9-]{1,60}$/.test(params.slug)) {
      const r = await fetch(`${url}/rest/v1/rpc/zo_birth_certificate`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_slug: params.slug }),
      });
      if (r.ok) c = (await r.json()) as Cert | null;
    }
  } catch { /* falls to the generic card */ }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(175deg, #0d1512, #080f0c)', color: '#e8e4d6',
        padding: 64, fontFamily: 'Georgia, serif', justifyContent: 'space-between',
        border: '2px solid #2a3c33' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          borderBottom: '1px solid #1b2822', paddingBottom: 20 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: 'uppercase', color: '#3bda8c' }}>Birth Certificate</div>
          <div style={{ fontSize: 20, color: '#8d978f' }}>zeroorigine · the anchored ledger</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{c ? c.name : 'A machine-born product'}</div>
          <div style={{ fontSize: 26, color: '#8d978f', marginTop: 14, letterSpacing: 2 }}>
            {c ? `BORN ${c.born_date} · BIRTH ${c.birth_no} OF ${c.births_total}` : 'born by eight AI minds'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, color: '#8d978f', textTransform: 'uppercase', letterSpacing: 3 }}>build cost</div>
            <div>{c && c.cost_usd != null ? `$${c.cost_usd.toFixed(2)}` : 'recorded'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, color: '#8d978f', textTransform: 'uppercase', letterSpacing: 3 }}>genes harvested</div>
            <div style={{ color: '#3bda8c' }}>{c ? c.genes_harvested : '—'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, color: '#8d978f', textTransform: 'uppercase', letterSpacing: 3 }}>anchored</div>
            <div style={{ color: '#d4a94e' }}>{c && c.anchor_day ? `Solana · ${c.anchor_day}` : 'Solana mainnet'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #1b2822', paddingTop: 20 }}>
          <div style={{ fontSize: 20, color: '#8d978f' }}>a birth you can watch is a claim you can check</div>
          <div style={{ width: 54, height: 54, border: '2px solid #3bda8c', borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3bda8c', fontSize: 28 }}>0</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
