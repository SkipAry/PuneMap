import type { Listing } from "./types.ts";

/** What an unstated spec looks like everywhere on the site. */
export const DASH = "—";
export const NOT_STATED = "Not stated in the listing";

const inr = new Intl.NumberFormat("en-IN");

/**
 * Monthly rent in rupees. Uses the broker's lump sum when quoted, otherwise
 * multiplies out the rate. Null in, null out - never a fabricated number.
 */
export function effectiveMonthlyRent(l: Listing): number | null {
  if (l.quoted_monthly_rent !== null) return l.quoted_monthly_rent;
  if (l.rate_per_sqft !== null && l.total_builtup !== null) {
    return Math.round(l.rate_per_sqft * l.total_builtup);
  }
  return null;
}

/** Rupees per sq ft per month, quoted or back-calculated from the lump sum. */
export function effectiveRatePerSqft(l: Listing): number | null {
  if (l.rate_per_sqft !== null) return l.rate_per_sqft;
  if (l.quoted_monthly_rent !== null && l.total_builtup) {
    return Math.round((l.quoted_monthly_rent / l.total_builtup) * 100) / 100;
  }
  return null;
}

/** True when the figure came from arithmetic rather than from the broker. */
/**
 * Scaffolding rows, not real inventory. They are written with the
 * non-allocatable +91555 prefix precisely so they cannot reach a person, and
 * that prefix is what marks them here - so the moment real listings with real
 * numbers land, every "Sample" mark disappears on its own.
 */
export const isSampleListing = (l: Listing) =>
  l.broker_phone?.startsWith("+91555") ?? false;

export const rentIsDerived = (l: Listing) => l.quoted_monthly_rent === null;
export const rateIsDerived = (l: Listing) => l.rate_per_sqft === null;

export const fmtNumber = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : inr.format(n);

export const fmtRupees = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : `₹${inr.format(n)}`;

export const fmtArea = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : `${inr.format(n)} sq ft`;

export const fmtHeight = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : `${n.toFixed(1)}m`;

/** Cranes read as tonnage; 0 means the shed only has the provision cast in. */
export const fmtCrane = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return DASH;
  if (n === 0) return "Prov.";
  return `${n % 1 === 0 ? n : n.toFixed(1)}T`;
};

export const fmtPower = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : `${inr.format(n)}HP`;

export const fmtCount = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : String(n);

export const fmtBool = (v: boolean | null | undefined): string =>
  v === null || v === undefined ? DASH : v ? "Yes" : "No";

export const fmtText = (v: string | null | undefined): string =>
  v === null || v === undefined || v === "" ? DASH : v;

/** "Verified 12 days ago". Falls back to the raw date if it will not parse. */
export function verifiedAgo(isoDate: string, now = new Date()): string {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return DASH;
  const days = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 45) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} months ago`;
}

/** Headline used on cards, page titles and the detail block. */
export function listingTitle(l: Listing): string {
  const area = l.total_builtup === null ? null : `${inr.format(l.total_builtup)} sq ft`;
  const type = l.property_type.toLowerCase();
  return area ? `${area} ${type}` : `${l.property_type} at ${l.cluster}`;
}
