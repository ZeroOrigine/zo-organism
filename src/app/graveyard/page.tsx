// #296 T3: THE FULL GRAVEYARD. Every retired product, its plain-words cause,
// the written reason recorded in the ledger, and what it paid forward.
// Rendered from the registry; scales to any number of deaths unchanged.
import Link from 'next/link';
import { getSiteState } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

export default async function GraveyardPage() {
  const state = await getSiteState();
  if (!state) {
    return (
      <main className="cert">
        <p style={{ fontFamily: 'var(--mono, monospace)' }}>
          The registry endpoint is not answering right now. This page waits
          rather than invent a history. Refresh in a minute.
        </p>
      </main>
    );
  }
  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio"><span className="no">GRAVEYARD</span><h2 style={{ color: 'var(--blood)' }}>The full graveyard</h2><span className="note">a kill without a lesson is pure loss</span></div>
        <div className="count-line">
          <b>{state.graveyard.length}</b> death{state.graveyard.length === 1 ? '' : 's'} on record · every one carries its written reason
        </div>
        <div className="ledger"><table>
          <thead><tr><th>Died</th><th>Product</th><th>Cause of death, in plain words</th><th>Paid forward</th></tr></thead>
          <tbody>
            {state.graveyard.map((g) => (
              <tr key={g.name}>
                <td className="mono">{g.died}</td><td>{g.name}</td><td>{g.cause}</td>
                <td className="lifecell">{g.forward}</td>
              </tr>
            ))}
            {state.graveyard.length === 0 && (
              <tr><td colSpan={4} className="mono">No deaths recorded. The graveyard waits, honestly empty.</td></tr>
            )}
          </tbody>
        </table></div>
        <p className="caveat">Sunset rule: the machine may propose a death; a death requires approval from outside the
          machine, with a written reason. Ideas killed before birth (ethics vetoes, adversary rejections) live in the
          Law record; they cost thought, not treasury.</p>
        <Link className="viewall" href="/">back to the organism</Link>
      </section>
    </main>
  );
}
