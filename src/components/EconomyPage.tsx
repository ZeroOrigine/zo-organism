'use client';

// #297: THE ZO ECONOMY. Faithful production port of the approved prototype
// ("The ZO Economy", cowork 2026-08-29) onto the organism design system.
// The Gate Watch meters read LIVE from the ledger via /site/economy; the
// allocation renders the founder's recorded ruling (zo_tokenomics_approved:
// 40/25/20/5/5/5). Language law: usage and participation only; never
// equity, profit, income, or price talk. No em dash in any copy.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface EconomyGates {
  paying_customers: number; revenue_30d: number; revenue_alltime: number;
  signups_real: number; real_signal_products: number;
}
export interface EconomyTargets {
  phase1_paying_customers: number; phase2_monthly_revenue_usd: number;
  phase2_months_required: number; phase2_active_users: number;
}

const ALLOC: Record<string, { t: string; p: string; d: string; r: string }> = {
  eco: { t: 'Ecosystem Treasury', p: '40% · 400,000,000 ZO',
    d: 'The war chest for infinite growth: it funds new births and entirely new minds. It does not unlock on a calendar. It unlocks on proof.',
    r: 'EMISSION LAW · tokens release ONLY against anchored ledger events: a product born, a mind commissioned, a gene graduated. No work, no unlock. The emission schedule IS the machine’s output.' },
  com: { t: 'Community, earned', p: '25% · 250,000,000 ZO',
    d: 'Users, supporters, gene contributors, and credit conversion. Earned only. Airdrops to strangers create holders with no relationship to the mission; this economy refuses them.',
    r: 'ACQUISITION LAW · use a product, support a birth, contribute a gene, or buy credits that convert 1:1 at token birth. Those are the four doors. There is no fifth.' },
  fdr: { t: 'Founder', p: '20% · 200,000,000 ZO',
    d: 'Four-year vest with a one-year cliff, then about 1.25% of total supply per quarter. Nothing liquid at birth. The founder waits longest, on purpose: the trust premium every early-selling team forfeits is this economy’s core asset.',
    r: 'VESTING LAW · multisig custody, published schedule, every vest event anchored to the chain the day it happens. The books watch the founder like they watch the machine.' },
  mind: { t: 'The Minds', p: '5% · 50,000,000 ZO',
    d: 'Earned by the machine’s recorded labor since day zero: every build, verdict, heal and anchor sits in the ledger as proof of work already done. Held by the machine’s own treasury, spendable only on its own compute and births.',
    r: 'FIRST OF ITS KIND · an institution that owns part of itself, with its labor record, not a claim, as the basis. When the minds buy their own compute with their own earnings, sovereignty stops being a metaphor.' },
  liq: { t: 'Liquidity', p: '5% · 50,000,000 ZO',
    d: 'Exists so Phase 3 is possible, locked so Phase 3 is never rushed. Behind the Phase 3 gate and fresh counsel, and it may rationally never unlock.',
    r: 'LOCK LAW · untouchable until Phase 2 is proven in use and tradeability has written legal blessing. No exceptions, no emergencies.' },
  res: { t: 'Reserve', p: '5% · 50,000,000 ZO',
    d: 'Legal, operations, and listings if ever. The boring allocation, kept small and kept visible.',
    r: 'TRANSPARENCY LAW · every movement is a ledger row, every row hashes into the day’s root, every root lands on-chain. The reserve cannot move quietly.' },
};

export interface EconomyMint {
  address: string; vault: string; conception_sig: string;
  explorer_mint: string; explorer_memo: string | null;
}

