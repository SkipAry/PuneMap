# Deployment guide

## Run locally

```bash
npm install
npm run dev
```

Works with no configuration — it reads `data/seed.csv`. Open http://localhost:3000.

Other scripts:

```bash
npm test        # filter-engine self-check (assertions, no framework)
npm run build   # production build
npm run seed    # validate seed.csv, and load it if credentials are set
```

## Supabase

1. Create a project. Run `supabase/migrations/0001_listings.sql` in the SQL
   editor. It creates the table, the five filter indexes, and an RLS policy
   granting `anon` SELECT only.

2. Load the seed data. The service role key is required — RLS blocks anon
   writes. It is a **server-side secret**: never put it in `NEXT_PUBLIC_*`, never
   commit it.

```bash
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service role key> \
npm run seed
```

Upserts on `slug`, so re-running after editing the spreadsheet is safe. Without
credentials it validates the CSV and stops.

3. Set the app's environment (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Once both are set the app reads Supabase and ignores the CSV. Until then it
falls back to the CSV, so a missing variable degrades rather than breaks.

## Adding and editing listings

Edit rows directly in the Supabase table editor. That is the admin panel — there
is no other one, by design.

Leave a cell empty when the broker did not state it. **Do not type 0 for
unknown.** The whole product depends on the difference: `0` docks means a shed
with no docks, empty means nobody said. Entering 0 for unknown puts a false
number in front of a buyer.

`crane_capacity_ton` is the one exception: `0` means the gantry provision is cast
but no crane is fitted, which the UI shows as `Prov.` and the "Provision only"
filter selects.

Constrained values:

- `cluster` — Chakan, Bhosari, Talegaon, Ranjangaon, Wagholi, Nigdi, Hinjawadi, Pirangut, Other
- `property_type` — Shed, Warehouse, Factory building, Industrial plot
- `flooring` — Trimix, Tremix, VDF, Epoxy, Plain RCC, Unknown
- `availability` — Ready, Under construction, Built-to-suit, Leased out

A value outside these lists will not match its filter. `npm run seed` rejects
them; the table editor does not, so type carefully.

Bump `last_verified` whenever you re-confirm a listing — it drives the "Verified
12 days ago" line, which is the site's main credibility signal.

## Vercel

Connect the repo, framework preset Next.js, add the two `NEXT_PUBLIC_SUPABASE_*`
variables. No other configuration.

`/` is dynamic (it reads search params). `/shed/[slug]` and `/[cluster]` are
prerendered from `generateStaticParams`, so **new listings appear on `/`
immediately but need a redeploy to get their own static page.** If that becomes
awkward, add `export const dynamicParams = true` and an ISR `revalidate` to those
routes.

## Map tiles

Defaults to VersaTiles' free public OpenStreetMap endpoint — keyless, no billing.
It is a community service with no uptime guarantee. Before launch, either
self-host tiles or accept the dependency deliberately. To point at your own:

```
NEXT_PUBLIC_MAP_STYLE_URL=https://your-host/style.json
```

Attribution to OpenStreetMap and VersaTiles is baked into the source definition
and must stay.

## Before launch

- [ ] Replace `data/seed.csv` with the owner's real export and re-run `npm run seed`
- [ ] Set `metadataBase` in `src/app/layout.tsx` to the real domain (currently a placeholder)
- [ ] Decide on the tile host
- [ ] Add the Plausible or Umami script tag to `src/app/layout.tsx`
