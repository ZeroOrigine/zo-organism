import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// #308 C5: one birth certificate, ledger-derived (RPC zo_birth_certificate).
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
    return NextResponse.json({ error: 'bad slug' }, { status: 400 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: 'not configured' }, { status: 500 });
  try {
    const r = await fetch(`${url}/rest/v1/rpc/zo_birth_certificate`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
      next: { revalidate: 300 },
    });
    if (!r.ok) return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    const d = await r.json();
    if (!d) return NextResponse.json({ error: 'no such birth' }, { status: 404 });
    return NextResponse.json(d);
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
}
