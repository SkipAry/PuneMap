import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { listingsFromCsv } from "./csv.ts";
import type { Listing } from "./types.ts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const usingSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function fromSupabase(): Promise<Listing[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });

  const { data, error } = await db.from("listings").select("*");
  if (error) throw new Error(`Supabase read failed: ${error.message}`);

  // numeric columns arrive as strings over PostgREST; coerce so the app only
  // ever sees numbers or null.
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const n = (k: string) => (r[k] === null || r[k] === undefined ? null : Number(r[k]));
    return { ...(r as unknown as Listing),
      lat: n("lat"), lng: n("lng"),
      shed_area: n("shed_area"), office_area: n("office_area"),
      total_builtup: n("total_builtup"), open_area: n("open_area"),
      height_m: n("height_m"), crane_capacity_ton: n("crane_capacity_ton"),
      crane_count: n("crane_count"), power_hp: n("power_hp"),
      floor_load_mt: n("floor_load_mt"), docks: n("docks"), ramps: n("ramps"),
      parking_slots: n("parking_slots"), rate_per_sqft: n("rate_per_sqft"),
      quoted_monthly_rent: n("quoted_monthly_rent"), deposit_months: n("deposit_months"),
    };
  });
}

async function fromSeedCsv(): Promise<Listing[]> {
  const file = path.join(process.cwd(), "data", "seed.csv");
  return listingsFromCsv(await readFile(file, "utf8"));
}

/**
 * Every listing, read once per request. Supabase is the source of truth; the
 * seed CSV is the fallback so the site runs before credentials are wired up.
 */
export const getListings = cache(async (): Promise<Listing[]> =>
  usingSupabase ? fromSupabase() : fromSeedCsv(),
);

export const getListingBySlug = cache(async (slug: string): Promise<Listing | null> => {
  const all = await getListings();
  return all.find((l) => l.slug === slug) ?? null;
});
