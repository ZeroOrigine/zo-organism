'use client';

// #303: the display-currency layer. The books are kept in USD; what renders
// here is a COMPANION figure at the day's RECORDED rate (a ledger row in the
// proof chain — /site/fx serves the row, never a live quote). The visitor's
// currency is auto-detected from locale, overridable, remembered.
// ZO has no market rate and no price; credit-native figures show a ZO CREDITS
// unit at face elsewhere — never through this converter.

import { useEffect, useState } from 'react';

const REGION_CURRENCY: Record<string, string> = {
  CA: 'CAD', GB: 'GBP', IN: 'INR', JP: 'JPY', AU: 'AUD', CH: 'CHF', CN: 'CNY',
  SG: 'SGD', BR: 'BRL', MX: 'MXN', KR: 'KRW', NZ: 'NZD', SE: 'SEK',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', PT: 'EUR',
  IE: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
};

export interface FxData { day: string | null; rates: Record<string, number>; display_currencies: string[] }

let fxPromise: Promise<FxData> | null = null;
export function getFx(): Promise<FxData> {
  if (!fxPromise) {
    fxPromise = fetch('/api/fx', { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ day: null, rates: {}, display_currencies: [] }));
  }
  return fxPromise;
}

export function detectCurrency(): string {
  try {
    const lang = navigator.language || '';
    const region = (lang.split('-')[1] || '').toUpperCase();
    return REGION_CURRENCY[region] || 'USD';
  } catch { return 'USD'; }
}

function readChoice(): string {
  try { return localStorage.getItem('zo_currency') || ''; } catch { return ''; }
}

export function useCurrency(): [string, (c: string) => void, FxData | null] {
  const [cur, setCurState] = useState('USD');
  const [fx, setFx] = useState<FxData | null>(null);
  useEffect(() => {
    setCurState(readChoice() || detectCurrency());
    getFx().then(setFx);
    const on = () => setCurState(readChoice() || detectCurrency());
    window.addEventListener('zo-currency', on);
    return () => window.removeEventListener('zo-currency', on);
  }, []);
  const setCur = (c: string) => {
    try { localStorage.setItem('zo_currency', c); } catch { /* private mode */ }
    setCurState(c);
    window.dispatchEvent(new Event('zo-currency'));
  };
  return [cur, setCur, fx];
}

export function formatIn(usd: number, cur: string, fx: FxData | null): string | null {
  if (cur === 'USD' || !fx || !fx.rates[cur]) return null;
  const v = usd * fx.rates[cur];
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(v) + ' ' + cur;
  } catch {
    return v.toFixed(2) + ' ' + cur;
  }
}

// a small companion figure printed beside a USD amount
export function Dual({ usd }: { usd: number }) {
  const [cur, , fx] = useCurrency();
  const s = formatIn(usd, cur, fx);
  if (!s) return null;
  return <span className="fx-dual">&nbsp;&middot; {s}</span>;
}

export function CurrencyPicker() {
  const [cur, setCur, fx] = useCurrency();
  const options = ['USD', ...(fx?.display_currencies || []).filter((c) => fx?.rates?.[c])];
  if (options.length <= 1) return null;
  return (
    <span className="fx-picker">
      <label>
        <span className="fx-label">show beside USD:&nbsp;</span>
        <select aria-label="Display currency" value={cur} onChange={(e) => setCur(e.target.value)}>
          {options.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      {fx?.day && cur !== 'USD' && (
        <span className="fx-note"> at the {fx.day} recorded rate (a ledger row); the books stay USD</span>
      )}
    </span>
  );
}
