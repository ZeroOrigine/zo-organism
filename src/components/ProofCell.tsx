'use client';

// #4545: THE PATH FROM AN ENTRY TO ITS PROOF. The whitepaper promises that a
// public endpoint returns, for any entry, the payload, its hash, the Merkle
// path, the day roots and the anchoring transaction. All of that has existed
// since #254 and the books page never called it, so a reader could see a
// number and had no way to ask the machine to prove it. This is the asking.
//
// Nothing here computes a proof: it renders what the machine returns, in full,
// with every hash copyable, so the reader can recompute it themselves.
import { useState } from 'react';

interface Proof {
  found: boolean;
  table?: string; entry_id?: string;
  payload?: Record<string, unknown>;
  canonical_json?: string;
  entry_hash?: string; hash_recipe?: string;
  merkle_path?: string[]; merkle_root?: string;
  day?: string; prev_root?: string; chained_root?: string; chain_recipe?: string;
  solana_sig?: string | null; solana_explorer?: string | null;
  memo_format?: string;
  reason?: string;
}

export function Copyable({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <span className="pf-copy">
      <code>{text}</code>
      <button type="button" aria-label={`copy ${label || 'value'}`}
        onClick={async () => {
          try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); }
          catch { /* clipboard blocked; the full value is on the page to select */ }
        }}>{done ? 'copied' : 'copy'}</button>
    </span>
  );
}

export default function ProofCell({ entryId, table, compact }: {
  entryId: string; table: string; compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<Proof | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (p || busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/proof?entry_id=${encodeURIComponent(entryId)}&table=${encodeURIComponent(table)}`);
      setP(await r.json());
    } catch {
      setP({ found: false, reason: 'the proof endpoint could not be reached just now' });
    }
    setBusy(false);
  };

  return (
    <>
      <button type="button" className="pf-btn" onClick={load} aria-expanded={open}>
        {open ? 'hide proof' : compact ? 'proof' : 'prove it'}
      </button>
      {open && (
        <div className="pf-panel">
          {busy && <p className="pf-note">asking the machine for this entry&apos;s proof…</p>}
          {!busy && p && !p.found && (
            <p className="pf-note">This entry has no leaf in the chain{p.reason ? `: ${p.reason}` : ''}.
              Entries recorded before the proof layer began on 2026-08-14 predate the daily roots; they are
              in the books, and they are not in the chain. The page says so rather than implying otherwise.</p>
          )}
          {!busy && p && p.found && (
            <dl className="pf-dl">
              <dt>the entry, exactly as hashed</dt>
              <dd><code className="pf-json">{p.canonical_json}</code></dd>
              <dt>entry hash</dt>
              <dd><Copyable text={p.entry_hash || ''} label="entry hash" />
                <span className="pf-recipe">{p.hash_recipe}</span></dd>
              <dt>Merkle path ({(p.merkle_path || []).length} steps)</dt>
              <dd>{(p.merkle_path || []).map((h, i) => (
                <span key={i} className="pf-step"><Copyable text={h} label={`path step ${i + 1}`} /></span>
              ))}
                <span className="pf-recipe">pairs are hashed sorted, up to the day&apos;s Merkle root</span></dd>
              <dt>day&apos;s Merkle root</dt>
              <dd><Copyable text={p.merkle_root || ''} label="merkle root" /></dd>
              <dt>chained root for {p.day}</dt>
              <dd><Copyable text={p.chained_root || ''} label="chained root" />
                <span className="pf-recipe">{p.chain_recipe}</span></dd>
              <dt>anchored on Solana</dt>
              <dd>{p.solana_explorer
                ? <>
                    <a href={p.solana_explorer} rel="noopener noreferrer" target="_blank">verify the {p.day} anchor</a>
                    <span className="pf-recipe">expand the transaction&apos;s first instruction: the memo reads{' '}
                      <code>{p.memo_format}</code></span>
                  </>
                : <span className="pf-note">this day is not anchored yet; a later anchored day still seals it
                    through the chain of previous roots</span>}</dd>
            </dl>
          )}
        </div>
      )}
    </>
  );
}
