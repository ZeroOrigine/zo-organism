// #296 T2: THE FULL BOOKS. Four blocks, all from live Postgres aggregation
// (never client-capped): the monthly statement, every birth's cost, the
// public supporter ledger, and the proof chain with its on-chain anchors.
import Link from 'next/link';
import { getBooksData } from '@/lib/siteState';
import { Dual, CurrencyPicker } from '@/lib/currency';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

export default async function BooksPage() {
  const data = await getBooksData();
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
  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio"><span className="no">BOOKS</span><h2>The full books</h2><span className="note">double-entry, kept in public</span></div>
        <p className="caveat" style={{ marginTop: 10 }}><CurrencyPicker /></p>

        <h3 className="books-h">Monthly statement</h3>
        <div className="ledger"><table>
          <thead><tr><th>Month</th><th className="num">Model + infra (debit)</th><th className="num">Product revenue (credit)</th><th className="num">Support received (credit)</th></tr></thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td className="mono">{m.month}</td>
                <td className="num">${m.cost_usd.toFixed(2)}<Dual usd={m.cost_usd} /></td>
                <td className="num">${m.revenue_usd.toFixed(2)}<Dual usd={m.revenue_usd} /></td>
                <td className="num">${m.donations_usd.toFixed(2)}<Dual usd={m.donations_usd} /></td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="caveat">Every debit is a logged model or infrastructure call; every credit is a settled payment.
          Nothing here is projected, netted, or annualized.</p>

        {rc && (
          <>
            <h3 className="books-h">Revenue reconciliation</h3>
            <div className="ledger"><table>
              <tbody>
                <tr><td>Gross payment events, all time</td><td className="num">{usd(rc.gross_cents)}<Dual usd={rc.gross_cents / 100} /></td></tr>
                <tr><td>less founder drills and self-tests</td><td className="num">-{usd(rc.test_drill_cents)}</td></tr>
                <tr><td>less refunds</td><td className="num">-{usd(rc.refund_cents)}</td></tr>
                <tr><td>less supporter contributions (they live in the supporter ledger below, not in revenue)</td><td className="num">-{usd(rc.support_reclass_cents)}</td></tr>
                <tr><td>less credit purchases held as deferred revenue (gift-card model; recognized only when spent)</td><td className="num">-{usd(rc.credits_reclass_cents)}</td></tr>
                <tr><td><b>Recognized revenue (the number the home page shows)</b></td><td className="num"><b>{usd(rc.recognized_cents)}</b><Dual usd={rc.recognized_cents / 100} /></td></tr>
              </tbody>
            </table></div>
            <p className="caveat">Corrections are made by reversal entries that reference the original, never by deletion;
              every line above is a row in zo_revenue_events or zo_credits_entries and ties to the cent.</p>

            <h3 className="books-h">Credits outstanding (what the machine owes)</h3>
            <div className="ledger"><table>
              <tbody>
                <tr><td>ZO Credits purchased</td><td className="num">{usd(rc.credits.purchased_cents)} &middot; {(rc.credits.purchased_cents / 100).toFixed(2)} ZO CREDITS</td></tr>
                <tr><td>less spent on products (recognized as revenue at spend)</td><td className="num">-{usd(rc.credits.spent_cents)}</td></tr>
                <tr><td>less refunded</td><td className="num">-{usd(rc.credits.refunded_cents)}</td></tr>
                <tr><td><b>Outstanding liability</b></td><td className="num"><b>{usd(rc.credits.outstanding_cents)} &middot; {(rc.credits.outstanding_cents / 100).toFixed(2)} ZO CREDITS</b><Dual usd={rc.credits.outstanding_cents / 100} /></td></tr>
              </tbody>
            </table></div>
            <p className="caveat">Credits are prepayment the machine still owes in product value. They are not revenue and
              not a donation; at token birth an unspent balance converts 1:1 into ZO by face value.</p>

            <h3 className="books-h">Recent revenue-ledger entries</h3>
            <div className="ledger"><table>
              <thead><tr><th>Date</th><th>Product</th><th className="num">Amount</th><th>Classification</th></tr></thead>
              <tbody>
                {rc.entries.map((e, i) => (
                  <tr key={i}>
                    <td className="mono">{e.date}</td><td>{e.product}</td>
                    <td className="num">{usd(e.amount_cents)}</td>
                    <td className="mono">{e.class}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <p className="caveat">Itemized, newest first, no personal data. A negative amount is a reversal or refund and
              names its reason.</p>
          </>
        )}

        <h3 className="books-h">Cost of every birth</h3>
        <div className="ledger"><table>
          <thead><tr><th>Born</th><th>Product</th><th>Status</th><th className="num">Cost of birth</th></tr></thead>
          <tbody>
            {data.births.map((b) => (
              <tr key={b.slug}>
                <td className="mono">{b.born}</td>
                <td>{b.status === 'live' ? <Link href={'/product/' + b.slug}>{b.name}</Link> : b.name}</td>
                <td className="mono">{b.status}</td>
                <td className="num">{b.cost === 'pre-attribution'
                  ? <span className="dimcell">pre-attribution</span> : b.cost}</td>
              </tr>
            ))}
          </tbody>
        </table></div>

        <h3 className="books-h">The supporter ledger</h3>
        <div className="ledger"><table>
          <thead><tr><th>Date</th><th>Supporter</th><th className="num">Amount</th><th>Allocated to</th></tr></thead>
          <tbody>
            {data.donations.map((d, i) => (
              <tr key={i}>
                <td className="mono">{d.date}</td><td>{d.name}</td>
                <td className="num">{d.amount}</td><td className="mono">{d.product}</td>
              </tr>
            ))}
            {data.donations.length === 0 && (
              <tr><td colSpan={4} className="mono">No contributions yet. The ledger waits, honestly empty.</td></tr>
            )}
          </tbody>
        </table></div>
        <p className="caveat">Names appear exactly as supporters gave them; no other personal data is published.
          Crypto support arrives at the machine&apos;s receive-only Solana wallet
          BQeNktmf4DAeetsxwCjVZwAzsAwCwkbvL1kSf9nUGXqQ and enters this same ledger.</p>

        <h3 className="books-h">The proof chain</h3>
        <div className="ledger"><table>
          <thead><tr><th>Day</th><th className="num">Entries</th><th>Chained root</th><th>On-chain anchor</th></tr></thead>
          <tbody>
            {data.proofs.map((p) => {
              // #298 T2(c): a day older than an anchored later day is already
              // cryptographically sealed through the prev_root chain — say so,
              // and link the covering anchor. "awaiting anchor" only when no
              // later anchored day exists.
              const covering = p.solana_explorer ? null
                : data.proofs.filter((q) => q.day > p.day && q.solana_explorer)
                    .sort((a, b) => (a.day < b.day ? -1 : 1))[0] || null;
              return (
                <tr key={p.day}>
                  <td className="mono">{p.day}</td>
                  <td className="num">{p.leaf_count}</td>
                  <td className="mono">{p.chained_root.slice(0, 12)}&hellip;{p.chained_root.slice(-6)}</td>
                  <td>{p.solana_explorer
                    ? <a href={p.solana_explorer} rel="noopener noreferrer" target="_blank">verify on Solana</a>
                    : covering
                      ? <a href={covering.solana_explorer as string} rel="noopener noreferrer" target="_blank">sealed by chain · via the {covering.day} anchor</a>
                      : <span className="dimcell">awaiting anchor</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        <p className="caveat">Each day&apos;s entries hash into one root; each root chains to the previous day&apos;s and is
          anchored on a public chain. Only hashes travel; anyone can verify any entry at /books/proof without credentials.</p>

        <Link className="viewall" href="/">back to the organism</Link>
      </section>
    </main>
  );
}
