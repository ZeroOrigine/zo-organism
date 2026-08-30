'use client';

// #4545 structural half — ONE LEDGER.
//
// The page carried four separate 17-row tables saying four kinds of the same
// thing: revenue entries, births, supporters, and (inside the revenue rows)
// credits. A reader who wanted "everything that happened on the 14th" had to
// read four tables and hold them in their head. This is one ledger, filtered,
// with the per-row proof drawer exactly as #4545 built it.
//
// The filter is a VIEW, never a redaction: "all" is the default, every row is
// present in the DOM's data at all times, and each chip prints its own count
// so a reader can see what a filter is hiding before they click it.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProofCell from '@/components/ProofCell';

export interface LedgerRow {
  kind: 'revenue' | 'supporters' | 'credits' | 'births';
  date: string;
  who: string;
  slug?: string | null;          // links a birth to its product page
  amount: string;
  detail: string;
  negative?: boolean;
  proof?: { entryId: string; table: string } | null;
  // REC #312 clause 2: 'ambiguous' (two rows share this key, so the page will
  // not guess) and 'unavailable' (the proof index could not be reached at all)
  // are DIFFERENT facts. They used to render the same sentence, which made a
  // broken lookup look like an honest limitation of the data.
  proofState?: 'ready' | 'ambiguous' | 'unavailable';
}

const CHIPS: { key: 'all' | LedgerRow['kind']; label: string }[] = [
  { key: 'all', label: 'all' },
  { key: 'revenue', label: 'revenue' },
  { key: 'supporters', label: 'supporters' },
  { key: 'credits', label: 'credits' },
  { key: 'births', label: 'births' },
];

export default function BooksLedger({ rows }: { rows: LedgerRow[] }) {
  const [filter, setFilter] = useState<'all' | LedgerRow['kind']>('all');
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.kind] = (c[r.kind] || 0) + 1;
    return c;
  }, [rows]);
  const shown = filter === 'all' ? rows : rows.filter((r) => r.kind === filter);

  return (
    <>
      <div className="bk-chips" role="group" aria-label="Filter the ledger">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            className="bk-chip"
            aria-pressed={filter === c.key}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
            <span className="bk-chip-n">{counts[c.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="bk-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Kind</th>
              <th>Entry</th>
              <th className="bk-num">Amount</th>
              <th>Proof</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={`${r.kind}-${i}`}>
                <td className="bk-mono">{r.date}</td>
                <td><span className="bk-kind">{r.kind}</span></td>
                <td>
                  {r.slug ? <Link href={'/product/' + r.slug}>{r.who}</Link> : r.who}
                  {r.detail ? <div className="bk-mono" style={{ color: 'var(--bone-faint)' }}>{r.detail}</div> : null}
                </td>
                <td className={'bk-num' + (r.negative ? ' bk-neg' : '')}>{r.amount}</td>
                <td>
                  {r.proof
                    ? <ProofCell entryId={r.proof.entryId} table={r.proof.table} compact />
                    : r.proofState === 'ambiguous'
                      ? <span
                          className="bk-mono"
                          style={{ color: 'var(--bone-faint)' }}
                          title="two entries share this date, name and amount, so the page will not guess which proof belongs to this row"
                        >ask /books/proof</span>
                      : r.proofState === 'unavailable'
                        ? <span
                            className="bk-mono bk-broken"
                            title="the proof index could not be reached, so this page cannot say which entry this row is; the proof itself is unaffected and /books/proof still answers"
                          >index unreachable</span>
                        : <span className="bk-mono" style={{ color: 'var(--bone-faint)' }}>&mdash;</span>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={5} className="bk-mono">Nothing of this kind yet. The ledger waits, honestly empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
