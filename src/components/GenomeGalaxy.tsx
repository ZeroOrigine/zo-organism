'use client';

// #306 T1 — THE GENOME GALAXY. Faithful port of cowork's founder-approved
// prototype (branch cowork/prototypes @ 40ca210) onto live data: the
// embedded 2026-08-29 snapshot is REPLACED by the live library payload
// (per the port rules in zo_config.zo_relay_note). Design preserved;
// fonts follow the site's self-hosted set (the fonts law); three.js is
// bundled, never a CDN. Every count on this page is a database read.
// T5 rides the gene card: status chip with live progress toward the
// published graduation rule, W8-guarded text, the lock + supporter CTA at
// the moment of maximum curiosity, and the one free sample.
// Tooltip content is DOM-built with textContent (never innerHTML): gene
// names are machine-written rows, and the page treats them as data anyway.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { genePublicText } from '@/components/OrganismPage';

export interface GalaxyNode {
  id: string; name: string; cat: string; mtype: string; origin: string | null;
  used: number; q: number; status: 'pushed' | 'blocked' | 'queued' | 'gestation';
  born: string; d: string;
}
export interface GalaxyProduct { name: string; slug: string; status: 'live' | 'launched' | 'dropped'; born: string; project_id: string }
export interface GalaxyData {
  counts: { modules: number; inheritances: number; pushed: number; queued: number; blocked: number; gestation: number };
  grad_rule: { uses_required: number; text: string };
  free_sample: string;
  products: GalaxyProduct[];
  nodes: GalaxyNode[];
}

const STATUS_LABEL: Record<string, string> = {
  pushed: 'IN THE GENOME', queued: 'QUEUED FOR REVIEW',
  blocked: 'HELD BACK', gestation: 'IN GESTATION',
};

// tooltip lines are [strong?, text] pairs rendered via textContent only
function setTip(el: HTMLDivElement, lines: Array<[boolean, string]>) {
  el.replaceChildren();
  lines.forEach(([strong, text], i) => {
    if (i > 0) el.appendChild(document.createElement('br'));
    const node = document.createElement(strong ? 'b' : 'span');
    if (!strong) node.className = 'c';
    node.textContent = text;
    el.appendChild(node);
  });
}

