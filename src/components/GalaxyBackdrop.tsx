'use client';

// #306 T7: the hero's ambient galaxy — a whisper of /genome. Lightweight by
// law: ~500 2D points, 30fps cap, 0.3 opacity, blur + vignette, very slow
// drift. Starts only AFTER window load (LCP untouched); disabled under
// prefers-reduced-motion and on small screens. The hero sentence stays king.

import { useEffect, useRef } from 'react';

export default function GalaxyBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    let raf = 0, running = false, last = 0;
    const start = () => {
      if (running) return;
      running = true;
      const cx = cv.getContext('2d');
      if (!cx) return;
      const dpr = Math.min(devicePixelRatio, 1.5);
      const W = () => cv.clientWidth * dpr, H = () => cv.clientHeight * dpr;
      const size = () => { cv.width = W(); cv.height = H(); };
      size();
      window.addEventListener('resize', size);

      // seeded field: a core cluster + a spiral arm, echoing the galaxy
      let s = 99;
      const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const pts = Array.from({ length: 500 }, (_, i) => {
        const arm = i > 170;
        const t = rnd();
        const r = arm ? 0.18 + t * 0.42 : 0.02 + Math.sqrt(rnd()) * 0.13;
        const a = arm ? t * 4.4 + 2.1 : rnd() * Math.PI * 2;
        return {
          r, a, sp: (arm ? 0.008 : 0.02) * (0.5 + rnd()),
          size: 0.6 + rnd() * 1.4,
          c: rnd() < 0.12 ? '61,218,140' : rnd() < 0.2 ? '212,169,78' : '141,151,143',
          o: 0.25 + rnd() * 0.5,
        };
      });

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (now - last < 33) return; // 30fps cap
        last = now;
        const w = cv.width, h = cv.height;
        cx.clearRect(0, 0, w, h);
        const cxp = w * 0.68, cyp = h * 0.42;
        for (const p of pts) {
          p.a += p.sp * 0.016;
          const x = cxp + Math.cos(p.a) * p.r * w;
          const y = cyp + Math.sin(p.a) * p.r * h * 0.62;
          cx.globalAlpha = p.o;
          cx.fillStyle = `rgb(${p.c})`;
          cx.beginPath(); cx.arc(x, y, p.size * dpr, 0, 7); cx.fill();
        }
        cx.globalAlpha = 1;
      };
      raf = requestAnimationFrame(frame);
    };

    if (document.readyState === 'complete') {
      const t = window.setTimeout(start, 300);
      return () => { window.clearTimeout(t); cancelAnimationFrame(raf); };
    }
    window.addEventListener('load', start, { once: true });
    return () => { window.removeEventListener('load', start); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="hero-galaxy" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
