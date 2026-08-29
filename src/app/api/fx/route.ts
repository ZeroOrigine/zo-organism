import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

// #303: the day's RECORDED display rates (a proof-chain ledger row).
export async function GET() {
  try {
    const r = await fetch(`${RAILWAY}/site/fx`, { next: { revalidate: 300 } });
    const d = await r.json().catch(() => null);
    return NextResponse.json(d ?? { day: null, rates: {}, display_currencies: [] });
  } catch {
    return NextResponse.json({ day: null, rates: {}, display_currencies: [] });
  }
}
