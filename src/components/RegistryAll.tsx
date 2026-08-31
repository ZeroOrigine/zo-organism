'use client';

// #255 W7: the FULL register of births. Searchable, filterable, paginated;
// built for hundreds of rows (W2's rails live here now). Every row links to
// its birth certificate. Rendered entirely from the registry payload.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { SiteProduct } from '@/lib/siteState';

const PAGE_SIZE = 25;
const PAGER_THRESHOLD = 30;

export default function RegistryAll({ products }: { products: SiteProduct[] }) {
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const cats = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.cat)))],
    [products],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (cat === 'all' || p.cat === cat) && (!q || p.name.toLowerCase().includes(q)),
    );
  }, [products, cat, query]);
  const paged = products.length > PAGER_THRESHOLD;
  const pages = paged ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const rows = paged ? filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : filtered;
  useEffect(() => setPage(0), [cat, query]);

  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio"><span className="no">REGISTRY</span><h2>The register of births</h2><span className="note">every product, every date, every dollar</span></div>
        <div className="filters" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="rail">
          <input
            type="search" placeholder="search the registry" aria-label="Search products"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="count-line">
          showing <b>{rows.length}</b> of <b>{products.length}</b> living products · rendered from the registry, not hand-written
        </div>
        <div className="ledger"><table>
          <thead><tr><th>Born</th><th>Product</th><th>Category</th><th className="num">Cost of birth</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.slug}>
                <td className="mono" data-label="Born">{p.born}</td>
                <td data-label="Product"><Link href={'/product/' + p.slug}>{p.name}</Link></td>
                <td className="mono" data-label="Category">{p.cat}</td>
                <td className="num" data-label="Cost of birth">{p.cost === 'pre-attribution'
                  ? <span style={{ color: 'var(--bone-faint)' }}>pre-attribution</span> : p.cost}</td>
                <td data-label="Status"><span className={'stamp ' + p.stamp[0]}>{p.stamp[1]}</span>
                  {p.slug.startsWith('exam-') && (
                    <span className="stamp hold" title="built entirely by open models on the machine's own hardware"> BORN IN EXAMINATION</span>
                  )}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="mono">Nothing matches. The registry holds only what was really born.</td></tr>
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
        <p className="caveat">A product is &quot;launched&quot; only after the machine walks its own front door on the live site.
          Births before August 2026 predate per-product cost attribution; their costs live in the aggregate books and are
          marked accordingly. No number is invented to fill a cell.</p>
        <Link className="viewall" href="/">back to the organism</Link>
      </section>
    </main>
  );
}
