import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

/**
 * #299 C2: same-origin proxy for ZO Credits checkout (the browser cannot
 * reach Railway cross-origin). Pack and email validated again server-side.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const pack = Number(body?.pack);
    const email = String(body?.email || '').trim().toLowerCase();
    if (![10, 25, 50, 100].includes(pack)) {
      return NextResponse.json({ ok: false, error: 'Packs are $10, $25, $50 and $100.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'A valid email is required. It is the account key.' }, { status: 400 });
    }
    const r = await fetch(`${RAILWAY}/credits/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack, email }),
      cache: 'no-store',
    });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d?.checkout_url) {
      return NextResponse.json({ ok: false, error: 'Checkout could not be created. Nothing was charged. Please try again.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, checkout_url: d.checkout_url });
  } catch {
    return NextResponse.json({ ok: false, error: 'Checkout could not be created. Nothing was charged.' }, { status: 500 });
  }
}
