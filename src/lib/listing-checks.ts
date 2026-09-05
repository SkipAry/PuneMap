import {
  AVAILABILITY,
  CLUSTERS,
  PROPERTY_TYPES,
  type Listing,
} from "./types.ts";

/**
 * What a row has to satisfy before it is allowed near the live table.
 *
 * These are the mistakes that survive a spreadsheet and only show themselves in
 * public: a placeholder phone number shipped as real inventory, a listing with
 * no link back to the posting it was restructured from, a decimal point that
 * puts a shed in the Arabian Sea, a height of 130m.
 *
 * Deliberately not checked: whether a stated spec is true. Nothing here can
 * tell a real 12m clear height from an invented one - that is what the
 * confirming phone call is for. The rule the data must follow is that an
 * unknown spec stays null rather than being guessed, and a guess is invisible
 * to code.
 */

/** The placeholder prefix the sample rows carry, and must never be published. */
const SAMPLE_PHONE_PREFIX = "+91555";

/**
 * Generous bounds around the Pune industrial belt - Talegaon in the north-west
 * to Ranjangaon in the east. A swapped lat/lng lands near 73 degrees north and
 * fails here rather than silently vanishing off the map.
 */
const PUNE_BOUNDS = { minLat: 18.0, maxLat: 19.3, minLng: 73.2, maxLng: 74.9 };

/** Ranges a real industrial shed falls inside; outside is a typo, not a rarity. */
const RANGES: { field: keyof Listing; min: number; max: number; unit: string }[] = [
  { field: "height_m", min: 3, max: 40, unit: "m" },
  { field: "crane_capacity_ton", min: 0, max: 200, unit: "T" },
  { field: "power_hp", min: 0, max: 5000, unit: "HP" },
  { field: "total_builtup", min: 500, max: 2_000_000, unit: "sq ft" },
  { field: "shed_area", min: 100, max: 2_000_000, unit: "sq ft" },
  { field: "docks", min: 0, max: 100, unit: "docks" },
  { field: "rate_per_sqft", min: 5, max: 500, unit: "rupees/sq ft" },
  { field: "deposit_months", min: 0, max: 36, unit: "months" },
];

/** Ten digits starting 6-9, however the sheet happens to space or prefix it. */
const looksLikeIndianMobile = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return local.length === 10 && /^[6-9]/.test(local);
};

export type CheckOptions = {
  /**
   * Sample rows are allowed to keep their placeholder phone numbers and skip
   * attribution; real inventory is not. Defaults to the strict reading.
   */
  allowSampleData?: boolean;
  /** Overridden in tests so a fixed date does not rot. */
  today?: Date;
};

export function checkListings(
  listings: Listing[],
  { allowSampleData = false, today = new Date() }: CheckOptions = {},
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  if (listings.length === 0) problems.push("no rows parsed");

  for (const l of listings) {
    const at = (msg: string) => problems.push(`${l.slug || "(no slug)"}: ${msg}`);

    if (!l.slug) problems.push("a row has no slug");
    else if (seen.has(l.slug)) at("duplicate slug");
    seen.add(l.slug);

    if (!CLUSTERS.includes(l.cluster as (typeof CLUSTERS)[number]))
      at(`unknown cluster "${l.cluster}"`);
    if (!PROPERTY_TYPES.includes(l.property_type as (typeof PROPERTY_TYPES)[number]))
      at(`unknown property_type "${l.property_type}"`);
    if (!AVAILABILITY.includes(l.availability as (typeof AVAILABILITY)[number]))
      at(`unknown availability "${l.availability}"`);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(l.last_verified)) {
      at(`last_verified must be YYYY-MM-DD, got "${l.last_verified}"`);
    } else if (new Date(l.last_verified) > today) {
      at(`last_verified is in the future (${l.last_verified})`);
    }

    // Every listing restructures someone else's posting and has to credit it.
    if (!allowSampleData && !l.source_url) at("no source_url - the original posting must be linked");

    if (l.broker_phone) {
      if (!allowSampleData && l.broker_phone.startsWith(SAMPLE_PHONE_PREFIX))
        at("still carries a placeholder phone number");
      else if (!l.broker_phone.startsWith(SAMPLE_PHONE_PREFIX) && !looksLikeIndianMobile(l.broker_phone))
        at(`phone is not a 10-digit Indian mobile: "${l.broker_phone}"`);
    } else if (!allowSampleData) {
      at("no broker_phone - the call is the whole point");
    }

    // Coordinates are optional; the listing simply stays off the map. But a
    // coordinate that exists has to be in the right part of the world.
    if (l.lat !== null && l.lng !== null) {
      const { minLat, maxLat, minLng, maxLng } = PUNE_BOUNDS;
      if (l.lat < minLat || l.lat > maxLat || l.lng < minLng || l.lng > maxLng)
        at(`coordinates outside the Pune region (${l.lat}, ${l.lng})`);
    } else if (l.lat !== null || l.lng !== null) {
      at("has one of lat/lng but not the other");
    }

    for (const { field, min, max, unit } of RANGES) {
      const v = l[field];
      if (typeof v === "number" && (v < min || v > max))
        at(`${String(field)} of ${v} is outside ${min}-${max} ${unit}`);
    }
  }

  return problems;
}
