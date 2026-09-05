# Launch readiness — Pune Industrial Space

**Status:** 02 done · 01 and 03 waiting on you · 04 not started · **Created:** 2026-09-03
**Updated:** 2026-09-05 · **Branch:** main
**Live (private):** punemap-silk.vercel.app · **Repo:** SkipAry/PuneMap

## Position

Software ~90% done. Launchable product ~15%. Four critique passes closed the
interface work (38/40, detector clean). Everything remaining is content,
identity and compliance — mostly not code.

## Phases

| # | Phase | Status | Remaining | Owner |
|---|-------|--------|-----------|-------|
| 01 | [Domain and canonical truth](phase-01-domain-and-canonical-truth.md) | code done | buy the domain, attach in Vercel | you |
| 02 | [Indexability and measurement](phase-02-indexability-and-measurement.md) | done | set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` once the account exists | you |
| 03 | [Data protection and public trust](phase-03-data-protection-and-trust.md) | page done | decide operator, create contact address, take advice | you |
| 04 | [Real inventory](phase-04-real-inventory.md) | intake guard done | collect and verify the listings | you |
| 05 | [Launch verification and cutover](phase-05-launch-verification.md) | dry run passing 11/14 | rerun once 01–04 close | me |

The code side of every phase is finished. What is left is a domain, an
identity, an analytics account and real listings — none of which can be
written into the repo.

Phases 01–03 and 04 run in parallel. 04 is the long pole and the only one that
decides whether the product is worth launching at all.

## Acceptance criteria for "genuinely live"

1. Canonical host resolves and matches the served host on every page.
2. `/robots.txt` and `/sitemap.xml` return 200; sitemap lists every cluster and
   shed URL.
3. A privacy page exists and is linked from the submission form.
4. At least 20 real listings, zero rows carrying the `+91555` sample marker.
5. No "Sample" tag or notice renders anywhere.
6. Analytics records a pageview from a real device.
7. Search Console verified, sitemap submitted, no coverage errors.

## Evidence this plan is built on

Verified 2026-09-03, not assumed:

- `puneindustrialspace.in` → **DNS name does not exist**, yet is the canonical
  on every page.
- `/robots.txt`, `/sitemap.xml` → **404**.
- No analytics tag in the served HTML.
- Build output route list contains no privacy or terms route.
- `select count(*) from listings` → 60, all carrying `+91555`.

## Open questions

- Which domain? `metadataBase` currently holds an unconfirmed placeholder.
- Does the brokerage need a registered business identity on the site before
  taking enquiries? Not something I can advise on.
- Is the exposed `service_role` key still acceptable at launch? You declined
  rotation on 2026-09-03 while nothing was deployed with it; that calculus
  changes once real broker contact data is in the table.
