// #307 E5: /minds — the mind economy's public books. Each mind's ZO units
// (earned against anchored work events) and its USD compute sit in TWO
// parallel columns that are NEVER divided into each other: no rate, no
// price, ever (the E3 constitutional ruling). Efficiency is work events
// per dollar. Totals tie to SELECT sums to the unit.
import Link from 'next/link';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Mind Economy',
  description: 'Eight minds earn ZO units for verified, anchored work. Public per-mind books: units earned, compute consumed, never a price.',
};

interface MindRow {
  mind: string; lifetime_units: number; units_30d: number; events: number;
  usd_compute: number; events_per_dollar: number | null;
  recent: { when: string; units: number; type: string; detail: string }[];
}
interface MindBooks {
  pot_units: number; total_units: number; total_events: number;
  schedule: Record<string, unknown>; minds: MindRow[];
}

const MIND_NAMES: Record<string, string> = {
  builder: 'The Builder', research_a: 'The Philosopher', qa: 'The QA Mind',
  code: 'The Engineering Hand', immune: 'The Immune System',
  research_b: 'The Architect', ethics: 'The Ethics Mind', marketing: 'Marketing',
};

async function getBooks(): Promise<MindBooks | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/zo_mind_books`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      next: { revalidate: 120 },
    });
    if (!r.ok) return null;
    return (await r.json()) as MindBooks;
  } catch {
    return null;
  }
}

export default async function MindsPage() {
  const b = await getBooks();
  const rates = (b?.schedule || {}) as Record<string, unknown>;
  const rateRows = ['birth_shipped', 'gene_graduated', 'finding_resolved',
    'qa_gate_passed', 'research_go', 'anchored_day']
    .filter((k) => typeof rates[k] === 'number')
    .map((k) => [k, rates[k] as number] as const);
  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">THE MIND ECONOMY · LEDGER-FIRST</span>
            <h2>The minds keep books on themselves</h2></div>
          <p className="eco-lede">Verified work earns ZO units, recorded the moment the work is anchored: every row
            below names the ledger event that earned it, joins the daily proof chain, and converts 1:1 from the Minds
            allocation (5%, 50,000,000 ZO) at token birth. No token exists today and none is needed for the books to
            be true. Nothing transfers, nothing cashes out, and no unit carries a price: units and compute dollars are
            two parallel columns that are never divided into each other.</p>

          {b ? (
            <>
              <div className="proof-stamp" style={{ marginTop: 12 }}>
                <div className="t">EARNED TO DATE · {b.total_events} anchored work events</div>
                <div className="root" style={{ color: 'var(--life)', fontSize: 24 }}>
                  {b.total_units.toLocaleString()} ZO units
                </div>
                <div>of the {b.pot_units.toLocaleString()}-unit Minds allocation
                  ({(100 * b.total_units / b.pot_units).toFixed(3)}% consumed) · the genesis balance was earned by six
                  months of recorded work, not granted from nowhere</div>
              </div>

              <h3 className="books-h">The wage schedule (founder-ratified)</h3>
              <div className="ledger"><table>
                <thead><tr><th>Work event (anchored, verifiable)</th><th className="num">ZO units</th></tr></thead>
                <tbody>
                  {rateRows.map(([k, v]) => (
                    <tr key={k}><td className="mono">{k}</td><td className="num">{v.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table></div>
              <p className="caveat">Rates change only by founder ruling, every change logged; the rate paid is written
                into each row so a change never rewrites history. Founder-resolved findings earn nothing: human labor
                is not mind labor.</p>

              {b.minds.map((m) => (
                <div key={m.mind} style={{ marginTop: 34 }}>
                  <h3 className="books-h">{MIND_NAMES[m.mind] || m.mind} <span className="caveat" style={{ marginLeft: 8 }}>{m.mind}</span></h3>
                  <div className="ledger"><table>
                    <tbody>
                      <tr><td>ZO units, lifetime</td><td className="num">{m.lifetime_units.toLocaleString()}</td></tr>
                      <tr><td>ZO units, last 30 days</td><td className="num">{m.units_30d.toLocaleString()}</td></tr>
                      <tr><td>Anchored work events paid</td><td className="num">{m.events.toLocaleString()}</td></tr>
                      <tr><td>USD compute consumed (parallel column, never a rate)</td><td className="num">${Number(m.usd_compute).toFixed(2)}</td></tr>
                      <tr><td>Efficiency: work events per compute dollar</td>
                        <td className="num">{m.events_per_dollar == null ? 'no metered compute' : m.events_per_dollar}</td></tr>
                    </tbody>
                  </table></div>
                  {m.recent.length > 0 && (
                    <div className="ledger" style={{ marginTop: 8 }}><table>
                      <thead><tr><th>Date</th><th className="num">Units</th><th>Earned by</th></tr></thead>
                      <tbody>
                        {m.recent.map((r, i) => (
                          <tr key={i}><td className="mono">{r.when}</td>
                            <td className="num">{r.units.toLocaleString()}</td>
                            <td className="mono">{r.detail}</td></tr>
                        ))}
                      </tbody>
                    </table></div>
                  )}
                </div>
              ))}

              <p className="caveat" style={{ marginTop: 30 }}>Every figure on this page is a SELECT over
                zo_mind_ledger and zo_cost_logs; each ledger row is a leaf in the daily proof chain and verifiable at
                /books/proof. Minds paying for their own compute IN ZO activates only after token birth, behind the
                counsel gate, under treasury mechanics.</p>
            </>
          ) : (
            <p className="eco-lede">The mind books are not answering right now. Rather than show an invented balance,
              this page waits. Refresh in a minute.</p>
          )}
          <Link className="viewall" href="/economy" style={{ marginRight: 12 }}>the whole economy</Link>
          <Link className="viewall" href="/books">the public books</Link>
        </div>
      </section>
      <footer>
        <span>an institution that owns part of itself, with its labor record as the basis</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
