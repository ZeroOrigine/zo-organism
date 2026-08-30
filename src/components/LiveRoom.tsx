'use client';

// #308 — THE DELIVERY ROOM AS CINEMA. Port of cowork's approved prototype
// (40ca210) with the simulated script REPLACED by the real whitelist event
// stream (/site/live, 8s poll). Everything visible is a ledger read:
// C1 the EKG pulses on real events; C2 the stage constellation ignites as
// gates pass; C3 odometers show run cost (and tokens when the payload
// carries them) with the owned-hardware badge ONLY at $0; C4 the birth
// moment (quiet, crescendo, name, gene shower, URL) — same sequence in
// replay; C5 the certificate links the permanent /births/<slug>/certificate;
// C6 no invented numbers (the prototype's fake bpm meter is GONE — the
// pulse is visual, the meters are elapsed/stage/cost), no autoplay sound,
// reduced-motion and small screens collapse to the calm feed.
// #4511 (folded in): research is rendered as its own honest state — the
// minds researching light NO builder star and claim NO birth.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Stage { key: string; label: string; status: 'done' | 'active' | 'pending' }
interface FeedLine { t: string; stage: string; line: string }
interface Ethics { verdict: string; score: number | null; reasoning: string; date: string }
interface LivePayload {
  mode: 'live' | 'replay'; in_flight: boolean;
  kind?: 'research' | 'birth';
  project?: { name: string; status: string };
  stages?: Stage[]; feed?: FeedLine[]; ethics?: Ethics | null;
  qa_findings_open?: number;
  cost?: { run_usd?: number; today_usd: number; daily_budget_usd: number };
  tokens?: { run?: number } | null;
  exam?: { zero_cost: boolean } | null;
  elapsed_min?: number | null;
  replay?: { name: string; born: string; cost_usd: number; stages: Stage[]; feed: FeedLine[]; ethics: Ethics | null } | null;
  between?: string; note?: string;
}

const STAGE_KEYS = ['research', 'ethics', 'adversary', 'approved', 'build', 'qa', 'marketing', 'drill', 'launched'];
const STAGE_SHORT: Record<string, string> = {
  research: 'RESEARCH', ethics: 'ETHICS', adversary: 'ADVERSARY', approved: 'APPROVAL',
  build: 'BUILDER', qa: 'QA', marketing: 'MARKETING', drill: 'DRILL', launched: 'LAUNCH',
};
const FAIL_RX = /failed|blocked the release|faulted|sent the idea back for/i;

function realLines(feed: FeedLine[]): FeedLine[] {
  return feed.filter((l) => !l.line.startsWith('alive right now'));
}
function stageIndexOf(feed: FeedLine[]): number {
  const lines = realLines(feed);
  if (!lines.length) return -1;
  return STAGE_KEYS.indexOf(lines[lines.length - 1].stage);
}

