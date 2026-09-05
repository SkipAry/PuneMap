# Phase 01 — Domain and canonical truth

**Blocks launch:** yes · **Depends on:** a domain you own · **Owner:** shared

## Why this is first

Every page currently tells search engines its real address is a host that does
not exist:

```
canonical: https://puneindustrialspace.in/shed/chakan-65000-sqft-factory-15m-20t-crane
DNS:       puneindustrialspace.in -> DNS name does not exist
served on: punemap-silk.vercel.app
```

A canonical pointing at a dead host invites Google to drop the page rather than
index the one it is on. For a product whose whole acquisition model is someone
searching "shed for rent chakan", nothing else in this plan matters until the
site agrees with itself about its own address.

PRODUCT.md already records this as unsettled: *"the domain is not set.
`metadataBase` currently holds the placeholder `puneindustrialspace.in`, which
must not be treated as confirmed."*

## Requirements

- One domain, bought and pointed at Vercel.
- `metadataBase` equal to that domain, sourced from env rather than hardcoded so
  preview deployments do not claim the production host.
- Canonicals and `og:url` resolve to the served host.

## Decision needed from you

The domain. Everything below is mechanical once it exists. Options worth
weighing: an exact-match domain helps a listings site, but a name you can say on
a phone call to a broker matters more.

## Files

- Modify: `src/app/layout.tsx` — `metadataBase`
- Modify: `.env.example` — document `NEXT_PUBLIC_SITE_URL`
- Vercel: add domain, set `NEXT_PUBLIC_SITE_URL` for Production

## Steps

1. Buy the domain; add it in Vercel → Domains; complete DNS.
2. Set `NEXT_PUBLIC_SITE_URL=https://<domain>` in Vercel (Production only).
3. Point `metadataBase` at that env var, falling back to
   `VERCEL_URL` for previews so a preview never emits a production canonical.
4. Confirm `og:url` is emitted — it is currently absent from every page.
5. Redeploy.

## Validation

```bash
curl -sI https://<domain>/ | head -1
curl -s https://<domain>/chakan | grep -o 'rel="canonical" href="[^"]*"'
```

Canonical host must equal the served host. Repeat on `/`, `/chakan`,
`/shed/<slug>`, `/about`, `/list-your-space`.

## Risks

- **Preview leakage.** If `metadataBase` is hardcoded, preview deploys emit
  production canonicals and compete for the same URLs. The env fallback prevents
  it.
- **Stale prerenders.** Pages are SSG and Next's build cache is keyed on source,
  not external data. If canonicals look unchanged after deploy, force a clean
  rebuild — this bit us on 2026-09-03 with the broker names.

## Rollback

Revert `metadataBase`. No data or schema involved.
