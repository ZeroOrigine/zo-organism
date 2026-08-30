'use client';

// #308 C5: one-tap native share; clipboard fallback where share is absent.
import { useState } from 'react';

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const [msg, setMsg] = useState('');
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setMsg('link copied');
      setTimeout(() => setMsg(''), 2500);
    } catch { /* user dismissed */ }
  };
  return (
    <button className="viewall" style={{ marginTop: 0, cursor: 'pointer', background: 'none' }}
      onClick={share} type="button">{msg || 'share this certificate'}</button>
  );
}
