/**
 * Self-check for the guard that stands between a spreadsheet and the live
 * table. Run: npm run test:checks
 *
 * Each case below is a mistake that would otherwise reach the public site:
 * placeholder contact details published as real inventory, a listing with no
 * credit to the posting it came from, a decimal slip that moves a shed out of
 * Maharashtra.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { listingsFromCsv } from "./csv.ts";
import { checkListings } from "./listing-checks.ts";
import type { Listing } from "./types.ts";

const all: Listing[] = listingsFromCsv(
  readFileSync(path.join(process.cwd(), "data", "seed.csv"), "utf8"),
);

const one = (over: Partial<Listing> = {}): Listing[] => [{ ...all[0], ...over }];
const has = (problems: string[], needle: string) =>
  problems.some((p) => p.includes(needle));

// --- the sample data, under both readings --------------------------------
assert.equal(
  checkListings(all, { allowSampleData: true }).length,
  0,
  "the shipped sample CSV must pass the sample rules",
);

const strict = checkListings(all);
assert.ok(
  has(strict, "no source_url") || has(strict, "placeholder phone"),
  "the same rows must fail the rules meant for real inventory",
);

// --- the mistakes worth catching -----------------------------------------
assert.ok(
  has(checkListings(one({ broker_phone: "+915550000001" })), "placeholder phone"),
  "a placeholder number must never pass as real inventory",
);
assert.ok(
  has(checkListings(one({ source_url: null })), "no source_url"),
  "a restructured listing has to credit its source",
);
assert.ok(
  has(checkListings(one({ broker_phone: "12345" })), "not a 10-digit Indian mobile"),
  "a malformed phone number is a listing nobody can call",
);
assert.ok(
  // Latitude and longitude swapped: a plausible-looking pair, nowhere near Pune.
  has(checkListings(one({ lat: 73.88, lng: 18.77 })), "outside the Pune region"),
  "swapped coordinates must not reach the map",
);
assert.ok(
  has(checkListings(one({ lat: 18.77, lng: null })), "one of lat/lng"),
  "half a coordinate is a broken coordinate",
);
assert.ok(
  // 13.0m typed as 130
  has(checkListings(one({ height_m: 130 })), "height_m"),
  "a decimal slip in clear height must be caught",
);
assert.ok(
  has(checkListings(one({ last_verified: "2099-01-01" })), "in the future"),
  "a listing cannot have been verified tomorrow",
);
assert.ok(
  has(checkListings(one({ cluster: "Chakkan" })), "unknown cluster"),
  "a misspelled cluster silently breaks filtering",
);
assert.ok(
  has(checkListings([all[0], all[0]]), "duplicate slug"),
  "two rows with one slug would overwrite each other",
);

// A row with no specs at all is valid: unstated is a first-class value, and
// refusing it would push the owner towards inventing numbers.
assert.equal(
  checkListings(
    one({ height_m: null, crane_capacity_ton: null, power_hp: null, docks: null }),
    { allowSampleData: true },
  ).length,
  0,
  "an all-unstated listing must stay acceptable",
);

console.log(
  `listing-checks.test.ts: all assertions passed (${all.length} sample rows, ${strict.length} strict findings)`,
);