export default function LiveRoom() {
  const [d, setD] = useState<LivePayload | null>(null);
  const [calm, setCalm] = useState(false);
  const [shownFeed, setShownFeed] = useState<FeedLine[]>([]);
  const [stageIdx, setStageIdx] = useState(-1);
  const [failedAt, setFailedAt] = useState(-1);
  const [finale, setFinale] = useState(false);
  const [certSlug, setCertSlug] = useState<string | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [replayStep, setReplayStep] = useState(-1);
  const slugMap = useRef<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anim = useRef({ pulse: 0, glow: 0, shower: [] as { x: number; y: number; v: number; r: number; a: number; c: string }[], rate: 0.5 });
  const prevCount = useRef(0);

  // calm mode: reduced motion or small screens (C6/C7-6)
  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sm = window.matchMedia('(max-width: 640px)');
    const update = () => setCalm(rm.matches || sm.matches);
    update();
    rm.addEventListener('change', update); sm.addEventListener('change', update);
    return () => { rm.removeEventListener('change', update); sm.removeEventListener('change', update); };
  }, []);

  // name -> slug map for certificates (from the genome products payload)
  useEffect(() => {
    fetch('/api/genome', { cache: 'force-cache' }).then((r) => r.json()).then((g) => {
      const m: Record<string, string> = {};
      for (const p of g?.products || []) m[p.name] = p.slug;
      slugMap.current = m;
    }).catch(() => { /* certificates just won't link */ });
  }, []);

  // the poll (C7-2 live / C7-1 idle)
  useEffect(() => {
    let stop = false;
    const pull = async () => {
      try {
        const r = await fetch('/api/live', { cache: 'no-store' });
        const j: LivePayload = await r.json();
        if (!stop) setD(j);
      } catch { /* keep the last frame */ }
    };
    pull();
    const iv = setInterval(pull, 8000);
    return () => { stop = true; clearInterval(iv); };
  }, []);

  // LIVE mode: real lines land as they arrive; pulses fire per new line
  useEffect(() => {
    if (!d || d.mode !== 'live') return;
    const lines = realLines(d.feed || []);
    setShownFeed(lines.slice(-3));
    // the SERVER's stage rail is the authority: a birth's own event history
    // can be nearly empty mid-build (whitelisted events land at stage ends),
    // and recomputing from the feed here once told a streaming build it was
    // 'researching'. Fall back to the feed only when the rail is absent.
    const railActive = (d.stages || []).findIndex((s) => s.status === 'active');
    const railDone = (d.stages || []).reduce((m, s, i) => (s.status === 'done' ? i : m), -1);
    const idx = railActive >= 0 ? railActive : railDone >= 0 ? railDone : stageIndexOf(d.feed || []);
    setStageIdx(idx);
    const isResearch = d.kind ? d.kind === 'research'
      : (idx <= 0 || (d.project?.status || '') === 'researching');
    anim.current.rate = isResearch ? 0.55 : 0.55 + Math.max(0, idx) * 0.09;
    if (lines.length > prevCount.current) { anim.current.pulse = 1; }
    prevCount.current = lines.length;
    const failIdx = lines.findIndex((l) => FAIL_RX.test(l.line));
    setFailedAt(failIdx >= 0 ? STAGE_KEYS.indexOf(lines[lines.length - 1].stage) : -1);
    const launched = (d.stages || []).find((s) => s.key === 'launched')?.status === 'done';
    if (launched && !finale) beginFinale(d.project?.name || 'the newborn');
    if (isResearch) setTitle('the minds are hunting an idea worth a body');
    else if (!launched) setTitle((d.project?.name && d.project.name !== 'an unnamed idea') ? `${d.project.name} is being born` : 'an unnamed idea is being born');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  // REPLAY mode: the recorded feed plays as a timed sequence (C4 replay)
  useEffect(() => {
    if (!d || d.mode !== 'replay' || !d.replay) return;
    if (replayStep === -1) { setReplayStep(0); setTitle(`replaying the birth of ${d.replay.name}`); return; }
    const lines = realLines(d.replay.feed || []);
    if (replayStep >= lines.length) {
      if (!finale) { beginFinale(d.replay.name); setCertSlug(slugMap.current[d.replay.name] || null); }
      return;
    }
    const line = lines[replayStep];
    setShownFeed(lines.slice(Math.max(0, replayStep - 2), replayStep + 1));
    setStageIdx(STAGE_KEYS.indexOf(line.stage));
    anim.current.pulse = 1;
    anim.current.rate = 0.55 + Math.max(0, STAGE_KEYS.indexOf(line.stage)) * 0.09;
    const t = setTimeout(() => setReplayStep((s) => s + 1), calm ? 900 : 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d?.mode, replayStep, d?.replay?.name]);

  const beginFinale = useCallback((name: string) => {
    setFinale(true);
    anim.current.glow = 1;
    const a = anim.current;
    const cv = canvasRef.current;
    const W = cv ? cv.width : 1200, H = cv ? cv.height : 800;
    for (let i = 0; i < 90; i++) {
      a.shower.push({ x: Math.random() * W, y: -Math.random() * H * 0.3, v: 1 + Math.random() * 2,
        r: 1 + Math.random() * 2.2, a: 0.9, c: Math.random() < 0.75 ? '#d4a94e' : '#3bda8c' });
    }
    setTitle('it has a name.');
    setTimeout(() => setTitle(name), 1800);
    setTimeout(() => setCertOpen(true), 3400);
  }, []);

  // C1/C2: the canvas — EKG + constellation + shower (skipped in calm mode)
  useEffect(() => {
    if (calm) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    const dpr = Math.min(devicePixelRatio, 2);
    const size = () => { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; };
    size();
    window.addEventListener('resize', size);
    let raf = 0, phase = 0, last = performance.now();
    // #4522(1): a tighter arc with real stars — the first cut spread tiny
    // dim nodes across the full width and the founder could not read them.
    const stagePos = (i: number) => {
      const t = i / (STAGE_KEYS.length - 1);
      return [cv.width * 0.19 + t * cv.width * 0.62, cv.height * 0.78 - Math.sin(t * Math.PI) * cv.height * 0.13] as const;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const a = anim.current;
      cx.clearRect(0, 0, cv.width, cv.height);
      const s = dpr;
      // EKG: baseline rhythm scaled by stage depth; pulses on real events
      phase += (a.rate + a.pulse * 1.6) * dt;
      a.pulse = Math.max(0, a.pulse - dt * 0.8);
      const failed = failedAt >= 0;
      const yBase = cv.height * 0.56, amp = cv.height * 0.035 * (failed ? 0.15 : 1 + a.glow * 2);
      cx.beginPath();
      for (let x = 0; x <= cv.width; x += 3 * s) {
        const u = ((x / cv.width) * 6 + phase) % 1;
        let y = 0;
        if (!failed) {
          if (u < 0.06) y = -Math.sin(u / 0.06 * Math.PI) * 0.25;
          else if (u < 0.12) y = Math.sin((u - 0.06) / 0.06 * Math.PI) * 1.0;
          else if (u < 0.2) y = -Math.sin((u - 0.12) / 0.08 * Math.PI) * 0.35;
        }
        cx.lineTo(x, yBase - y * amp);
      }
      cx.strokeStyle = failed ? 'rgba(224,96,76,0.6)' : `rgba(59,218,140,${0.5 + a.glow * 0.5})`;
      cx.lineWidth = 1.4 * s; cx.stroke();
      cx.save(); cx.filter = `blur(${6 * s}px)`;
      cx.strokeStyle = failed ? 'rgba(224,96,76,0.3)' : `rgba(59,218,140,${0.25 + a.glow * 0.4})`;
      cx.lineWidth = 5 * s; cx.stroke(); cx.restore();
      // constellation
      for (let i = 0; i < STAGE_KEYS.length; i++) {
        const [p, q] = stagePos(i);
        const lit = i <= stageIdx, cur = i === stageIdx;
        const failHere = failed && cur;
        if (i > 0 && i - 1 <= stageIdx) {
          const [ax, ay] = stagePos(i - 1);
          cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(p, q);
          cx.strokeStyle = i <= stageIdx ? 'rgba(59,218,140,0.45)' : 'rgba(40,58,50,0.6)';
          cx.lineWidth = 1.6 * s; cx.stroke();
        }
        cx.beginPath(); cx.arc(p, q, (cur ? 9 : 6) * s, 0, 7);
        cx.fillStyle = failHere ? '#e0604c' : lit ? (cur ? '#d4a94e' : '#3bda8c') : '#2c3f36';
        cx.fill();
        if (lit) {
          cx.save(); cx.filter = `blur(${7 * s}px)`;
          cx.beginPath(); cx.arc(p, q, (cur ? 19 : 12) * s, 0, 7);
          cx.fillStyle = failHere ? 'rgba(224,96,76,0.6)' : cur ? 'rgba(212,169,78,0.6)' : 'rgba(59,218,140,0.45)';
          cx.fill(); cx.restore();
        }
        // canvas font cannot resolve a CSS variable — 'var(--mono)' was
        // silently ignored and the labels fell to the default face
        cx.fillStyle = failHere ? '#e0604c' : lit ? '#c9d2ca' : '#55645b';
        const fs = Math.max(11, Math.min(13.5, cv.clientWidth / 58));
        cx.font = `${fs * s}px 'IBM Plex Mono', 'SFMono-Regular', monospace`; cx.textAlign = 'center';
        cx.fillText(STAGE_SHORT[STAGE_KEYS[i]], p, q + 26 * s);
      }
      // gene shower (C4)
      a.shower.forEach((g) => { g.y += g.v * s; g.v += 0.05; g.a -= 0.006;
        cx.globalAlpha = Math.max(0, g.a); cx.beginPath(); cx.arc(g.x, g.y, g.r * s, 0, 7);
        cx.fillStyle = g.c; cx.fill(); cx.globalAlpha = 1; });
      a.shower = a.shower.filter((g) => g.a > 0 && g.y < cv.height);
      a.glow = Math.max(0, a.glow - dt * 0.12);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, [calm, stageIdx, failedAt]);

  const isLive = d?.mode === 'live';
  const cost = d?.cost;
  const showHw = !!(isLive && d?.in_flight && (d?.exam?.zero_cost ?? ((cost?.run_usd ?? -1) === 0 && realLines(d?.feed || []).length > 0)));
  const failed = failedAt >= 0;
  const elapsed = d?.elapsed_min;
  const replayName = d?.replay?.name;

  return (
    <main style={{ opacity: 1 }}>
      <div className="cinema">
        {!calm && <canvas className="cn-canvas" ref={canvasRef} aria-hidden="true" />}
        <div className="cn-vignette" aria-hidden="true" />

        <div className="cn-center">
          <div className="cn-eyebrow">
            {failed ? 'delivery room · a birth failed, honestly'
              : isLive ? ((d?.kind === 'research' || (!d?.kind && stageIdx <= 0)) ? 'delivery room · the minds are researching' : 'delivery room · a birth is in flight')
              : 'delivery room · replay'}
          </div>
          <h1 className="cn-title">{title || (d ? '' : 'opening the room')}<span className="cursor" /></h1>
          <div className="cn-meters">
            {isLive && cost && <span>run <b>${Number(cost.run_usd ?? 0).toFixed(6)}</b></span>}
            {!isLive && d?.replay && <span>cost of birth <b>${d.replay.cost_usd.toFixed(2)}</b></span>}
            {typeof d?.tokens?.run === 'number' && d.tokens.run > 0 &&
              <span>tokens <b>{d.tokens.run.toLocaleString()}</b></span>}
            {typeof elapsed === 'number' && isLive && <span>elapsed <b>{Math.floor(elapsed / 60)}h {elapsed % 60}m</b></span>}
            <span>stage <b>{Math.max(0, stageIdx + 1)} of {STAGE_KEYS.length}</b></span>
            {typeof d?.qa_findings_open === 'number' && isLive && <span>open findings <b>{d.qa_findings_open}</b></span>}
          </div>
          {showHw && <div className="cn-hw on">served by owned hardware · $0.000000</div>}
        </div>

        <div className="cn-feed" aria-live="polite">
          {calm && d && (
            <div className="cn-calmlist">
              {realLines((isLive ? d.feed : d.replay?.feed) || []).slice(-6).map((l, i) => (
                <div key={i}><span className="t">{l.t.slice(11, 19) || l.t.slice(0, 10)}</span> [{l.stage}] {l.line}</div>
              ))}
            </div>
          )}
          {!calm && shownFeed.map((l, i) => (
            <div className="ln" key={l.t + l.line + i}>
              <span className="t">{l.t.slice(11, 19) || l.t.slice(0, 10)}</span> [{l.stage}] <b>{l.line}</b>
            </div>
          ))}
          {failed && (
            <div className="ln"><b>the run stopped at its failed stage; the failure is metabolized into genes in
              the <Link href="/graveyard">graveyard</Link></b></div>
          )}
        </div>

        <div className="cn-bar">
          {!isLive && d?.replay && (
            <button onClick={() => { setReplayStep(-1); setFinale(false); setCertOpen(false); setShownFeed([]); setStageIdx(-1); anim.current.shower = []; }} type="button">
              replay the birth
            </button>
          )}
          {replayName && slugMap.current[replayName] && (
            <Link className="cn-btn" href={`/births/${slugMap.current[replayName]}/certificate`}>
              the birth certificate
            </Link>
          )}
          <Link className="cn-btn" href="/sovereignty">the exam room</Link>
        </div>

        {certOpen && d?.replay && (
          <div className="cn-certwrap on" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('cn-certwrap')) setCertOpen(false); }}>
            <div className="cn-cert">
              <button className="close" onClick={() => setCertOpen(false)} aria-label="close" type="button">×</button>
              <div className="head"><span className="l">Birth Certificate</span><span className="r">zeroorigine · the anchored ledger</span></div>
              <h3>{d.replay.name}</h3>
              <div className="born">BORN {d.replay.born}</div>
              <div className="grid">
                <div className="cell"><div className="k">build cost</div><div className="v">${d.replay.cost_usd.toFixed(2)}</div></div>
                <div className="cell"><div className="k">every line</div><div className="v g">anchored</div></div>
              </div>
              <div className="anchor">every ledger line of this birth is a leaf under an anchored root on <b>Solana mainnet</b> ·
                a birth you can watch is a claim you can check</div>
              {slugMap.current[d.replay.name] && (
                <p style={{ marginTop: 14 }}>
                  <Link href={`/births/${slugMap.current[d.replay.name]}/certificate`} style={{ color: 'var(--gx-green, #3bda8c)' }}>
                    the permanent certificate, with the full record and a share card
                  </Link>
                </p>
              )}
              <div className="foot"><div className="seal">0</div>
                <div className="note">no tokens exist ·<br />the machine keeps its own books</div></div>
            </div>
          </div>
        )}
      </div>

      <section className="eco-section"><div className="eco-wrap">
        <p className="caveat">Every line above is whitelist-mapped from the machine&apos;s own event ledger: short honest
          lines, never internals, never invented drama. {d?.note || 'every line of a birth becomes a leaf in that day’s anchored root'}.
          A failed birth renders honestly and mints no certificate.</p>
      </div></section>
      <footer>
        <span>a birth you can watch is a claim you can check</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
