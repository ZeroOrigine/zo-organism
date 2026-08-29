'use client';

// #306 T1/T5: THE GENOME PLAYGROUND. The full library as a playable force
// network: every gene, every origin, live counts, a timeline that replays
// the genome growing birth by birth. Metadata is public; each gene's full
// doc, code and harvest findings sit behind supporter access, with one free
// sample fully open so the lock is credible. Wording law: machine voice,
// live counts only, no invented numbers, no urgency.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { genePublicText } from '@/components/OrganismPage';

interface GNode {
  id: string; name: string; cat: string; origin: string | null;
  used: number; q: number; status: 'pushed' | 'gestation' | 'blocked';
  born: string; d: string;
}
interface Genome {
  counts: { modules: number; inheritances: number; origins: number; pushed: number; blocked: number; gestation: number; proven: number };
  grad_rule: { uses_required: number; text: string };
  free_sample: string;
  nodes: GNode[];
}

interface Sim {
  x: number; y: number; vx: number; vy: number; n: GNode; r: number;
  hub: number; visible: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  pushed: '#3DFF9E', gestation: '#E8B44C', blocked: '#E25B4A',
};

export default function GenomePlayground() {
  const [g, setG] = useState<Genome | null>(null);
  const [sel, setSel] = useState<GNode | null>(null);
  const [fStatus, setFStatus] = useState('all');
  const [fCat, setFCat] = useState('all');
  const [fOrigin, setFOrigin] = useState('all');
  const [tPct, setTPct] = useState(100);
  const [replaying, setReplaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim[]>([]);
  const hubsRef = useRef<{ x: number; y: number; name: string }[]>([]);
  const hoverRef = useRef<Sim | null>(null);
  const dragRef = useRef<Sim | null>(null);

  useEffect(() => {
    fetch('/api/genome', { cache: 'no-store' }).then((r) => r.json()).then(setG).catch(() => setG(null));
  }, []);

  const cats = useMemo(() => Array.from(new Set((g?.nodes || []).map((n) => n.cat))).sort(), [g]);
  const origins = useMemo(() => Array.from(new Set((g?.nodes || []).map((n) => n.origin || 'foundation'))).sort(), [g]);
  const dates = useMemo(() => (g?.nodes || []).map((n) => n.born).sort(), [g]);
  const tCut = useMemo(() => {
    if (!dates.length) return '9999';
    const i = Math.min(dates.length - 1, Math.floor((tPct / 100) * (dates.length - 1)));
    return dates[i];
  }, [dates, tPct]);

  // build the sim once per data load
  useEffect(() => {
    if (!g) return;
    const hubNames = Array.from(new Set(g.nodes.map((n) => n.origin || 'foundation'))).sort();
    const W = 1200, H = 900;
    hubsRef.current = hubNames.map((name, i) => {
      const a = (i / hubNames.length) * Math.PI * 2 - Math.PI / 2;
      return { x: W / 2 + Math.cos(a) * 330, y: H / 2 + Math.sin(a) * 300, name };
    });
    simRef.current = g.nodes.map((n, i) => {
      const hub = hubNames.indexOf(n.origin || 'foundation');
      const h = hubsRef.current[hub];
      const a = (i * 2.399963) % (Math.PI * 2);
      const rr = 30 + (i % 90);
      return { n, hub, visible: true,
               x: h.x + Math.cos(a) * rr, y: h.y + Math.sin(a) * rr,
               vx: 0, vy: 0, r: 3 + Math.sqrt(n.used + 1) * 1.6 };
    });
  }, [g]);

  // visibility follows filters + timeline
  useEffect(() => {
    for (const s of simRef.current) {
      s.visible = (fStatus === 'all' || s.n.status === fStatus)
        && (fCat === 'all' || s.n.cat === fCat)
        && (fOrigin === 'all' || (s.n.origin || 'foundation') === fOrigin)
        && s.n.born <= tCut;
    }
  }, [fStatus, fCat, fOrigin, tCut, g]);

  // replay: walk the timeline forward
  useEffect(() => {
    if (!replaying) return;
    if (tPct >= 100) { setReplaying(false); return; }
    const t = setTimeout(() => setTPct((p) => Math.min(100, p + 1.5)), 60);
    return () => clearTimeout(t);
  }, [replaying, tPct]);

  // the force loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !g) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0; let running = true;

    const step = () => {
      const sims = simRef.current.filter((s) => s.visible);
      // hub attraction + soft pair repulsion on a spatial grid
      const cell = 46; const grid = new Map<string, Sim[]>();
      for (const s of sims) {
        const k = `${Math.floor(s.x / cell)}:${Math.floor(s.y / cell)}`;
        (grid.get(k) || grid.set(k, []).get(k)!).push(s);
      }
      for (const s of sims) {
        const h = hubsRef.current[s.hub];
        s.vx += (h.x - s.x) * 0.0016; s.vy += (h.y - s.y) * 0.0016;
        const gx = Math.floor(s.x / cell), gy = Math.floor(s.y / cell);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          for (const o of grid.get(`${gx + dx}:${gy + dy}`) || []) {
            if (o === s) continue;
            const ddx = s.x - o.x, ddy = s.y - o.y;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 > 1 && d2 < 2200) { const f = 14 / d2; s.vx += ddx * f; s.vy += ddy * f; }
          }
        }
        s.vx *= 0.86; s.vy *= 0.86;
        const sp = Math.hypot(s.vx, s.vy);
        if (sp > 2.2) { s.vx *= 2.2 / sp; s.vy *= 2.2 / sp; }
        if (dragRef.current !== s) { s.x += s.vx; s.y += s.vy; }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sims = simRef.current.filter((s) => s.visible);
      // edges: gene -> its origin hub, weight by uses
      ctx.lineWidth = 0.5;
      for (const s of sims) {
        const h = hubsRef.current[s.hub];
        ctx.strokeStyle = `rgba(140,154,144,${Math.min(0.35, 0.05 + s.n.used * 0.01)})`;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(h.x, h.y); ctx.stroke();
      }
      for (const h of hubsRef.current) {
        ctx.fillStyle = '#E9E4D6'; ctx.beginPath(); ctx.arc(h.x, h.y, 5, 0, 7); ctx.fill();
        ctx.fillStyle = '#8C9A90'; ctx.font = '12px ui-monospace, monospace';
        ctx.textAlign = 'center'; ctx.fillText(h.name, h.x, h.y - 12);
      }
      for (const s of sims) {
        ctx.fillStyle = STATUS_COLOR[s.n.status] || '#8C9A90';
        ctx.globalAlpha = s.n.status === 'gestation' ? 0.75 : 1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      const hov = hoverRef.current;
      if (hov && hov.visible) {
        ctx.fillStyle = '#E9E4D6'; ctx.font = '13px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hov.n.name.slice(0, 46), hov.x, hov.y - hov.r - 8);
      }
    };

    const loop = () => {
      if (!running) return;
      step(); draw();
      raf = requestAnimationFrame(loop);
    };
    if (reduced) {
      for (let i = 0; i < 260; i++) step();
      draw();
      const iv = setInterval(() => { step(); draw(); }, 400);
      return () => { running = false; clearInterval(iv); };
    }
    loop();
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [g]);

  const pick = useCallback((cx: number, cy: number): Sim | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((cx - rect.left) / rect.width) * canvas.width;
    const y = ((cy - rect.top) / rect.height) * canvas.height;
    let best: Sim | null = null; let bd = 400;
    for (const s of simRef.current) {
      if (!s.visible) continue;
      const d = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d < bd + s.r * s.r) { bd = d; best = s; }
    }
    return best;
  }, []);

  const usd = g?.grad_rule?.uses_required || 10;

  return (
    <section className="eco-section registry-head">
      <div className="eco-wrap">
        <div className="eco-head">
          <span className="eco-label gold">THE GENOME · PLAYABLE</span>
          <h2>{g ? `${g.counts.modules} genes. ${g.counts.inheritances} inheritances recorded.` : 'The genome'}</h2>
        </div>
        <p className="eco-lede">The machine keeps its lessons here. Every gene below is real and countable:
          {g ? ` ${g.counts.pushed} in the genome, ${g.counts.gestation} in gestation, ${g.counts.blocked} held back, from ${g.counts.origins} origin products.` : ' loading the live library.'}
          {' '}Drag the nodes, filter the library, scrub the timeline to replay the genome growing.</p>

        <div className="rail" style={{ gap: 10, margin: '14px 0', flexWrap: 'wrap' }}>
          {['all', 'pushed', 'gestation', 'blocked'].map((s) => (
            <button key={s} type="button" onClick={() => setFStatus(s)}
              className="viewall" style={{ marginTop: 0, cursor: 'pointer', padding: '5px 12px',
                background: fStatus === s ? 'var(--life)' : 'none',
                color: fStatus === s ? 'var(--void)' : 'var(--life)' }}>{s}</button>
          ))}
          <select aria-label="Category" value={fCat} onChange={(e) => setFCat(e.target.value)}>
            <option value="all">every category</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Origin product" value={fOrigin} onChange={(e) => setFOrigin(e.target.value)}>
            <option value="all">every origin</option>
            {origins.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="rail" style={{ gap: 12, marginBottom: 8, alignItems: 'center' }}>
          <button className="viewall" type="button" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
            onClick={() => { setTPct(0); setReplaying(true); }}>replay the growth</button>
          <input type="range" min={0} max={100} step={0.5} value={tPct} aria-label="Timeline"
            onChange={(e) => { setReplaying(false); setTPct(Number(e.target.value)); }} style={{ flex: 1, minWidth: 160 }} />
          <span className="caveat" style={{ margin: 0 }}>{tCut === '9999' ? '' : `up to ${tCut}`}</span>
        </div>

        <div className="genome-stage">
          <canvas ref={canvasRef} width={1200} height={900}
            onPointerMove={(e) => { hoverRef.current = pick(e.clientX, e.clientY); if (dragRef.current) { const c = canvasRef.current!; const r = c.getBoundingClientRect(); dragRef.current.x = ((e.clientX - r.left) / r.width) * c.width; dragRef.current.y = ((e.clientY - r.top) / r.height) * c.height; } }}
            onPointerDown={(e) => { const s = pick(e.clientX, e.clientY); dragRef.current = s; if (s) setSel(s.n); }}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerLeave={() => { hoverRef.current = null; dragRef.current = null; }}
          />
          {sel && (
            <aside className="genome-panel" aria-live="polite">
              <button className="close" type="button" onClick={() => setSel(null)} aria-label="Close">×</button>
              <p className="eco-label gold">{sel.id}</p>
              <h3>{sel.name}</h3>
              <p className="chip" data-s={sel.status}>
                {sel.status === 'pushed' && 'IN THE GENOME · inherited by every product born after it'}
                {sel.status === 'blocked' && 'HELD BACK · until its findings clear'}
                {sel.status === 'gestation' && `IN GESTATION · used ${Math.min(sel.used, usd)} of ${usd} recorded uses required for graduation review`}
              </p>
              <p className="body">{genePublicText({ d: sel.d, status: [sel.status === 'pushed' ? 'ship' : 'hold', sel.status] })}</p>
              <p className="meta">origin {sel.origin || 'foundation'} · used {sel.used} times · born {sel.born}</p>
              {g && sel.id === g.free_sample ? (
                <p className="body"><Link href="/genome/sample" style={{ color: 'var(--life)' }}>THE FREE SAMPLE:
                  read this gene in full</Link>. One gene is fully open to everyone so the lock below is credible.</p>
              ) : (
                <div className="lockbox">
                  <p className="eco-label gold">🔒 FULL DOC · CODE · HARVEST FINDINGS</p>
                  <p>Supporters read everything: the proven genes, the failures, the fixes.
                    Any amount. Same access. <Link href="/#support" style={{ color: 'var(--life)' }}>become a supporter</Link>
                    {' '}· <Link href="/library" style={{ color: 'var(--life)' }}>already one? open the library</Link>
                    {' '}· <Link href="/genome/sample" style={{ color: 'var(--life)' }}>read the free sample first</Link></p>
                </div>
              )}
            </aside>
          )}
        </div>

        <p className="caveat">{g?.grad_rule?.text}. Graduations are public status-change events; the next one happens in
          public. Supporter access is access, not charity, and the library carries no price: every claim on this page is
          a database read.</p>
        <Link className="viewall" href="/genes">the gene registry, as a table</Link>
      </div>
    </section>
  );
}
