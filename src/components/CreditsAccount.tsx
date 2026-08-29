'use client';

// #304: THE CREDITS ACCOUNT — one ledger, two views. The holder sees exactly
// the rows the machine's public books hash and anchor, with a proof link per
// entry. Magic-link identity; optional wallet binding (signature only, never
// a transaction) that becomes the ZO conversion address at token birth.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const RAILWAY = 'https://zo-langgraph-production-3c96.up.railway.app';

interface Entry { id: string; kind: string; amount_cents: number; note: string; date: string; proof_url: string }
interface Statement {
  ok: boolean; reason?: string; email_masked: string; balance_cents: number; cap_cents: number;
  entries: Entry[]; wallet: string | null;
  wallet_history: { wallet: string; action: string; date: string }[];
}
interface LiveProduct { slug: string; name: string }

async function api(action: string, payload: Record<string, unknown>) {
  const r = await fetch('/api/credits-account', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return r.json().catch(() => ({ ok: false, reason: 'no answer' }));
}

function loadSession(): string {
  try { return localStorage.getItem('zo_credits_session') || ''; } catch { return ''; }
}
function saveSession(s: string) {
  try { if (s) localStorage.setItem('zo_credits_session', s); else localStorage.removeItem('zo_credits_session'); } catch { /* private mode */ }
}

export default function CreditsAccount({ products }: { products: LiveProduct[] }) {
  const [phase, setPhase] = useState<'boot' | 'login' | 'account'>('boot');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [st, setSt] = useState<Statement | null>(null);
  const [session, setSession] = useState('');
  const [busy, setBusy] = useState(false);
  const [spendProduct, setSpendProduct] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const refresh = useCallback(async (sess: string) => {
    const d = await api('statement', { session: sess });
    if (d?.ok) { setSt(d as Statement); setPhase('account'); }
    else { saveSession(''); setSession(''); setPhase('login'); if (d?.reason) setMsg(d.reason); }
  }, []);

  useEffect(() => {
    (async () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const m = hash.match(/#t=([A-Za-z0-9_-]+)/);
      if (m) {
        history.replaceState(null, '', window.location.pathname);
        const d = await api('session', { token: m[1] });
        if (d?.ok && d.session) { saveSession(d.session); setSession(d.session); await refresh(d.session); return; }
        setMsg(d?.reason || 'that link did not work; request a new one');
      }
      const sess = loadSession();
      if (sess) { setSession(sess); await refresh(sess); return; }
      setPhase('login');
    })();
  }, [refresh]);

  const sendLink = async () => {
    setBusy(true); setMsg('');
    const d = await api('login', { email: email.trim() });
    setBusy(false);
    if (d?.sent) setSent(true); else setMsg(d?.reason || 'could not send the link');
  };

  const linkWallet = async () => {
    setBusy(true); setMsg('');
    try {
      const sol = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString(): string } }>; signMessage: (m: Uint8Array, e: string) => Promise<{ signature: Uint8Array }> } }).solana;
      if (!sol) { setMsg('No Solana wallet found. Install Phantom, then try again.'); setBusy(false); return; }
      const conn = await sol.connect();
      const wallet = conn.publicKey.toString();
      const n = await api('wallet_nonce', { session });
      if (!n?.ok) { setMsg(n?.reason || 'could not start the binding'); setBusy(false); return; }
      const signed = await sol.signMessage(new TextEncoder().encode(n.message), 'utf8');
      const sigB64 = btoa(String.fromCharCode(...Array.from(signed.signature)));
      const d = await api('wallet_link', { session, wallet, nonce: n.nonce, signature: sigB64 });
      if (d?.ok) { setMsg('Wallet linked. The binding is a ledger row and joins tonight’s anchored root.'); await refresh(session); }
      else setMsg(d?.reason || 'the binding was refused');
    } catch {
      setMsg('The wallet did not complete the signature. Nothing was linked.');
    }
    setBusy(false);
  };

  const unlinkWallet = async () => {
    setBusy(true);
    const d = await api('wallet_unlink', { session });
    setMsg(d?.ok ? 'Unlinked. The full history stays in the books.' : d?.reason || 'could not unlink');
    await refresh(session); setBusy(false);
  };

  const doSpend = async () => {
    setBusy(true); setMsg('');
    const cents = Math.round(parseFloat(spendAmount || '0') * 100);
    const d = await api('spend', { session, product: spendProduct, amount_cents: cents });
    if (d?.ok) { setMsg(`$${(cents / 100).toFixed(2)} applied. Revenue is recognized at spend; the operator activates it on the product and confirms by email.`); setSpendAmount(''); await refresh(session); }
    else setMsg(d?.reason || 'the spend was refused');
    setBusy(false);
  };

  const doRefund = async () => {
    setBusy(true); setMsg('');
    const cents = Math.round(parseFloat(refundAmount || '0') * 100);
    const d = await api('refund_request', { session, amount_cents: cents });
    setMsg(d?.ok ? d.note : d?.reason || 'the request was refused');
    if (d?.ok) setRefundAmount('');
    setBusy(false);
  };

  const usd = (c: number) => (c < 0 ? '-$' : '$') + (Math.abs(c) / 100).toFixed(2);

  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">CREDITS · ACCOUNT</span><h2>Your side of the ledger</h2></div>

          {phase === 'boot' && <p className="eco-lede">Opening the ledger&hellip;</p>}

          {phase === 'login' && (
            <>
              <p className="eco-lede">One ledger, two views: this page shows you exactly the rows the machine publishes
                and anchors in its books. Log in with the email you bought credits with; a one-time link arrives there.
                No password exists to steal.</p>
              {!sent ? (
                <div className="rail" style={{ marginTop: 22, gap: 12 }}>
                  <input type="email" placeholder="the email on your credits purchase" aria-label="Account email"
                    value={email} onChange={(e) => setEmail(e.target.value)} style={{ minWidth: 300 }} />
                  <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                    onClick={sendLink} disabled={busy} type="button">{busy ? 'sending' : 'Email me a login link'}</button>
                </div>
              ) : (
                <div className="gatebox" style={{ marginTop: 22 }}>
                  <p className="eco-label life">SENT, IF AN ACCOUNT EXISTS</p>
                  <p>Check that mailbox. The link lasts 20 minutes and works once. If no account exists there, the
                    email says so honestly; an account opens with a first purchase at <Link href="/credits">/credits</Link>.</p>
                </div>
              )}
            </>
          )}

          {phase === 'account' && st && (
            <>
              <div className="proof-stamp" style={{ marginTop: 6 }}>
                <div className="t">{st.email_masked} · balance</div>
                <div className="root" style={{ fontSize: 26, color: 'var(--life)' }}>
                  {usd(st.balance_cents)} <span style={{ fontSize: 15, color: 'var(--bone-dim)' }}>&middot; {(st.balance_cents / 100).toFixed(2)} ZO CREDITS at face</span>
                </div>
                <div>of a ${st.cap_cents / 100} account cap · credits are prepayment, convert 1:1 into ZO at token birth ·
                  no resale, no transfer, no yield</div>
              </div>

              <h3 className="books-h">Statement</h3>
              <div className="ledger"><table>
                <thead><tr><th>Date</th><th>Entry</th><th className="num">Amount</th><th>Proof</th></tr></thead>
                <tbody>
                  {st.entries.map((e) => (
                    <tr key={e.id}>
                      <td className="mono">{e.date.slice(0, 10)}</td>
                      <td>{e.kind}{e.note ? ` · ${e.note}` : ''}</td>
                      <td className="num">{usd(e.amount_cents)}</td>
                      <td><a href={RAILWAY + e.proof_url} rel="noopener noreferrer" target="_blank">verify on-chain</a></td>
                    </tr>
                  ))}
                  {st.entries.length === 0 && (
                    <tr><td colSpan={4} className="mono">No entries yet.</td></tr>
                  )}
                </tbody>
              </table></div>
              <p className="caveat">Each proof link returns the entry&apos;s hash, its Merkle path, the day&apos;s chained root and
                the Solana transaction that anchors it. You verify; you never have to trust.</p>

              <h3 className="books-h">Conversion wallet</h3>
              {st.wallet ? (
                <>
                  <p className="eco-lede">Linked: <span style={{ fontFamily: 'var(--mono, monospace)', wordBreak: 'break-all' }}>{st.wallet}</span></p>
                  <p className="caveat">This address receives your ZO at token birth (1:1 by face value, behind the
                    Phase 2 gate). Every link and unlink is an anchored ledger row; the history below is permanent.</p>
                  <button className="viewall" style={{ cursor: 'pointer', background: 'none' }} onClick={unlinkWallet} disabled={busy} type="button">Unlink wallet</button>
                </>
              ) : (
                <>
                  <p className="eco-lede">Optionally bind a Solana wallet as your conversion address: at ZO&apos;s birth,
                    your credit balance converts 1:1 to this address. The binding is a signed message only — no
                    transaction, no funds move, ever.</p>
                  <button className="viewall" style={{ cursor: 'pointer', background: 'none' }} onClick={linkWallet} disabled={busy} type="button">
                    {busy ? 'waiting for the wallet' : 'Link a Solana wallet (sign a message)'}
                  </button>
                </>
              )}
              {st.wallet_history.length > 0 && (
                <p className="caveat" style={{ marginTop: 12 }}>
                  history: {st.wallet_history.map((h) => `${h.date.slice(0, 10)} ${h.action} ${h.wallet.slice(0, 6)}…`).join(' · ')}
                </p>
              )}

              <h3 className="books-h">Spend credits</h3>
              <p className="eco-lede">Apply credits to any live product. The spend debits your balance now and is
                recognized as revenue in the public books; the machine&apos;s operator activates it on your product account
                and confirms by email, usually within a day.</p>
              <div className="rail" style={{ marginTop: 14, gap: 12 }}>
                <select aria-label="Product" value={spendProduct} onChange={(e) => setSpendProduct(e.target.value)}>
                  <option value="">choose a product</option>
                  {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                </select>
                <input type="number" min="1" step="0.01" placeholder="amount USD" aria-label="Spend amount"
                  value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} style={{ width: 130 }} />
                <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                  onClick={doSpend} disabled={busy || !spendProduct || !spendAmount} type="button">Apply credits</button>
              </div>

              <h3 className="books-h">Refunds</h3>
              <p className="eco-lede">Unspent credits from the last 30 days are refundable to the original payment
                method only. Never cash, never a transfer: credits are not a money rail. The founder executes approved
                refunds at Stripe and the refund entry appears on this statement.</p>
              <div className="rail" style={{ marginTop: 14, gap: 12 }}>
                <input type="number" min="1" step="0.01" placeholder="amount USD" aria-label="Refund amount"
                  value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} style={{ width: 130 }} />
                <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                  onClick={doRefund} disabled={busy || !refundAmount} type="button">Request refund</button>
              </div>

              <p className="caveat" style={{ marginTop: 26 }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--bone-faint)', cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}
                  onClick={() => { saveSession(''); setSession(''); setSt(null); setPhase('login'); }} type="button">Log out on this device</button>
              </p>
            </>
          )}

          {msg && <p className="caveat" style={{ marginTop: 18, color: 'var(--gold)' }}>{msg}</p>}
        </div>
      </section>
      <footer>
        <span>the statement you see is the ledger the world can verify</span>
        <span className="right"><Link href="/books">the public books</Link></span>
      </footer>
    </main>
  );
}
