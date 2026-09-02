import { effectiveMonthlyRent, effectiveRatePerSqft, fmtArea } from "./derive.ts";
import type { Filters } from "./filters.ts";
import type { Listing } from "./types.ts";

export const PAGE_SIZE = 12;

/**
 * One user-set constraint. `value` pulls the spec out of a listing; when it
 * returns null the broker never stated it, which is a different outcome from
 * failing the test and is counted separately.
 */
type Predicate = {
  key: string;
  /** Reads as "... don't state {label}." */
  label: string;
  value: (l: Listing) => number | string | boolean | null;
  test: (v: never) => boolean;
  /** False for constraints on NOT NULL columns, where an unknown cannot arise. */
  nullable: boolean;
};

function buildPredicates(f: Filters): Predicate[] {
  const p: Predicate[] = [];

  // Building specs first - they are the reason the site exists.
  if (f.minHeight !== null) {
    const min = f.minHeight;
    p.push({
      key: "height",
      label: "clear height",
      value: (l) => l.height_m,
      test: ((v: number) => v >= min) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.crane !== null) {
    const want = f.crane;
    p.push({
      key: "crane",
      label: "crane capacity",
      value: (l) => l.crane_capacity_ton,
      test: ((v: number) =>
        want === "provision" ? v === 0 : v >= want) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.minPower !== null) {
    const min = f.minPower;
    p.push({
      key: "power",
      label: "sanctioned power",
      value: (l) => l.power_hp,
      test: ((v: number) => v >= min) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.flooring.length) {
    const want = f.flooring;
    p.push({
      key: "flooring",
      label: "flooring",
      value: (l) => l.flooring,
      test: ((v: string) => want.includes(v)) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.minDocks !== null && f.minDocks > 0) {
    const min = f.minDocks;
    p.push({
      key: "docks",
      label: "dock count",
      value: (l) => l.docks,
      test: ((v: number) => v >= min) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.fire) {
    p.push({
      key: "fire",
      label: "a fire system",
      value: (l) => l.fire_system,
      test: (() => true) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.factoryPlan) {
    p.push({
      key: "fpa",
      label: "factory plan approval",
      value: (l) => l.factory_plan_approved,
      test: ((v: boolean) => v === true) as Predicate["test"],
      nullable: true,
    });
  }

  // Size.
  if (f.minArea !== null || f.maxArea !== null) {
    const lo = f.minArea;
    const hi = f.maxArea;
    p.push({
      key: "area",
      label: "built-up area",
      value: (l) => l.total_builtup,
      test: ((v: number) =>
        (lo === null || v >= lo) && (hi === null || v <= hi)) as Predicate["test"],
      nullable: true,
    });
  }

  // Commercials. Both sides fall back to the derived figure so a lump-sum-only
  // listing still answers a rate filter.
  if (f.minRate !== null || f.maxRate !== null) {
    const lo = f.minRate;
    const hi = f.maxRate;
    p.push({
      key: "rate",
      label: "a rate per sq ft",
      value: (l) => effectiveRatePerSqft(l),
      test: ((v: number) =>
        (lo === null || v >= lo) && (hi === null || v <= hi)) as Predicate["test"],
      nullable: true,
    });
  }

  if (f.minRent !== null || f.maxRent !== null) {
    const lo = f.minRent;
    const hi = f.maxRent;
    p.push({
      key: "rent",
      label: "a monthly rent",
      value: (l) => effectiveMonthlyRent(l),
      test: ((v: number) =>
        (lo === null || v >= lo) && (hi === null || v <= hi)) as Predicate["test"],
      nullable: true,
    });
  }

  // Location. cluster is NOT NULL, so it can never exclude on unknown.
  if (f.clusters.length) {
    const want = f.clusters;
    p.push({
      key: "cluster",
      label: "a cluster",
      value: (l) => l.cluster,
      test: ((v: string) => want.includes(v)) as Predicate["test"],
      nullable: false,
    });
  }

  // Status. Leased-out listings are hidden unless asked for.
  if (!f.includeLeased) {
    p.push({
      key: "availability",
      label: "availability",
      value: (l) => l.availability,
      test: ((v: string) => v !== "Leased out") as Predicate["test"],
      nullable: false,
    });
  }

  return p;
}

type Outcome = "pass" | "fail" | "unknown";

const evaluate = (p: Predicate, l: Listing): Outcome => {
  const v = p.value(l);
  if (v === null) return "unknown";
  return (p.test as (x: unknown) => boolean)(v) ? "pass" : "fail";
};

export type NullExclusion = { key: string; label: string; count: number };

export type QueryResult = {
  listings: Listing[];
  total: number;
  /** Fields that pushed listings out purely for being unstated. */
  nullExclusions: NullExclusion[];
  /** Total listings that `loose=1` would add back. */
  nullExcludedTotal: number;
  /** Nearest alternative when nothing matched, for the empty state. */
  closestMiss: { listing: Listing; reason: string } | null;
};

const availabilityRank: Record<string, number> = {
  Ready: 0,
  "Under construction": 1,
  "Built-to-suit": 2,
  "Leased out": 3,
};

/** Ready first, then most recently verified - the order a buyer wants to scan. */
function sortListings(rows: Listing[]): Listing[] {
  return [...rows].sort((a, b) => {
    const rank = (availabilityRank[a.availability] ?? 9) - (availabilityRank[b.availability] ?? 9);
    if (rank !== 0) return rank;
    return b.last_verified.localeCompare(a.last_verified);
  });
}

/**
 * Applies the filters and, crucially, reports what was thrown away for being
 * unstated rather than for genuinely not matching.
 */
export function applyFilters(all: Listing[], f: Filters): QueryResult {
  const predicates = buildPredicates(f);

  if (predicates.length === 0) {
    const listings = sortListings(all);
    return {
      listings,
      total: listings.length,
      nullExclusions: [],
      nullExcludedTotal: 0,
      closestMiss: null,
    };
  }

  const matched: Listing[] = [];
  const nullCounts = new Map<string, number>();
  const nullExcludedRows = new Set<Listing>();
  let bestMiss: { listing: Listing; reason: string; failures: number } | null = null;

  for (const l of all) {
    const unknowns: Predicate[] = [];
    const failures: Predicate[] = [];

    for (const p of predicates) {
      const outcome = evaluate(p, l);
      if (outcome === "fail") failures.push(p);
      else if (outcome === "unknown") unknowns.push(p);
    }

    // In loose mode an unstated spec is treated as a pass.
    const excludedBy = f.loose ? failures : [...failures, ...unknowns];

    if (excludedBy.length === 0) {
      matched.push(l);
      continue;
    }

    // Only blame a null when it is the *sole* reason the row dropped out -
    // otherwise "Include them" would promise rows that still would not match.
    if (!f.loose && failures.length === 0 && unknowns.length > 0) {
      nullExcludedRows.add(l);
      for (const p of unknowns) {
        if (p.nullable) nullCounts.set(p.key, (nullCounts.get(p.key) ?? 0) + 1);
      }
    }

    const weight = excludedBy.length;
    if (bestMiss === null || weight < bestMiss.failures) {
      const p = excludedBy[0];
      const stated = p.value(l) !== null;
      bestMiss = {
        listing: l,
        reason: stated ? `a different ${p.label}` : `no stated ${p.label}`,
        failures: weight,
      };
    }
  }

  const nullExclusions: NullExclusion[] = predicates
    .filter((p) => p.nullable && (nullCounts.get(p.key) ?? 0) > 0)
    .map((p) => ({ key: p.key, label: p.label, count: nullCounts.get(p.key) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const listings = sortListings(matched);

  return {
    listings,
    total: listings.length,
    nullExclusions,
    nullExcludedTotal: nullExcludedRows.size,
    closestMiss:
      listings.length === 0 && bestMiss
        ? { listing: bestMiss.listing, reason: bestMiss.reason }
        : null,
  };
}

/** "a 38,000 sq ft unit in Talegaon with no stated crane capacity" */
export function describeMiss(miss: { listing: Listing; reason: string }): string {
  const { listing, reason } = miss;
  const area = listing.total_builtup === null ? "a unit" : `a ${fmtArea(listing.total_builtup)} unit`;
  return `${area} in ${listing.cluster} with ${reason}`;
}

/** Same-cluster listings within +/-40% area, for the detail page. */
export function similarListings(all: Listing[], to: Listing, limit = 3): Listing[] {
  const area = to.total_builtup;
  const pool = all.filter(
    (l) =>
      l.slug !== to.slug &&
      l.cluster === to.cluster &&
      (area === null ||
        (l.total_builtup !== null &&
          l.total_builtup >= area * 0.6 &&
          l.total_builtup <= area * 1.4)),
  );
  return sortListings(pool).slice(0, limit);
}
