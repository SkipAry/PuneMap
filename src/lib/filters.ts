import { CLUSTERS, FLOORING_TYPES, clusterFromSlug, clusterSlug } from "./types.ts";

/** Range ends, shared by the sliders and the URL parser so they cannot drift. */
export const HEIGHT_MIN = 6;
export const HEIGHT_MAX = 20;
export const HEIGHT_STEP = 0.5;

export const POWER_MIN = 0;
export const POWER_MAX = 500;
export const POWER_STEP = 25;

export const AREA_MIN = 5_000;
export const AREA_MAX = 400_000;

export const RATE_MIN = 15;
export const RATE_MAX = 60;

export const RENT_MIN = 100_000;
export const RENT_MAX = 5_000_000;

/** "provision" selects sheds with the gantry provision cast but no crane fitted. */
export type CraneFilter = "provision" | number;

export type Filters = {
  clusters: string[];
  minHeight: number | null;
  crane: CraneFilter | null;
  minPower: number | null;
  flooring: string[];
  minDocks: number | null;
  fire: boolean;
  factoryPlan: boolean;
  minArea: number | null;
  maxArea: number | null;
  minRate: number | null;
  maxRate: number | null;
  minRent: number | null;
  maxRent: number | null;
  includeLeased: boolean;
  loose: boolean;
};

export const EMPTY_FILTERS: Filters = {
  clusters: [],
  minHeight: null,
  crane: null,
  minPower: null,
  flooring: [],
  minDocks: null,
  fire: false,
  factoryPlan: false,
  minArea: null,
  maxArea: null,
  minRate: null,
  maxRate: null,
  minRent: null,
  maxRent: null,
  includeLeased: false,
  loose: false,
};

/** Any URLSearchParams-like bag, so this works on the server and in the browser. */
type Params = {
  get(key: string): string | null;
};

const numParam = (p: Params, key: string, lo: number, hi: number): number | null => {
  const raw = p.get(key);
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(hi, Math.max(lo, n));
};

const listParam = (p: Params, key: string): string[] => {
  const raw = p.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const flag = (p: Params, key: string) => p.get(key) === "1";

export function parseFilters(p: Params): Filters {
  const clusters = listParam(p, "cluster")
    .map((s) => clusterFromSlug(s))
    .filter((c): c is string => Boolean(c));

  const flooring: string[] = listParam(p, "flooring")
    .map((s) => FLOORING_TYPES.find((f) => f.toLowerCase() === s.toLowerCase()))
    .filter((f) => f !== undefined);

  const rawCrane = p.get("crane");
  let crane: CraneFilter | null = null;
  if (rawCrane === "provision") crane = "provision";
  else if (rawCrane !== null && rawCrane.trim() !== "") {
    const n = Number(rawCrane);
    if (Number.isFinite(n) && n > 0) crane = n;
  }

  return {
    clusters,
    minHeight: numParam(p, "minHeight", HEIGHT_MIN, HEIGHT_MAX),
    crane,
    minPower: numParam(p, "minPower", POWER_MIN, POWER_MAX),
    flooring,
    minDocks: numParam(p, "docks", 0, 99),
    fire: flag(p, "fire"),
    factoryPlan: flag(p, "fpa"),
    minArea: numParam(p, "minArea", AREA_MIN, AREA_MAX),
    maxArea: numParam(p, "maxArea", AREA_MIN, AREA_MAX),
    minRate: numParam(p, "minRate", RATE_MIN, RATE_MAX),
    maxRate: numParam(p, "maxRate", RATE_MIN, RATE_MAX),
    minRent: numParam(p, "minRent", RENT_MIN, RENT_MAX),
    maxRent: numParam(p, "maxRent", RENT_MIN, RENT_MAX),
    includeLeased: flag(p, "leased"),
    loose: flag(p, "loose"),
  };
}

/** Writes only what differs from the default, so shared URLs stay readable. */
export function serialiseFilters(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.clusters.length) p.set("cluster", f.clusters.map(clusterSlug).join(","));
  if (f.minHeight !== null) p.set("minHeight", String(f.minHeight));
  if (f.crane !== null) p.set("crane", String(f.crane));
  if (f.minPower !== null) p.set("minPower", String(f.minPower));
  if (f.flooring.length) p.set("flooring", f.flooring.join(","));
  if (f.minDocks !== null && f.minDocks > 0) p.set("docks", String(f.minDocks));
  if (f.fire) p.set("fire", "1");
  if (f.factoryPlan) p.set("fpa", "1");
  if (f.minArea !== null) p.set("minArea", String(f.minArea));
  if (f.maxArea !== null) p.set("maxArea", String(f.maxArea));
  if (f.minRate !== null) p.set("minRate", String(f.minRate));
  if (f.maxRate !== null) p.set("maxRate", String(f.maxRate));
  if (f.minRent !== null) p.set("minRent", String(f.minRent));
  if (f.maxRent !== null) p.set("maxRent", String(f.maxRent));
  if (f.includeLeased) p.set("leased", "1");
  if (f.loose) p.set("loose", "1");
  return p;
}

/**
 * How many filters the user has actually set. `loose` is a modifier on the
 * others rather than a filter, so it does not count.
 */
export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.clusters.length) n++;
  if (f.minHeight !== null) n++;
  if (f.crane !== null) n++;
  if (f.minPower !== null) n++;
  if (f.flooring.length) n++;
  if (f.minDocks !== null && f.minDocks > 0) n++;
  if (f.fire) n++;
  if (f.factoryPlan) n++;
  if (f.minArea !== null || f.maxArea !== null) n++;
  if (f.minRate !== null || f.maxRate !== null) n++;
  if (f.minRent !== null || f.maxRent !== null) n++;
  if (f.includeLeased) n++;
  return n;
}

export const CLUSTER_OPTIONS = CLUSTERS;
