// #255 W1: the ONE payload the whole site renders from. Server-side fetch of
// the machine's live state endpoint, cached 60 seconds. A new birth appears
// on the site with zero frontend changes because nothing here is hand-written.
// If the machine cannot be reached the page renders its honest empty states;
// no number is ever invented to fill a cell.

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

export interface Vital { k: string; v: number; prefix?: string; cls?: string; s: string }
export interface SiteProduct {
  born: string; name: string; url: string; cat: string; slug: string;
  tagline: string; cost: string; stamp: [string, string];
}
export interface Grave { died: string; name: string; slug?: string; cause: string; forward: string }
// 2026-09-23 THE ADOPTED SHELF. A product a human built outside the pipeline and
// the founder adopted into the ecosystem's care. Not a birth: no certificate of
// birth, no cost of birth, never counted among the born. Shelved apart.
export interface Adopted { since: string; name: string; url: string; slug: string; cat: string; tagline: string; stamp: [string, string] }
export interface Gene { slug: string; d: string; status: [string, string] }
export interface BookLine { p: string; e: string; d: string; c: string; n: string }
export interface SiteState {
  generated_at: string;
  vitals: Vital[];
  products: SiteProduct[];
  graveyard: Grave[];
  adopted?: Adopted[];
  genes: Gene[];
  gestation?: number | null;
  books: BookLine[];
}
export interface ProofSummary {
  days_proven: number;
  days_anchored: number;
  latest_anchored?: { day: string; solana_sig: string; solana_explorer: string } | null;
  latest: { day: string; chained_root: string; leaf_count: number; solana_sig: string | null; solana_explorer: string | null } | null;
}

export interface BooksMonth { month: string; cost_usd: number; revenue_usd: number; donations_usd: number }
export interface BooksBirth { name: string; slug: string; born: string; status: string; cost: string }
export interface BooksDonation { date: string; name: string; amount: string; product: string }
export interface BooksProof { day: string; leaf_count: number; chained_root: string; solana_sig: string | null; solana_explorer: string | null }
// #4492: the revenue reconciliation — gross to recognized, every reclass
// itemized, plus the credits-outstanding liability.
export interface BooksReconEntry { date: string; product: string; amount_cents: number; class: string }
export interface BooksReconciliation {
  gross_cents: number; test_drill_cents: number; refund_cents: number;
  credits_reclass_cents: number; support_reclass_cents: number; recognized_cents: number;
  // #4598: the reversal that had no name, and the leftover that proves the
  // rest are complete. unexplained_cents is zero or the books are wrong.
  self_test_reclass_cents: number; unexplained_cents: number;
  reclass_by_reason?: Record<string, number>;
  credits: { purchased_cents: number; spent_cents: number; refunded_cents: number; converted_cents: number; outstanding_cents: number };
  entries: BooksReconEntry[];
}
export interface BooksData {
  months: BooksMonth[]; births: BooksBirth[]; donations: BooksDonation[]; proofs: BooksProof[];
  reconciliation?: BooksReconciliation | null;
}
export interface LawVerdict { date: string; idea: string; verdict: string; score: number | null; reasoning: string }

export async function getSiteState(): Promise<SiteState | null> {
  try {
    const r = await fetch(`${RAILWAY}/site/state`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as SiteState;
  } catch {
    return null;
  }
}

export async function getProofSummary(): Promise<ProofSummary | null> {
  // #255 W4: graceful absence. Before the proof layer anchors (or if it is
  // ever unreachable) the Books folio simply shows no stamp.
  try {
    const r = await fetch(`${RAILWAY}/books/proof-summary`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as ProofSummary;
  } catch {
    return null;
  }
}

// #255 W2 acceptance rig: `?scaletest=500` expands the REAL payload with
// clearly-labeled synthetic rows so the scale rails can be exercised on a
// preview. Inert without the query param; nothing synthetic is ever stored.
export function expandForScaleTest(state: SiteState, n: number): SiteState {
  const cats = ['compliance', 'finance', 'education', 'business', 'productivity', 'transport'];
  const fake: SiteProduct[] = Array.from({ length: n }, (_, i) => ({
    born: '2026-01-01',
    name: `ScaleTest Product ${i + 1}`,
    url: '#',
    cat: cats[i % cats.length],
    slug: `scaletest-${i + 1}`,
    tagline: 'synthetic row for the scale drill',
    cost: 'synthetic',
    stamp: ['hold', 'scale test'],
  }));
  return { ...state, products: [...state.products, ...fake] };
}


export async function getBooksData(): Promise<BooksData | null> {
  // #296 T2: the full public books, aggregated in Postgres, cached 60s.
  try {
    const r = await fetch(`${RAILWAY}/books/data`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as BooksData;
  } catch {
    return null;
  }
}

export async function getLawVerdicts(): Promise<LawVerdict[] | null> {
  // #296 T5: every ethics verdict, unedited, dated.
  try {
    const r = await fetch(`${RAILWAY}/site/law`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    return ((await r.json()) as { verdicts: LawVerdict[] }).verdicts || [];
  } catch {
    return null;
  }
}

export interface EconomyData {
  gates: { paying_customers: number; revenue_30d: number; revenue_alltime: number; signups_real: number; real_signal_products: number } | null;
  targets: { phase1_paying_customers: number; phase2_monthly_revenue_usd: number; phase2_months_required: number; phase2_active_users: number } | null;
  credits?: { live: boolean; purchased_cents: number } | null;
  // #301 M3: the conceived mint. Null until the conception act runs on-chain.
  mint?: { address: string; vault: string; conception_sig: string; explorer_mint: string; explorer_memo: string | null } | null;
}

export interface WhitepaperDoc { version: string; note: string; markdown: string; sha256: string }

// #305 E3: the sovereignty exam scoreboard.
export interface ExamRun {
  started: string; ended: string | null; status: string;
  // #4555: derived from the ledger at request time, not from a snapshot
  // written when the run started — the board once advertised a dead run as
  // "running · in the room now" for 39 minutes after it had failed.
  project?: string | null; project_status?: string | null;
  stages_reached?: string[];
  stage_died_at?: string | null;
  failure_reason?: string | null;
  failure_actor?: string | null;
  local_calls?: number; tokens?: number; paid_usd?: number;
  zero_paid_calls?: boolean | null;
  artifacts_kept?: boolean;
  board_note?: string | null;
  stages: { seen?: Record<string, string>; local_calls?: number; cloud_paid_calls_in_window?: number; zero_anthropic?: boolean };
  models: Record<string, string>;
}
export interface ExamData { exam_mode: boolean; runs: ExamRun[] }

export async function getExamData(): Promise<ExamData | null> {
  try {
    const r = await fetch(`${RAILWAY}/site/exam`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as ExamData;
  } catch {
    return null;
  }
}

export async function getWhitepaper(): Promise<WhitepaperDoc | null> {
  // #298 T4: the whitepaper serves from the machine's constitution store —
  // the page and the downloadable PDF regenerate from the same bytes.
  try {
    const r = await fetch(`${RAILWAY}/site/whitepaper`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    return (await r.json()) as WhitepaperDoc;
  } catch {
    return null;
  }
}

export async function getEconomyData(): Promise<EconomyData | null> {
  // #297: the Gate Watch reads the ledger, cached 60s, never hardcoded.
  try {
    const r = await fetch(`${RAILWAY}/site/economy`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as EconomyData;
  } catch {
    return null;
  }
}
