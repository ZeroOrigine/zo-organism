'use client';

// #300 A1: pledge form -> memo code + the published wallet. The machine only
// RECEIVES on this rail; every deposit becomes a public books row within the
// hour, named when the memo matches a pledge, anonymous otherwise.

import { useState } from 'react';
import Link from 'next/link';

const WALLET = 'BQeNktmf4DAeetsxwCjVZwAzsAwCwkbvL1kSf9nUGXqQ';

export default function CryptoSupport() {
  const [name, setName] = useState('');
  const [asset, setAsset] = useState<'usdc' | 'sol'>('usdc');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pledge = async () => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/crypto-pledge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), asset }),
      });
      const d = await r.json().catch(() => null);
      if (d?.memo_code) { setMemo(d.memo_code); } else { setErr('The pledge could not be recorded. Refresh and try again.'); }
    } catch { setErr('The pledge could not be recorded. Refresh and try again.'); }
    setBusy(false);
  };

  return (
    <main style={{ opacity: 1 }}>
      <nav aria-label="Primary">
        <span className="wordmark">Zero<b>Origine</b></span>
        <span className="links">
          <Link href="/">Organism</Link><Link href="/books">Books</Link>
          <Link href="/economy">Economy</Link><Link href="/credits">Credits</Link>
        </span>
      </nav>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">SUPPORT · CRYPTO</span><h2>Send SOL or USDC, enter the books</h2></div>
          <p className="eco-lede">The machine holds a dedicated, receive-only donation wallet on Solana mainnet, separate
            from its anchoring key. Every deposit is read by a watcher within the hour and written into the same public,
            chain-anchored books as every card payment. This wallet only receives; nothing here yields, converts, or
            trades.</p>

          <div className="gatebox" style={{ marginTop: 30 }}>
            <p className="eco-label gold">THE WALLET</p>
            <p style={{ wordBreak: 'break-all' }}>{WALLET}</p>
          </div>

          <h3 className="books-h">To be named in the supporter ledger</h3>
          <p className="eco-lede">Announce the donation first: you get a memo code, and the deposit carrying it enters the
            books under your name. A deposit without a memo still counts; it is simply recorded as anonymous.</p>
          <div className="rail" style={{ marginTop: 18, gap: 12 }}>
            <input type="text" placeholder="name for the ledger (as you want it printed)" aria-label="Supporter name"
              value={name} onChange={(e) => setName(e.target.value)} style={{ minWidth: 280 }} />
            <button className={'viewall'} style={{ marginTop: 0, cursor: 'pointer', background: asset === 'usdc' ? 'var(--life)' : 'none', color: asset === 'usdc' ? 'var(--void)' : 'var(--life)' }} onClick={() => setAsset('usdc')} type="button">USDC</button>
            <button className={'viewall'} style={{ marginTop: 0, cursor: 'pointer', background: asset === 'sol' ? 'var(--life)' : 'none', color: asset === 'sol' ? 'var(--void)' : 'var(--life)' }} onClick={() => setAsset('sol')} type="button">SOL</button>
            <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }} onClick={pledge} disabled={busy} type="button">
              {busy ? 'recording' : 'Get my memo code'}
            </button>
          </div>
          {memo && (
            <div className="proof-stamp" style={{ marginTop: 18 }}>
              <div className="t">Your memo code</div>
              <div className="root" style={{ fontSize: 18, color: 'var(--life)' }}>{memo}</div>
              <div>Send {asset.toUpperCase()} on Solana mainnet to the wallet above WITH THIS MEMO. The books record it
                within the hour under the name you gave.</div>
            </div>
          )}
          {err && <p className="caveat" style={{ color: 'var(--blood)' }}>{err}</p>}

          <p className="caveat" style={{ marginTop: 26 }}>USDC is valued 1:1; SOL is valued at the market rate at the
            moment of recording, and the rate is written into the books row. Crypto support is a donation to the
            machine&apos;s work: no yield, no token, no promise beyond a public, verifiable record.</p>
          <Link className="viewall" href="/books">see the supporter ledger</Link>
        </div>
      </section>
      <footer>
        <span>every deposit becomes a leaf in the day&apos;s proof chain</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
