# System architecture

## Shape

Next.js 15 App Router, TypeScript strict, Tailwind v4, MapLibre GL. One table in
Supabase Postgres, read-only from the server with the anon key. No auth, no
state library, no component library.

## The filter is the product

`src/lib/query.ts` is the only place filtering happens. It is a pure function of
`(Listing[], Filters)`, so the same code answers:

- the server render of `/`
- `/api/listings`
- client-side re-filtering as the user moves a slider

There is no second implementation to drift.

`buildPredicates()` turns `Filters` into a list of predicates. Each predicate
reads a spec via `value()` and returns one of three outcomes — pass, fail, or
**unknown** (the broker never stated it). That third outcome is what the rest of
the null handling is built on.

## Null handling

| Rule | Where |
|---|---|
| Unknown never satisfies a filter on that spec | `evaluate()` in `query.ts` |
| Unknown renders as `—` with a "Not stated in the listing" tooltip | `derive.ts`, `spec-strip.tsx` |
| Count of rows excluded *only* for being unstated | `nullExclusions` in `query.ts` |
| `loose=1` treats unknown as a pass | `applyFilters()` |
| Unstated fields grouped with a "Call to confirm" action | `/shed/[slug]` |

A null is blamed only when it is the **sole** reason a row dropped out. A row
that also fails a stated filter is not counted, so "Include them" never promises
rows that still would not match. `query.test.ts` asserts
`loose.total === strict.total + strict.nullExcludedTotal`.

## State

URL search params are the state. `parseFilters` / `serialiseFilters`
(`src/lib/filters.ts`) are the only readers and writers. No filter value is
mirrored in `useState`, so a shared URL restores exactly.

`search-shell.tsx` holds three pieces of presentation state only: which cards
are fading out, how many rows are shown, and which pin is active.

## Data source

`src/lib/data.ts` reads Supabase when `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, and `data/seed.csv` otherwise. The CSV
fallback exists so the site runs and can be tested before credentials are wired
up. PostgREST returns `numeric` columns as strings, so they are coerced on read;
everything downstream sees `number | null`.

The full listing set is passed to the client once and filtered in memory. At the
expected scale (hundreds of rows) this is faster than a request per keystroke and
removes a loading state from the core loop. `/api/listings` exists and is fully
functional, but the search screen does not need it.

> `ponytail:` in-memory client filtering. If the table passes a few thousand
> rows, move filtering behind `/api/listings` with a debounce.

## Map

MapLibre GL with a hand-built style (`src/lib/map-style.ts`) over VersaTiles'
free, keyless, CORS-enabled OpenStreetMap vector tiles in the Shortbread schema.
No API key and no billing account.

- Pins coloured by availability, radius stepped by `total_builtup`
- Clustered above 40 markers, declustering on zoom
- Listings with no `lat`/`lng` are excluded from the map but stay in the list,
  tagged "Location approximate"
- The map is imported on `requestIdleCallback`, keeping ~200KB of parse out of
  Total Blocking Time. The result list is usable before the map arrives.

## Performance

Lighthouse on `/`, desktop preset: performance 91–92, accessibility 100,
best-practices 96, SEO 100, CLS 0.

Card height is reserved in CSS (`.result-card { min-height: 170px }`) so a
filter-driven reflow shifts nothing.

## Modules

```
src/lib/      types · csv · derive · filters · query · data · map-style
src/components/  spec-strip · listing-card · filter-controls · filter-rail
                 search-shell · listing-map · static-locator · site-header
src/app/      / · /shed/[slug] · /[cluster] · /about · /api/listings
```

Largest file is `query.ts` at 308 lines; everything else is under 260.
