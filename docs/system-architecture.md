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

MapLibre GL JS. The basemap is resolved in `src/lib/map-style.ts`:

| Condition | Basemap |
|---|---|
| `NEXT_PUBLIC_MAP_STYLE_URL` set | that style JSON |
| `NEXT_PUBLIC_CARTO_API_KEY` set | CARTO raster (`light_all` / `voyager`) |
| neither | OpenFreeMap Positron vector tiles |

CARTO's CDN answers without a key but stamps every tile "API KEY REQUIRED", so
the keyless default is OpenFreeMap's Positron - the same near-monochrome design,
genuinely free.

**This choice costs real performance.** Measured on `/`, desktop preset:

| Basemap | Lighthouse performance | Total Blocking Time |
|---|---|---|
| CARTO raster | 96-98 | 130-160 ms |
| OpenFreeMap Positron (vector) | 81-82 | 390-420 ms |

Vector tiles are styled and laid out on the main thread; 55 style layers is
substantially more work than decoding raster PNGs. A free CARTO key both matches
the reference design exactly and restores the performance budget.

- Pins coloured by availability, radius stepped by `total_builtup`
- Clustered above 40 markers, declustering on zoom
- Listings with no `lat`/`lng` are excluded from the map but stay in the list,
  tagged "Location approximate"
- The map is imported on `requestIdleCallback`, so its parse stays off the
  critical path. The result list is usable before it arrives.

## Performance

Lighthouse on `/`, desktop preset, with the keyless Positron basemap:
performance 81-82, accessibility 100, best-practices 96, SEO 100, CLS 0.
With a CARTO key, performance is 96-98. See the table above.

Typography is Google Sans (weights 400-700). It is not in `next/font`'s
catalogue, so the `@font-face` rules are inlined in `src/app/google-sans.css` -
fetched once from the Google Fonts API and committed, with the files still
served from gstatic. Nothing is redistributed and no stylesheet request blocks
first paint. Google Sans has no width axis, so the label tier is set by weight
and tracking rather than a condensed cut.

> `ponytail:` inlined `@font-face` pins gstatic URLs that Google rotates
> eventually. The stack falls back to system-ui if they 404; re-run the fetch in
> the deployment guide to refresh.

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
