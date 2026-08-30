import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

// #4543: same-origin proxy for the two-step claim. Step one only IDENTIFIES a
// deposit (a pasted signature proves nothing: the chain is public). Step two
// carries the signature the paying wallet produced over the exact claim
// message, which is what actually proves control.
const ROUTES: Record<string, string> = {
  prepare: '/donations/crypto-claim/prepare',
  verify: '/donations/crypto-claim/verify',
  verify_pledge_wallet: '/donations/crypto-pledge/verify-wallet',
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = ROUTES[String(body?.action || '')];
    if (!path) return NextResponse.json({ ok: false, reason: 'unknown action' }, { status: 400 });
    const { action, ...rest } = body;
    void action;
    const r = await fetch(`${RAILWAY}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest), cache: 'no-store',
    });
    const d = await r.json().catch(() => null);
    if (!d) return NextResponse.json({ ok: false, reason: 'the machine did not answer' }, { status: 502 });
    return NextResponse.json(d);
  } catch {
    return NextResponse.json({ ok: false, reason: 'the machine did not answer' }, { status: 502 });
  }
}
