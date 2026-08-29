// #305 E3: /sovereignty — the exam scoreboard, published pass or fail.
// The quarterly benchmark: can the machine run a full birth on the
// founder's own hardware, through the real gates, at zero model cost?
import Link from 'next/link';
import { getExamData } from '@/lib/siteState';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Sovereignty Exam',
  description: 'Full births attempted on owned hardware with open models, through the real gates, scored in public — pass or fail.',
};

const STAGE_LABELS: Record<string, string> = {
  research: 'Research', ethics: 'Ethics', adversary: 'Adversary', approved: 'Approval',
  build: 'Build', qa: 'QA', marketing: 'Marketing', drill: 'Front-door drill', launched: 'Launch',
};

export default async function SovereigntyPage() {
  const data = await getExamData();
  return (
    <main style={{ opacity: 1 }}>
      <section className="eco-section registry-head">
        <div className="eco-wrap">
          <div className="eco-head">
            <span className="eco-label gold">SOVEREIGNTY · THE EXAM</span>
            <h2>Can the machine be born on its own hardware?</h2>
          </div>
          <p className="eco-lede">The minds currently rent frontier intelligence. The sovereignty ladder ends that
            dependency one proven rung at a time, and this page is the exam room: a full product birth attempted with
            open models running on the machine&apos;s own node, through the REAL pipeline, REAL gates, and the REAL
            front-door drill. Zero special treatment, zero cloud rescue: a failed stage ends the run and the row
            stands here anyway. Model cost of an exam run: nothing but electricity.</p>

          <div className="gatebox" style={{ marginTop: 24 }}>
            <p className="eco-label gold">THE RULES</p>
            <p>Same prompts, same gates, same verdict engine, same live drill. Every call is served by the node&apos;s
              open models through an authenticated tunnel; the cost ledger proves zero paid model calls for the run.
              A product born in an exam carries the mark BORN IN EXAMINATION. Open models generate at roughly a
              twentieth of cloud speed, so an exam is measured in hours, and that is part of the honest score.</p>
          </div>

          <h3 className="books-h">The scoreboard</h3>
          {data && data.runs.length > 0 ? (
            <div className="ledger"><table>
              <thead><tr><th>Started</th><th>Status</th><th>Stages reached</th><th className="num">Local calls</th><th>Zero paid calls</th></tr></thead>
              <tbody>
                {data.runs.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.started}</td>
                    <td className="mono">{r.status}{data.exam_mode && r.status === 'running' ? ' · in the room now' : ''}</td>
                    <td>{Object.keys(r.stages?.seen || {}).map((s) => STAGE_LABELS[s] || s).join(' · ') || 'armed'}</td>
                    <td className="num">{r.stages?.local_calls ?? 0}</td>
                    <td className="mono">{r.stages?.zero_anthropic === undefined ? 'open' : r.stages.zero_anthropic ? 'YES' : 'NO'}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <p className="eco-lede">No exam has been attempted yet. The first row lands here the day the machine sits
              its first exam, pass or fail.</p>
          )}
          <p className="caveat">Stages derive from the same event ledger every birth writes; the zero-paid-calls
            column is a query over the public cost books, not a claim. Models on the node today: qwen3:32b (reasoning)
            and qwen2.5-coder:32b (code), served by Ollama on a 48GB machine the founder owns.</p>

          <Link className="viewall" href="/economy">back to the economy</Link>
        </div>
      </section>
      <footer>
        <span>a benchmark the machine can fail in public is the only benchmark worth publishing</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
