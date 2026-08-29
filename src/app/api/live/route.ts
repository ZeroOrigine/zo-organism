import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

// #302: same-origin pass-through for the Delivery Room feed (public-safe by
// whitelist on the machine side; nothing is added here).
export async function GET() {
  try {
    const r = await fetch(`${RAILWAY}/site/live`, { cache: 'no-store' });
    const d = await r.json().catch(() => null);
    return NextResponse.json(d ?? { in_flight: false, mode: 'replay', replay: null }, { status: 200 });
  } catch {
    return NextResponse.json({ in_flight: false, mode: 'replay', replay: null }, { status: 200 });
  }
}
