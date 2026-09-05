# Phase 04 — Real inventory

**Blocks launch:** yes · **Depends on:** — · **Owner:** you

## Why

This is the whole game. The other four phases are a day's work between us; this
one decides whether the product is worth launching.

```
select count(*) from listings;                      -> 60
select count(*) where broker_phone like '+91555%';  -> 60
```

Every row is scaffolding. The filter is the product, and it currently filters
fiction. A broker who lands on 60 marked placeholders learns the site is empty
and does not return — and brokers are the supply side you need.

## Target

**20–30 real listings before launch.** Not 300. Enough that a manager filtering
to 12m + 10T gets a non-empty answer in the two or three clusters you know best.
Depth in Chakan and Bhosari beats thin coverage of all nine.

## Requirements

- Real properties, sourced from public postings, each with a working
  `source_url` — the product restructures public listings, it does not claim
  them, and every entry must credit its source.
- Real broker names and numbers.
- `last_verified` set honestly on the day you confirmed it.
- Unstated specs left **null**. Never guess. A blank renders as "not stated" and
  that is the contract the whole product rests on.

## What already exists

- `npm run seed` loads `data/seed.csv` into Supabase.
- The CSV schema is the 30 columns already in `data/seed.csv`.
- `crane_capacity_ton = 0` means gantry provision cast, no crane fitted — the
  one meaningful zero. Everything else empty means unstated.
- The `+91555` marker drives all Sample tagging, so marks disappear on their own
  as real rows replace placeholders.

## Steps

1. Collect listings into a copy of `data/seed.csv`, one row per property.
2. Phone each broker to confirm the numbers a manager will filter on: clear
   height, crane, sanctioned power, docks. Set `last_verified` to that date.
3. Delete the 60 sample rows from `listings`, then load the real ones.
4. Re-run the seed and confirm counts.

## Validation

```sql
select count(*) as total,
       count(*) filter (where broker_phone like '+91555%') as still_sample,
       count(*) filter (where source_url is null) as unattributed
from listings;
```

`still_sample` and `unattributed` must both be 0. Then load the site and confirm
no Sample tag or notice renders anywhere.

## Risks

- **Guessed specs.** The single thing that would destroy trust in this product
  is a stated number that turns out wrong on site. Null is always safe; a guess
  is not.
- **Attribution.** Restructuring someone's public listing without linking back
  is both a product-principle breach and a fight you do not need.
- **Stale prerenders.** Data-only changes with no commit can leave deployed SSG
  pages serving old rows. After seeding, trigger a deploy.

## Rollback

Keep the sample CSV until real data is live. Re-seeding restores it.
