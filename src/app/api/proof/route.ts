import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

/**
 * #4545: same-origin proxy for the machine's own entry-proof endpoint. The
 * endpoint has existed since #254 and answers without credentials; the books
 * page simply never asked it. Nothing is computed here: the proof comes from
 * the machine that keeps the books, and a reader can call the same URL.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entryId = (searchParams.get('entry_id') || '').trim();
  const table = (searchParams.get('table') || '').trim();
  if (!/^[A-Za-z0-9-]{1,64}$/.test(entryId)) {
    return NextResponse.json({ found: false, reason: 'bad entry id' }, { status: 400 });
  }
  if (table && !/^[a-z_]{1,40}$/.test(table)) {
    return NextResponse.json({ found: false, reason: 'bad table' }, { status: 400 });
  }
  try {
    const url = `${RAILWAY}/books/proof?entry_id=${encodeURIComponent(entryId)}`
      + (table ? `&table=${encodeURIComponent(table)}` : '');
    const r = await fetch(url, { cache: 'no-store' });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d) {
      return NextResponse.json({ found: false, reason: 'the proof endpoint did not answer' }, { status: 502 });
    }
    return NextResponse.json(d);
  } catch {
    return NextResponse.json({ found: false, reason: 'the proof endpoint did not answer' }, { status: 502 });
  }
}
