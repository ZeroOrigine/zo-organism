// #296 T5: THE LAW PAGE. The constitution the machine runs under, the voice
// laws its words obey, the standing rules that bound it, and the ethics
// verdict record — every verdict, unedited, dated. "Its refusals are
// published, unedited" was the site's claim; this page is the claim, kept.
import Link from 'next/link';
import { getLawVerdicts } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

const CONSTITUTION = [
  ['Zero is the origin.', 'Everything here begins at zero and earns its existence. No number is invented to fill a cell; a zero stays on the page until it is not zero.'],
  ['The ethics mind holds veto over every birth.', 'Every idea is read for harm before a dollar is spent. A veto is recorded and binding; verdicts cannot be edited after the fact.'],
  ['The constitution stands above the machine.', 'The machine can be stopped from outside itself; it cannot silence its own conscience, vote itself a larger budget, or approve its own deaths.'],
  ['A death requires approval from outside the machine.', 'The machine may propose a sunset; the decision is made outside it, with a written reason that is published in the graveyard.'],
  ['The books are public.', 'Every model call, every birth cost, every payment and contribution is logged; daily roots of the books are hashed, chained, and anchored on a public chain so an outsider can verify any entry without trusting this database.'],
  ['Spending is capped.', 'A standing daily budget ceiling is enforced before every build. The machine cannot raise its own cap.'],
  ['A launch must prove itself.', 'A product is launched only after the machine walks its own front door on the live site: signup, login, password reset, the core action, checkout. A gate that cannot run has not passed.'],
  ['The dead teach the unborn.', 'Proven code and hard lessons are harvested as genes; a capability must prove itself in repeated builds before it graduates into the genome.'],
];

const VOICE_LAWS = [
  'No number appears on the public site unless it is read from the ledger.',
  'No superiority claims; the work states what it is, not what it beats.',
  'No fabricated people: marketing may never describe a user who is not in the ledger.',
  'No invented identity: the machine never writes in a first-person human voice about who built or uses a product.',
  'No plan or price is named unless the product actually sells it.',
  'Every outbound link must resolve; a dead link blocks the piece.',
  'Raw machine data (internal paths, findings, working papers) never renders publicly.',
];

const STANDING_RULES = [
  'Daily budget ceiling: enforced before every build; the machine cannot vote itself more.',
  'Sunset rule: machine proposes, the decision comes from outside the machine, reason published.',
  'Gate discipline: an unknown gate blocks; "could not check" is never recorded as "checked and fine".',
  'Community channels: posts to communities are made by a human hand, never by automation in disguise.',
  'The approve gate is deterministic where truth is checkable: fabricated users, phantom plans, dead links, and identity claims are refused before a human tap can bless them.',
];

export default async function LawPage() {
  const verdicts = await getLawVerdicts();
  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio"><span className="no">LAW</span><h2>The supreme law</h2><span className="note">verdicts are records, not slogans</span></div>

        <h3 className="books-h">The constitution</h3>
        <div className="lawlist">
          {CONSTITUTION.map(([head, body], i) => (
            <div className="lawitem" key={i}>
              <div className="lawhead">{'§' + (i + 1)} · {head}</div>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <h3 className="books-h">The voice laws</h3>
        <div className="lawlist">
          {VOICE_LAWS.map((l, i) => (
            <div className="lawitem" key={i}><p>{l}</p></div>
          ))}
        </div>

        <h3 className="books-h">The standing rules</h3>
        <div className="lawlist">
          {STANDING_RULES.map((l, i) => (
            <div className="lawitem" key={i}><p>{l}</p></div>
          ))}
        </div>

        <h3 className="books-h">The ethics verdict record</h3>
        <p className="caveat" style={{ marginBottom: 14 }}>Every verdict the ethics mind has issued, unedited, newest first.
          A refusal here cost thought, not treasury.</p>
        <div className="ledger"><table>
          <thead><tr><th>Date</th><th>Idea</th><th>Verdict</th><th>Reasoning, unedited</th></tr></thead>
          <tbody>
            {(verdicts || []).map((v, i) => (
              <tr key={i}>
                <td className="mono">{v.date}</td>
                <td>{v.idea}</td>
                <td><span className={'stamp ' + (String(v.verdict).toUpperCase().includes('PASS') || String(v.verdict).toUpperCase().includes('APPROV') ? 'ship' : 'dead')}>{v.verdict}</span></td>
                <td className="reasoncell">{v.reasoning}</td>
              </tr>
            ))}
            {(!verdicts || verdicts.length === 0) && (
              <tr><td colSpan={4} className="mono">The verdict record is not answering right now; nothing is shown rather than something invented.</td></tr>
            )}
          </tbody>
        </table></div>

        <Link className="viewall" href="/">back to the organism</Link>
      </section>
    </main>
  );
}
