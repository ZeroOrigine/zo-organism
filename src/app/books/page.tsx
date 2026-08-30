// #296 T2: THE FULL BOOKS. Every figure from live Postgres aggregation, never
// client-capped.
//
// #4545 structural half: the honesty work left this page 5,627px tall — eight
// flat sections, with the reconciliation (the most important thing here)
// reading as section two of eight, and four separate tables saying four kinds
// of the same thing. Same information, one third the height: the POSITION
// first, then the reconciliation as a waterfall, then ONE ledger with filter
// chips carrying the per-row proof drawer, then the chain as a spine.
import Link from 'next/link';
import { getBooksData } from '@/lib/siteState';
import { Dual, CurrencyPicker } from '@/lib/currency';
import { Copyable } from '@/components/ProofCell';
import BooksLedger, { type LedgerRow } from '@/components/BooksLedger';
import '@/app/organism.css';
import '@/app/books.css';

export const dynamic = 'force-dynamic';

// #4545: the supporter ledger's own keys, read from the SAME public view the
// machine's books endpoint reads (v_donations_public, is_test excluded), so
// the table and its proof links cannot drift apart. donation_id is the key
// /books/proof already answers on for anyone, with no credentials.
//
// REC #312 clause 2: this used to return {} on a missing key, a 401, or a
// thrown fetch — indistinguishable from "every row's key is ambiguous". Two
// different states rendered as the same sentence, so a page that could not
// reach the proof index looked exactly like a page whose rows genuinely
// cannot be told apart. It now says which, and the row says so too.
async function donationKeys(): Promise<{ reachable: boolean; keys: Record<string, string> }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { reachable: false, keys: {} };
  try {
    const r = await fetch(
      `${url}/rest/v1/v_donations_public?select=donation_id,created_at,amount,donor_name&order=created_at.desc&limit=200`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
    if (!r.ok) return { reachable: false, keys: {} };
    const rows = (await r.json()) as
      { donation_id: string; created_at: string; amount: number; donor_name: string | null }[];
    // The books payload renders date + name + amount, so that triple keys a row
    // back to its ledger id. Two rows CAN share it (there are already two $1.00
    // donations on 2026-08-14), and showing a row its neighbour's proof would
    // be exactly the dishonesty this fix exists to end — so a colliding key
    // resolves to nothing and the row says the key is ambiguous.
    const byKey: Record<string, string[]> = {};
    for (const row of rows) {
      const k = `${String(row.created_at).slice(0, 10)}|${row.donor_name || 'anonymous'}|$${Number(row.amount).toFixed(2)}`;
      (byKey[k] ||= []).push(row.donation_id);
    }
    const out: Record<string, string> = {};
    for (const [k, ids] of Object.entries(byKey)) if (ids.length === 1) out[k] = ids[0];
    return { reachable: true, keys: out };
  } catch {
    return { reachable: false, keys: {} };
  }
}

