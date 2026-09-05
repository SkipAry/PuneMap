# Phase 05 — Launch verification and cutover

**Blocks launch:** yes · **Depends on:** 01–04 · **Owner:** me

## Why

Each earlier phase is verified in isolation. This phase checks the whole thing
once, on the real domain, with real data, in the order a first visitor meets it.

## Pre-flight

Run against the production domain, not a preview.

| Check | Expected |
|---|---|
| `curl -sI https://<domain>/` | 200 |
| Canonical host on `/`, `/chakan`, `/shed/<slug>`, `/about`, `/privacy` | equals served host |
| `curl -s .../robots.txt` | 200, names the sitemap |
| `curl -s .../sitemap.xml \| grep -c "<loc>"` | 3 + 9 + listings + 1 privacy |
| `select count(*) filter (where broker_phone like '+91555%')` | 0 |
| "Sample" string anywhere in served HTML | absent |
| `/nonexistent` and `/shed/bad-slug` | HTTP 404, custom page |
| Submission form, bad phone | values preserved, phone focused |
| Submission form, valid entry | row lands, "Filed for review" |
| Cold load of a filtered URL | every control restored |
| JavaScript disabled | listings render, noscript offers clusters |
| Analytics | hit recorded from a real device |

## Cutover steps

1. Confirm real inventory is live and sample rows are gone.
2. Submit the sitemap in Search Console. **Not before this point** — indexing
   placeholders and then retracting them is worse than starting late.
3. Delete your own test submission if one is present:
   `select * from listing_submissions;`
4. Walk the primary journey on a phone on mobile data: search → filter →
   shed → call. That is the product, and it should hold on a mid-range Android
   on an Indian network.

## Security decisions to revisit before real data lands

- **The exposed `service_role` key.** You declined rotation on 2026-09-03 when
  nothing was deployed with it. Once `listing_submissions` holds real brokers'
  personal contact details, an RLS-bypassing key sitting in a chat transcript is
  a different proposition. Rotating invalidates the anon key too, so do it
  before launch, not after: rotate, then update `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  in Vercel, then redeploy.
- Confirm `listing_submissions` still has no select policy, so contact details
  stay readable only by the service role.

## Known and accepted at launch

Not blockers, recorded so they are decisions rather than surprises:

- Matches outside the map viewport are not announced — the zoom-to-fit
  affordance was removed by your choice on 2026-09-03.
- Search screen performance sits around 82 on the keyless OpenFreeMap basemap; a
  CARTO key restores roughly 96 if it ever matters.
- "Clear all" lives inside the filter sheet rather than beside the filter chip.
- The submission success screen offers no "add another" for a broker with a
  portfolio.

## Risks

- **Launching on stale prerenders.** Confirm the deploy that goes live was built
  *after* the final seed. When in doubt, redeploy.
- **Declaring done from a green checklist.** The last check is a human one:
  would you send this link to a broker you respect?

## Rollback

Vercel keeps prior deployments; promote the previous one. Database changes are
the only irreversible part, so snapshot `listings` before the final seed.
