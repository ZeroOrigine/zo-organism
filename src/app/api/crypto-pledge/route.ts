import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

/** #300 A1: same-origin proxy for the crypto donation pledge. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const r = await fetch(`${RAILWAY}/donations/crypto-pledge`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: String(body?.name || '').slice(0, 120), asset: body?.asset === 'sol' ? 'sol' : 'usdc' }),
      cache: 'no-store',
    });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d?.memo_code) return NextResponse.json({ ok: false }, { status: 502 });
    return NextResponse.json(d);
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