export default function GenomeGalaxy({ data }: { data: GalaxyData }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [gene, setGene] = useState<GalaxyNode | null>(null);
  const [card, setCard] = useState<{ eyebrow: string; title: string; rows: [string, string][]; statusColor?: string } | null>(null);
  const controls = useRef<{ goTo: (i: number) => void; setPlaying: (v: boolean) => void; next: () => void; prev: () => void; cycleSpeed: () => string; stops: number; dropped: boolean[] } | null>(null);
  const [dot, setDot] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedLabel, setSpeedLabel] = useState('1x');
  // FIX 2026-08-31: three.js is imported only after DESCEND, so there were several
  // seconds of pure black with no sign the page was working. Show the wait.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!entered || !stageRef.current || !data) return;
    let disposed = false;
    setReady(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import('three');
      if (disposed || !stageRef.current) return;
      const stage = stageRef.current;
      const W = () => hostRef.current!.clientWidth;
      const H = () => hostRef.current!.clientHeight;

      const COL = { space: 0x04070a, gold: 0xd4a94e, green: 0x3bda8c, cyan: 0x63d3c2, red: 0xe0604c, ember: 0xa06a58, sun: 0xf2e9d5, core: 0xbfe8cf };
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W(), H());
      stage.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(COL.space);
      scene.fog = new THREE.FogExp2(COL.space, 0.0016);
      const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 4000);
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const keyLight = new THREE.PointLight(0xfff4dc, 1.1, 0, 0);
      keyLight.position.set(0, 120, 0);
      scene.add(keyLight);

      function glowTex(hex: number) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 128;
        const x = cv.getContext('2d')!;
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        const col = new THREE.Color(hex);
        const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
        g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(0.35, `rgba(${rgb},0.28)`); g.addColorStop(1, `rgba(${rgb},0)`);
        x.fillStyle = g; x.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(cv);
      }
      const TEX: Record<string, InstanceType<typeof THREE.CanvasTexture>> = {
        gold: glowTex(COL.gold), green: glowTex(COL.green), cyan: glowTex(COL.cyan),
        red: glowTex(COL.red), sun: glowTex(COL.sun), ember: glowTex(COL.ember), core: glowTex(COL.core),
      };

      // starfield (seeded, deterministic)
      {
        const n = 2600, pos = new Float32Array(n * 3); let s = 42;
        const srnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < n; i++) {
          const r = 600 + srnd() * 1600, th = srnd() * Math.PI * 2, ph = Math.acos(2 * srnd() - 1);
          pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
          pos[i * 3 + 1] = r * Math.cos(ph) * 0.6;
          pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x4a5a52, size: 1.6, sizeAttenuation: true, transparent: true, opacity: 0.8 })));
      }

      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const sphereGeo = new THREE.SphereGeometry(1, 20, 16);
      const MAT = {
        gold: new THREE.MeshLambertMaterial({ color: COL.gold, emissive: COL.gold, emissiveIntensity: 0.25 }),
        green: new THREE.MeshLambertMaterial({ color: COL.green, emissive: COL.green, emissiveIntensity: 0.55 }),
        cyan: new THREE.MeshLambertMaterial({ color: COL.cyan, emissive: COL.cyan, emissiveIntensity: 0.45 }),
        red: new THREE.MeshLambertMaterial({ color: COL.red, emissive: COL.red, emissiveIntensity: 0.5 }),
        sun: new THREE.MeshBasicMaterial({ color: COL.sun }),
        ember: new THREE.MeshBasicMaterial({ color: COL.ember }),
      };
      const statusKey = (s: string) => s === 'pushed' ? 'green' : s === 'queued' ? 'cyan' : s === 'blocked' ? 'red' : 'gold';
      const pickables: InstanceType<typeof THREE.Mesh>[] = [];
      function addGlow(obj: InstanceType<typeof THREE.Object3D>, key: string, scale: number) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX[key], transparent: true, depthWrite: false }));
        sp.scale.setScalar(scale); obj.add(sp); return sp;
      }
      const planetSize = (u: number) => 0.5 + Math.log2(u + 2) * 0.30;

      // LIVE DATA (replaces the prototype snapshot)
      const nodes = data.nodes;
      const products = data.products;
      const bySlugProject: Record<string, GalaxyNode[]> = {};
      const foundation: GalaxyNode[] = [];
      for (const g of nodes) {
        if (!g.origin || g.origin === 'harvested-from-7-products') foundation.push(g);
        else (bySlugProject[g.origin] = bySlugProject[g.origin] || []).push(g);
      }

      // the core: founding pool
      const coreGroup = new THREE.Group(); scene.add(coreGroup);
      const coreStar = new THREE.Mesh(new THREE.SphereGeometry(4.6, 28, 22), new THREE.MeshBasicMaterial({ color: COL.core }));
      coreStar.userData = { kind: 'core' }; addGlow(coreStar, 'core', 34); coreGroup.add(coreStar); pickables.push(coreStar);
      for (const g of foundation) {
        const k = statusKey(g.status);
        const m = new THREE.Mesh(sphereGeo, MAT[k as keyof typeof MAT]);
        const r = 11 + 34 * Math.sqrt(rnd()), th = rnd() * Math.PI * 2, y = (rnd() * 2 - 1);
        m.position.set(r * Math.cos(th), y * 10 * (1 - r / 60), r * Math.sin(th));
        m.scale.setScalar(planetSize(g.used));
        m.userData = { kind: 'gene', g, home: 'the founding pool' };
        if (g.status !== 'gestation') addGlow(m, k, 7);
        coreGroup.add(m); pickables.push(m);
      }

      // product suns on the spiral arm
      const suns: { group: InstanceType<typeof THREE.Group>; name: string; pstat: string; d: string; genes: GalaxyNode[]; dead: boolean }[] = [];
      const orbiters: { m: InstanceType<typeof THREE.Mesh>; R: number; tilt: number; phase: number; speed: number }[] = [];
      products.forEach((p, i) => {
        const ang = i * 0.585 + 2.1, r = 78 + i * 10.6, y = Math.sin(i * 1.63) * 13;
        const group = new THREE.Group();
        group.position.set(r * Math.cos(ang), y, r * Math.sin(ang)); scene.add(group);
        const dead = p.status === 'dropped';
        const sun = new THREE.Mesh(new THREE.SphereGeometry(dead ? 1.9 : 3.0, 24, 18), dead ? MAT.ember : MAT.sun);
        sun.userData = { kind: 'sun', name: p.name, pstat: p.status, d: p.born, i };
        addGlow(sun, dead ? 'ember' : 'sun', dead ? 11 : 22); group.add(sun); pickables.push(sun);
        const genes = bySlugProject[p.project_id] || [];
        genes.forEach((g, j) => {
          const k = statusKey(g.status);
          const m = new THREE.Mesh(sphereGeo, MAT[k as keyof typeof MAT]);
          m.scale.setScalar(planetSize(g.used));
          m.userData = { kind: 'gene', g, home: p.name };
          if (g.status !== 'gestation') addGlow(m, k, 6);
          group.add(m); pickables.push(m);
          orbiters.push({ m, R: 6 + j * 1.9, tilt: (rnd() - 0.5) * 0.9, phase: rnd() * Math.PI * 2, speed: (dead ? 0.02 : 0.09) / Math.pow(1 + j * 0.35, 0.7) });
        });
        const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), group.position.clone().negate()]);
        group.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x14231d, transparent: true, opacity: 0.55 })));
        suns.push({ group, name: p.name, pstat: p.status, d: p.born, genes, dead });
      });

      // DOM labels
      const labels: { el: HTMLDivElement; getPos: () => InstanceType<typeof THREE.Vector3> }[] = [];
      function mkLabel(text: string, ember = false) {
        const el = document.createElement('div');
        el.className = 'gx-plabel'; el.textContent = text;
        if (ember) el.style.color = 'var(--gx-ember)';
        stage.appendChild(el); return el;
      }
      labels.push({ el: mkLabel('the founding pool'), getPos: () => coreGroup.position });
      suns.forEach((s) => labels.push({ el: mkLabel(s.name.toLowerCase(), s.dead), getPos: () => s.group.position }));

      // camera rig + tour
      const rig = { target: new THREE.Vector3(0, 0, 0), radius: 430, theta: 0.9, phi: 1.12 };
      function applyRig() {
        const t = rig.target, r = rig.radius, st = Math.sin(rig.phi), ct = Math.cos(rig.phi);
        camera.position.set(t.x + r * st * Math.cos(rig.theta), t.y + r * ct, t.z + r * st * Math.sin(rig.theta));
        camera.lookAt(t);
      }
      const c = data.counts;
      type Stop = { name: string; eyebrow: string; dead?: boolean; pstat?: string; get: () => { target: InstanceType<typeof THREE.Vector3>; radius: number }; rows: () => [string, string][] };
      const topFoundation = [...foundation].sort((a, b) => b.used - a.used)[0];
      const stops: Stop[] = [
        { name: 'the galaxy', eyebrow: 'overview', get: () => ({ target: new THREE.Vector3(0, 0, 0), radius: 430 }),
          rows: () => [['genes', String(c.modules)], ['births', String(products.length)], ['in the genome', String(c.pushed)], ['queued for review', String(c.queued)], ['held back', String(c.blocked)]] },
        { name: 'the founding pool', eyebrow: 'galactic core', get: () => ({ target: coreGroup.position.clone(), radius: 95 }),
          rows: () => [['genes in the pool', String(foundation.length)],
            ['most used', topFoundation ? `${topFoundation.name.slice(0, 18)} · ${topFoundation.used} builds` : 'none'],
            ['status', 'feeding every birth']] },
        ...suns.map((s): Stop => ({ name: s.name, eyebrow: 'birth · ' + s.d, dead: s.dead, pstat: s.pstat,
          get: () => ({ target: s.group.position.clone(), radius: s.dead ? 26 : 34 }),
          rows: () => {
            const top = [...s.genes].sort((a, b) => b.used - a.used)[0];
            return [['status', s.pstat.toUpperCase()], ['genes harvested', String(s.genes.length)],
              ...(top ? [['notable gene', top.name.length > 22 ? top.name.slice(0, 22) + '…' : top.name] as [string, string]] : [['harvest', 'foundation era'] as [string, string]])];
          } })),
      ];

      let cur = 0, isPlaying = false, speedIdx = 1;
      const SPEEDS = [0.5, 1, 2];
      let flight: { t0: number; dur: number; from: { target: InstanceType<typeof THREE.Vector3>; radius: number; theta: number }; to: { target: InstanceType<typeof THREE.Vector3>; radius: number; theta: number } } | null = null;
      let holdT = 0; const HOLD = 7.5;
      function showCard(stop: Stop) {
        const stCol = stop.pstat ? (stop.dead ? 'var(--gx-ember)' : (stop.pstat === 'live' ? 'var(--gx-green)' : 'var(--gx-bone)')) : 'var(--gx-green)';
        setCard({ eyebrow: stop.eyebrow, title: stop.name, rows: stop.rows(), statusColor: stCol });
      }
      function goTo(i: number, instant = false) {
        cur = ((i % stops.length) + stops.length) % stops.length;
        const s = stops[cur], dest = s.get();
        setDot(cur); showCard(s); holdT = 0;
        if (instant) { rig.target.copy(dest.target); rig.radius = dest.radius; flight = null; return; }
        flight = { t0: performance.now(), dur: 2600 / SPEEDS[speedIdx],
          from: { target: rig.target.clone(), radius: rig.radius, theta: rig.theta },
          to: { target: dest.target, radius: dest.radius, theta: rig.theta + 0.9 } };
      }
      const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      controls.current = {
        goTo: (i) => { isPlaying = false; setPlaying(false); goTo(i); },
        setPlaying: (v) => { isPlaying = v; setPlaying(v); },
        next: () => goTo(cur + 1), prev: () => goTo(cur - 1),
        cycleSpeed: () => { speedIdx = (speedIdx + 1) % SPEEDS.length; const l = SPEEDS[speedIdx] + 'x'; setSpeedLabel(l); return l; },
        stops: stops.length, dropped: stops.map((s) => !!s.dead),
      };

      // manual orbit + picking
      let dragging = false, px = 0, py = 0, moved = 0;
      const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
      function pick(e: PointerEvent) {
        const rect = stage.getBoundingClientRect();
        mouse.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        ray.setFromCamera(mouse, camera);
        const hits = ray.intersectObjects(pickables, false);
        return hits[0] ? (hits[0].object as InstanceType<typeof THREE.Mesh>) : null;
      }
      const onDown = (e: PointerEvent) => { dragging = true; moved = 0; px = e.clientX; py = e.clientY; stage.classList.add('dragging'); };
      const onMove = (e: PointerEvent) => {
        if (dragging) {
          const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
          moved += Math.abs(dx) + Math.abs(dy);
          rig.theta -= dx * 0.005; rig.phi = Math.min(2.6, Math.max(0.35, rig.phi - dy * 0.004)); flight = null;
          return;
        }
        const tip = tipRef.current; if (!tip) return;
        const o = pick(e);
        const rect = stage.getBoundingClientRect();
        if (o && o.userData.kind === 'gene') {
          const g: GalaxyNode = o.userData.g;
          setTip(tip, [[true, g.name],
            [false, `${g.cat} · used in ${g.used} builds · ${g.status}`],
            [false, `home: ${o.userData.home} · tap to read`]]);
        } else if (o && o.userData.kind === 'sun') {
          setTip(tip, [[true, o.userData.name], [false, `born ${o.userData.d} · ${o.userData.pstat}`]]);
        } else if (o && o.userData.kind === 'core') {
          setTip(tip, [[true, 'the founding pool'], [false, `${foundation.length} genes feeding every birth`]]);
        } else { tip.style.opacity = '0'; return; }
        tip.style.left = Math.min(rect.width - 260, e.clientX - rect.left + 14) + 'px';
        tip.style.top = (e.clientY - rect.top + 14) + 'px';
        tip.style.opacity = '1';
      };
      const onUp = (e: PointerEvent) => {
        const wasDrag = moved > 6;
        dragging = false; stage.classList.remove('dragging');
        if (wasDrag) return;
        const o = pick(e);
        if (o && o.userData.kind === 'gene') { setGene(o.userData.g); }
        else if (o && o.userData.kind === 'sun') { isPlaying = false; setPlaying(false); goTo(2 + o.userData.i); }
        else if (o && o.userData.kind === 'core') { isPlaying = false; setPlaying(false); goTo(1); }
      };
      const onWheel = (e: WheelEvent) => { e.preventDefault(); rig.radius = Math.min(900, Math.max(12, rig.radius * (1 + e.deltaY * 0.001))); flight = null; };
      stage.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      stage.addEventListener('wheel', onWheel, { passive: false });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === ' ') { e.preventDefault(); isPlaying = !isPlaying; setPlaying(isPlaying); }
        if (e.key === 'ArrowRight') goTo(cur + 1);
        if (e.key === 'ArrowLeft') goTo(cur - 1);
      };
      window.addEventListener('keydown', onKey);

      // start
      goTo(0, true); showCard(stops[0]);
      if (!reduced) { isPlaying = true; setPlaying(true); goTo(1); }

      let last = performance.now(); let raf = 0;
      const v = new THREE.Vector3();
      function frame(now: number) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const sp = SPEEDS[speedIdx];
        coreGroup.rotation.y += dt * 0.03 * sp;
        for (const o of orbiters) {
          o.phase += dt * o.speed * sp;
          const cc = Math.cos(o.phase) * o.R, s2 = Math.sin(o.phase) * o.R;
          o.m.position.set(cc, Math.sin(o.phase) * o.R * Math.sin(o.tilt), s2 * Math.cos(o.tilt));
        }
        if (flight) {
          const t = Math.min(1, (now - flight.t0) / flight.dur), k = ease(t);
          rig.target.lerpVectors(flight.from.target, flight.to.target, k);
          rig.radius = flight.from.radius + (flight.to.radius - flight.from.radius) * k;
          rig.theta = flight.from.theta + (flight.to.theta - flight.from.theta) * k;
          if (t >= 1) flight = null;
        } else {
          if (!dragging && !reduced) rig.theta += dt * 0.05 * sp;
          if (isPlaying) { holdT += dt * sp; if (holdT > HOLD) goTo(cur + 1); }
        }
        applyRig();
        const rw = stage.clientWidth, rh = stage.clientHeight;
        for (const L of labels) {
          v.copy(L.getPos()); v.y += 6; v.project(camera);
          const behind = v.z > 1, x = (v.x * 0.5 + 0.5) * rw, y = (-v.y * 0.5 + 0.5) * rh;
          L.el.style.opacity = behind ? '0' : String(Math.max(0, 1 - Math.abs(v.z) * 0.35));
          L.el.style.left = x + 'px'; L.el.style.top = y + 'px';
        }
        renderer.render(scene, camera);
      }
      applyRig();
      renderer.render(scene, camera);   // paint frame one before we call it ready
      setReady(true);
      raf = requestAnimationFrame(frame);
      const onResize = () => {
        camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H());
      };
      window.addEventListener('resize', onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('wheel', onWheel);
        labels.forEach((L) => L.el.remove());
        renderer.dispose();
        if (stage.contains(renderer.domElement)) stage.removeChild(renderer.domElement);
      };
    })();

    return () => { disposed = true; cleanup && cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered, data]);

  const c = data.counts;
  const usesReq = data.grad_rule?.uses_required || 10;
  const foundationCount = data.nodes.filter((n) => !n.origin || n.origin === 'harvested-from-7-products').length;

  return (
    <div className="galaxy" ref={hostRef}>
      <div className="gx-stage" ref={stageRef} />
      <div className="gx-hud gx-counts">
        {c.modules} genes · {data.products.length} births<br />
        <span className="g">{c.pushed} in the genome</span><br />
        <span className="q">{c.queued} queued for review</span><br />
        <span className="a">{c.gestation} in gestation</span><br />
        <span className="b">{c.blocked} held back</span>
      </div>

      {card && entered && !gene && (
        <div className="gx-hud gx-card on">
          <div className="eyebrow">{card.eyebrow}</div>
          <h2>{card.title}</h2>
          <div>
            {card.rows.map((r, i) => (
              <div className="row" key={i}><span>{r[0]}</span>
                <b style={r[0] === 'status' ? { color: card.statusColor } : undefined}>{r[1]}</b></div>
            ))}
          </div>
        </div>
      )}

      {gene && (
        <div className="gx-hud gx-card gx-gene on" aria-live="polite">
          <button className="gx-close" onClick={() => setGene(null)} aria-label="Close" type="button">×</button>
          <div className="eyebrow">{gene.id}</div>
          <h2>{gene.name}</h2>
          <div className="row"><span>status</span>
            <b className={'st-' + gene.status}>{STATUS_LABEL[gene.status]}</b></div>
          {gene.status === 'gestation' && (
            <div className="row"><span>toward graduation</span>
              <b>used {Math.min(gene.used, usesReq)} of {usesReq} required</b></div>
          )}
          <div className="row"><span>used in</span><b>{gene.used} builds</b></div>
          <div className="row"><span>home</span><b>{gene.origin ? gene.origin.replace('zo-', '') : 'the founding pool'}</b></div>
          <p className="gx-desc">{genePublicText({ d: gene.d, status: [gene.status === 'pushed' ? 'ship' : 'hold', gene.status] })}</p>
          {gene.id === data.free_sample ? (
            <p className="gx-lock"><Link href="/genome/sample">THE FREE SAMPLE: read this gene in full</Link> · one gene
              is fully open so the lock on the rest is credible</p>
          ) : (
            <p className="gx-lock">🔒 full doc · code · harvest findings are supporter access.{' '}
              <Link href="/#support">become a supporter</Link> · <Link href="/library">already one? the library</Link></p>
          )}
        </div>
      )}

      {entered && !ready && (
        <div className="gx-loading" role="status" aria-live="polite">
          <div className="sub">building the galaxy</div>
          <div className="lead">{c.modules} genes are being placed in orbit</div>
          <div className="track"><i /></div>
        </div>
      )}

      <div className="gx-tip" ref={tipRef} />

      {entered && (
        <div className="gx-hud gx-bar">
          <button onClick={() => controls.current?.prev()} title="previous (left arrow)" type="button">◀</button>
          <button onClick={() => controls.current?.setPlaying(!playing)} title="play or pause (space)" type="button" style={{ minWidth: 74 }}>
            {playing ? 'pause' : 'descend'}
          </button>
          <button onClick={() => controls.current?.next()} title="next (right arrow)" type="button">▶</button>
          <div className="gx-dots">
            {Array.from({ length: controls.current?.stops || 0 }, (_, i) => (
              <i key={i} className={(i === dot ? 'on ' : '') + (controls.current?.dropped[i] ? 'dropped' : '')}
                onClick={() => controls.current?.goTo(i)} title={`stop ${i + 1}`} />
            ))}
          </div>
          <button onClick={() => controls.current?.cycleSpeed()} title="tour speed" type="button" style={{ minWidth: 44 }}>{speedLabel}</button>
        </div>
      )}

      <div className="gx-hud gx-foot">drag to orbit · wheel to zoom · tap a body to read it · every count on this page is a database read</div>

      {!entered && (
        <div className="gx-intro">
          <div className="box">
            <div className="eyebrow">the delivery of every birth, kept</div>
            <h1>The Genome Galaxy</h1>
            <p>{c.modules} genes orbit {data.products.length} births. The founding pool holds {foundationCount} of them
              at the galactic core. Dropped products burn as dim embers. Nothing here is invented: every body is a row
              in the anchored ledger.</p>
            <button onClick={() => setEntered(true)} type="button">DESCEND INTO THE GENOME</button>
          </div>
        </div>
      )}
    </div>
  );
}
