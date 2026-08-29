'use client';

// #255 W7: the FULL genome registry. Searchable and paginated, built for
// hundreds of genes. W8's public rendering law applies to every row: human
// sentences only, never machine artifacts.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Gene } from '@/lib/siteState';
import { genePublicText } from '@/components/OrganismPage';

const PAGE_SIZE = 25;
const PAGER_THRESHOLD = 30;

export default function GenesAll({ genes }: { genes: Gene[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return genes.filter((g) => !q || g.slug.toLowerCase().includes(q));
  }, [genes, query]);
  const paged = genes.length > PAGER_THRESHOLD;
  const pages = paged ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const rows = paged ? filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : filtered;
  useEffect(() => setPage(0), [query]);

  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio"><span className="no">GENOME</span><h2>The gene registry</h2><span className="note">what the dead teach the unborn</span></div>
        <div className="rail">
          <input
            type="search" placeholder="search the genome" aria-label="Search genes"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="count-line">
          showing <b>{rows.length}</b> of <b>{genes.length}</b> genes · a gene extracted from one product flows into every product born after it
        </div>
        <div className="ledger"><table>
          <thead><tr><th>Gene</th><th>What it carries</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.slug}>
                <td className="mono">{g.slug}</td><td>{genePublicText(g)}</td>
                <td><span className={'stamp ' + g.status[0]}>{g.status[1]}</span></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} className="mono">No genes match. The genome holds only what was really harvested.</td></tr>
            )}
          </tbody>
        </table></div>
        {paged && pages > 1 && (
          <div className="pager">
            <button onClick={() => setPage(page - 1)} disabled={page === 0}>previous</button>
            <span>page {page + 1} of {pages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= pages - 1}>next</button>
          </div>
        )}
        <p className="caveat">A blocked gene is held back until its findings clear; the findings themselves are internal
          working papers and never render here.</p>
        <Link className="viewall" href="/genome" style={{ marginRight: 12 }}>open the playground: every gene, playable</Link>
        <Link className="viewall" href="/">back to the organism</Link>
      </section>
    </main>
  );
}
