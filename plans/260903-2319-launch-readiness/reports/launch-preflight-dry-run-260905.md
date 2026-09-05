# Launch pre-flight, dry run

**Run:** 2026-09-05 against `https://punemap-silk.vercel.app` · **Result:** 11 of 14 pass

Run early, before phases 01, 03 and 04 close, to prove the checklist itself
works and to see what is genuinely outstanding rather than assumed.

## Passing

| Check | Detail |
|---|---|
| Home returns 200 | 200 |
| canonical = og:url on `/` | `punemap-silk.vercel.app` |
| canonical = og:url on `/chakan` | matches served host |
| canonical = og:url on `/shed/[slug]` | matches served host |
| canonical = og:url on `/about` | matches served host |
| canonical = og:url on `/privacy` | matches served host |
| canonical = og:url on `/list-your-space` | matches served host |
| robots.txt names the sitemap | `Sitemap: https://punemap-silk.vercel.app/sitemap.xml` |
| sitemap entries | 69 (`/`, `/about`, `/list-your-space`, `/privacy`, 9 clusters, 56 sheds) |
| `/nonexistent-abc` | 404, custom page |
| `/shed/bad-slug` | 404, custom page |

## Failing, each for a known reason

| Check | Detail | Closes with |
|---|---|---|
| No "Sample" tag on the site | present | Phase 04 — real listings replace the 60 placeholders |
| Privacy page finished | draft banner showing | Phase 03 — `SITE_OPERATOR_NAME` and `SITE_CONTACT_EMAIL` |
| Analytics tag live | no tag | Phase 02 — `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` once the account exists |

None is a defect. Each is a deliberate refusal to fake something: the sample
marking is doing its job, the privacy page says it is unfinished rather than
naming someone who has not agreed, and the analytics tag stays out of the page
until there is an account behind it.

## Not covered by this run

- Search Console verification and sitemap submission. Held to Phase 05 proper,
  because submitting now asks Google to index 60 placeholders and then to forget
  them.
- The submission form's happy path. Exercising it writes a real row; it was
  verified on 2026-09-03 and the test row removed.
- The phone journey on a real device on mobile data.

## Note on the sitemap count

69 = 4 static pages + 9 clusters + 56 sheds. The other 4 of the 60 listings are
the leased-out rows, excluded on purpose — the cluster pages and the default
search hide them, so the sitemap should not be the one place the product
advertises what it treats as gone.
