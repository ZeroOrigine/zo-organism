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
import { Dual } from '@/lib/currency';
import GalaxyBackdrop from '@/components/GalaxyBackdrop';
import Link from 'next/link';
import AdoptedShelf from '@/components/AdoptedShelf';
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

// #4478: after the birth completes or is skipped, this tab (session) and this
// browser (7 days) have witnessed it. Failures are swallowed: storage that
// cannot be written simply means the ceremony may play again.
function markBorn() {
  try { sessionStorage.setItem('zo_born', '1'); } catch { /* play again later */ }
  try { localStorage.setItem('zo_born_at', String(Date.now())); } catch { /* play again later */ }
}

function witnessBirth() {
  try { sessionStorage.setItem('zo_witness', '1'); } catch { /* the reload will just skip */ }
  try { sessionStorage.removeItem('zo_born'); } catch { }
  try { localStorage.removeItem('zo_born_at'); } catch { }
  window.location.href = '/';
}
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
  // #4505: the LIVE dot and the primary nav now live in SiteNav (root layout)
  const [reduced, setReduced] = useState(false);
  const [funding, setFunding] = useState<number | null>(null);
  const [fundErr, setFundErr] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const heroCv = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const geneCv = useRef<HTMLCanvasElement>(null);
  const geneReadout = useRef<HTMLDivElement>(null);

  // W7: home is a PREVIEW. The latest births and genes render here; the full
  // registries live on /products and /genes, built for hundreds of rows.
  const previewBirths = useMemo(() => state.products.slice(0, BIRTHS_PREVIEW), [state.products]);
  const previewGenes = useMemo(() => state.genes.slice(0, GENES_PREVIEW), [state.genes]);

  // ---------- the birth ----------
  // #4478: the ceremony plays ONCE per arrival, not on every navigation.
  // It plays only when ALL are true: no URL hash, no same-site referrer,
  // no zo_born session flag, no return visit within 7 days — UNLESS the
  // visitor asked for it (the footer's witness control sets zo_witness).
  // Storage reads fail toward PLAYING: a blocked storage never mutes the birth.
  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(rm);
    if (rm) { setAlive(true); return; }
    let witness = false;
    try {
      witness = sessionStorage.getItem('zo_witness') === '1';
      if (witness) sessionStorage.removeItem('zo_witness');
    } catch { witness = false; }
    if (!witness) {
      let hasHash = false; let sameSite = false; let born = false; let recent = false;
      try { hasHash = !!window.location.hash; } catch { hasHash = false; }
      try {
        const ref = document.referrer;
        sameSite = !!ref && new URL(ref).origin === window.location.origin;
      } catch { sameSite = false; }
      try { born = sessionStorage.getItem('zo_born') === '1'; } catch { born = false; }
      try {
        const t = Number(localStorage.getItem('zo_born_at') || 0);
        recent = t > 0 && Date.now() - t < 7 * 24 * 3600 * 1000;
      } catch { recent = false; }
      if (hasHash || sameSite || born || recent) {
        setAlive(true);
        if (hasHash) {
          // the deep link lands on its target, not on the ceremony. Late
          // layout (canvas sizing, restored scroll) can undo a single early
          // scroll, so it retries until it sticks.
          [60, 400, 1200].forEach((ms) => setTimeout(() => {
            try {
              const el = document.querySelector(window.location.hash);
              if (el && Math.abs(el.getBoundingClientRect().top) > 120) {
                // INSTANT by the finding's letter: the page's smooth
                // scroll-behavior is an animation, and an animation can be
                // frozen by a hidden tab; a deep link must simply BE there
                window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'instant' as ScrollBehavior });
              }
            } catch { /* an unscrollable hash is harmless */ }
          }, ms));
        }
        return;
      }
    }
    let i = 0; let cancelled = false;
    const box = logRef.current;
    const timers: number[] = [];
    const next = () => {
      if (cancelled) return;
      if (!box || i >= BIRTH_LOG.length) { timers.push(window.setTimeout(() => { markBorn(); setAlive(true); }, 650)); return; }
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
        // #4492: money vitals carry cents (recognized revenue is exact to the
        // reconciliation) — a non-integer target formats with 2 decimals.
        const target = parseFloat(elm.getAttribute('data-count') || '0');
        const prefix = elm.getAttribute('data-prefix') || '';
        const fmt = (n: number) => Number.isInteger(target)
          ? Math.round(n).toLocaleString()
          : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (reduced || target === 0) { elm.textContent = prefix + fmt(target); return; }
        const t0 = performance.now(); const dur = 1400;
        const tick = (tm: number) => {
          let p = Math.min(1, (tm - t0) / dur); p = 1 - Math.pow(1 - p, 3);
          elm.textContent = prefix + fmt(target * p);
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

  // ---------- the genome: THE CHROMOSOME ----------
  // 2026-09-23. The previous drawing was a force simulation that placed a text
  // label on every gene; at 50 genes the labels collided into noise and at
  // 300 the folio was unreadable (founder: "definitely not scalable"). A label
  // needs pixels, a gene does not. So: genes are TICKS on family bands
  // (sorted, evenly spaced, no text on the canvas), products are fixed slots on
  // one row, and the only text is ONE readout line under the canvas that names
  // whatever the pointer is on. Past ~one tick per 3px a band becomes a density
  // strip and still reads by position. Nothing can overlap at any count.
  useEffect(() => {
    const gn = geneCv.current; const ro = geneReadout.current; if (!gn || !ro) return;
    const gx = gn.getContext('2d'); if (!gx) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let GW = 0; let GH = 0; let raf = 0; let stopped = false;
    const FAMILIES: Array<[string, RegExp]> = [
      ['launch', /^launch-/], ['qa', /^qa-/], ['ref', /^ref-/], ['mech', /^mech-/], ['core', /./],
    ];
    interface Tick { slug: string; hold: boolean; fam: number; x: number; y: number }
    interface Slot { name: string; x: number; y: number }
    let ticks: Tick[] = []; let slots: Slot[] = []; let bands: Array<{ name: string; y: number; n: number; dense: boolean }> = [];
    let sel = -1; let hov = -1; let pulse = 0;
    const genes = [...state.genes].sort((p, q) => p.slug.localeCompare(q.slug));
    const prods = state.products.slice(0, 10);
    const gsize = () => { GW = gn.clientWidth; GH = gn.clientHeight; gn.width = GW * DPR; gn.height = GH * DPR; gx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    const gbuild = () => {
      ticks = []; slots = []; bands = [];
      const grouped: Tick[][] = FAMILIES.map(() => []);
      genes.forEach((g) => {
        const fi = FAMILIES.findIndex(([, re]) => re.test(g.slug));
        grouped[fi].push({ slug: g.slug, hold: g.status[0] === 'hold', fam: fi, x: 0, y: 0 });
      });
      const present = grouped.map((t, i) => ({ t, i })).filter((f) => f.t.length > 0);
      const left = GW < 760 ? 58 : 92; const right = GW - 40; const span = right - left;
      const top = 26; const rowH = Math.min(46, (GH * 0.64) / Math.max(1, present.length));
      present.forEach((f, r) => {
        const y = top + r * rowH + rowH / 2;
        const n = f.t.length; const gap = n > 1 ? span / (n - 1) : 0;
        const dense = n > span / 3;
        bands.push({ name: FAMILIES[f.i][0], y, n, dense });
        f.t.forEach((t, k) => { t.x = n > 1 ? left + k * gap : left + span / 2; t.y = y; ticks.push(t); });
      });
      const py = GH - 34; const pw = span / Math.max(1, prods.length);
      prods.forEach((p, i) => slots.push({ name: p.name, x: left + pw * i + pw / 2, y: py }));
    };
    const ellipsize = (txt: string, max: number) => {
      if (gx.measureText(txt).width <= max) return txt;
      let t = txt; while (t.length > 2 && gx.measureText(t + '…').width > max) t = t.slice(0, -1);
      return t + '…';
    };
    const gdraw = () => {
      if (stopped) return;
      gx.clearRect(0, 0, GW, GH);
      pulse = rm ? 1 : 0.85 + Math.abs(Math.sin(Date.now() * 0.0016)) * 0.15;
      const left = GW < 760 ? 58 : 92; const right = GW - 40;
      // bands
      gx.font = '12px IBM Plex Mono, monospace'; gx.textAlign = 'right'; gx.textBaseline = 'middle';
      bands.forEach((b) => {
        gx.strokeStyle = 'rgba(233,228,214,.10)'; gx.lineWidth = 1;
        gx.beginPath(); gx.moveTo(left, b.y); gx.lineTo(right, b.y); gx.stroke();
        gx.fillStyle = 'rgba(233,228,214,.55)'; gx.fillText(b.name, left - 10, b.y);
        gx.textAlign = 'left'; gx.fillStyle = 'rgba(233,228,214,.35)'; gx.fillText(String(b.n), right + 6, b.y); gx.textAlign = 'right';
      });
      // inheritance: only for the selected (or hovered) gene, to every product slot
      const focus = sel >= 0 ? sel : hov;
      if (focus >= 0) {
        const t = ticks[focus];
        slots.forEach((s) => {
          gx.setLineDash(t.hold ? [3, 5] : []);
          gx.strokeStyle = t.hold ? 'rgba(232,180,76,.45)' : 'rgba(61,255,158,.45)'; gx.lineWidth = 1;
          gx.beginPath(); gx.moveTo(t.x, t.y); gx.lineTo(s.x, s.y); gx.stroke();
        });
        gx.setLineDash([]);
      }
      // ticks (or density strips)
      bands.forEach((b) => {
        const mine = ticks.filter((t) => t.y === b.y);
        if (b.dense) {
          const g = gx.createLinearGradient(left, 0, right, 0);
          g.addColorStop(0, 'rgba(61,255,158,.55)'); g.addColorStop(1, 'rgba(61,255,158,.55)');
          gx.fillStyle = g; gx.fillRect(left, b.y - 5, right - left, 10);
          mine.forEach((t) => { if (t.hold) { gx.fillStyle = 'rgba(232,180,76,.9)'; gx.fillRect(t.x - 1, b.y - 6, 2, 12); } });
        } else {
          mine.forEach((t) => {
            const on = ticks.indexOf(t) === focus;
            const h = on ? 14 : 9;
            gx.fillStyle = t.hold ? (on ? '#F2C56A' : 'rgba(232,180,76,.85)') : (on ? '#7CFFBF' : 'rgba(61,255,158,' + 0.75 * pulse + ')');
            gx.fillRect(t.x - (on ? 1.5 : 1), t.y - h / 2, on ? 3 : 2, h);
          });
        }
      });
      // product slots
      gx.textAlign = 'center'; gx.font = '12px IBM Plex Mono, monospace';
      const pw = (right - left) / Math.max(1, slots.length);
      slots.forEach((s) => {
        gx.fillStyle = 'rgba(233,228,214,.6)'; gx.beginPath(); gx.arc(s.x, s.y, 3.4, 0, 7); gx.fill();
        gx.fillStyle = 'rgba(233,228,214,.55)'; gx.fillText(ellipsize(s.name, pw - 8), s.x, s.y + 16);
      });
      if (!rm) raf = requestAnimationFrame(gdraw);
    };
    const readout = () => {
      const i = sel >= 0 ? sel : hov;
      if (i < 0) { ro.textContent = 'hover or tap a tick to read the gene · a selected gene lights its inheritance into every product born after it'; return; }
      const t = ticks[i];
      ro.textContent = t.slug + ' · ' + (t.hold ? 'under review, tethered until its findings clear' : 'in the genome, inherited by every later birth') + ' · family ' + FAMILIES[t.fam][0];
    };
    const nearest = (mx: number, my: number) => {
      // a tick is 2px wide; the hit target is the band's full height and half the gap to its neighbour
      let best = -1; let bd = 18 * 18;
      ticks.forEach((t, i) => { if (Math.abs(t.y - my) > 16) return; const dx = t.x - mx; const d = dx * dx; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const onGMove = (ev: MouseEvent) => {
      const r = gn.getBoundingClientRect(); const h = nearest(ev.clientX - r.left, ev.clientY - r.top);
      if (h !== hov) { hov = h; readout(); if (rm) gdraw(); }
      gn.style.cursor = h >= 0 ? 'pointer' : 'default';
    };
    const onClick = (ev: MouseEvent) => {
      const r = gn.getBoundingClientRect(); const h = nearest(ev.clientX - r.left, ev.clientY - r.top);
      sel = h === sel ? -1 : h; readout(); if (rm) gdraw();
    };
    const onLeave = () => { hov = -1; readout(); if (rm) gdraw(); };
    const onResize = () => { gsize(); gbuild(); if (rm) gdraw(); };
    gn.addEventListener('click', onClick); gn.addEventListener('mousemove', onGMove); gn.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);
    gsize(); gbuild(); readout(); if (rm) { gdraw(); } else { raf = requestAnimationFrame(gdraw); }
    return () => { stopped = true; cancelAnimationFrame(raf); gn.removeEventListener('click', onClick); gn.removeEventListener('mousemove', onGMove); gn.removeEventListener('mouseleave', onLeave); window.removeEventListener('resize', onResize); };
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
          <button id="skipbirth" type="button" onClick={() => { markBorn(); setAlive(true); }}>skip the birth</button>
        </>
      )}


      <main id="page" className={alive ? 'alive' : ''}>
        <section id="hero">
          {/* #306 T7: the galaxy, whispered — dimmed, blurred, behind everything */}
          <GalaxyBackdrop />
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
                  {(v.prefix || '') + (Number.isInteger(v.v) ? v.v.toLocaleString()
                    : v.v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </div>
                <div className="s">{v.s}{v.prefix === '$' && <Dual usd={v.v} />}</div>
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
          <AdoptedShelf items={state.adopted} compact />
          <Link className="viewall" href="/products">View the full registry · {state.products.length} products</Link>
          <p className="caveat">A product is &quot;launched&quot; only after the machine walks its own front door on the live site:
            signup, login, password reset, the core action, and checkout, or, for products built without accounts,
            the core action alone. Births before August 2026 predate per-product
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
            product born after it. Each tick is one gene on its family band; the row beneath is the latest births.
            Touch a tick and its inheritance lights up.</p>
          <canvas id="genome-net" ref={geneCv} />
          <div className="gene-legend" ref={geneReadout} aria-live="polite" />
          <div className="gene-legend"><span className="g">▮ gene in the genome</span> &nbsp; <span className="b">▮ gene under review</span> &nbsp; <span className="p">● product</span> &nbsp; · one tick per gene, grouped by family; the readout above names what you touch</div>
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
          <p className="caveat">This folio reads a rolling 30 days ending now; the statement at /books uses calendar
            months, so the two can differ by a few cents mid-month by design. On the Solana link, expand the
            transaction&apos;s first instruction: the memo carries the day and the root.</p>
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
          <Link className="viewall" href="/support-crypto">Prefer crypto? Send SOL or USDC on Solana</Link>
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
          <button className="witness" type="button" onClick={witnessBirth}>witness a birth</button>
          <span className="right">© ZeroOrigine · <Link href="/privacy">privacy</Link> · <Link href="/terms">terms</Link></span>
        </footer>
      </main>
    </>
  );
}
