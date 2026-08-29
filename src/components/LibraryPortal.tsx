'use client';

// #306 T3/T4: THE SUPPORTER LIBRARY. Magic-link entry; the proven genes and
// their harvest records lead (the lessons are the product; the code is the
// artifact). Supporter access, never charity; the library carries no price.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface LGene {
  id: string; name: string; cat: string; origin: string | null; used: number;
  q: number; status: string; born: string; d: string;
  harvest: { status: string; detail: string; when: string } | null;
}
interface GeneFull {
  id: string; name: string; description: string; category: string;
  used: number; q: number; born: string; content: string;
  harvest: { status: string; detail: string; when: string }[];
}

async function api(action: string, payload: Record<string, unknown>) {
  const r = await fetch('/api/library', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return r.json().catch(() => ({ ok: false, reason: 'no answer' }));
}

function loadSession(): string {
  try { return localStorage.getItem('zo_library_session') || ''; } catch { return ''; }
}
function saveSession(s: string) {
  try { if (s) localStorage.setItem('zo_library_session', s); else localStorage.removeItem('zo_library_session'); } catch { /* private mode */ }
}

export default function LibraryPortal() {
  const [phase, setPhase] = useState<'boot' | 'login' | 'shelf'>('boot');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [session, setSession] = useState('');
  const [genes, setGenes] = useState<LGene[]>([]);
  const [counts, setCounts] = useState<{ modules?: number; proven?: number }>({});
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<GeneFull | null>(null);
  const [busy, setBusy] = useState(false);

  const shelf = useCallback(async (sess: string) => {
    const d = await api('genes', { session: sess });
    if (d?.ok) { setGenes(d.genes || []); setCounts(d.counts || {}); setPhase('shelf'); }
    else { saveSession(''); setSession(''); setPhase('login'); if (d?.reason) setMsg(d.reason); }
  }, []);

  useEffect(() => {
    (async () => {
      const m = (typeof window !== 'undefined' ? window.location.hash : '').match(/#t=([A-Za-z0-9_-]+)/);
      if (m) {
        history.replaceState(null, '', window.location.pathname);
        const d = await api('session', { token: m[1] });
        if (d?.ok && d.session) { saveSession(d.session); setSession(d.session); await shelf(d.session); return; }
        setMsg(d?.reason || 'that link did not work; request a new one');
      }
      const sess = loadSession();
      if (sess) { setSession(sess); await shelf(sess); return; }
      setPhase('login');
    })();
  }, [shelf]);

  const sendLink = async () => {
    setBusy(true); setMsg('');
    const d = await api('login', { email: email.trim() });
    setBusy(false);
    if (d?.sent) setSent(true); else setMsg(d?.reason || 'could not send the link');
  };

  const openGene = async (id: string) => {
    setBusy(true);
    const d = await api('gene', { session, id });
    setBusy(false);
    if (d?.ok) setOpen(d.gene); else setMsg(d?.reason || 'could not open the gene');
  };

  const q = search.trim().toLowerCase();
  const visible = genes.filter((g) => !q || g.name.toLowerCase().includes(q) || g.id.includes(q) || g.cat.includes(q));
  const proven = visible.filter((g) => g.used >= 10);
  const rest = visible.filter((g) => g.used < 10);

  const row = (g: LGene) => (
    <tr key={g.id} style={{ cursor: 'pointer' }} onClick={() => openGene(g.id)}>
      <td className="mono">{g.id}</td>
      <td>{g.name}</td>
      <td className="num">{g.used}</td>
      <td className="mono">{g.harvest ? `${g.harvest.status} · ${g.harvest.when}` : g.status}</td>
    </tr>
  );

  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">SUPPORTER LIBRARY</span>
            <h2>The full gene library</h2></div>

          {phase === 'boot' && <p className="eco-lede">Opening the library&hellip;</p>}

          {phase === 'login' && (
            <>
              <p className="eco-lede">Supporters read everything: the proven genes, the failures, the fixes. Any
                amount. Same access. Access arrives automatically with any contribution; enter the email from yours
                and a one-time link arrives there. The public <Link href="/genome">playground</Link> and the{' '}
                <Link href="/genome/sample">free sample gene</Link> are open to everyone.</p>
              {!sent ? (
                <div className="rail" style={{ marginTop: 22, gap: 12 }}>
                  <input type="email" placeholder="the email from your contribution" aria-label="Supporter email"
                    value={email} onChange={(e) => setEmail(e.target.value)} style={{ minWidth: 300 }} />
                  <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                    onClick={sendLink} disabled={busy} type="button">{busy ? 'sending' : 'Email me the library link'}</button>
                </div>
              ) : (
                <div className="gatebox" style={{ marginTop: 22 }}>
                  <p className="eco-label life">SENT, IF A SUPPORTER RECORD EXISTS</p>
                  <p>Check that mailbox. The link lasts 30 minutes. If no record exists there, the email says so
                    honestly; access opens with any contribution at the <Link href="/#support">support folio</Link>.</p>
                </div>
              )}
            </>
          )}

          {phase === 'shelf' && !open && (
            <>
              <p className="eco-lede">{counts.modules ?? genes.length} genes on the shelf, {counts.proven ?? proven.length} proven
                in ten or more builds. The proven genes lead; each carries its harvest record where one exists: what it
                does, where it ran, what broke, what fixed it.</p>
              <div className="rail" style={{ margin: '14px 0', gap: 12 }}>
                <input type="search" placeholder="search the library" aria-label="Search genes"
                  value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 260 }} />
              </div>
              <h3 className="books-h">Proven genes</h3>
              <div className="ledger"><table>
                <thead><tr><th>Gene</th><th>Carries</th><th className="num">Uses</th><th>Record</th></tr></thead>
                <tbody>{proven.map(row)}</tbody>
              </table></div>
              <h3 className="books-h">In gestation</h3>
              <div className="ledger"><table>
                <thead><tr><th>Gene</th><th>Carries</th><th className="num">Uses</th><th>Record</th></tr></thead>
                <tbody>{rest.map(row)}</tbody>
              </table></div>
              <p className="caveat" style={{ marginTop: 14 }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--bone-faint)', cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}
                  onClick={() => { saveSession(''); setSession(''); setPhase('login'); }} type="button">Log out on this device</button>
              </p>
            </>
          )}

          {phase === 'shelf' && open && (
            <>
              <button className="viewall" style={{ cursor: 'pointer', background: 'none', marginBottom: 16 }}
                onClick={() => setOpen(null)} type="button">back to the shelf</button>
              <h3 className="books-h">{open.name}</h3>
              <p className="caveat">{open.id} · {open.category} · used {open.used} times · born {open.born}</p>
              {open.description && <p className="eco-lede">{open.description}</p>}
              {open.harvest.length > 0 && (
                <>
                  <h3 className="books-h">Harvest record</h3>
                  <div className="ledger"><table><tbody>
                    {open.harvest.map((h, i) => (
                      <tr key={i}><td className="mono">{h.when}</td><td className="mono">{h.status}</td><td>{h.detail}</td></tr>
                    ))}
                  </tbody></table></div>
                </>
              )}
              <h3 className="books-h">The gene, in full</h3>
              <div className="ledger" style={{ padding: '18px 20px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--mono, monospace)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--bone-dim)', margin: 0, overflowX: 'auto' }}>{open.content || 'this gene carries no stored text'}</pre>
              </div>
            </>
          )}

          {msg && <p className="caveat" style={{ marginTop: 18, color: 'var(--gold)' }}>{msg}</p>}
        </div>
      </section>
      <footer>
        <span>the lessons are the product; the code is the artifact</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