export default async function BooksPage() {
  const [data, proofIndex] = await Promise.all([getBooksData(), donationKeys()]);
  const keys = proofIndex.keys;
  if (!data) {
    return (
      <main className="cert">
        <p style={{ fontFamily: 'var(--mono, monospace)' }}>
          The books endpoint is not answering right now. Rather than show an
          invented statement, this page waits. Refresh in a minute.
        </p>
      </main>
    );
  }
  const months = [...data.months].reverse();
  const rc = data.reconciliation || null;
  const usd = (c: number) => (c < 0 ? '-$' : '$') + (Math.abs(c) / 100).toFixed(2);

  // ── the position: four numbers that say where the machine stands ──
  const invested = months.reduce((s, m) => s + Number(m.cost_usd || 0), 0);
  const anchoredDays = data.proofs.filter((p) => p.solana_explorer).length;

  // ── one ledger out of four tables ──
  const ledger: LedgerRow[] = [];
  if (rc) {
    for (const e of rc.entries) {
      const isCredit = /credit/i.test(e.class);
      ledger.push({
        kind: isCredit ? 'credits' : 'revenue',
        date: e.date,
        who: e.product,
        amount: usd(e.amount_cents),
        detail: e.class,
        negative: e.amount_cents < 0,
        proof: null,
      });
    }
  }
  for (const d of data.donations) {
    const id = keys[`${d.date}|${d.name}|${d.amount}`];
    ledger.push({
      kind: 'supporters', date: d.date, who: d.name, amount: d.amount,
      detail: d.product ? `allocated to ${d.product}` : '',
      proof: id ? { entryId: id, table: 'zo_donations' } : null,
      // REC #312 clause 2: an unreachable index and an ambiguous key are
      // different facts and must not read the same
      proofState: id ? 'ready' : proofIndex.reachable ? 'ambiguous' : 'unavailable',
    });
  }
  for (const b of data.births) {
    ledger.push({
      kind: 'births', date: b.born, who: b.name,
      slug: b.status === 'live' ? b.slug : null,
      amount: b.cost === 'pre-attribution' ? 'pre-attribution' : b.cost,
      detail: b.status, negative: true, proof: null,
    });
  }
  ledger.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // the waterfall: each deduction sized against the gross it comes out of
  // a zero deduction draws NO bar: a sliver of colour for $0.00 is a picture
  // of something that did not happen
  const pct = (c: number) =>
    !c || !rc || !rc.gross_cents ? 0 : Math.max(0.6, (Math.abs(c) / rc.gross_cents) * 100);
  const deductions = rc ? [
    ['founder drills (payments made to test the rails)', rc.test_drill_cents],
    ['refunds', rc.refund_cents],
    ['the founder buying from his own machine (a self-test, never arm’s-length revenue)', rc.self_test_reclass_cents],
    ['supporter contributions (they live in the supporter ledger, not in revenue)', rc.support_reclass_cents],
    ['credit purchases held as deferred revenue (recognized only when spent)', rc.credits_reclass_cents],
  ] as [string, number][] : [];

  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio"><span className="no">BOOKS</span><h2>The full books</h2><span className="note">double-entry, kept in public</span></div>

        <div className="bk-position">
          <div className="bk-pos-cell">
            <span className="bk-pos-label">Recognized revenue</span>
            <span className="bk-pos-value">{rc ? usd(rc.recognized_cents) : '—'}</span>
            <span className="bk-pos-note">arm&apos;s-length, all time</span>
          </div>
          <div className="bk-pos-cell">
            <span className="bk-pos-label">Invested</span>
            <span className="bk-pos-value">${invested.toFixed(2)}</span>
            <span className="bk-pos-note">model and infrastructure</span>
          </div>
          <div className="bk-pos-cell">
            <span className="bk-pos-label">Credits outstanding</span>
            <span className={'bk-pos-value' + (rc && rc.credits.outstanding_cents > 0 ? ' bk-owed' : '')}>
              {rc ? usd(rc.credits.outstanding_cents) : '—'}
            </span>
            <span className="bk-pos-note">owed in product value, not revenue</span>
          </div>
          <div className="bk-pos-cell">
            <span className="bk-pos-label">Days proven</span>
            <span className="bk-pos-value">{anchoredDays}/{data.proofs.length}</span>
            <span className="bk-pos-note">anchored on a public chain</span>
          </div>
        </div>
        <p className="caveat" style={{ marginTop: 10 }}><CurrencyPicker /></p>

        {rc && (
          <>
            <h2 className="books-h">From gross to recognized</h2>
            <div className="bk-fall">
              <div className="bk-fall-row">
                <div>
                  <div className="bk-fall-label">Gross payment events, all time</div>
                  <div className="bk-bar"><span className="bk-gross" style={{ width: '100%' }} /></div>
                </div>
                <div className="bk-fall-amt">{usd(rc.gross_cents)}</div>
              </div>
              {deductions.map(([label, cents]) => (
                <div className="bk-fall-row" key={label}>
                  <div>
                    <div className="bk-fall-label">less {label}</div>
                    <div className="bk-bar">
                      <span className="bk-less" style={{ right: 0, width: `${pct(cents)}%` }} />
                    </div>
                  </div>
                  <div className="bk-fall-amt">-{usd(cents)}</div>
                </div>
              ))}
              {!!rc.unexplained_cents && (
                <div className="bk-fall-row">
                  <div className="bk-fall-label bk-unexplained">
                    unexplained difference: the deductions above do not account for the whole gap
                  </div>
                  <div className="bk-fall-amt bk-unexplained">{usd(rc.unexplained_cents)}</div>
                </div>
              )}
              <div className="bk-fall-row bk-total">
                <div>
                  <div className="bk-fall-label">Recognized revenue (the number the home page shows)</div>
                  <div className="bk-bar"><span className="bk-kept" style={{ width: `${pct(rc.recognized_cents)}%` }} /></div>
                </div>
                <div className="bk-fall-amt">{usd(rc.recognized_cents)}<Dual usd={rc.recognized_cents / 100} /></div>
              </div>
            </div>
            <p className="caveat">Corrections are made by reversal entries that reference the original, never by deletion;
              every line above is a row in zo_revenue_events or zo_credits_entries. Subtract the deductions from the gross
              and you get the recognized figure exactly: the books publish what is left over, so a deduction nobody named
              would appear above as an unexplained difference rather than as a hole for the reader to find.
              Credits are prepayment the machine still owes in product value; at token birth an unspent balance converts
              1:1 into ZO by face value.</p>
          </>
        )}

        <h2 className="books-h">The ledger</h2>
        <BooksLedger rows={ledger} />
        <p className="caveat">One ledger, filtered: revenue recognition, supporter contributions, credit movements and the
          cost of every birth, newest first. Names appear exactly as supporters gave them and no other personal data is
          published. Crypto support arrives at the machine&apos;s receive-only Solana wallet
          BQeNktmf4DAeetsxwCjVZwAzsAwCwkbvL1kSf9nUGXqQ and enters this same ledger.
          <b> Revenue recognition lines are not themselves leaves in the proof chain yet</b>: the chain carries the cost,
          donation, credits, product, finding, verdict, rate and wage tables, and recognition joins it from the day that
          change ships. Saying so is cheaper than implying a proof that does not exist.</p>

        <h2 className="books-h">Monthly statement</h2>
        <div className="ledger bk-months"><table>
          <thead><tr><th>Month</th><th className="num">Model + infra (debit)</th><th className="num">Product revenue (credit)</th><th className="num">Support received (credit)</th></tr></thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td className="mono">{m.month}</td>
                <td className="num">${Number(m.cost_usd || 0).toFixed(2)}</td>
                <td className="num">${Number(m.revenue_usd || 0).toFixed(2)}</td>
                <td className="num">${Number(m.donations_usd || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>

        <h2 className="books-h">The proof chain</h2>
        <div className="bk-spine">
          {data.proofs.map((p, i) => {
            // #298 T2(c): a day older than an anchored later day is already
            // cryptographically sealed through the prev_root chain — say so,
            // and link the covering anchor. "awaiting anchor" only when no
            // later anchored day exists.
            const covering = p.solana_explorer ? null
              : data.proofs.filter((q) => q.day > p.day && q.solana_explorer)
                  .sort((a, b) => (a.day < b.day ? -1 : 1))[0] || null;
            const prev = data.proofs[i + 1];
            return (
              <div className="bk-day" key={p.day}>
                <div className="bk-rail"><div className={'bk-node' + (p.solana_explorer ? ' bk-anchored' : '')} /></div>
                <div className="bk-day-body">
                  <div className="bk-day-head">
                    <span className="bk-day-date">{p.day}</span>
                    <span className="bk-day-meta">{p.leaf_count} entries</span>
                    <span className="bk-day-meta">
                      {p.solana_explorer
                        ? <a href={p.solana_explorer} rel="noopener noreferrer" target="_blank">verify on Solana</a>
                        : covering
                          ? <a href={covering.solana_explorer as string} rel="noopener noreferrer" target="_blank">sealed by chain, via the {covering.day} anchor</a>
                          : 'awaiting anchor'}
                    </span>
                  </div>
                  <div className="bk-root"><Copyable text={p.chained_root} label={`${p.day} chained root`} /></div>
                  <div className="bk-chainline">
                    {prev
                      ? `chains onto ${prev.day}: sha256(prev_root + merkle_root + day)`
                      : 'the first day: prev_root is empty, and the chain starts here'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="caveat">Each day&apos;s entries hash into one root; each root chains to the previous day&apos;s and is
          anchored on a public chain. Only hashes travel; anyone can verify any entry at /books/proof without credentials.
          On the explorer page, expand the transaction&apos;s first instruction: the memo carries the day and the root,
          in plain text.</p>

        <h2 className="books-h">How to check any of this yourself</h2>
        <ol className="books-how">
          <li>Open <b>proof</b> on any supporter row in the ledger above. The machine returns the exact bytes it hashed,
            the hash, and the path of sibling hashes up to that day&apos;s root.</li>
          <li>Recompute it: <code>sha256(&apos;&lt;table&gt;:&lt;id&gt;:&apos; + canonical_json)</code> must equal the
            entry hash; hash each path pair sorted, in order, and you must land on the day&apos;s Merkle root.</li>
          <li>Chain it: <code>sha256(prev_root + merkle_root + day)</code> must equal the chained root printed above,
            which is copyable in full.</li>
          <li>Compare it to the chain: open that day&apos;s anchor transaction and read the memo. It says{' '}
            <code>zo-ledger:&lt;day&gt;:&lt;root&gt;</code>. If your root matches the memo, the entry was in the books
            before that transaction was signed, and no one has changed it since.</li>
          <li>Or call it directly, with no account and no permission:{' '}
            <code>zo-langgraph-production-3c96.up.railway.app/books/proof?entry_id=&lt;id&gt;&amp;table=zo_donations</code>.</li>
        </ol>
        <p className="caveat">A number you cannot check is a number you have to trust. These are checkable, which is
          the point of keeping them this way.</p>

        <Link className="viewall" href="/">back to the organism</Link>
      </section>
    </main>
  );
}
