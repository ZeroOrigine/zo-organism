// #306 T1: /genome — the full library as a playable network. Public
// metadata for all genes; depth (docs, code, harvest findings) is
// supporter access, with one free sample fully open.
import Link from 'next/link';
import GenomePlayground from '@/components/GenomePlayground';
import '@/app/organism.css';
import '@/app/economy.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Genome Playground',
  description: 'Every gene the machine has harvested, playable: statuses, inheritances, origins, and a timeline of the genome growing birth by birth.',
};

export default function GenomePage() {
  return (
    <main style={{ opacity: 1 }}>
      <GenomePlayground />
      <footer>
        <span>every failure becomes a gene; every gene is a lesson the dead paid for</span>
        <span className="right"><Link href="/">back to the organism</Link></span>
      </footer>
    </main>
  );
}