export default function EconomyPage({ gates, targets, anchorSig, anchorDay, creditsLive, mint }: {
  gates: EconomyGates | null; targets: EconomyTargets | null;
  anchorSig: string | null; anchorDay: string | null; creditsLive?: boolean;
  mint?: EconomyMint | null;
}) {
  const [allocKey, setAllocKey] = useState('eco');
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const tlRef = useRef<HTMLDivElement>(null);
  const metersRef = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm || !('IntersectionObserver' in window)) { setGrown(true); setRevealed(true); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setGrown(true); setRevealed(true); io.disconnect(); }
    }, { threshold: 0.15 });
    if (tlRef.current) io.observe(tlRef.current);
    const io2 = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setGrown(true); io2.disconnect(); }
    }, { threshold: 0.3 });
    if (metersRef.current) io2.observe(metersRef.current);
    return () => { io.disconnect(); io2.disconnect(); };
  }, []);

  const t = targets || { phase1_paying_customers: 25, phase2_monthly_revenue_usd: 2000, phase2_months_required: 3, phase2_active_users: 500 };
  const pct = (num: number, den: number) => Math.max(num > 0 ? 1.5 : 0.8, Math.min(100, (num / den) * 100));
  const toggle = (id: string) => setOpenPhases((o) => ({ ...o, [id]: !o[id] }));
  const a = ALLOC[allocKey];

  const PHASES = [
    { id: 'p0', state: 'live', tag: 'PHASE 0', name: 'The Proof Layer', status: 'LIVE · ANCHORED', cls: 'live',
      short: 'Every ledger row hashes into a daily root; every root chains to the last and lands on Solana. The institution can no longer rewrite its own history. Shipped, running, under a cent a day.',
      mech: [
        ['Triple entry.', ' Debit, credit, and a third entry no bookkeeper can touch: sha256(prev_root + merkle_root + day), anchored as a Solana memo transaction.'],
        ['One transaction commits all history.', ' Each day’s root contains the day before it, so the newest anchor seals everything behind it.'],
        ['Public verification.', ' Anyone can request any entry’s Merkle path and check it against the chain. No account. No permission. No trust.'],
        ['Only hashes leave the building.', ' Never customer data.'],
      ],
      gateHead: 'GATE', gate: 'Founder approval. PASSED. First anchor finalized 2026-08-29, block 442678226.' },
    // #299 C5: the card flips itself the moment the ledger holds a real
    // purchase entry; before that it reads open-by-ruling.
    { id: 'p1', state: creditsLive ? 'live' : 'armed', tag: 'PHASE 1', name: 'ZO Credits',
      status: creditsLive ? 'LIVE · OPEN' : 'OPEN BY RULING · AWAITING FIRST PURCHASE',
      cls: creditsLive ? 'live' : 'armed',
      short: 'One balance, bought with ordinary money, spendable across every product the machine has ever born. The first way the public puts value IN. Not a security anywhere on earth. Open now at /credits.',
      mech: [
        ['Buy anytime, in fiat or crypto.', ' Credits are product prepayment under the gift-card model: clean accounting, no yield, no resale, no promises.'],
        ['One balance, every product.', ' Subscriptions, genome access, anything the fleet sells now or ever.'],
        ['The bridge clause.', ' Credits convert 1:1 into ZO on the day the token is born. Buying credits is how the public arrives early, without a token sale ever happening.'],
        ['Recorded forever.', ' Every credit purchase enters the anchored ledger. Remember that for Folio E·4.'],
      ],
      gateHead: 'GATE', gate: 'Opened by founder ruling 2026-08-29 (recorded in the ledger). The paying-customers count stays on the Gate Watch as a vital. Buy credits at zeroorigine.com/credits.' },
    { id: 'p2', state: 'armed', tag: 'PHASE 2', name: 'The Birth of ZO', status: 'DESIGNED · UNBORN', cls: 'armed',
      short: 'An SPL token on Solana, born with a birth certificate anchored on-chain, the same ceremony as every product. Utility first, earned mostly, sold never. Full specification below in Folio E·3.',
      mech: [
        ['Utility, in priority order:', ' pay any subscription in ZO at a discount · genome access · birth governance (holders vote which approved product is born next) · permanent on-chain supporter record.'],
        ['No public token sale.', ' ZO is earned by use, support, and contribution, or arrives via credit conversion. The absence of a sale is the legal architecture, not a marketing line.'],
        ['Constitutional language law.', ' The token conveys usage and participation. Never equity, never profit rights, never income promises. The minds are banned from price talk, permanently.'],
        ['Fixed supply.', ' 1,000,000,000 ZO. No inflation, ever. Emission only unlocks against proven work (Folio E·3).'],
      ],
      gateHead: 'GATE · CANNOT BE BYPASSED, EVEN BY THE FOUNDER',
      gate: 'A written opinion from a Canadian securities lawyer. That is the only door (amended by the founder 2026-08-29; the revenue and user thresholds moved to the Gate Watch as public vitals). The pre-approval of this roadmap explicitly does not open this gate, and counsel will weigh the same utility evidence the vitals show.' },
    { id: 'p3', state: 'far', tag: 'PHASE 3', name: 'The Open Market, Maybe', status: 'BEHIND PHASE 2 · MAY NEVER OPEN', cls: 'far',
      short: 'Tradeability, only if Phase 2 utility is real, only with counsel, only if it serves holders rather than speculation. The token is valuable without it, the way airline miles are.',
      mech: [
        ['Liquidity is a decision, not a destiny.', ' The 5% liquidity allocation stays locked until this gate, and the gate may rationally never pass.'],
        ['If it never opens,', ' the books will show exactly why, and that outcome is also the design working. The first promise of this economy is that nothing here exists without earning it.'],
      ],
      gateHead: 'GATE', gate: 'Phase 2 complete and proven in use, plus fresh legal counsel for tradeability. Nothing else unlocks it.' },
  ];

  return (
    <main style={{ opacity: 1 }}>
      <nav aria-label="Primary">
        <span className="wordmark">Zero<b>Origine</b></span>
        <span className="links">
          <Link href="/">Organism</Link><Link href="/products">Births</Link>
          <Link href="/graveyard">Graveyard</Link><Link href="/genes">Genome</Link>
          <Link href="/books">Books</Link><Link href="/law">Law</Link>
          <a href="/economy" style={{ color: 'var(--life)' }}>Economy</a>
          <Link href="/whitepaper">Paper</Link>
        </span>
      </nav>

      <header className="eco-hero">
        <div className="egg" aria-hidden="true"><span>0</span></div>
        <p className="eco-label life" style={{ marginBottom: 18 }}>THE ZO ECONOMY · A PRODUCT IN THE WOMB</p>
        <h1>The token that refuses to exist <em>until it earns to.</em></h1>
        <p className="sub">Eight AI minds run an autonomous institution with open, chain-anchored books. Its currency is
          treated like its products: an unborn entity behind written gates, gestating in public. This page is the gestation, live.</p>
        {anchorSig && (
          <div className="proofstrip">LATEST ANCHOR · Solana mainnet · {anchorDay} · <a href={'https://solscan.io/tx/' + anchorSig} rel="noopener noreferrer" target="_blank"><b>{anchorSig.slice(0, 20)}&hellip;{anchorSig.slice(-8)}</b></a></div>
        )}
        <div className="scrollhint">descend</div>
      </header>

      <section className="eco-section" style={{ paddingTop: 24 }}>
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">FOLIO E·0</span><h2>Value the old ledgers cannot see</h2></div>
          <p className="eco-lede">Human accounting prices what was spent. It has no column for what was <b>learned, proven,
            and made incorruptible</b>. The machine already holds three assets no balance sheet records: a genome of proven
            code that makes every next birth cheaper, a labor record of an institution that never sleeps, and books that
            mathematics itself audits. The token exists to let the world hold a piece of that invisible value, without ever
            pretending it is equity.</p>
        </div>
      </section>

      <section className="eco-section" style={{ paddingTop: 0 }}>
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">FOLIO E·1</span><h2>Four phases, four gates</h2><span className="eco-label right">TAP A PHASE TO OPEN IT</span></div>
          <div className="timelineE" ref={tlRef}>
            <div className={'spine' + (grown ? ' grow' : '')}><i /></div>
            {PHASES.map((p) => (
              <article className={'phaseE' + (revealed ? ' in' : '') + (openPhases[p.id] ? ' open' : '')} data-state={p.state} key={p.id}>
                <span className="node" />
                <div className="cardE">
                  <button className="card-top" aria-expanded={!!openPhases[p.id]} onClick={() => toggle(p.id)}>
                    <span className="ph-tag">{p.tag}</span><h3>{p.name}</h3>
                    <span className={'statusE ' + p.cls}>{p.status}</span><span className="chev">▶</span>
                  </button>
                  <p className="short">{p.short}</p>
                  <div className="detailE"><div className="detail-inner">
                    <ul className="mech">
                      {p.mech.map(([b, rest], i) => (<li key={i}><b>{b}</b>{rest}</li>))}
                    </ul>
                    <div className="gatebox"><p className="eco-label gold">{p.gateHead}</p><p>{p.gate}</p></div>
                  </div></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="eco-section eco-band">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">FOLIO E·2</span><h2>The Gate Watch</h2><span className="eco-label right">ONE GATE, TWO VITALS · HONEST ZEROS, SHOWN LARGE</span></div>
          <p className="eco-lede">The crypto world has watched a thousand tokens launch. It has never watched a token earn
            the right to launch, in public, against written acceptance tests. These meters read from the anchored ledger.
            They cannot be inflated, because inflating them would break a hash chain the institution does not control.</p>
          <div className="meters" ref={metersRef}>
            {gates ? (
              <>
                <div className="meter">
                  <div className="row"><h4>Phase 1 gate: paying customers</h4>
                    <span className="num">{gates.paying_customers} / {t.phase1_paying_customers}</span></div>
                  <div className="bar"><i style={{ width: grown ? pct(gates.paying_customers, t.phase1_paying_customers) + '%' : 0 }} /></div>
                  <small>counted from settled payment rows in the ledger, not signups</small>
                </div>
                <div className="meter">
                  <div className="row"><h4>Vital: monthly revenue</h4>
                    <span className="num">${gates.revenue_30d.toFixed(2)} last 30 days · reference ${t.phase2_monthly_revenue_usd.toLocaleString()}/mo</span></div>
                  <div className="bar"><i style={{ width: grown ? pct(gates.revenue_30d, t.phase2_monthly_revenue_usd) + '%' : 0 }} /></div>
                  <small>a signal of life, watched in public, no longer a door · the number is small and printed anyway</small>
                </div>
                <div className="meter">
                  <div className="row"><h4>Vital: active users</h4>
                    <span className="num">{gates.signups_real} recorded signups · reference {t.phase2_active_users}</span></div>
                  <div className="bar"><i style={{ width: grown ? pct(gates.signups_real, t.phase2_active_users) + '%' : 0 }} /></div>
                  <small>a signal of life, watched in public, no longer a door · {gates.real_signal_products} products carry real signal today</small>
                </div>
              </>
            ) : (
              <div className="meter"><h4>The gate meters are not answering right now.</h4>
                <small>Rather than show an invented number, this section waits. Refresh in a minute.</small></div>
            )}
          </div>
        </div>
      </section>

      <section className="eco-section">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">FOLIO E·3</span><h2>One billion ZO, allocated like a ledger</h2><span className="eco-label right">HOVER OR TAP A BLOCK</span></div>
          <p className="eco-lede">Fixed supply. No inflation. Most of it is earned, none of it is sold at birth, and the
            largest share belongs to the machine&apos;s future work. This allocation was ruled by the founder on 2026-08-29
            and recorded in the ledger; the phase gates stand above it.</p>

          <div className="allocbar" role="tablist" aria-label="Token allocation">
            <button className="seg s-eco" role="tab" onClick={() => setAllocKey('eco')} onMouseEnter={() => setAllocKey('eco')} onFocus={() => setAllocKey('eco')}><span>ECOSYSTEM 40%</span></button>
            <button className="seg s-com" role="tab" onClick={() => setAllocKey('com')} onMouseEnter={() => setAllocKey('com')} onFocus={() => setAllocKey('com')}><span>EARNED 25%</span></button>
            <button className="seg s-fdr" role="tab" onClick={() => setAllocKey('fdr')} onMouseEnter={() => setAllocKey('fdr')} onFocus={() => setAllocKey('fdr')}><span>FOUNDER 20%</span></button>
            <button className="seg s-mind" role="tab" onClick={() => setAllocKey('mind')} onMouseEnter={() => setAllocKey('mind')} onFocus={() => setAllocKey('mind')}><span>5%</span></button>
            <button className="seg s-liq" role="tab" onClick={() => setAllocKey('liq')} onMouseEnter={() => setAllocKey('liq')} onFocus={() => setAllocKey('liq')}><span>5%</span></button>
            <button className="seg s-res" role="tab" onClick={() => setAllocKey('res')} onMouseEnter={() => setAllocKey('res')} onFocus={() => setAllocKey('res')}><span>5%</span></button>
          </div>

          <div className="alloc-detail" aria-live="polite">
            <h4>{a.t} <span className="pct">{a.p}</span></h4>
            <p>{a.d}</p>
            <div className="rule2">{a.r}</div>
          </div>

          <div className="tablewrap">
            <table className="alloc">
              <thead><tr><th>Allocation</th><th>Share</th><th>Vesting and law</th></tr></thead>
              <tbody>
                <tr><td><span className="swatch" style={{ background: '#2FA76B' }} />Ecosystem Treasury</td><td className="pctcell">40%</td><td>Proof-of-birth emission: unlocks only against anchored work events. Multisig held.</td></tr>
                <tr><td><span className="swatch" style={{ background: '#57C98B' }} />Community, earned</td><td className="pctcell">25%</td><td>Users, supporters, gene contributors, credit conversion. Earned only. No airdrops to strangers, ever.</td></tr>
                <tr><td><span className="swatch" style={{ background: 'var(--gold)' }} />Founder</td><td className="pctcell">20%</td><td>4-year vest, 1-year cliff, then about 1.25% of total per quarter. Zero liquid at birth. Multisig, published schedule, every vest event anchored.</td></tr>
                <tr><td><span className="swatch" style={{ background: '#B7E4C7' }} />The Minds</td><td className="pctcell">5%</td><td>Earned by recorded machine labor since day zero. Held by the machine&apos;s own treasury; spendable only on its own compute and births. The first institution to own part of itself.</td></tr>
                <tr><td><span className="swatch" style={{ background: '#a58ee0' }} />Liquidity</td><td className="pctcell">5%</td><td>Locked behind the Phase 3 gate. May never unlock, and the design says so in print.</td></tr>
                <tr><td><span className="swatch" style={{ background: '#93A097' }} />Reserve</td><td className="pctcell">5%</td><td>Legal, operations, listings if ever. Movements visible in the anchored books like everything else.</td></tr>
              </tbody>
            </table>
          </div>

          <div className="emission">
            <div className="em-box"><p className="eco-label life">PROVEN WORK</p><p>a birth · a new mind · a graduated gene</p></div>
            <div className="em-arrow">▶</div>
            <div className="em-box"><p className="eco-label gold">UNLOCKED ZO</p><p>emission released against the anchored event</p></div>
            <p className="em-note">Every other token emits on a clock and prays for work to follow. ZO inverts it: the clock
              is dead, the work is the clock. If the machine stops building, the treasury stops flowing, verifiably. Growth
              over an infinite period needs exactly one thing: that the reproduction loop stays honest and funded. This law
              fuses the two.</p>
          </div>
        </div>
      </section>

      <section className="eco-section eco-band">
        <div className="eco-wrap" style={{ display: 'grid', gap: 26 }}>
          <div className="eco-head" style={{ marginBottom: 0 }}><span className="eco-label gold">FOLIO E·4</span><h2>The ledger is the whitelist</h2></div>
          <p className="bigline">No presale. No promises. <em>History itself is the allowlist.</em></p>
          <p className="eco-lede">When ZO is born, earned allocations read from the anchored record: who supported, who used,
            who contributed, who bought credits, since day zero. Every day that passes adds another sealed root to the only
            whitelist that will ever exist. Joining early is valuable not because of a promise made today, but because the
            record of today cannot be forged tomorrow.</p>
        </div>
      </section>

      <section className="eco-section">
        <div className="eco-wrap">
          <div className="eco-head"><span className="eco-label gold">FOLIO E·5</span><h2>The conceived mint</h2><span className="eco-label right">COUNTERFEIT WARNING · STANDING</span></div>
          {mint ? (
            <>
              <p className="eco-lede">The canonical on-chain identity of ZO has been <b>conceived</b>: an SPL mint on Solana
                mainnet with <b>zero supply</b>. No ZO tokens exist. The mint and freeze authority both sit with the
                2-of-2 treasury vault (founder + machine); the machine&apos;s own key cannot mint alone, and neither can the
                founder&apos;s. Birth (supply, distribution) stays behind the Phase 2 legal-opinion gate.</p>
              <div className="gatebox" style={{ marginTop: 22 }}>
                <p className="eco-label gold">THE ONE TRUE MINT ADDRESS</p>
                <p style={{ wordBreak: 'break-all', fontFamily: 'var(--mono, monospace)' }}>{mint.address}</p>
                <p style={{ marginTop: 10 }}>Supply: 0 · decimals 9 · mint + freeze authority: treasury vault{' '}
                  <span style={{ wordBreak: 'break-all', fontFamily: 'var(--mono, monospace)' }}>{mint.vault}</span></p>
                <p style={{ marginTop: 10 }}>
                  <a href={mint.explorer_mint} rel="noopener noreferrer" target="_blank">verify the mint on Solana</a>
                  {mint.explorer_memo && (<>{' · '}<a href={mint.explorer_memo} rel="noopener noreferrer" target="_blank">the conception memo</a></>)}
                </p>
              </div>
              <p className="eco-lede" style={{ marginTop: 22 }}><b>Any ZO in circulation today is counterfeit.</b> The birth
                of real supply will be announced here and confirmed by a signed memo transaction from the machine&apos;s anchor
                address 77E28MtzWiE5jKwF7yALzysiBqpwQwKMmEwpgDzcHjgk. Any token claiming to be ZO without that signed
                confirmation, or under any other mint address, is a fake.</p>
            </>
          ) : (
            <p className="eco-lede">No ZO token exists today, and no mint has been conceived yet. When ZO&apos;s on-chain
              identity is reserved, its one true mint address will be published here and confirmed by a signed memo from
              the machine&apos;s anchor address 77E28MtzWiE5jKwF7yALzysiBqpwQwKMmEwpgDzcHjgk. Until then, every token
              claiming to be ZO is counterfeit.</p>
          )}
          <p className="eco-lede" style={{ marginTop: 26 }}>The full story, from the proof layer to the growth law, lives in
            the whitepaper: <Link href="/whitepaper" style={{ color: 'var(--life)' }}>read the whitepaper</Link>, rendered
            live from the machine&apos;s constitution store, with a downloadable PDF.</p>
        </div>
      </section>

      <div className="eco-closing">
        <p className="eco-label life" style={{ marginBottom: 20 }}>THE STANDING SENTENCE</p>
        <p className="bigline">If the gates never pass, the token is never born. <em>That outcome is also the design working.</em></p>
        <p>Everything at ZeroOrigine begins at zero and earns its existence. The currency is not an exception. It is the
          proof the rule has no exceptions.</p>
      </div>

      <footer>
        <span>zeroorigine.com · books anchored daily on Solana · verify anything, trust nothing</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
