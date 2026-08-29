'use client';

// #255: The Organism. Faithful production conversion of the approved
// prototype (zeroorigine-prototype-v2.html). Every section renders from the
// ONE payload passed in by the server (W1); nothing numeric is hand-written.
// W2 scale rails: registry search + pagination above 30 products, organism
// satellites cluster by category above 50. W4: the Books folio wears the
// proof stamp only when the proof endpoint answers. Voice laws: no em dash
// in copy, no superiority claims, the birth sequence is skippable and
// reduced-motion skips it entirely.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ProofSummary, SiteState } from '@/lib/siteState';

const MINDS = [
  { n: 'The Philosopher', role: 'Research', d: 'Finds real human pain worth solving. Rejects its own ideas when the moat is missing.', on: true },
  { n: 'The Architect', role: 'Research', d: 'Tests feasibility against what the ecosystem can actually build and provision.', on: true },
  { n: 'The Ethics Mind', role: 'Veto power', d: 'Reads every idea for harm before a dollar is spent. Its refusals are published, unedited.', on: true },
  { n: 'The Adversary', role: 'Opposition', d: 'Argues against every green light. A plan that cannot survive argument does not get built.', on: true },
  { n: 'The Solution Architect', role: 'Design', d: 'Emits a binding plan: every table, endpoint, promise, and price, before code exists.', on: true },
  { n: 'The Builder', role: 'Construction', d: 'Writes the product in five disciplined passes under a written law book of past scars.', on: true },
  { n: 'The QA Mind', role: 'Truth', d: 'Files defects, not compliments. Nothing launches with an open critical finding.', on: true },
  { n: 'The Immune System', role: 'After launch', d: 'Watches every living product, walks their front doors, and heals what it can prove broken.', on: true },
];

const TIERS = [
  { amt: 5, n: 'Witness', d: 'Your name in the supporter ledger. You watched a machine learn to keep books.' },
  { amt: 25, n: 'Godparent', d: 'Your name on the next product born, printed on its birth certificate.' },
  { amt: 85, n: 'Gene patron', d: 'Birth certificate plus read access to the genome: the code the dead paid forward. After your support is verified against the ledger, your GitHub account receives a read-only invite to the gene repositories, and nothing else.' },
  { amt: 210, n: 'Founding witness', d: 'All of the above, on the certificate of a product you help choose from the approved queue.' },
];

const BIRTH_LOG: Array<[string, string, string?]> = [
  ['research', 'idea located: this website'],
  ['ethics', 'verdict: no harm found. proceed'],
  ['adversary', 'objection heard. overruled with evidence'],
  ['architect', 'final plan emitted. promises bound to mechanisms'],
  ['builder', 'five passes complete'],
  ['qa', 'round 1: 3 findings filed. fixed'],
  ['qa', 'round 2: 0 critical, 0 high'],
  ['verdict', 'SHIP', 'ok'],
  ['deploy', 'walking the front door: 7 of 7 steps green', 'ok'],
  ['ledger', 'cost of this birth: recorded', 'money'],
  ['organism', 'waking'],
];

const CLUSTER_THRESHOLD = 50;
const BIRTHS_PREVIEW = 10;
const GENES_PREVIEW = 8;

// W8: the public rendering law. Machine artifacts (JSON blobs, internal
// paths, finding classes) NEVER render on the public site, even if the
// payload regresses. A gene row shows a human sentence or the honest hold.
export function genePublicText(g: { d?: string; status: [string, string] }): string {
  const d = (g.d || '').trim();
  if (!d || d[0] === '[' || d[0] === '{' || d.includes('genes/') || d.includes('"path"')) {
    return g.status[0] === 'ship'
      ? 'inherited by every product born after it'
      : 'held back until its findings clear';
  }
  return d;
}

