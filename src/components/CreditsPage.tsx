'use client';

// #299: the /credits purchase surface. Four packs, one email (the account
// key), the existing Stripe rails through /api/credits, and the language
// law printed verbatim (C4). Machine voice, no em dash, honest everywhere.

import { useState } from 'react';
import Link from 'next/link';

const PACKS = [10, 25, 50, 100];

export default function CreditsPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState('');

  const buy = async (pack: number) => {
    setErr('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setErr('Enter the email that will own the credits first. It is the account key and the receipt address.');
      return;
    }
    setBusy(pack);
    try {
      const r = await fetch('/api/credits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, email: email.trim() }),
      });
      const d = await r.json().catch(() => null);
      if (d?.ok && d.checkout_url) { window.location.href = d.checkout_url; return; }
      setErr(d?.error || 'Checkout could not be created. Nothing was charged.');
    } catch {
      setErr('Checkout could not be created. Nothing was charged.');
    }
    setBusy(null);
  };

  return (
    <main style={{ opacity: 1 }}>
      <nav aria-label="Primary">
        <span className="wordmark">Zero<b>Origine</b></span>
        <span className="links">
          <Link href="/">Organism</Link><Link href="/books">Books</Link>
          <Link href="/law">Law</Link><Link href="/economy">Economy</Link>
          <a href="/credits" style={{ color: 'var(--life)' }}>Credits</a>
        </span>
      </nav>

      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">PHASE 1 · OPEN BY FOUNDER RULING</span><h2>ZO Credits</h2><span className="eco-label right">ONE BALANCE, EVERY PRODUCT</span></div>
          <p className="eco-lede">One balance, bought with ordinary money, spendable across every product the machine has
            ever born. Every purchase is an append-only row in the credits ledger, and every row becomes a leaf in the
            day&apos;s proof chain, anchored on Solana. The books watch this money like they watch everything else.</p>

          <div className="gatebox" style={{ marginTop: 34 }}>
            <p className="eco-label gold">THE LANGUAGE LAW, VERBATIM</p>
            <p>Credits are product prepayment; they convert 1:1 into ZO only at token birth; no resale, no transfer,
              no yield, not an investment.</p>
          </div>

          <div className="rail" style={{ marginTop: 34 }}>
            <input
              type="email" placeholder="the email that owns the credits" aria-label="Account email"
              value={email} onChange={(e) => setEmail(e.target.value)} style={{ minWidth: 300 }}
            />
          </div>
          <div className="meters" style={{ marginTop: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', display: 'grid' }}>
            {PACKS.map((p) => (
              <div className="meter" key={p} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--gold)' }}>${p}</div>
                <p style={{ color: 'var(--bone-dim)', fontSize: 15, margin: '8px 0 14px' }}>{p * 100} credit cents</p>
                <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                  onClick={() => buy(p)} disabled={busy !== null}>
                  {busy === p ? 'opening checkout' : 'Buy this pack'}
                </button>
              </div>
            ))}
          </div>
          {err && <p className="caveat" style={{ color: 'var(--blood)', marginTop: 14 }}>{err}</p>}

          <h3 className="books-h">How spending works today</h3>
          <p className="eco-lede">Credits redeem against any product subscription in the fleet. The automated
            at-checkout redemption is being wired product by product; until it reaches a product you use, redemption is
            honored on request from your account email, within a day, and every spend is recorded as an append-only
            ledger entry you can verify in the public books. No credit ever expires while the machine lives.</p>

          <h3 className="books-h">The bridge clause</h3>
          <p className="eco-lede">Credits convert 1:1 into ZO on the day the token is born, read from this same ledger.
            Buying credits is how the public arrives early, without a token sale ever happening. If the gates never pass
            and the token is never born, your credits remain what they always were: prepayment for real products,
            spendable in full.</p>

          <Link className="viewall" href="/economy">read the whole economy</Link>
        </div>
      </section>

      <footer>
        <span>every purchase enters the anchored books · <Link href="/books">see the ledger</Link></span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
