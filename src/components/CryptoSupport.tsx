'use client';

// #300 A1: pledge form -> memo code + the published wallet. The machine only
// RECEIVES on this rail; every deposit becomes a public books row within the
// hour, named when the memo matches a pledge, anonymous otherwise.

import { useState } from 'react';
import Link from 'next/link';

const WALLET = 'BQeNktmf4DAeetsxwCjVZwAzsAwCwkbvL1kSf9nUGXqQ';

export default function CryptoSupport() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<'usdc' | 'sol'>('usdc');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  // #4543: the claim door — signed message, never a pasted signature alone
  const [claimSig, setClaimSig] = useState('');
  const [claimName, setClaimName] = useState('');
  const [claimSignature, setClaimSignature] = useState('');
  const [claim, setClaim] = useState<{ ok: boolean; wallet?: string; asset?: string; amount?: number; message_template?: string } | null>(null);
  const [claimMsg, setClaimMsg] = useState('');
  const [claimOk, setClaimOk] = useState(false);

  const claimApi = async (action: string, payload: Record<string, unknown>) => {
    const r = await fetch('/api/crypto-claim', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    return r.json().catch(() => ({ ok: false, reason: 'no answer' }));
  };

  const prepare = async () => {
    setBusy(true); setClaimMsg(''); setClaim(null); setClaimOk(false);
    const d = await claimApi('prepare', { sig: claimSig.trim() });
    setBusy(false);
    if (d?.ok) {
      setClaim(d);
      if (d.already_named) setClaimMsg('that deposit already carries a name; a signed claim can still correct it');
    } else setClaimMsg(d?.reason || 'that deposit could not be found');
  };

  const verify = async () => {
    setBusy(true); setClaimMsg('');
    const d = await claimApi('verify', {
      sig: claimSig.trim(), name: claimName.trim(), signature: claimSignature.trim(),
    });
    setBusy(false);
    setClaimOk(!!d?.ok);
    setClaimMsg(d?.ok
      ? `Claimed. The books now print this deposit as ${d.donor_name}, and the reason is on the record.`
      : d?.reason || 'the claim could not be verified');
    if (d?.ok) { setClaimSignature(''); }
  };

  const pledge = async () => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/crypto-pledge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), asset, amount: amount.trim() || null }),
      });
      const d = await r.json().catch(() => null);
      if (d?.memo_code) { setMemo(d.memo_code); } else { setErr('The pledge could not be recorded. Refresh and try again.'); }
    } catch { setErr('The pledge could not be recorded. Refresh and try again.'); }
    setBusy(false);
  };

  return (
    <main style={{ opacity: 1 }}>
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
          <p className="eco-lede">Plainly, because a founder drill proved it on real money: <b>most wallets, Phantom
            included, cannot attach a memo to a token send at all.</b> If your wallet has a memo or note field, the code
            below is the simplest way to be named. If it does not, that is not your mistake and it is not a dead end:
            announce the donation here anyway, and the machine matches your deposit from evidence it can verify. A
            deposit it cannot attribute is still recorded, in full, as anonymous. Money that arrived is money on the
            books, named or not.</p>
          <div className="rail" style={{ marginTop: 18, gap: 12 }}>
            <input type="text" placeholder="name for the ledger (as you want it printed)" aria-label="Supporter name"
              value={name} onChange={(e) => setName(e.target.value)} style={{ minWidth: 280 }} />
            <input type="number" min="0" step="0.0001" placeholder="amount you will send" aria-label="Amount"
              value={amount} onChange={(e) => setAmount(e.target.value)} style={{ minWidth: 180 }} />
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
              <div>Send {asset.toUpperCase()} on Solana mainnet to the wallet above. <b>If your wallet offers a memo or
                note field, put this code in it</b> and the match is exact. If it does not offer one, send anyway: the
                watcher reads the deposit within the hour, and matches it to this announcement when the evidence is
                unambiguous. What it can never do is guess between two people who asked for the same credit, so if it
                cannot be sure, your deposit is recorded as anonymous rather than named wrongly.</div>
            </div>
          )}
          {err && <p className="caveat" style={{ color: 'var(--blood)' }}>{err}</p>}

          <h3 className="books-h">Already sent it? Claim the deposit</h3>
          <p className="eco-lede">Paste the transaction and the machine will tell you which wallet paid. Then sign one
            line with that wallet and the deposit takes the name you choose. Pasting the transaction alone proves
            nothing, and the machine says so plainly: the chain is public, so anyone could paste anyone&apos;s. The
            signature is the proof, and every wallet can sign a message even when it cannot write a memo.</p>
          <div className="rail" style={{ marginTop: 14, gap: 12 }}>
            <input type="text" placeholder="your transaction signature" aria-label="Transaction signature"
              value={claimSig} onChange={(e) => setClaimSig(e.target.value)} style={{ minWidth: 320 }} />
            <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
              onClick={prepare} disabled={busy} type="button">Find my deposit</button>
          </div>
          {claim?.ok && (
            <div className="proof-stamp" style={{ marginTop: 16 }}>
              <div className="t">{claim.amount} {String(claim.asset).toUpperCase()} from {claim.wallet}</div>
              <div className="rail" style={{ marginTop: 10, gap: 12 }}>
                <input type="text" placeholder="name for the ledger" aria-label="Claim name"
                  value={claimName} onChange={(e) => setClaimName(e.target.value)} style={{ minWidth: 240 }} />
              </div>
              {claimName.trim() && (
                <>
                  <div className="root" style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
                    {String(claim.message_template).replace('&lt;your name&gt;', claimName.trim())
                      .replace('<your name>', claimName.trim())}
                  </div>
                  <div className="rail" style={{ marginTop: 12, gap: 12 }}>
                    <input type="text" placeholder="paste the signature (base64)" aria-label="Claim signature"
                      value={claimSignature} onChange={(e) => setClaimSignature(e.target.value)} style={{ minWidth: 320 }} />
                    <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
                      onClick={verify} disabled={busy} type="button">{busy ? 'checking' : 'Claim this deposit'}</button>
                  </div>
                </>
              )}
            </div>
          )}
          {claimMsg && <p className="caveat" style={{ color: claimOk ? 'var(--life)' : 'var(--blood)' }}>{claimMsg}</p>}

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
