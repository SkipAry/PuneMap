# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: a factory or logistics manager sourcing a building around Pune.** He arrives
knowing his requirement as a set of numbers — 30,000 sq ft, 12-metre clear height, a
10-ton crane, 150 HP sanctioned power, two docks — not as a neighbourhood or a budget
band. He is not browsing; he has a machine, a line, or a lease expiry driving him.

Today that search means phoning ten brokers and repeating the same five questions to
each. He is comparing across those calls from memory or a spreadsheet.

**Secondary: the site owner**, who enters and verifies listings directly in the Supabase
table editor. There is no other admin surface, by design.

Brokers are a data source, not users. They do not log in and cannot submit listings.

## Product Purpose

A map-based search tool for industrial sheds, warehouses and factory buildings available
on rent or lease around Pune — Chakan, Bhosari, Talegaon, Ranjangaon, Wagholi, Nigdi,
Hinjawadi Phase III and Pirangut.

**The whole product is the filter.** Success is a user narrowing 300 sheds to 4 by
entering his crane and height requirement, in three interactions, and being able to share
that result as a URL. If he cannot do that, the build has failed regardless of how it
looks.

The conversion event is a phone call to the broker, not a form submission.

## Positioning

Every existing portal — 99acres, MagicBricks, SquareYards, RealEstateIndia — was built to
sell apartments. Clear height, crane capacity and sanctioned power **do** appear in their
industrial listings, but only as free text buried inside a paragraph. **There is no way
to filter by them anywhere on the internet.**

This product restructures publicly posted listings around exactly those fields. A
neighbouring portal could not truthfully copy the claim without rebuilding its data model
around industrial specs rather than bedrooms and locality.

Revenue is brokerage on closed leases. Not listing fees, not subscriptions, not ads.

## Operating Context

- **Real broker listings are half-empty.** A shed listing may state height and crane but
  not power. Incompleteness is the normal case, not an edge case, and how it is handled
  determines whether the product is trusted.
- **The site owner enters data directly in Supabase.** That table editor is the admin
  panel; building a second one is an explicit non-goal.
- Users compare listings by scanning the same number in the same position down a column,
  the way a spec sheet is read — not by reading prose descriptions.
- Listings are restructured from public sources, so each carries an obligation to link
  back to the original.
- `last_verified` per listing is the credibility signal; the owner bumps it on re-confirmation.

## Capabilities and Constraints

**Domain terminology** (used exactly, never softened for a general audience): cluster,
clear height at centre, crane capacity in tons, sanctioned power in HP, Trimix / Tremix /
VDF / Epoxy / Plain RCC flooring, floor load in MT/sqm, docks, ramps, factory plan
approval, MIDC, built-to-suit.

**Null handling is the core contract:**

- Never invent, estimate or interpolate a missing value.
- An unstated spec renders as an em dash with a "Not stated in the listing" tooltip —
  never `0`, never "N/A", never a hidden row.
- Filtering on a spec excludes listings where that spec is null. A listing that never
  mentions a crane is not a match for a 10-ton crane requirement.
- The cost of that exclusion is surfaced as a count and reversed by one control.
- `crane_capacity_ton = 0` is the single meaningful zero: gantry provision cast, no crane
  fitted.
- Derived commercials are labelled as calculated, so the user knows what came from the
  broker and what came from arithmetic.

**Explicit non-goals.** Building any of these is a failure, not a bonus: user accounts or
auth; payments, pricing or subscriptions; a broker dashboard or listing-submission portal;
saved searches, favourites or comparison baskets; a chatbot or AI assistant; multi-city
support or i18n; dark mode; a CMS; any analytics beyond a single Plausible/Umami tag.

**Technical constraints:**

- URL search params are the only filter state — a search must be shareable and restore
  exactly on a cold load.
- `/` and `/shed/[slug]` must be useful and indexable with JavaScript disabled.
- Listings with no coordinates are excluded from the map but never dropped from the list.
- Map tiles must not require a billing account to run.

## Brand Commitments

- **Name: "Pune Industrial Space"** — confirmed and binding.
- **Voice: plain, active, specific.** "Show 12 sheds", not "Apply filters". An empty state
  names the nearest alternative rather than apologising.
- **Source attribution is non-negotiable.** Every listing links to the original posting;
  the product restructures public listings, it does not claim them.
- *Open decision:* the domain is not set. `metadataBase` currently holds the placeholder
  `puneindustrialspace.in`, which must not be treated as confirmed.

## Evidence on Hand

**Real:**

- Live deployment: `punemap-silk.vercel.app`; repository `SkipAry/PuneMap`.
- The eight named Pune industrial clusters and their MIDC geography.
- The competitor gap — the absence of spec filters on 99acres, MagicBricks, SquareYards
  and RealEstateIndia — is directly observable.

**Fabricated, and must not be mistaken for real:**

- `data/seed.csv` holds 60 rows authored by Claude as scaffolding. Localities and
  geography are plausible; **broker names are invented and phone numbers use the
  non-allocatable `+91555…` prefix** specifically so they cannot reach a real person.

**Absent — future work must not fabricate around these:**

- Real listing inventory does not exist yet. It will come from the owner's tracker
  spreadsheet, loaded via `npm run seed`.
- No listing counts, no "300+ sheds", no coverage claims in copy until real data lands.
- No testimonials, customers, closed-lease figures, press or case studies exist.
- No Supabase project is provisioned; the app currently reads the seed CSV fallback.

## Product Principles

1. **The filter is the product.** Anything that does not help a manager get from 300
   buildings to 4 is decoration.
2. **Unknown is a first-class value, never zero.** The difference between "no docks" and
   "nobody said" is the difference between a trusted tool and a misleading one.
3. **Spec fields outrank commercials.** Height, crane and power come before area and rent,
   because that inversion is the reason the product exists.
4. **Missing data is a reason to phone.** Unstated specs are surfaced as a prompt to call,
   which is the actual conversion event — not a gap to hide.
5. **Attribute what you restructure.** Every listing credits and links its source.

## Accessibility & Inclusion

- Fully responsive down to 360px; the spec strip must stay readable and aligned there.
- Every filter operable by keyboard, including arrow-key support on sliders.
- Visible focus at every stop; `outline: none` is banned.
- The map requires a text equivalent — the result list is always present and never behind
  a tab on desktop.
- Body text contrast ≥ 4.5:1. Lighthouse accessibility ≥ 95 on `/`.
- Users are on Indian mobile networks and mid-range Android hardware as often as desktop;
  the result list must work before the map finishes loading.
