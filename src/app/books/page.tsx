// #296 T2: THE FULL BOOKS. Four blocks, all from live Postgres aggregation
// (never client-capped): the monthly statement, every birth's cost, the
// public supporter ledger, and the proof chain with its on-chain anchors.
import Link from 'next/link';
import { getBooksData } from '@/lib/siteState';
import { Dual, CurrencyPicker } from '@/lib/currency';
import ProofCell, { Copyable } from '@/components/ProofCell';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

// #4545: the supporter ledger's own keys, read from the SAME public view the
// machine's books endpoint reads (v_donations_public, is_test excluded), so
// the table and its proof links cannot drift apart. donation_id is the key
// /books/proof already answers on for anyone, with no credentials.
async function donationKeys(): Promise<Record<string, string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};
  try {
    const r = await fetch(
      `${url}/rest/v1/v_donations_public?select=donation_id,created_at,amount,donor_name&order=created_at.desc&limit=200`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
    if (!r.ok) return {};
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
    return out;
  } catch {
    return {};
  }
}

export default async function BooksPage() {
  const [data, keys] = await Promise.all([getBooksData(), donationKeys()]);
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
                <tr><td>less founder drills (payments made to test the rails)</td><td className="num">-{usd(rc.test_drill_cents)}</td></tr>
                <tr><td>less refunds</td><td className="num">-{usd(rc.refund_cents)}</td></tr>
                <tr><td>less the founder buying from his own machine (a self-test, never arm&apos;s-length revenue)</td><td className="num">-{usd(rc.self_test_reclass_cents)}</td></tr>
                <tr><td>less supporter contributions (they live in the supporter ledger below, not in revenue)</td><td className="num">-{usd(rc.support_reclass_cents)}</td></tr>
                <tr><td>less credit purchases held as deferred revenue (gift-card model; recognized only when spent)</td><td className="num">-{usd(rc.credits_reclass_cents)}</td></tr>
                {!!rc.unexplained_cents && (
                  <tr><td><b>unexplained difference (this should be zero: the deductions above do not account for the whole gap)</b></td>
                    <td className="num"><b>{usd(rc.unexplained_cents)}</b></td></tr>
                )}
                <tr><td><b>Recognized revenue (the number the home page shows)</b></td><td className="num"><b>{usd(rc.recognized_cents)}</b><Dual usd={rc.recognized_cents / 100} /></td></tr>
              </tbody>
            </table></div>
            <p className="caveat">Corrections are made by reversal entries that reference the original, never by deletion;
              every line above is a row in zo_revenue_events or zo_credits_entries. Subtract the deductions from the gross
              and you get the recognized figure exactly: the books publish what is left over, so a deduction nobody named
              would appear above as an unexplained difference rather than as a hole for the reader to find.</p>

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
              names its reason. <b>These recognition lines are not themselves leaves in the proof chain yet</b>: the
              chain carries the cost, donation, credits, product, finding, verdict, rate and wage tables, and revenue
              recognition joins it from the day that change ships. Saying so is cheaper than implying a proof that does
              not exist; the money behind each line is provable today through the supporter ledger and the credits
              statement below and above.</p>
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
          <thead><tr><th>Date</th><th>Supporter</th><th className="num">Amount</th><th>Allocated to</th><th>Proof</th></tr></thead>
          <tbody>
            {data.donations.map((d, i) => {
              const id = keys[`${d.date}|${d.name}|${d.amount}`];
              return (
                <tr key={i}>
                  <td className="mono">{d.date}</td><td>{d.name}</td>
                  <td className="num">{d.amount}</td><td className="mono">{d.product}</td>
                  <td>{id
                    ? <ProofCell entryId={id} table="zo_donations" compact />
                    : <span className="dimcell" title="two entries share this date, name and amount, so the page will not guess which proof belongs to this row">ask /books/proof</span>}</td>
                </tr>
              );
            })}
            {data.donations.length === 0 && (
              <tr><td colSpan={5} className="mono">No contributions yet. The ledger waits, honestly empty.</td></tr>
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
                  <td className="mono"><Copyable text={p.chained_root} label={`${p.day} chained root`} /></td>
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
          anchored on a public chain. Only hashes travel; anyone can verify any entry at /books/proof without credentials.
          On the explorer page, expand the transaction&apos;s first instruction: the memo carries the day and the root,
          in plain text.</p>

        <h3 className="books-h">How to check any of this yourself</h3>
        <ol className="books-how">
          <li>Open <b>proof</b> on any supporter-ledger row above. The machine returns the exact bytes it hashed, the
            hash, and the path of sibling hashes up to that day&apos;s root.</li>
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
