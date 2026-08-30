/** @type {import('next').NextConfig} */

// ZO_PUBLIC_SITE is set ONLY on the zeroorigine.com Netlify site. This repo is
// both the public website AND the product template, so template scaffolding was
// leaking onto the public domain: /pricing served a "$29/month" plan that does
// not exist, and /auth/login offered an account system the parent brand has no
// such thing as. Products still inherit every one of those pages.
const ZO_PUBLIC_SITE = process.env.ZO_PUBLIC_SITE === 'true';

const nextConfig = {
  env: { ZO_PUBLIC_SITE: ZO_PUBLIC_SITE ? 'true' : 'false' },
  async redirects() {
    return [
      // /about is a REAL page on every product, built from src/lib/zo-meta.json.
      // A global redirect would break all of them. zeroorigine.com ships the
      // sentinel meta, so there /about 404s and is sent to the live registry
      // instead: the honest answer to "what is this" is every attempt, alive
      // and dead.
      ...(ZO_PUBLIC_SITE
        ? [
            { source: '/about', destination: '/products', permanent: false },
            // #4505 (adjacent honesty leak, same class): the template's fake
            // "$29/month" pricing page and an auth system the parent brand
            // does not have were reachable on zeroorigine.com. Products keep
            // these pages; the public site sends them home.
            { source: '/pricing', destination: '/economy', permanent: false },
            { source: '/auth/:path*', destination: '/', permanent: false },
            // #4517: the human guess. /products is the register (a real
            // page); /products/<slug> is the natural plural of the birth
            // record and dead-ended on a 404. Send it to the record.
            { source: '/products/:slug', destination: '/product/:slug', permanent: false },
          ]
        : []),
      // #307 E5: /minds is now a REAL page (the mind economy's public books);
      // the old hash redirect is superseded.
      { source: '/constitution', destination: '/#constitution', permanent: false },
    ];
  },
};

export default nextConfig;
