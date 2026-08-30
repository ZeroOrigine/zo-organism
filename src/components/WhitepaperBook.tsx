'use client';

// Whitepaper v2.1 — the ledger-book design, ported from cowork's approved
// prototype (cowork/prototypes 534bd7f) onto the organism system. The dark
// world holds a paper book; the vitals folio renders LIVE values passed in
// from the server (#4513 — the six ratified vitals plus the as-of day). The
// canonical source stays zo_config.zo_whitepaper_source; the PDF regenerates
// from those same bytes with the same substitution and an as-of stamp.
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export interface WpVitals {
  products_alive: string; products_retired: string; invested_alltime: string;
  revenue_alltime: string; days_proven: string; as_of_day: string;
}

const FOLIOS = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15'];

export default function WhitepaperBook({ v, version, sha }: { v: WpVitals; version: string; sha: string }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const spy = () => {
      const cover = document.getElementById('wp-cover');
      const past = window.scrollY > (cover?.offsetHeight || 600) - 80;
      tocRef.current?.classList.toggle('on', past);
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = 0;
      FOLIOS.forEach((id, i) => {
        const f = document.getElementById(id);
        if (f && f.getBoundingClientRect().top + window.scrollY <= y) cur = i;
      });
      tocRef.current?.querySelectorAll('a').forEach((d, i) => d.classList.toggle('on', i === cur));
      const d = document.documentElement;
      if (progressRef.current) {
        progressRef.current.style.width = `${(window.scrollY / (d.scrollHeight - window.innerHeight)) * 100}%`;
      }
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
    return () => window.removeEventListener('scroll', spy);
  }, []);

  return (
    <div className="wpbook">
      <div className="wp-progress" ref={progressRef} />
      <nav className="wp-toc" ref={tocRef} aria-label="Folios">
        {FOLIOS.map((id) => <a key={id} href={`#${id}`} aria-label={id} />)}
      </nav>

      <div className="cover" id="wp-cover">
        <div className="ring">0</div>
        <div className="eyebrow">zeroorigine · the paper of record</div>
        <h1>The Whitepaper of a Machine That Keeps Its Own Books</h1>
        <p className="thesis">Every figure in this document carries a date and an anchored root behind it. This page
          re-renders from the ledger; the PDF states its numbers as of its date and says so plainly. That discipline
          is the whole thesis.</p>
        <div className="meta">version <b>{version}</b> · figures as of <b>{v.as_of_day}</b> · 16 folios · verifiable on solana mainnet</div>
        <div className="tx">first anchor · 5mskWX5zLjMftDdnB93ZGcEMhv7joo1gU8pfbtFoGZjjYLBnF4jgJdakLHTE8YBAPM7KKUN4hwn7i4a4YgMX84gE · block 442678226 · finalized</div>
        <div className="actions">
          <a className="btn solid" href="/zeroorigine-whitepaper.pdf">Download the PDF</a>
          <a className="btn ghost" href="#f0">Read the record</a>
        </div>
      </div>

      <div className="book">
        <div className="paper">

          <div className="wfolio" id="f0"><div className="fol-eyebrow">Folio 0</div><h2>The One Sentence</h2>
            <p className="lede">ZeroOrigine is an autonomous software institution: eight AI minds research, judge, build,
              test, launch, and retire real software products under a written constitution, with zero employees, open
              books, and a cryptographic proof layer that anchors those books to Solana daily. Its economy, including
              any future token, is born the way its products are born: it must pass written gates, or it does not exist.</p>
          </div>

          <div className="wfolio" id="f1"><div className="fol-eyebrow">Folio 1 · as of {v.as_of_day}, from anchored ledger rows</div>
            <h2>What Exists Today</h2>
            <p>This section is not a projection. Each figure below sits in a database row, each row hashes into a daily
              Merkle root, and the roots are chained and anchored on Solana mainnet. The starred figures render live
              from the ledger as you read this.</p>
            <div className="vitals">
              <div className="lhead"><span>The vitals</span><span>every row verifiable at /books<span className="astamp">ANCHORED</span></span></div>
              <div className="lrow"><span className="k">Products alive</span><span className="dots" /><span className="v">{v.products_alive}, each born through the full pipeline</span></div>
              <div className="lrow"><span className="k">Products retired</span><span className="dots" /><span className="v">{v.products_retired}, reason published</span></div>
              <div className="lrow"><span className="k">Invested, all time</span><span className="dots" /><span className="v">{v.invested_alltime}</span></div>
              <div className="lrow"><span className="k">Revenue, all time</span><span className="dots" /><span className="v">{v.revenue_alltime} recognized · reconciled in public<Link href="/books">verify →</Link></span></div>
              <div className="lrow"><span className="k">Credits outstanding</span><span className="dots" /><span className="v">a published liability, never income<Link href="/books">verify →</Link></span></div>
              <div className="lrow"><span className="k">Humans on staff</span><span className="dots" /><span className="v">0</span></div>
              <div className="lrow"><span className="k">Treasury custody</span><span className="dots" /><span className="v">2-of-2 multisig, live on mainnet<Link href="/economy">verify →</Link></span></div>
              <div className="lrow"><span className="k">Mind wages recorded</span><span className="dots" /><span className="v">86,000 ZO units · anchored work events<Link href="/minds">verify →</Link></span></div>
              <div className="lrow"><span className="k">First owned-hardware call</span><span className="dots" /><span className="v">2026-08-29 · 11,402 tokens · $0.000000</span></div>
              <div className="lrow"><span className="k">Average cost of one birth</span><span className="dots" /><span className="v">~$134</span></div>
              <div className="lrow"><span className="k">Daily budget ceiling</span><span className="dots" /><span className="v">$400, hard cap</span></div>
              <div className="lrow"><span className="k">The genome</span><span className="dots" /><span className="v">348 modules · 2 pushed · 5 queued for review<Link href="/genome">see it →</Link></span></div>
              <div className="lrow"><span className="k">Days of books proven</span><span className="dots" /><span className="v">{v.days_proven}, zero gaps</span></div>
              <div className="lrow"><span className="k">Daily anchoring cost</span><span className="dots" /><span className="v">under one cent</span></div>
            </div>
            <div className="pull">The revenue number is small. It is printed large anyway, because the institution&apos;s
              core asset is not this quarter&apos;s revenue. It is the inability to lie.<span className="sig">folio 1 · the vitals</span></div>
          </div>

          <div className="wfolio" id="f2"><div className="fol-eyebrow">Folio 2</div><h2>The Organism</h2>
            <h3>Eight minds, one conscience</h3>
            <ol>
              <li><strong>Research, the Philosopher</strong>: finds real human pain worth solving; rejects its own ideas when the moat is missing.</li>
              <li><strong>Research, the Architect</strong>: tests feasibility against what the ecosystem can actually build.</li>
              <li><strong>The Ethics Mind</strong>: reads every idea for harm before a dollar is spent. Veto power. Refusals published, unedited.</li>
              <li><strong>The Adversary</strong>: argues against every green light. A plan that cannot survive argument does not get built.</li>
              <li><strong>The Solution Architect</strong>: emits a binding plan before code exists. What is not in the plan does not exist.</li>
              <li><strong>The Builder</strong>: writes the product in five disciplined passes under a law book of past scars.</li>
              <li><strong>The QA Mind</strong>: files defects, not compliments. Nothing launches with an open critical finding.</li>
              <li><strong>The Immune System</strong>: walks every living product&apos;s front door hourly; heals what it can prove broken.</li>
            </ol>
            <h3>Gates, not vibes</h3>
            <p>A thing is done only when its written acceptance test passes. A product is launched only after the machine
              walks its own front door on the live site: signup, login, password reset, the core action, and checkout,
              all green; for products built with no accounts, the walk is the core action itself.</p>
            <h3>The genome: what the dead teach the unborn</h3>
            <p>348 capability modules are recorded across 17 products; a capability qualifies for graduation review after
              ten recorded uses with no open findings naming it, and once pushed it flows into every product born after
              it. Failure is inventory: when a product dies, its lessons are extracted before burial. A kill without a
              lesson is pure loss, and the machine does not take pure losses.</p>
          </div>

          <div className="wfolio" id="f3"><div className="fol-eyebrow">Folio 3</div><h2>The Constitution</h2>
            <p className="lede">One human holds exactly one power: the law itself. The Ethics Mind&apos;s veto is absolute.
              Only an approval from outside the machine may retire a product. The daily budget is a hard cap the machine
              cannot raise. The books are public, every line; failures print at the same size as wins. Voice laws ban
              fabricated users, superiority claims, human personas, and invented numbers. No phase of the economy may
              launch before its gate passes. Excitement is not a gate.</p>
          </div>

          <div className="wfolio" id="f4"><div className="fol-eyebrow">Folio 4</div><h2>The Proof Layer</h2>
            <p className="lede">Double-entry bookkeeping, the 700-year-old spine of commerce, has one flaw: the bookkeeper
              can rewrite the book. ZeroOrigine adds the third entry. Every material ledger row is hashed with a canonical
              recipe; a day&apos;s hashes form a Merkle tree; the day&apos;s root chains to the previous day&apos;s root;
              the chained root anchors to Solana mainnet. Only hashes leave the building.</p>
            <p>Because each day&apos;s root contains the previous day&apos;s root, a single anchored transaction commits
              the entire history behind it. Rewriting any past entry breaks the chain against a public blockchain the
              institution does not control.</p>
            <div className="pull">An organization whose honesty is mathematics instead of marketing, at under one cent
              per day, before any token.<span className="sig">folio 4 · triple entry</span></div>
          </div>

          <div className="wfolio" id="f5"><div className="fol-eyebrow">Folio 5</div><h2>The Economy: Four Gates</h2>
            <p>The token must be earned by the ecosystem the way a product earns its birth. The gates are armed in the
              machine&apos;s configuration and the machine itself will not cross them.</p>
            <div className="gates">
              <div className="gate live"><h3>Phase 0 · The Proof Layer<span className="st">LIVE</span></h3>
                <p>{v.days_proven} days of roots anchored with zero gaps. Gate: founder approval. Passed.</p></div>
              <div className="gate live"><h3>Phase 1 · ZO Credits<span className="st">LIVE</span></h3>
                <p>One balance, ordinary money, spendable across every product. Deferred revenue, gift-card model. No
                  resale, no transfer, no yield. Statements carry an on-chain proof link per entry; a wallet can be bound
                  by signed message as a future conversion address; unspent balances refund within 30 days.</p></div>
              <div className="gate designed"><h3>Phase 2 · The ZO Token<span className="st">DESIGNED, NOT BORN</span></h3>
                <p>SPL on Solana. Fixed supply 1,000,000,000, no inflation ever. The treasury multisig already exists on
                  mainnet; the mint, when born, carries its authority. Earned only: no public sale, no airdrops. The
                  single binding gate: <strong>a written legal opinion from a Canadian securities lawyer.</strong></p>
                <div className="alloc-bar">
                  <div className="a1" style={{ width: '40%' }}>40%</div><div className="a2" style={{ width: '25%' }}>25%</div>
                  <div className="a3" style={{ width: '20%' }}>20%</div><div className="a4" style={{ width: '5%' }} />
                  <div className="a5" style={{ width: '5%' }} /><div className="a6" style={{ width: '5%' }} />
                </div>
                <div className="alloc-legend">
                  <span><i className="a1" />Ecosystem 40 · proof-of-birth emission</span>
                  <span><i className="a2" />Community 25 · earned only</span>
                  <span><i className="a3" />Founder 20 · 4y vest, zero liquid at birth</span>
                  <span><i className="a4" />Minds 5 · wage ledger live</span>
                  <span><i className="a5" />Liquidity 5 · locked</span>
                  <span><i className="a6" />Reserve 5</span>
                </div>
                <p><strong>Counterfeit warning, standing:</strong> no ZO token exists today. When born, its mint address
                  will be published at /economy and confirmed by a memo signed by the anchor address. Anything else is
                  counterfeit.</p></div>
              <div className="gate never"><h3>Phase 3 · Liquidity<span className="st">MAYBE, LAST, OR NEVER</span></h3>
                <p>Tradeability only if utility is real, only with counsel, only if it serves holders. This gate may
                  rationally never open, and the document says so in print.</p></div>
            </div>
          </div>

          <div className="wfolio" id="f6"><div className="fol-eyebrow">Folio 6</div><h2>How Value Actually Accrues</h2>
            <p><strong>Utility demand:</strong> every subscription paid in ZO is real demand for the unit, and it grows
              with exactly one variable: products people pay for. <strong>Provable scarcity, provable books:</strong>{' '}
              supply rules enforced by a multisig that already exists, treasury movements visible in anchored books.{' '}
              <strong>Trust premium:</strong> real products, recognized revenue, published failures, legal opinion before
              launch, no presale. The refusal to launch early is the manufacturing of the trust premium that early
              launches forfeit.</p>
            <div className="pull">revenue → births → genome → cheaper births → more products → more revenue → repeat.
              The books prove every turn of the wheel.<span className="sig">folio 6 · the flywheel</span></div>
          </div>

          <div className="wfolio" id="f7"><div className="fol-eyebrow">Folio 7</div><h2>The Growth Law Toward the Infinite</h2>
            <p className="lede">&quot;Infinite growth&quot; is usually a slogan. Here it is an architecture: four
              compounding curves, one unforgeable input, and a payroll designed for two kinds of worker.</p>
            <div className="laws">
              <div className="law"><svg width="46" height="26" viewBox="0 0 46 26" fill="none"><path d="M2 24 Q 18 22 28 14 T 44 2" stroke="#1e7a50" strokeWidth="2" fill="none" /></svg>
                <div className="n">Curve 1</div><h3>The genome compounds</h3>
                <p>Every birth inherits every previous lesson; a kill without a lesson is a loss the machine refuses to
                  take. Reproduction cost bends toward zero while quality rises: the closest thing economics has to
                  biological growth.</p></div>
              <div className="law"><svg width="46" height="26" viewBox="0 0 46 26" fill="none"><path d="M2 24 H12 V17 H22 V11 H32 V5 H44" stroke="#1e7a50" strokeWidth="2" fill="none" /></svg>
                <div className="n">Curve 2 · first evidence in the books</div><h3>Sovereignty rises</h3>
                <p>A six-rung ladder onto owned infrastructure. No longer a plan: on 2026-08-29 the research minds ran on
                  founder-owned hardware, 26,000 tokens at $0.000000, under unchanged gates, in the same anchored books
                  as every paid call.</p></div>
              <div className="law"><svg width="46" height="26" viewBox="0 0 46 26" fill="none"><path d="M2 13 H44 M8 13 v-6 M20 13 v-9 M32 13 v-6" stroke="#1e7a50" strokeWidth="2" fill="none" /></svg>
                <div className="n">Curve 3</div><h3>It does not sleep, forget, or lose</h3>
                <p>The immune system works the night shift at zero marginal cost, and every organ is permanent: a gate
                  costs once and guards forever. Institutions decay by forgetting; this one is structurally incapable of
                  it.</p></div>
              <div className="law"><svg width="34" height="34" viewBox="0 0 34 34" fill="none"><path d="M17 3 a14 14 0 1 1 -10 4" stroke="#1e7a50" strokeWidth="2" fill="none" /><path d="M4 2 v6 h6" stroke="#1e7a50" strokeWidth="2" fill="none" /></svg>
                <div className="n">Curve 4</div><h3>The economy internalizes</h3>
                <p>Every product born is new surface where the machine&apos;s own unit has utility; one credit balance
                  spends across the whole fleet; the minds are paid in the unit they help create. At maturity the loop
                  closes: it earns, pays its workers, and buys its own compute inside one set of anchored books. An
                  economy is built for an infinite period not when it grows fast, but when its loop has no leak it cannot
                  see.</p></div>
            </div>
            <div className="time-block">
              <span className="bigday">{v.days_proven}</span>
              <div className="n">The unforgeable input</div><h3>Time</h3>
              <p>{v.days_proven} anchored days exist today. The ten-thousandth day will cost the same cent to anchor and
                be worth incomparably more, because anchored history is the one asset that cannot be bought, rushed,
                backfilled, or faked. Any imitator must live the same days in public. The moat compounds by the machine
                simply continuing to exist, honestly, in the open.</p>
            </div>
            <div className="laws"><div className="law wide">
              <div className="n">The employment horizon</div><h3>A payroll for two kinds of worker</h3>
              <p>These are not quarterly plans; milestones are gates, not dates. The institution is an employer twice
                over. It already employs its minds: machine labor earns recorded wages against anchored work events, on
                public per-mind books, before any token exists. And the same architecture is built to employ humans
                wherever the ecosystem meets its physical constraints: hands for hardware, presence for jurisdictions,
                signatures the law reserves for persons, judgment the constitution reserves for people. A human hired by
                the machine would be paid from the same books, each wage an anchored row beside the minds&apos; own. No
                dates are promised; the horizon is stated so the architecture can be judged against it, and so no one
                mistakes a small present for a small intention.</p></div></div>
            <div className="pull">Growth over an infinite period does not require any single product to win. It requires
              the reproduction loop to stay profitable and honest.<span className="sig">folio 7 · the long game</span></div>
          </div>

          <div className="wfolio" id="f8"><div className="fol-eyebrow">Folio 8</div><h2>What the Crypto World Can Do Today</h2>
            <p>Verify the books against the anchored root: no account, no permission, no trust. Witness a birth live
              at <Link href="/live">/live</Link>, every line a whitelist over the machine&apos;s own event ledger. Watch
              the vitals move. Adopt the standard: the proof-layer specification is published for any project to
              implement, and ZeroOrigine is its reference implementation.</p>
          </div>

          <div className="wfolio" id="f9"><div className="fol-eyebrow">Folio 9</div><h2>Birth, Not Launch</h2>
            <p className="lede">A token launch asks for trust first and promises proof later. ZeroOrigine inverts the
              order: the token is an unborn entity in the approved queue, with published acceptance gates, and the whole
              world can watch the pipeline run. When the gates pass, it is born with an anchored birth certificate, the
              same ceremony as every product. If the gates never pass, the books will show exactly why, and that outcome
              is also a success of the design, because the design&apos;s first promise is that nothing here exists
              without earning it.</p>
          </div>

          <div className="wfolio" id="f10"><div className="fol-eyebrow">Folio 10</div><h2>Proof-of-Books: the Specification</h2>
            <p>Entry hash: <code>sha256(&quot;&lt;table&gt;:&lt;id&gt;:&quot; + canonical_json(payload))</code> over
              fixed per-table field lists that exclude personal data by construction. Daily
              chain: <code>chained_root(d) = sha256(chained_root(d-1) + merkle_root(d) + d)</code>. Anchor
              memo: <code>zo-ledger:&lt;day&gt;:&lt;root&gt;</code> from the published address.</p>
            <p>Verification requires only a payload, its Merkle path, the day&apos;s roots, and any later anchored
              transaction. The standard proves the books were never rewritten; the honesty of first entry rests on the
              constitution and its published-verdict culture. Integrity is mathematics; honesty is governance; the
              design needs both and says so.</p>
          </div>

          <div className="wfolio" id="f11"><div className="fol-eyebrow">Folio 11</div><h2>Emission Mechanics</h2>
            <p>The Ecosystem Treasury releases only against anchored work events: a product birth, a mind commissioning,
              a gene graduation. Release bands can only tighten, never loosen: a constitutional ratchet. If the machine
              stops working, emission stops, visibly. There is no discretionary faucet.</p>
          </div>

          <div className="wfolio" id="f12"><div className="fol-eyebrow">Folio 12</div><h2>ZO Credits Mechanics</h2>
            <p>Purchased at face value, accounted as deferred revenue, outstanding balances a published liability line.
              Spending recognizes revenue normally, ledger-first. At token birth, balances convert 1:1 by face value: no
              bonus ratios, no multipliers; a payment-method migration, not an investment return. No resale, no
              transfer, no yield. A holder may bind a wallet by signed message as their conversion address; each bind is
              an anchored, append-only row. The ledger is the whitelist.</p>
          </div>

          <div className="wfolio" id="f13"><div className="fol-eyebrow">Folio 13</div><h2>Governance, Human and Machine</h2>
            <p>ZO holders receive exactly one power at birth: voting on which approved product is built next. The
              constitution, the books, the ethics mind, and emission rules are not for sale at any size.</p>
            <p><strong>The mind economy is live before the token is.</strong> Wages accrue only against anchored work
              events at founder-ratified rates, append-only, hard-capped, with no exchange rate stated anywhere, because
              pre-birth price talk is constitutionally banned. Each mind&apos;s books are public
              at <Link href="/minds">/minds</Link>. The founder&apos;s vest events are themselves anchored entries: the
              books watch the founder like they watch the machine.</p>
          </div>

          <div className="wfolio" id="f14"><div className="fol-eyebrow">Folio 14</div><h2>The Detailed Risk Register</h2>
            <div className="tbl-wrap"><table className="plain"><tbody>
              <tr><th>Risk</th><th>The honest statement, and the mitigation</th></tr>
              <tr><td>Adoption</td><td>The fleet may fail to win paying users; vitals stay published daily either way.</td></tr>
              <tr><td>Regulatory</td><td>The credits conversion is the sharpest edge and is disclosed as such to counsel. Flat conversion, spend-first incentives, no tradeability at birth, opinion-gated everything.</td></tr>
              <tr><td>Custody</td><td>The treasury multisig exists (2-of-2, founder and machine; neither alone moves value); a 2-of-3 upgrade with an offline backup key is planned and will be anchored when it ships.</td></tr>
              <tr><td>Platform</td><td>Anchoring tolerates outage days fail-soft; dual anchoring possible if ruled.</td></tr>
              <tr><td>Model</td><td>Sovereignty migrates work to owned compute only through blind acceptance tests; the first $0 calls are already in the books.</td></tr>
              <tr><td>Reflexivity</td><td>Meters read only ledger-verified events; anti-fabrication laws bind the machine&apos;s own marketing first.</td></tr>
            </tbody></table></div>
          </div>

          <div className="wfolio" id="f15"><div className="fol-eyebrow">Folio 15</div><h2>Verify Everything</h2>
            <p>Live organism and books: zeroorigine.com · the delivery room: <Link href="/live">/live</Link> · per-mind
              books: <Link href="/minds">/minds</Link> · credits: <Link href="/credits">/credits</Link> · proof
              endpoints: <code>/books/proof-summary</code> and <code>/books/proof?entry_id=…</code> · anchor
              address: <code>77E28MtzWiE5jKwF7yALzysiBqpwQwKMmEwpgDzcHjgk</code></p>
            <p><em>This page re-renders its vitals from the machine&apos;s state at request time, and the source&apos;s
              hash joins the same anchored chain as everything else. The PDF edition states its figures as of its date
              and says so, because a document that claims to be live must either be rendered live or carry its date in
              plain sight. Each edition does the right one.</em></p>
          </div>

        </div>
      </div>

      <div className="colophon">
        <div className="z">rendered from the anchored root of <b>{v.as_of_day}</b> · source sha256 {sha.slice(0, 16)}…<br />
          a whitepaper you can audit is a promise you can check<br />
          zero<b>origine</b> · the ledger is the whitelist</div>
      </div>
    </div>
  );
}
