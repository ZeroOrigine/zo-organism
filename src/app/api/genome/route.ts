import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// #306 T1: the playground payload — metadata for the FULL library via one
// Postgres RPC (the 1000-row law). Gene content NEVER flows here except the
// single published free sample (?sample=1), which the RPC alone decides.
export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'genome source not configured' }, { status: 500 });
  }
  const wantSample = new URL(req.url).searchParams.get('sample') === '1';
  const fn = wantSample ? 'zo_genome_free_sample' : 'zo_genome_playground';
  try {
    const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      next: { revalidate: 300 },
    });
    if (!r.ok) return NextResponse.json({ error: 'genome unavailable' }, { status: 502 });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ error: 'genome unavailable' }, { status: 502 });
  }
}
