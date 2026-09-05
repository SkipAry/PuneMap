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
import { checkListings } from "../src/lib/listing-checks.ts";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const file = path.join(process.cwd(), "data", "seed.csv");
  const listings = listingsFromCsv(await readFile(file, "utf8"));

  if (listings.length === 0) throw new Error("data/seed.csv parsed to zero rows");

  /*
    The placeholder rows still in the repo cannot pass the checks that matter
    for real inventory - they have no source_url and carry unallocatable phone
    numbers, both on purpose. `npm run seed -- --sample` keeps loading them
    while the site is being built; real data must clear the strict pass.
  */
  const allowSampleData = process.argv.includes("--sample");
  const problems = checkListings(listings, { allowSampleData });

  if (problems.length) {
    for (const p of problems) console.error(`  ✗ ${p}`);
    throw new Error(`${problems.length} invalid row(s) - nothing written`);
  }

  console.log(
    `Parsed ${listings.length} valid rows from data/seed.csv` +
      (allowSampleData ? " (sample rules - attribution and phone checks skipped)" : ""),
  );

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
