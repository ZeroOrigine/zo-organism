// #4517: the branded 404. A black site must never flash the framework's
// white default page. The tone borrows from the graveyard: this address
// holds nothing, and the register says so plainly, with doors back in.
import Link from 'next/link';
import '@/app/organism.css';

export default function NotFound() {
  return (
    <main className="nf-wrap" style={{ opacity: 1 }}>
      <div className="nf-zero">0</div>
      <h1>Nothing was ever born at this address</h1>
      <p>
        The registry holds every product the machine has built, alive and dead,
        and this path is not among them. If a link led you here, it pointed at
        something that does not exist.
      </p>
      <div className="doors">
        <Link href="/products">the births</Link>
        <Link href="/graveyard">the graveyard</Link>
        <Link href="/">the organism</Link>
      </div>
    </main>
  );
}
