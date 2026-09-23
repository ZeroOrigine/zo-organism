// 2026-09-23 THE ADOPTED SHELF. Products a human built outside the Minds
// pipeline and the founder adopted into the ecosystem's care (watched by the
// sentinel, kept on the books, marketed under the same honesty gates). They
// are NOT births: no certificate of birth, no cost of birth, never in the
// "born autonomously" count. Rendered from /site/state.adopted; the shelf
// disappears when the list is empty, so nothing here is hand-written.
import Link from 'next/link';
import type { Adopted } from '@/lib/siteState';

export default function AdoptedShelf({ items, compact = false }: { items?: Adopted[]; compact?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="adopted-shelf" style={{ marginTop: compact ? 26 : 34 }}>
      <div className="count-line">
        <b>{items.length}</b> adopted {items.length === 1 ? 'product' : 'products'} · built by a human outside the pipeline, taken into the ecosystem's care by founder order · not counted as born
      </div>
      <div className="ledger"><table>
        <thead><tr><th>Adopted</th><th>Product</th><th>Category</th><th className="num">Cost of birth</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.slug}>
              <td className="mono" data-label="Adopted">{p.since}</td>
              <td data-label="Product"><Link href={'/product/' + p.slug}>{p.name}</Link></td>
              <td className="mono" data-label="Category">{p.cat}</td>
              <td className="num" data-label="Cost of birth"><span style={{ color: 'var(--bone-faint)' }}>none · not a birth</span></td>
              <td data-label="Status"><span className={'stamp ' + p.stamp[0]}>{p.stamp[1]}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
