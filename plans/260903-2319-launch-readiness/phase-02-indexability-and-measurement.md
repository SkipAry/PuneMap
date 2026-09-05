# Phase 02 — Indexability and measurement

**Blocks launch:** yes · **Depends on:** Phase 01 · **Owner:** me

## Why

The pages are already unusually well prepared for search — server-rendered with
JavaScript disabled, JSON-LD on every shed, spec-rich titles like *"65,000 sq ft
factory building on rent in Chakan MIDC Phase II, Bhamboli — 15m height, 20T
crane, 300 HP"*. None of that is discoverable, because:

```
/robots.txt  -> 404
/sitemap.xml -> 404
analytics    -> absent from served HTML
```

Sixty-odd static pages that nothing points a crawler at, and no way to see
whether anyone arrives.

## Requirements

- `robots.txt` allowing crawl and naming the sitemap.
- `sitemap.xml` listing `/`, `/about`, `/list-your-space`, all 9 clusters and
  every shed slug, generated from the same data the pages are.
- One analytics tag — Plausible or Umami. PRODUCT.md permits exactly this and
  nothing more.
- Search Console verified, sitemap submitted.

## Files

- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Modify: `src/app/layout.tsx` — analytics script
- Modify: `.env.example`

## Steps

1. `robots.ts` returning allow-all plus `sitemap: ${SITE_URL}/sitemap.xml`.
2. `sitemap.ts` reading `getListings()` so shed and cluster URLs come from the
   same source as the pages; `lastModified` from `last_verified`.
3. Add the analytics tag via `next/script` with `strategy="afterInteractive"`.
4. After deploy: verify domain in Search Console, submit the sitemap.

## Validation

```bash
curl -s https://<domain>/robots.txt
curl -s https://<domain>/sitemap.xml | grep -c "<loc>"
```

`<loc>` count must equal 3 + 9 + (number of listings). With 60 listings that is
72. Analytics: load a page on a phone and confirm the hit appears.

## Risks

- **Indexing sample data.** Do not submit the sitemap while the table is
  placeholders — you would be asking Google to index 60 fake properties, then
  asking it to forget them. Phase 02 ships the files; sitemap submission waits
  for Phase 04.
- **Sitemap drift.** Generating from `getListings()` rather than a static list
  means it cannot go stale.

## Rollback

Delete the two routes and the script tag. Nothing persistent.
