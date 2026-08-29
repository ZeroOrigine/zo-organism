'use client';

// #4505(3): the stale-session self-heal. A tab left open across a deploy
// references chunks that no longer exist; the next navigation dies with a
// ChunkLoadError and the page goes blank with dead nav clicks. Detect that
// exact failure class and reload ONCE (session-guarded so a genuinely
// broken deploy cannot reload-loop).

import { useEffect } from 'react';

const PATTERN = /ChunkLoadError|Loading chunk .+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

function healOnce() {
  try {
    if (sessionStorage.getItem('zo_chunk_reload') === '1') return;
    sessionStorage.setItem('zo_chunk_reload', '1');
  } catch { /* private mode: still reload, just unguarded */ }
  window.location.reload();
}

export default function ChunkReload() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const sig = `${e.message || ''} ${(e.error && (e.error.name + ' ' + e.error.message)) || ''}`;
      if (PATTERN.test(sig)) healOnce();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      const sig = `${(r && r.name) || ''} ${(r && r.message) || String(r || '')}`;
      if (PATTERN.test(sig)) healOnce();
    };
    // a load that SURVIVES 10s is healthy: clear the guard so the NEXT
    // deploy can heal too. Clearing on mount would re-arm a reload loop.
    const t = window.setTimeout(() => {
      try { sessionStorage.removeItem('zo_chunk_reload'); } catch { /* ignore */ }
    }, 10000);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
