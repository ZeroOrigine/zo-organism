import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

// REC #310 P3: same-origin proxy for the passport. One action per route on the
// machine side; the browser never talks to the pipeline directly and never
// holds anything but its own session token.
const ROUTES: Record<string, string> = {
  login: '/passport/login',
  session: '/passport/session',
  view: '/passport/view',
  wallet_nonce: '/passport/wallet/nonce',
  wallet_bind: '/passport/wallet/bind',
  revoke: '/passport/revoke',
  export: '/passport/export',
  github: '/passport/github',
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
