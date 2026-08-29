'use client';

// #302 D2: THE DELIVERY ROOM. When a birth is in flight the log lines
// appear as the pipeline emits them (8s poll), the current stage pulses,
// the ethics verdict renders unedited the moment it lands, and launch
// flips to the newborn's link. Idle: the last birth replays, honestly
// labeled, and the room says the machine is between births.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Stage { key: string; label: string; status: 'done' | 'active' | 'pending' }
interface FeedLine { t: string; stage: string; line: string }
interface Ethics { verdict: string; score: number | null; reasoning: string; date: string }
interface LivePayload {
  mode: 'live' | 'replay'; in_flight: boolean;
  project?: { name: string; status: string };
  stages?: Stage[]; feed?: FeedLine[]; ethics?: Ethics | null;
  qa_findings_open?: number;
  cost?: { run_usd?: number; today_usd: number; daily_budget_usd: number };
  elapsed_min?: number | null;
  replay?: { name: string; born: string; cost_usd: number; stages: Stage[]; feed: FeedLine[]; ethics: Ethics | null } | null;
  between?: string; note?: string;
}

export default function LiveRoom() {
  const [d, setD] = useState<LivePayload | null>(null);
  const [shown, setShown] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop = false;
    const pull = async () => {
      try {
        const r = await fetch('/api/live', { cache: 'no-store' });
        const j = await r.json();
        if (!stop) setD(j);
      } catch { /* keep the last frame */ }
    };
    pull();
    const iv = setInterval(pull, 8000);
    return () => { stop = true; clearInterval(iv); };
  }, []);

  const stages = d?.mode === 'live' ? d?.stages : d?.replay?.stages;
  const feed = (d?.mode === 'live' ? d?.feed : d?.replay?.feed) || [];
  const ethics = d?.mode === 'live' ? d?.ethics : d?.replay?.ethics;

  // replay lines type on gradually; live lines appear as they land
  useEffect(() => {
    if (!d) return;
    if (d.mode === 'live') { setShown(feed.length); return; }
    if (shown >= feed.length) return;
    const t = setTimeout(() => setShown((s) => Math.min(s + 1, feed.length)), 350);
    return () => clearTimeout(t);
  }, [d, shown, feed.length]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [shown, feed.length]);

  const launched = stages?.find((s) => s.key === 'launched')?.status === 'done';

  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head">
            <span className={'eco-label ' + (d?.in_flight ? 'life' : 'gold')}>
              {d?.in_flight ? 'DELIVERY ROOM · A BIRTH IS IN FLIGHT' : 'DELIVERY ROOM · BETWEEN BIRTHS'}
            </span>
            <h2>{d?.in_flight
              ? `${d?.project?.name || 'a birth'} is being born`
              : d?.replay ? `replay: the birth of ${d.replay.name}` : 'the delivery room'}</h2>
          </div>

          {!d && <p className="eco-lede">Opening the room&hellip;</p>}

          {d && !d.in_flight && (
            <p className="eco-lede">{d.between} Nobody has ever watched software be researched, judged, built,
              tested and launched by machine minds in real time; when the next birth starts, this page is where
              it happens. Below, the last birth replays from its recorded ledger events.</p>
          )}

          {d?.in_flight && (
            <div className="rail" style={{ gap: 22, margin: '10px 0 6px', flexWrap: 'wrap' }}>
              {typeof d.elapsed_min === 'number' && (
                <span className="caveat" style={{ margin: 0 }}>elapsed {Math.floor(d.elapsed_min / 60)}h {d.elapsed_min % 60}m</span>
              )}
              {typeof d.qa_findings_open === 'number' && (
                <span className="caveat" style={{ margin: 0 }}>open findings {d.qa_findings_open}</span>
              )}
              {d.cost && (
                <span className="caveat" style={{ margin: 0 }}>
                  run ${Number(d.cost.run_usd || 0).toFixed(2)} · today ${d.cost.today_usd.toFixed(2)} of ${d.cost.daily_budget_usd.toFixed(0)} cap
                </span>
              )}
            </div>
          )}

          {stages && (
            <div className="live-rail" role="list" aria-label="Birth stages">
              {stages.map((s) => (
                <div key={s.key} className={'live-stage ' + s.status} role="listitem">
                  <span className="dot" aria-hidden="true" />{s.label}
                </div>
              ))}
            </div>
          )}

          <div className="live-feed" ref={feedRef} aria-live="polite">
            {feed.slice(0, d?.mode === 'live' ? feed.length : shown).map((l, i) => (
              <div className="live-line" key={i}>
                <span className="t">{l.t.slice(11, 19) || l.t.slice(0, 10)}</span>
                <span className="s">[{l.stage}]</span> {l.line}
              </div>
            ))}
            {feed.length === 0 && <div className="live-line">no recorded lines yet</div>}
          </div>

          {ethics && (
            <div className="gatebox" style={{ marginTop: 26 }}>
              <p className="eco-label gold">THE ETHICS VERDICT · UNEDITED · {ethics.date}</p>
              <p><b>{ethics.verdict}</b>{ethics.score != null ? ` · score ${ethics.score}` : ''}</p>
              <p style={{ marginTop: 8 }}>{ethics.reasoning}</p>
            </div>
          )}

          {launched && (
            <div className="proof-stamp" style={{ marginTop: 26 }}>
              <div className="t">BORN</div>
              <div className="root" style={{ color: 'var(--life)', fontSize: 20 }}>
                {d?.mode === 'live' ? d?.project?.name : d?.replay?.name}
                {d?.mode === 'replay' && d?.replay ? ` · ${d.replay.born} · cost of birth $${d.replay.cost_usd.toFixed(2)}` : ''}
              </div>
              <div>{d?.note || 'every line above becomes a leaf in that day’s anchored root'}</div>
              <p style={{ marginTop: 10 }}><Link href="/products">meet every product born here</Link></p>
            </div>
          )}

          <p className="caveat" style={{ marginTop: 26 }}>This feed is a public whitelist over the machine&apos;s own
            event ledger: short honest lines, never internals. {d?.note}</p>
        </div>
      </section>
      <footer>
        <span>a birth you can watch is a claim you can check</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
