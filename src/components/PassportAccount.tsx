'use client';

// REC #310 P3 — THE PERSONAL LEDGER. One identity that outlives products: the
// ways you have proven who you are, what you are entitled to, and every public
// ledger row that belongs to you, each with the same proof drawer the public
// books use (#4545). Nothing here is a second account system: the link is the
// #304 magic link and the wallet proof is the #304 signature.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ProofCell from '@/components/ProofCell';

interface Binding { id: string; kind: string; hint: string | null; method: string; verified_at: string | null }
interface LedgerRow {
  kind: string; date: string; amount: string; public_name: string; method: string;
  proof: { entry_id: string; table: string };
}
interface View {
  ok: boolean; reason?: string; passport_id?: string; email_masked?: string;
  bindings?: Binding[];
  entitlements?: { credits_balance_cents?: number; library?: { status: string; github: string | null } };
  ledger?: LedgerRow[]; deletion_note?: string;
}

async function api(action: string, payload: Record<string, unknown>) {
  const r = await fetch('/api/passport', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return r.json().catch(() => ({ ok: false, reason: 'no answer' }));
}

function loadSession(): string {
  try { return localStorage.getItem('zo_passport_session') || ''; } catch { return ''; }
}
function saveSession(s: string) {
  try { if (s) localStorage.setItem('zo_passport_session', s); else localStorage.removeItem('zo_passport_session'); }
  catch { /* private mode: the session simply does not persist */ }
}

export default function PassportAccount() {
  const [phase, setPhase] = useState<'login' | 'boot' | 'account'>('login');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState('');
  const [v, setV] = useState<View | null>(null);
  const [wallet, setWallet] = useState('');
  const [sig, setSig] = useState('');
  const [nonce, setNonce] = useState('');

  const refresh = useCallback(async (s: string) => {
    const d = await api('view', { session: s });
    if (d?.ok) { setV(d); setPhase('account'); }
    else { saveSession(''); setSession(''); setPhase('login'); if (d?.reason) setMsg(d.reason); }
  }, []);

  useEffect(() => {
    (async () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const m = hash.match(/#t=([A-Za-z0-9_-]+)/);
      if (m) {
        setPhase('boot');
        history.replaceState(null, '', window.location.pathname);
        const d = await api('session', { token: m[1] });
        if (d?.ok && d.session) { saveSession(d.session); setSession(d.session); await refresh(d.session); return; }
        setMsg(d?.reason || 'that link did not work; request a new one');
        setPhase('login');
        return;
      }
      // GitHub returns with a PKCE ?code= that must be EXCHANGED for a
      // session. The first version called getSession() straight away and
      // raced the client's own background exchange, so the door recorded
      // nothing and said nothing — the founder clicked and landed nowhere.
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const oauthErr = params.get('error_description') || params.get('error');
      if (oauthErr) {
        setMsg(`GitHub sign-in failed: ${oauthErr}`);
        history.replaceState(null, '', window.location.pathname);
      } else if (code || params.get('github') === '1') {
        setPhase('boot');
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
          let at = '';
          if (code) {
            const { data, error } = await sb.auth.exchangeCodeForSession(code);
            if (error) setMsg(`GitHub sign-in failed: ${error.message}`);
            at = data?.session?.access_token || '';
          }
          if (!at) {
            const { data } = await sb.auth.getSession();
            at = data?.session?.access_token || '';
          }
          history.replaceState(null, '', window.location.pathname);
          if (at) {
            const d = await api('github', { access_token: at });
            if (d?.ok) {
              setMsg(`GitHub verified as ${d.github}.` + (d.library?.granted
                ? ' Library access is now granted to that account.'
                : ' No library entitlement on this address yet.'));
              if (d.session) { saveSession(d.session); setSession(d.session); await refresh(d.session); return; }
            } else {
              setMsg(d?.reason || 'that GitHub session could not be verified');
            }
          } else if (!oauthErr) {
            setMsg('GitHub returned no session; nothing was changed.');
          }
        } catch (e) {
          setMsg(`the GitHub session could not be read: ${(e as Error).message}`);
        }
        setPhase('login');
      }
      const s = loadSession();
      if (s) { setPhase('boot'); setSession(s); await refresh(s); }
      else setPhase('login');
    })();
  }, [refresh]);

  // REC #310 Phase A, the fourth door. The browser never tells the machine who
  // it is: it hands over the Supabase session and the machine asks Supabase.
  const signInWithGithub = async () => {
    setMsg('');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/account` },
      });
      if (error) setMsg(`GitHub sign-in could not start: ${error.message}`);
    } catch {
      setMsg('GitHub sign-in could not start; the email link still works.');
    }
  };

  const sendLink = async () => {
    setBusy(true); setMsg('');
    const d = await api('login', { email: email.trim() });
    setBusy(false);
    if (d?.sent) setSent(true); else setMsg(d?.reason || 'the link could not be sent');
  };

  const getNonce = async () => {
    const d = await api('wallet_nonce', { session });
    if (d?.ok) setNonce(d.message); else setMsg(d?.reason || 'could not issue the message');
  };

  const bind = async () => {
    setBusy(true); setMsg('');
    const d = await api('wallet_bind', { session, wallet: wallet.trim(), signature: sig.trim() });
    setBusy(false);
    if (d?.ok) {
      setMsg(d.already ? 'that wallet was already yours'
        : `wallet bound${d.deposits_recognized ? ` · ${d.deposits_recognized} deposit(s) recognized as yours` : ''}`);
      setWallet(''); setSig(''); setNonce('');
      await refresh(session);
    } else setMsg(d?.reason || 'the wallet could not be bound');
  };

  const revoke = async (id: string) => {
    setBusy(true); setMsg('');
    const d = await api('revoke', { session, binding_id: id });
    setBusy(false);
    setMsg(d?.ok ? `revoked${d.public_rows_anonymized ? ` · ${d.public_rows_anonymized} public row(s) are anonymous again` : ''}`
      : d?.reason || 'could not revoke');
    await refresh(session);
  };

  const usd = (c: number) => '$' + (c / 100).toFixed(2);

  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">PASSPORT</span>
            <h2>One identity, older than any product</h2></div>

          {phase === 'boot' && <p className="eco-lede">Opening your passport&hellip;</p>}

          {phase === 'login' && (
            <>
              <p className="eco-lede">Products are mortal here: the graveyard is a published feature. So identity
                lives with the ecosystem, not inside a product. This page shows what the machine knows about you,
                what you are entitled to, and every public ledger row that is yours, each with its own proof. Log in
                with an email the machine already knows; the link is single use and no password exists.</p>
              {!sent ? (
                <div className="rail" style={{ marginTop: 22, gap: 12 }}>
                  <input type="email" placeholder="the email the machine knows you by" aria-label="Passport email"
                    value={email} onChange={(e) => setEmail(e.target.value)} style={{ minWidth: 320 }} />
                  <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                    onClick={sendLink} disabled={busy} type="button">{busy ? 'sending' : 'Email me a link'}</button>
                  <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                    onClick={signInWithGithub} type="button">Continue with GitHub</button>
                </div>
              ) : (
                <div className="gatebox" style={{ marginTop: 22 }}>
                  <p className="eco-label life">SENT, IF A PASSPORT EXISTS</p>
                  <p>Check that mailbox. The link lasts 20 minutes and works once. If nothing is bound to that
                    address the email says so honestly; a passport opens by itself when you buy credits, support
                    the machine, or receive library access.</p>
                </div>
              )}
              {msg && <p className="caveat" style={{ color: 'var(--blood)', marginTop: 14 }}>{msg}</p>}
            </>
          )}

          {phase === 'account' && v?.ok && (
            <>
              <p className="eco-lede">Passport <b className="mono">{v.passport_id}</b> &middot; {v.email_masked}</p>
              {msg && <p className="caveat" style={{ color: 'var(--life)' }}>{msg}</p>}

              <h3 className="books-h">How you have proven who you are</h3>
              <div className="ledger"><table>
                <thead><tr><th>Kind</th><th>Value</th><th>Proven by</th><th>Verified</th><th /></tr></thead>
                <tbody>
                  {(v.bindings || []).map((b) => (
                    <tr key={b.id}>
                      <td className="mono">{b.kind}</td>
                      <td className="mono">{b.hint || '—'}</td>
                      <td className="mono">{b.method}</td>
                      <td className="mono">{b.verified_at ? String(b.verified_at).slice(0, 10)
                        : <span className="dimcell">inherited, not yet proven here</span>}</td>
                      <td><button className="pf-btn" type="button" disabled={busy}
                        onClick={() => revoke(b.id)}>revoke</button></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              <p className="caveat">A binding stores a hash of the value, never the value: the machine can recognize
                you without holding you. These are the hints it can show back.</p>

              <h3 className="books-h">Prove a wallet</h3>
              <p className="eco-lede">This is how money finds its owner. Sign the exact message below with the wallet
                you send from; the machine verifies the signature and recognizes deposits from that wallet as yours.
                Being <i>named</i> in the public ledger stays a separate, explicit choice.</p>
              <div className="rail" style={{ marginTop: 14, gap: 12 }}>
                <input type="text" placeholder="your Solana address" aria-label="Wallet"
                  value={wallet} onChange={(e) => setWallet(e.target.value)} style={{ minWidth: 300 }} />
                <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                  onClick={getNonce} type="button">Show the message to sign</button>
              </div>
              {nonce && (
                <div className="proof-stamp" style={{ marginTop: 14 }}>
                  <div className="t">Sign exactly this, in your wallet</div>
                  <div className="root" style={{ whiteSpace: 'pre-wrap' }}>{nonce}</div>
                  <div className="rail" style={{ marginTop: 12, gap: 12 }}>
                    <input type="text" placeholder="paste the signature (base64)" aria-label="Signature"
                      value={sig} onChange={(e) => setSig(e.target.value)} style={{ minWidth: 320 }} />
                    <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                      onClick={bind} disabled={busy} type="button">{busy ? 'verifying' : 'Bind this wallet'}</button>
                  </div>
                </div>
              )}

              <h3 className="books-h">What you are entitled to</h3>
              <div className="ledger"><table>
                <tbody>
                  <tr><td>ZO Credits balance</td><td className="num">
                    {typeof v.entitlements?.credits_balance_cents === 'number'
                      ? usd(v.entitlements.credits_balance_cents) : <span className="dimcell">no credits account</span>}</td></tr>
                  <tr><td>Genome library</td><td className="num">
                    {v.entitlements?.library
                      ? `${v.entitlements.library.status}${v.entitlements.library.github ? ' · ' + v.entitlements.library.github : ''}`
                      : <span className="dimcell">not granted</span>}</td></tr>
                </tbody>
              </table></div>

              <h3 className="books-h">Your rows in the public books</h3>
              <div className="ledger"><table>
                <thead><tr><th>Date</th><th>Kind</th><th className="num">Amount</th><th>Printed as</th><th>Proof</th></tr></thead>
                <tbody>
                  {(v.ledger || []).map((r, i) => (
                    <tr key={i}>
                      <td className="mono">{r.date}</td><td className="mono">{r.kind}</td>
                      <td className="num">{r.amount}</td><td>{r.public_name}</td>
                      <td>{r.proof?.entry_id
                        ? <ProofCell entryId={r.proof.entry_id} table={r.proof.table} compact />
                        : <span className="dimcell">—</span>}</td>
                    </tr>
                  ))}
                  {(v.ledger || []).length === 0 && (
                    <tr><td colSpan={5} className="mono">No public rows belong to this passport yet.</td></tr>
                  )}
                </tbody>
              </table></div>

              <h3 className="books-h">Your data, and one honest limit</h3>
              <p className="caveat">{v.deletion_note}</p>
              <button className="viewall" style={{ cursor: 'pointer', background: 'none' }} type="button"
                onClick={async () => {
                  const d = await api('export', { session });
                  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `zeroorigine-passport-${v.passport_id}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}>Export everything as JSON</button>
              <button className="viewall" style={{ cursor: 'pointer', background: 'none', marginLeft: 14 }}
                type="button" onClick={() => { saveSession(''); setSession(''); setV(null); setPhase('login'); }}>
                Sign out of this browser</button>
            </>
          )}
        </div>
      </section>
      <footer>
        <span>the ecosystem holds the person; a product holds only a claim</span>
        <span className="right"><Link href="/books">the public books</Link></span>
      </footer>
    </main>
  );
}
