/**
 * Loads data/seed.csv into the `listings` table, upserting on `slug` so it is
 * safe to re-run after the owner edits the spreadsheet.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
 *
 * Writes need the service role key: RLS grants anon SELECT only. Without
 * credentials the script parses and validates the CSV, then stops - so you can
 * check the file before touching the database.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { listingsFromCsv } from "../src/lib/csv.ts";
import { AVAILABILITY, CLUSTERS, PROPERTY_TYPES } from "../src/lib/types.ts";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const file = path.join(process.cwd(), "data", "seed.csv");
  const listings = listingsFromCsv(await readFile(file, "utf8"));

  if (listings.length === 0) throw new Error("data/seed.csv parsed to zero rows");

  // Validate before writing - a typo in a cluster name silently breaks filtering.
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const l of listings) {
    if (seen.has(l.slug)) problems.push(`duplicate slug: ${l.slug}`);
    seen.add(l.slug);
    if (!CLUSTERS.includes(l.cluster as (typeof CLUSTERS)[number]))
      problems.push(`${l.slug}: unknown cluster "${l.cluster}"`);
    if (!PROPERTY_TYPES.includes(l.property_type as (typeof PROPERTY_TYPES)[number]))
      problems.push(`${l.slug}: unknown property_type "${l.property_type}"`);
    if (!AVAILABILITY.includes(l.availability as (typeof AVAILABILITY)[number]))
      problems.push(`${l.slug}: unknown availability "${l.availability}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(l.last_verified))
      problems.push(`${l.slug}: last_verified must be YYYY-MM-DD, got "${l.last_verified}"`);
  }

  if (problems.length) {
    for (const p of problems) console.error(`  ✗ ${p}`);
    throw new Error(`${problems.length} invalid row(s) - nothing written`);
  }

  console.log(`Parsed ${listings.length} valid rows from data/seed.csv`);

  if (!url || !key) {
    console.log("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set - validation only, no write.");
    return;
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  // `id` is generated always; strip it so Postgres assigns its own.
  const rows = listings.map(({ id: _id, ...rest }) => rest);

  const { error } = await db.from("listings").upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`upsert failed: ${error.message}`);

  const { count, error: countError } = await db
    .from("listings")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(`count failed: ${countError.message}`);

  console.log(`Upserted ${rows.length} rows. Table now holds ${count} listings.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
