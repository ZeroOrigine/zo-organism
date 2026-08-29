import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

// #304 K1/K2/K4: same-origin proxy for the credits account. Each action maps
// to exactly one Railway endpoint; nothing else passes through.
const ACTIONS: Record<string, string> = {
  login: '/credits/login',
  session: '/credits/session',
  statement: '/credits/statement',
  wallet_nonce: '/credits/wallet-nonce',
  wallet_link: '/credits/wallet-link',
  wallet_unlink: '/credits/wallet-unlink',
  spend: '/credits/spend',
  refund_request: '/credits/refund-request',
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = ACTIONS[String(body?.action || '')];
    if (!path) {
      return NextResponse.json({ ok: false, reason: 'unknown action' }, { status: 400 });
    }
    const { action: _a, ...rest } = body || {};
    const r = await fetch(`${RAILWAY}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
      cache: 'no-store',
    });
    const d = await r.json().catch(() => null);
    return NextResponse.json(d ?? { ok: false, reason: 'no answer' }, { status: r.ok ? 200 : r.status });
  } catch {
    return NextResponse.json({ ok: false, reason: 'the account service is not answering' }, { status: 500 });
  }
}
