// #298 T4: THE WHITEPAPER, rendered from the machine's constitution store.
// The markdown arrives from /site/whitepaper (zo_config.zo_whitepaper_source)
// and is rendered faithfully — this component draws it, it never authors it.
// The PDF at /zeroorigine-whitepaper.pdf is regenerated from the same bytes.
import Link from 'next/link';
import type { WhitepaperDoc } from '@/lib/siteState';
import type { ReactNode } from 'react';

// ── a small, deterministic markdown renderer ────────────────────────────────
// Handles exactly the constructs the document uses: h1/h2/h3, hr, pipe
// tables, -/1. lists, bold, italic, inline code, paragraphs. Anything it
// does not recognize renders as a plain paragraph — never dropped.

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0; let m: RegExpExecArray | null; let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={`${key}-${i++}`}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('`')) out.push(<code key={`${key}-${i++}`} className="wp-code">{t.slice(1, -1)}</code>);
    else out.push(<em key={`${key}-${i++}`}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function tableCells(row: string): string[] {
  return row.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split('\n');
  const out: ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) continue;
    if (t === '---') { out.push(<hr key={k++} className="wp-hr" />); continue; }
    if (t.startsWith('### ')) { out.push(<h4 key={k++} className="wp-h3">{inline(t.slice(4), k)}</h4>); continue; }
    if (t.startsWith('## ')) { out.push(<h3 key={k++} className="wp-h2 books-h">{inline(t.slice(3), k)}</h3>); continue; }
    if (t.startsWith('# ')) { out.push(<h2 key={k++} className="wp-h1">{inline(t.slice(2), k)}</h2>); continue; }
    if (t.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      i--;
      const header = tableCells(rows[0]);
      const body = rows.slice(1).filter((r) => !/^\|[\s|:-]+\|$/.test(r)).map(tableCells);
      out.push(
        <div key={k++} className="ledger wp-table"><table>
          <thead><tr>{header.map((h, j) => <th key={j}>{inline(h, k * 100 + j)}</th>)}</tr></thead>
          <tbody>{body.map((r, ri) => (
            <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c, k * 1000 + ri * 10 + ci)}</td>)}</tr>
          ))}</tbody>
        </table></div>);
      continue;
    }
    if (/^[-*] /.test(t) || /^\d+\. /.test(t)) {
      const ordered = /^\d+\. /.test(t);
      const items: string[] = [];
      while (i < lines.length) {
        const lt = lines[i].trim();
        if (/^[-*] /.test(lt)) items.push(lt.replace(/^[-*] /, ''));
        else if (/^\d+\. /.test(lt)) items.push(lt.replace(/^\d+\. /, ''));
        else break;
        i++;
      }
      i--;
      const kids = items.map((it, j) => <li key={j}>{inline(it, k * 100 + j)}</li>);
      out.push(ordered ? <ol key={k++} className="wp-list">{kids}</ol> : <ul key={k++} className="wp-list">{kids}</ul>);
      continue;
    }
    // paragraph: join consecutive non-structural lines
    const para: string[] = [t];
    while (i + 1 < lines.length) {
      const nt = lines[i + 1].trim();
      if (!nt || nt === '---' || nt.startsWith('#') || nt.startsWith('|') || /^[-*] /.test(nt) || /^\d+\. /.test(nt)) break;
      para.push(nt); i++;
    }
    out.push(<p key={k++} className="wp-p">{inline(para.join(' '), k)}</p>);
  }
  return out;
}

export default function WhitepaperPage({ doc }: { doc: WhitepaperDoc | null }) {
  return (
    <main style={{ opacity: 1 }}>
      <section className="registry-head">
        <div className="folio">
          <span className="no">PAPER</span>
          <h2>The whitepaper</h2>
          <span className="note">rendered live from the machine&apos;s constitution store</span>
        </div>
        {doc ? (
          <>
            <div className="rail" style={{ margin: '18px 0 8px', gap: 14, alignItems: 'center' }}>
              <a className="viewall" style={{ marginTop: 0 }} href="/zeroorigine-whitepaper.pdf" download>
                DOWNLOAD PDF
              </a>
              <span className="caveat" style={{ margin: 0 }}>
                version {doc.version} · source sha256 {doc.sha256.slice(0, 12)}&hellip; · the PDF regenerates from these same bytes
              </span>
            </div>
            <article className="wp-body">{renderMarkdown(doc.markdown)}</article>
          </>
        ) : (
          <p className="wp-p" style={{ fontFamily: 'var(--mono, monospace)' }}>
            The whitepaper endpoint is not answering right now. Rather than show a
            stale copy, this page waits. Refresh in a minute.
          </p>
        )}
        <Link className="viewall" href="/economy">back to the economy</Link>
      </section>
      <footer>
        <span>a whitepaper that could go stale would be a contradiction; this one renders from live state</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
