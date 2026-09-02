/**
 * Self-check for the filter engine. Run: npm test
 * Covers the rules that decide whether this product is trusted - null never
 * passes a spec filter, and the count of null-excluded rows is honest.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { listingsFromCsv } from "./csv.ts";
import { effectiveMonthlyRent, effectiveRatePerSqft } from "./derive.ts";
import { EMPTY_FILTERS, parseFilters, serialiseFilters, type Filters } from "./filters.ts";
import { applyFilters } from "./query.ts";
import type { Listing } from "./types.ts";

const csv = readFileSync(path.join(process.cwd(), "data", "seed.csv"), "utf8");
const all: Listing[] = listingsFromCsv(csv);

const f = (over: Partial<Filters> = {}): Filters => ({ ...EMPTY_FILTERS, ...over });

// --- parsing -------------------------------------------------------------
assert.equal(all.length, 60, "seed CSV should parse to 60 rows");
assert.equal(
  all.find((l) => l.slug === "chakan-45000-sqft-shed-13m-crane")?.locality,
  "Chakan MIDC Phase II, near Courtyard Marriott",
  "quoted field with an embedded comma must survive",
);
assert.equal(
  all.find((l) => l.slug === "chakan-19000-sqft-shed-no-specs")?.height_m,
  null,
  "empty cell must become null, not 0",
);

// --- a null spec never satisfies a filter on that spec -------------------
const craneOnly = applyFilters(all, f({ crane: 10 }));
assert.ok(
  craneOnly.listings.every((l) => l.crane_capacity_ton !== null && l.crane_capacity_ton >= 10),
  "10T+ filter must not admit listings with no stated crane",
);
assert.ok(craneOnly.nullExcludedTotal > 0, "some listings do not state a crane");
assert.ok(
  craneOnly.nullExclusions.some((n) => n.key === "crane"),
  "crane must be named as a reason rows were dropped",
);

// --- loose=1 adds back exactly the rows the notice promised -------------
const loose = applyFilters(all, f({ crane: 10, loose: true }));
assert.equal(
  loose.total,
  craneOnly.total + craneOnly.nullExcludedTotal,
  "Include them must add back precisely the null-excluded rows",
);

// --- a null blamed only when it is the sole reason for exclusion ---------
const narrow = applyFilters(all, f({ crane: 10, clusters: ["Chakan"] }));
const narrowLoose = applyFilters(all, f({ crane: 10, clusters: ["Chakan"], loose: true }));
assert.equal(
  narrowLoose.total,
  narrow.total + narrow.nullExcludedTotal,
  "null count must respect the other active filters",
);

// --- provision-only is distinct from any crane --------------------------
const provision = applyFilters(all, f({ crane: "provision" }));
assert.ok(provision.total > 0, "seed data has crane-provision sheds");
assert.ok(
  provision.listings.every((l) => l.crane_capacity_ton === 0),
  "provision means the gantry provision only, not a fitted crane",
);

// --- leased out is hidden until asked for -------------------------------
assert.ok(
  applyFilters(all, f()).listings.every((l) => l.availability !== "Leased out"),
  "leased-out listings are excluded by default",
);
assert.ok(
  applyFilters(all, f({ includeLeased: true })).listings.some(
    (l) => l.availability === "Leased out",
  ),
  "the checkbox re-includes leased-out listings",
);

// --- listings with no coordinates stay in the list ----------------------
assert.ok(
  applyFilters(all, f()).listings.some((l) => l.lat === null),
  "a missing lat/lng must never drop a listing from the results",
);

// --- the spec's worked example: 12m+ and a 10T crane in Chakan ----------
const target = applyFilters(all, f({ minHeight: 12, crane: 10, clusters: ["Chakan"] }));
assert.ok(target.total > 0, "the headline search must return something");
assert.ok(
  target.listings.every(
    (l) => (l.height_m ?? 0) >= 12 && (l.crane_capacity_ton ?? 0) >= 10 && l.cluster === "Chakan",
  ),
  "every result must satisfy every constraint",
);

// --- empty state names the nearest alternative --------------------------
const impossible = applyFilters(all, f({ minHeight: 20, crane: 40, minPower: 500 }));
assert.equal(impossible.total, 0);
assert.ok(impossible.closestMiss, "an empty result must name the closest miss");

// --- derived commercials: null in, null out -----------------------------
const noCommercials: Listing = { ...all[0], rate_per_sqft: null, quoted_monthly_rent: null };
assert.equal(effectiveMonthlyRent(noCommercials), null);
assert.equal(effectiveRatePerSqft(noCommercials), null);
const lumpSum = all.find((l) => l.quoted_monthly_rent !== null && l.rate_per_sqft === null)!;
assert.ok(
  (effectiveRatePerSqft(lumpSum) ?? 0) > 0,
  "a lump-sum listing still yields a rate per sq ft",
);

// --- the URL is the state ------------------------------------------------
const round = f({ clusters: ["Chakan"], minHeight: 12, crane: 10, minArea: 20000 });
const restored = parseFilters(new URLSearchParams(serialiseFilters(round).toString()));
assert.deepEqual(restored, round, "filters must survive a round trip through the URL");
assert.equal(
  serialiseFilters(round).toString(),
  new URLSearchParams("cluster=chakan&minHeight=12&crane=10&minArea=20000").toString(),
  "the shareable URL keeps the documented parameter names",
);

console.log(
  `query.test.ts: all assertions passed (${all.length} listings, ` +
    `${craneOnly.total} match 10T+, ${craneOnly.nullExcludedTotal} unstated)`,
);