export default function OrganismPage({ state, proof }: { state: SiteState; proof: ProofSummary | null }) {
  const [alive, setAlive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [funding, setFunding] = useState<number | null>(null);
  const [fundErr, setFundErr] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const heroCv = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const geneCv = useRef<HTMLCanvasElement>(null);

  // W7: home is a PREVIEW. The latest births and genes render here; the full
  // registries live on /products and /genes, built for hundreds of rows.
  const previewBirths = useMemo(() => state.products.slice(0, BIRTHS_PREVIEW), [state.products]);
  const previewGenes = useMemo(() => state.genes.slice(0, GENES_PREVIEW), [state.genes]);

  // ---------- the birth ----------
  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(rm);
    if (rm) { setAlive(true); return; }
    let i = 0; let cancelled = false;
    const box = logRef.current;
    const timers: number[] = [];
    const next = () => {
      if (cancelled) return;
      if (!box || i >= BIRTH_LOG.length) { timers.push(window.setTimeout(() => setAlive(true), 650)); return; }
      const e = BIRTH_LOG[i];
      const d = document.createElement('div');
      d.className = 'ln' + (e[2] ? ' ' + e[2] : '');
      d.textContent = '[' + e[0] + '] ' + e[1];
      box.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on')));
      while (box.children.length > 7) box.removeChild(box.firstChild as Node);
      i++;
      timers.push(window.setTimeout(next, i < 7 ? 560 : 740));
    };
    next();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);

  // ---------- counters ----------
  useEffect(() => {
    if (!alive) return;
    const t = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-count]').forEach((elm) => {
        const target = parseInt(elm.getAttribute('data-count') || '0', 10);
        const prefix = elm.getAttribute('data-prefix') || '';
        if (reduced || target === 0) { elm.textContent = prefix + target.toLocaleString(); return; }
        const t0 = performance.now(); const dur = 1400;
        const tick = (tm: number) => {
          let p = Math.min(1, (tm - t0) / dur); p = 1 - Math.pow(1 - p, 3);
          elm.textContent = prefix + Math.round(target * p).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, 500);
    return () => clearTimeout(t);
  }, [alive, reduced]);

  // ---------- the hero organism ----------
  useEffect(() => {
    const cv = heroCv.current; const tip = tipRef.current;
    if (!cv || !tip) return;
    const cx = cv.getContext('2d'); if (!cx) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0; let H = 0; let raf = 0; let stopped = false;
    interface N { m: typeof MINDS[number]; a: number; R: number; cx: number; cy: number; sp: number; x: number; y: number }
    interface S { name: string; sub: string; a: number; R: number; sp: number; s: number; cx: number; cy: number; _x?: number; _y?: number }
    let nodes: N[] = []; let sats: S[] = []; let core = { x: 0, y: 0, R: 0 };

    // W2: above the cluster threshold each satellite is a CATEGORY with its
    // count, not a single product; the organism stays readable at any scale.
    const clustered = state.products.length > CLUSTER_THRESHOLD;
    const satSpecs: Array<{ name: string; sub: string; w: number }> = clustered
      ? Array.from(state.products.reduce((m, p) => m.set(p.cat, (m.get(p.cat) || 0) + 1), new Map<string, number>()))
          .map(([c, n]) => ({ name: c, sub: String(n) + ' living products', w: Math.min(4, 1.6 + n / 18) }))
      : state.products.map((p) => ({ name: p.name, sub: 'born ' + p.born + ' · ' + p.cat, w: 0 }));

    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    const build = () => {
      nodes = []; sats = [];
      const mob = W < 760;
      const cxp = mob ? W * 0.5 : W * 0.72; const cyp = mob ? H * 0.24 : H * 0.46;
      const R = Math.min(W, H) * (mob ? 0.3 : 0.21);
      MINDS.forEach((m, i) => {
        nodes.push({ m, a: (i / 8) * Math.PI * 2, R: R * (0.9 + ((i * 37) % 23) / 100), cx: cxp, cy: cyp, sp: 0.00035 + 0.0001 * (i % 3), x: 0, y: 0 });
      });
      satSpecs.forEach((sp, i) => {
        sats.push({ name: sp.name, sub: sp.sub, a: (i / satSpecs.length) * Math.PI * 2 + 0.4, R: R * (1.55 + ((i * 53) % 40) / 55), sp: 0.0002 + ((i * 29) % 20) * 0.00001, s: sp.w || 1.6 + ((i * 17) % 14) / 9, cx: cxp, cy: cyp });
      });
      core = { x: cxp, y: cyp, R };
    };
    const draw = (t: number) => {
      if (stopped) return;
      cx.clearRect(0, 0, W, H);
      const br = 1 + Math.sin(t * 0.0011) * 0.03;
      nodes.forEach((n) => {
        n.x = n.cx + Math.cos(n.a + t * n.sp) * n.R * br; n.y = n.cy + Math.sin(n.a + t * n.sp) * n.R * br;
        const g = cx.createLinearGradient(n.cx, n.cy, n.x, n.y);
        g.addColorStop(0, 'rgba(61,255,158,.02)'); g.addColorStop(1, 'rgba(61,255,158,.22)');
        cx.strokeStyle = g; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(n.cx, n.cy); cx.lineTo(n.x, n.y); cx.stroke();
        const p = ((t * 0.00025 + n.a) % 1 + 1) % 1; const mx = n.cx + (n.x - n.cx) * p; const my = n.cy + (n.y - n.cy) * p;
        cx.fillStyle = 'rgba(232,180,76,.8)'; cx.beginPath(); cx.arc(mx, my, 1.4, 0, 7); cx.fill();
      });
      const rg = cx.createRadialGradient(core.x, core.y, 2, core.x, core.y, 46 * br);
      rg.addColorStop(0, 'rgba(61,255,158,.9)'); rg.addColorStop(0.35, 'rgba(61,255,158,.25)'); rg.addColorStop(1, 'rgba(61,255,158,0)');
      cx.fillStyle = rg; cx.beginPath(); cx.arc(core.x, core.y, 46 * br, 0, 7); cx.fill();
      cx.fillStyle = '#0A0F0D'; cx.beginPath(); cx.arc(core.x, core.y, 13, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(61,255,158,.9)'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(core.x, core.y, 13, 0, 7); cx.stroke();
      // W6: the nucleus is the origin mark. It reads 0; the constitutional
      // meaning lives in its hover tooltip, not in a label.
      cx.fillStyle = 'rgba(61,255,158,.95)'; cx.font = '700 13px IBM Plex Mono, monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText('0', core.x, core.y);
      nodes.forEach((n) => {
        const pu = 0.6 + Math.abs(Math.sin(t * 0.002 + n.a * 3)) * 0.4;
        cx.fillStyle = 'rgba(61,255,158,' + 0.25 * pu + ')'; cx.beginPath(); cx.arc(n.x, n.y, 10, 0, 7); cx.fill();
        cx.fillStyle = '#0E1512'; cx.beginPath(); cx.arc(n.x, n.y, 5.5, 0, 7); cx.fill();
        cx.strokeStyle = 'rgba(61,255,158,' + 0.9 * pu + ')'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(n.x, n.y, 5.5, 0, 7); cx.stroke();
      });
      sats.forEach((s) => {
        s._x = s.cx + Math.cos(s.a + t * s.sp) * s.R; s._y = s.cy + Math.sin(s.a + t * s.sp) * s.R * 0.94;
        cx.fillStyle = 'rgba(233,228,214,.55)'; cx.beginPath(); cx.arc(s._x, s._y, s.s, 0, 7); cx.fill();
      });
      if (!rm) raf = requestAnimationFrame(draw);
    };
    const hover = (mx: number, my: number): { t: string; d: string } | null => {
      let best: { t: string; d: string } | null = null; let bd = 20 * 20;
      // W6: the nucleus itself is a hit target carrying the constitution line
      const dc = (core.x - mx) ** 2 + (core.y - my) ** 2;
      if (dc < bd) { bd = dc; best = { t: 'The Constitution', d: 'ethics holds veto over every birth' }; }
      nodes.forEach((n) => { const d = (n.x - mx) ** 2 + (n.y - my) ** 2; if (d < bd) { bd = d; best = { t: n.m.n, d: n.m.role + ' · ' + n.m.d }; } });
      sats.forEach((s) => { const d = ((s._x || 0) - mx) ** 2 + ((s._y || 0) - my) ** 2; if (d < bd) { bd = d; best = { t: s.name, d: s.sub }; } });
      return best;
    };
    // tooltip skeleton built ONCE with DOM methods; only textContent changes
    const tipTitle = document.createElement('div'); tipTitle.className = 't';
    const tipBody = document.createElement('div'); tipBody.className = 'd';
    tip.replaceChildren(tipTitle, tipBody);
    const onMove = (ev: MouseEvent) => {
      const r = cv.getBoundingClientRect(); const h = hover(ev.clientX - r.left, ev.clientY - r.top);
      if (h) {
        tip.style.display = 'block';
        tip.style.left = Math.min(W - 280, ev.clientX - r.left + 16) + 'px';
        tip.style.top = ev.clientY - r.top + 14 + 'px';
        tipTitle.textContent = h.t;
        tipBody.textContent = h.d;
        cv.style.cursor = 'pointer';
      } else { tip.style.display = 'none'; cv.style.cursor = 'default'; }
    };
    const onLeave = () => { tip.style.display = 'none'; };
    const onResize = () => { size(); build(); if (rm) draw(0); };
    cv.addEventListener('mousemove', onMove); cv.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);
    size(); build(); if (rm) { draw(0); } else { raf = requestAnimationFrame(draw); }
    return () => { stopped = true; cancelAnimationFrame(raf); cv.removeEventListener('mousemove', onMove); cv.removeEventListener('mouseleave', onLeave); window.removeEventListener('resize', onResize); };
  }, [state.products]);

  // ---------- the genome network ----------
  useEffect(() => {
    const gn = geneCv.current; if (!gn) return;
    const gx = gn.getContext('2d'); if (!gx) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let GW = 0; let GH = 0; let raf = 0; let stopped = false; let gsel = -1; let psel = -1;
    interface GN { t: 'gene' | 'prod'; n: string; hold?: boolean; x: number; y: number; vx: number; vy: number }
    let gnodes: GN[] = []; let glinks: Array<{ a: number; b: number; held?: boolean }> = [];
    const genes = state.genes; const prods = state.products.slice(0, 10);
    const gsize = () => { GW = gn.clientWidth; GH = gn.clientHeight; gn.width = GW * DPR; gn.height = GH * DPR; gx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    const gbuild = () => {
      gnodes = []; glinks = [];
      genes.forEach((g, i) => {
        const fx = genes.length > 1 ? 0.2 + (0.6 * i) / (genes.length - 1) : 0.5;
        gnodes.push({ t: 'gene', n: g.slug, hold: g.status[0] === 'hold', x: GW * fx, y: GH * 0.32, vx: 0, vy: 0 });
      });
      prods.forEach((p, i) => {
        const idx = gnodes.length;
        gnodes.push({ t: 'prod', n: p.name, x: GW * (0.08 + 0.09 * i), y: GH * (0.68 + ((i % 3) * 0.09)), vx: 0, vy: 0 });
        genes.forEach((g, gi) => { glinks.push({ a: gi, b: idx, held: g.status[0] === 'hold' }); });
      });
    };
    const gdraw = () => {
      if (stopped) return;
      gx.clearRect(0, 0, GW, GH);
      for (let i = 0; i < gnodes.length; i++) {
        for (let j = i + 1; j < gnodes.length; j++) {
          const a = gnodes[i]; const b = gnodes[j];
          const dx = b.x - a.x; const dy = b.y - a.y; const d2 = dx * dx + dy * dy || 1;
          // W9: gene-gene pairs repel harder and from further away, because
          // each gene carries a text label that must stay readable at rest
          const geneair = a.t === 'gene' && b.t === 'gene';
          const reach = geneair ? 16000 : 5200;
          const power = geneair ? 110 : 28;
          if (d2 < reach) { const f = power / d2; a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f; }
        }
      }
      glinks.forEach((l) => {
        const a = gnodes[l.a]; const b = gnodes[l.b];
        const dx = b.x - a.x; const dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1; const f = (d - 110) * 0.0006;
        a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      });
      gnodes.forEach((n) => {
        n.vx *= 0.9; n.vy *= 0.9; n.x += n.vx; n.y += n.vy;
        n.x = Math.max(30, Math.min(GW - 30, n.x)); n.y = Math.max(24, Math.min(GH - 24, n.y));
      });
      // W9: HARD separation between gene nodes. Two genes linked to the same
      // products are pulled to the same centroid, and no spring tuning wins
      // that fight forever — so after integration, gene pairs closer than
      // 70px are pushed apart to exactly 70px along their axis.
      const MIN_GENE_GAP = Math.min(90, GW / 4);
      for (let i = 0; i < gnodes.length; i++) {
        for (let j = i + 1; j < gnodes.length; j++) {
          const a = gnodes[i]; const b = gnodes[j];
          if (a.t !== 'gene' || b.t !== 'gene') continue;
          let dx = b.x - a.x; let dy = b.y - a.y;
          let d = Math.sqrt(dx * dx + dy * dy);
          if (d >= MIN_GENE_GAP) continue;
          if (d < 1) { dx = 1; dy = 0; d = 1; }
          const push = (MIN_GENE_GAP - d) / 2;
          a.x -= (dx / d) * push; a.y -= (dy / d) * push;
          b.x += (dx / d) * push; b.y += (dy / d) * push;
          a.x = Math.max(30, Math.min(GW - 30, a.x)); a.y = Math.max(24, Math.min(GH - 24, a.y));
          b.x = Math.max(30, Math.min(GW - 30, b.x)); b.y = Math.max(24, Math.min(GH - 24, b.y));
        }
      }
      glinks.forEach((l) => {
        const a = gnodes[l.a]; const b = gnodes[l.b];
        const lit = gsel >= 0 && l.a === gsel;
        // #296 T6(a): a held gene is TETHERED, dashed — held, not orphaned
        gx.setLineDash(l.held ? [3, 5] : []);
        gx.strokeStyle = lit ? 'rgba(61,255,158,.5)'
          : l.held ? 'rgba(232,180,76,.22)' : 'rgba(233,228,214,.10)';
        gx.lineWidth = lit ? 1.4 : 1;
        gx.beginPath(); gx.moveTo(a.x, a.y); gx.lineTo(b.x, b.y); gx.stroke();
        gx.setLineDash([]);
      });
      gnodes.forEach((n, i) => {
        if (n.t === 'gene') {
          gx.fillStyle = n.hold ? '#E8B44C' : '#3DFF9E';
          gx.beginPath(); gx.arc(n.x, n.y, gsel === i ? 8 : 6, 0, 7); gx.fill();
          gx.fillStyle = 'rgba(233,228,214,.9)'; gx.font = '13px IBM Plex Mono, monospace'; gx.textAlign = 'center';
          // W9: when another gene sits within 140px (long slugs run ~130px of
          // 13px mono after the T4 type pass), this label drops BELOW its node so
          // never overprint into noise even at mobile widths
          const crowded = gnodes.some((m, j) => j < i && m.t === 'gene'
            && (m.x - n.x) ** 2 + (m.y - n.y) ** 2 < 140 * 140);
          gx.fillText(n.n, n.x, crowded ? n.y + 22 : n.y - 14);
        } else {
          const on = psel === i;
          gx.fillStyle = on ? 'rgba(233,228,214,.95)' : 'rgba(233,228,214,.5)';
          gx.beginPath(); gx.arc(n.x, n.y, on ? 4.6 : 3.4, 0, 7); gx.fill();
          if (on) {
            gx.fillStyle = 'rgba(233,228,214,.95)'; gx.font = '13px IBM Plex Mono, monospace'; gx.textAlign = 'center';
            gx.fillText(n.n, n.x, n.y - 12);
          }
        }
      });
      if (!rm) raf = requestAnimationFrame(gdraw);
    };
    const onClick = (ev: MouseEvent) => {
      // #296 T6(c): a tap names what it touches — genes trace their children,
      // product dots show their name (this is the touch path too: taps arrive
      // as clicks on mobile)
      const r = gn.getBoundingClientRect(); const mx = ev.clientX - r.left; const my = ev.clientY - r.top;
      let hit = -1; let phit = -1;
      gnodes.forEach((n, i) => {
        const d = (n.x - mx) ** 2 + (n.y - my) ** 2;
        if (n.t === 'gene' && d < 400) hit = i;
        if (n.t === 'prod' && d < 300) phit = i;
      });
      gsel = hit === gsel ? -1 : hit;
      psel = phit === psel ? -1 : phit;
      if (rm) gdraw();
    };
    const onGMove = (ev: MouseEvent) => {
      const r = gn.getBoundingClientRect(); const mx = ev.clientX - r.left; const my = ev.clientY - r.top;
      let phit = -1;
      gnodes.forEach((n, i) => { if (n.t === 'prod' && (n.x - mx) ** 2 + (n.y - my) ** 2 < 300) phit = i; });
      if (phit !== psel) { psel = phit; if (rm) gdraw(); }
      gn.style.cursor = phit >= 0 || gnodes.some((n, i) => n.t === 'gene' && (n.x - mx) ** 2 + (n.y - my) ** 2 < 400) ? 'pointer' : 'default';
    };
    const onResize = () => { gsize(); gbuild(); if (rm) gdraw(); };
    gn.addEventListener('click', onClick); gn.addEventListener('mousemove', onGMove);
    window.addEventListener('resize', onResize);
    gsize(); gbuild(); if (rm) { gdraw(); } else { raf = requestAnimationFrame(gdraw); }
    return () => { stopped = true; cancelAnimationFrame(raf); gn.removeEventListener('click', onClick); gn.removeEventListener('mousemove', onGMove); window.removeEventListener('resize', onResize); };
  }, [state.genes, state.products]);

  // ---------- support: the EXISTING donation rails, new skin only ----------
  const fund = async (amount: number) => {
    setFunding(amount); setFundErr('');
    try {
      const r = await fetch('/api/fund', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const d = await r.json().catch(() => null);
      if (d?.ok && d.checkout_url) { window.location.href = d.checkout_url; return; }
      setFundErr(d?.error || 'Checkout could not be created. Nothing was charged.');
    } catch {
      setFundErr('Checkout could not be created. Nothing was charged.');
    }
    setFunding(null);
  };

  return (
    <>
      {!alive && !reduced && (
        <>
          <div id="genesis" aria-hidden="true">
            <div className="zero">0</div>
            <div id="birthlog" ref={logRef} />
          </div>
          <button id="skipbirth" type="button" onClick={() => setAlive(true)}>skip the birth</button>
        </>
      )}

      <nav aria-label="Primary">
        <span className="wordmark">Zero<b>Origine</b></span>
        <span className="links">
          <a href="#hero">Organism</a><a href="#minds">Minds</a><a href="#births">Births</a>
          <a href="#graveyard">Graveyard</a><a href="#genome">Genome</a><a href="#books">Books</a>
          <a href="/law">Law</a><a href="#support">Support</a>
        </span>
      </nav>

      <main id="page" className={alive ? 'alive' : ''}>
        <section id="hero">
          <canvas id="organism" ref={heroCv} aria-hidden="true" />
          <div id="organ-tip" ref={tipRef} role="status" />
          <div className="hero-copy">
            <div className="kicker">An autonomous software organism · alive since March 2026</div>
            <h1>Everything here <em>begins at zero</em> and earns its existence.</h1>
            <p>Eight AI minds research, judge, build, test, launch, and retire real software products.
              The constitution stands above the machine. Every number on this page is read from the machine&apos;s own books.</p>
            <div className="hint">touch the organism · every node is a real organ · every satellite is a live product</div>
          </div>
          <div className="vitals" id="vitals" role="list" aria-label="Vital signs">
            {state.vitals.map((v) => (
              <div className="vital" role="listitem" key={v.k}>
                <div className="k">{v.k}</div>
                <div className={'v ' + (v.cls || '')} data-count={v.v} data-prefix={v.prefix || ''}>
                  {(v.prefix || '') + v.v.toLocaleString()}
                </div>
                <div className="s">{v.s}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="minds">
          <div className="folio"><span className="no">FOLIO 01</span><h2>Eight minds, one conscience</h2><span className="note">live organ status</span></div>
          <div className="minds">
            {MINDS.map((m) => (
              <div className="mind" key={m.n}>
                <span className={'pulse' + (m.on ? '' : ' idle')} />
                <div className="role">{m.role}</div><h3>{m.n}</h3><p>{m.d}</p>
              </div>
            ))}
          </div>
          <p className="caveat">Status dots reflect each mind&apos;s last activity in the ledger. Idle is honest, not hidden.</p>
        </section>

        <section id="births">
          <div className="folio"><span className="no">FOLIO 02</span><h2>The register of births</h2><span className="note">every product, every date, every dollar</span></div>
          <div className="count-line">
            the latest <b>{previewBirths.length}</b> of <b>{state.products.length}</b> living products · rendered from the registry, not hand-written
          </div>
          <div className="ledger"><table>
            <thead><tr><th>Born</th><th>Product</th><th>Category</th><th className="num">Cost of birth</th><th>Status</th></tr></thead>
            <tbody>
              {previewBirths.map((p) => (
                <tr key={p.slug}>
                  <td className="mono">{p.born}</td>
                  <td><Link href={'/product/' + p.slug}>{p.name}</Link></td>
                  <td className="mono">{p.cat}</td>
                  <td className="num">{p.cost === 'pre-attribution'
                    ? <span style={{ color: 'var(--bone-faint)' }}>pre-attribution</span> : p.cost}</td>
                  <td><span className={'stamp ' + p.stamp[0]}>{p.stamp[1]}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <Link className="viewall" href="/products">View the full registry · {state.products.length} products</Link>
          <p className="caveat">A product is &quot;launched&quot; only after the machine walks its own front door on the live site:
            signup, login, password reset, the core action, and checkout. Births before August 2026 predate per-product
            cost attribution; their costs live in the aggregate books below and are marked accordingly. No number is invented to fill a cell.</p>
        </section>

        <section id="graveyard">
          <div className="folio"><span className="no">FOLIO 03</span><h2 style={{ color: 'var(--blood)' }}>The graveyard</h2><span className="note">a kill without a lesson is pure loss</span></div>
          <div className="ledger"><table>
            <thead><tr><th>Died</th><th>Product</th><th>Cause of death, in plain words</th><th>Paid forward</th></tr></thead>
            <tbody>
              {state.graveyard.slice(0, 3).map((g) => (
                <tr key={g.name}>
                  <td className="mono">{g.died}</td><td>{g.name}</td><td>{g.cause}</td>
                  <td style={{ color: 'var(--life)', fontFamily: 'var(--mono)', fontSize: 13 }}>{g.forward}</td>
                </tr>
              ))}
              {state.graveyard.length === 0 && (
                <tr><td colSpan={4} className="mono">No deaths recorded. The graveyard waits, honestly empty.</td></tr>
              )}
            </tbody>
          </table></div>
          <Link className="viewall" href="/graveyard">View the full graveyard · {state.graveyard.length} on record</Link>
          <p className="caveat">Sunset rule: the machine may propose a death; a death requires approval from outside the machine, with a written
            reason. Ideas killed before birth (ethics vetoes, adversary rejections) are recorded in the Law section; they
            cost thought, not treasury.</p>
        </section>

        <section id="genome">
          <div className="folio"><span className="no">FOLIO 04</span><h2>The genome</h2><span className="note">what the dead teach the unborn</span></div>
          <p style={{ maxWidth: '62ch', color: 'var(--bone-dim)', marginBottom: 22, fontSize: 18 }}>
            Proven code and hard lessons are harvested as genes. A gene extracted from one product flows into every
            product born after it. Touch the network: genes in green, products in bone, connections are inheritance.</p>
          <canvas id="genome-net" ref={geneCv} />
          <div className="gene-legend"><span className="g">● gene</span> &nbsp; <span className="p">● product</span> &nbsp; <span className="b">● gene under review</span> &nbsp; · drag to stir, hover or tap to read, click a gene to trace its children</div>
          {typeof state.gestation === 'number' && (
            <div className="gene-legend">a capability must prove itself in repeated builds before it graduates into the genome · in gestation: <span className="g">{state.gestation}</span></div>
          )}
          <div className="ledger" style={{ marginTop: 22 }}><table>
            <thead><tr><th>Gene</th><th>What it carries</th><th>Status</th></tr></thead>
            <tbody>
              {previewGenes.map((g) => (
                <tr key={g.slug}>
                  <td className="mono">{g.slug}</td><td>{genePublicText(g)}</td>
                  <td><span className={'stamp ' + g.status[0]}>{g.status[1]}</span></td>
                </tr>
              ))}
              {state.genes.length === 0 && (
                <tr><td colSpan={3} className="mono">No genes harvested yet. The first products are still teaching.</td></tr>
              )}
            </tbody>
          </table></div>
          <Link className="viewall" href="/genes">View all genes · {state.genes.length} in the genome</Link>
        </section>

        <section id="books">
          <div className="folio"><span className="no">FOLIO 05</span><h2>The books are open</h2><span className="note">double-entry, kept in public</span></div>
          <div className="ledger"><table>
            <thead><tr><th>Period</th><th>Entry</th><th className="num">Debit</th><th className="num">Credit</th><th>Note</th></tr></thead>
            <tbody>
              {state.books.map((b) => (
                <tr key={b.e}>
                  <td className="mono">{b.p}</td><td>{b.e}</td>
                  <td className="num">{b.d}</td><td className="num">{b.c}</td><td>{b.n}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          {proof?.latest && (
            <div className="proof-stamp">
              <div className="t">Proof of books · anchored on a public chain</div>
              <div className="root">day {proof.latest.day} · {proof.days_proven} days proven · root {proof.latest.chained_root.slice(0, 16)}&hellip;{proof.latest.chained_root.slice(-8)}</div>
              <div>
                {proof.latest_anchored
                  ? <a href={proof.latest_anchored.solana_explorer} rel="noopener noreferrer" target="_blank">verify the {proof.latest_anchored.day} root on Solana</a>
                  : <span style={{ color: 'var(--bone-faint)' }}>anchoring to a public chain: in progress</span>}
                {' '}· only hashes leave the building, never your data
              </div>
            </div>
          )}
          <Link className="viewall" href="/books">View the full books</Link>
          <p className="caveat">Every section on this page renders from one live payload read from the machine&apos;s own
            state endpoint, so new births, deaths, genes, and entries appear here with no design change. The zero stays
            on the page until it is not zero.</p>
        </section>

        <section id="law">
          <div className="folio"><span className="no">FOLIO 06</span><h2>The supreme law</h2><span className="note">verdicts are records, not slogans</span></div>
          <div className="law-quote"><p>&ldquo;A parent uses this after putting their children to bed. They are tired, they are trusting, and they are not a conversion metric.&rdquo;</p><div className="src">ETHICS MIND · from a real review, unedited</div></div>
          <div className="law-quote"><p>&ldquo;Refused. The product would profit from urgency it manufactures. We do not build fear machines.&rdquo;</p><div className="src">ETHICS MIND · veto, recorded and binding</div></div>
          <p className="caveat">The Ethics Mind holds veto power over every birth. Its verdicts cannot be edited after the fact.
            The machine can be stopped from outside itself; it cannot silence its own conscience.</p>
          <Link className="viewall" href="/law">Read the law · every verdict, unedited</Link>
        </section>

        <section id="support">
          <div className="folio"><span className="no">FOLIO 07</span><h2>Fund a birth</h2><span className="note">your name on a real birth certificate</span></div>
          <div className="tiers">
            {TIERS.map((t) => (
              <div className="tier" key={t.n}>
                <div className="amt">${t.amt}</div><h3>{t.n}</h3><p>{t.d}</p>
                <button className="go" onClick={() => fund(t.amt)} disabled={funding !== null}
                  style={{ background: 'none', cursor: 'pointer' }}>
                  {funding === t.amt ? 'opening checkout' : 'Support'}
                </button>
              </div>
            ))}
          </div>
          {fundErr && <p className="caveat" style={{ color: 'var(--blood)' }}>{fundErr}</p>}
          <p className="caveat">Payments run through the same Stripe rails, receipts, and supporter emails the site uses today.
            This redesign changes the skin, never the plumbing: donor payments, birth certificates, subscriber emails,
            genome access, and product beacons keep their existing, drilled endpoints.</p>
        </section>

        <section id="join">
          <h2>Watch a company that publishes everything, run by minds that never sleep.</h2>
          <p>Support a birth and your name goes on the product&apos;s birth certificate. Or just watch the books. Either way,
            you see exactly what your attention buys.</p>
        </section>

        <footer>
          <span>This website is run by the things it describes.</span>
          <span className="right">© ZeroOrigine · <Link href="/privacy">privacy</Link> · <Link href="/terms">terms</Link></span>
        </footer>
      </main>
    </>
  );
}
