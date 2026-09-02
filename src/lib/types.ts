/**
 * One row of the `listings` table. Every field the broker did not state is null,
 * and null must survive all the way to the screen as an em-dash - never as 0.
 */
export type Listing = {
  id: number;
  slug: string;
  cluster: string;
  locality: string | null;
  property_type: string;
  lat: number | null;
  lng: number | null;

  shed_area: number | null;
  office_area: number | null;
  total_builtup: number | null;
  open_area: number | null;

  height_m: number | null;
  crane_capacity_ton: number | null;
  crane_count: number | null;
  power_hp: number | null;
  flooring: string | null;
  floor_load_mt: number | null;
  docks: number | null;
  ramps: number | null;
  fire_system: string | null;
  factory_plan_approved: boolean | null;
  parking_slots: number | null;

  rate_per_sqft: number | null;
  quoted_monthly_rent: number | null;
  deposit_months: number | null;

  availability: string;
  broker_name: string | null;
  broker_phone: string | null;
  source_url: string | null;
  notes: string | null;
  last_verified: string;
};

export const CLUSTERS = [
  "Chakan",
  "Bhosari",
  "Talegaon",
  "Ranjangaon",
  "Wagholi",
  "Nigdi",
  "Hinjawadi",
  "Pirangut",
  "Other",
] as const;

export const PROPERTY_TYPES = [
  "Shed",
  "Warehouse",
  "Factory building",
  "Industrial plot",
] as const;

export const FLOORING_TYPES = [
  "Trimix",
  "Tremix",
  "VDF",
  "Epoxy",
  "Plain RCC",
  "Unknown",
] as const;

export const AVAILABILITY = [
  "Ready",
  "Under construction",
  "Built-to-suit",
  "Leased out",
] as const;

/** Muted status colours. Deliberately not bright - see design section 9. */
export const AVAILABILITY_COLOUR: Record<string, string> = {
  Ready: "#2F6B4F",
  "Under construction": "#8A6D1F",
  "Built-to-suit": "#4A5C6A",
  "Leased out": "#9A9A96",
};

/** URL slug for a cluster, e.g. "Chakan" -> "chakan". Used by /[cluster] and ?cluster=. */
export const clusterSlug = (cluster: string) =>
  cluster.toLowerCase().replace(/\s+/g, "-");

export const clusterFromSlug = (slug: string): string | undefined =>
  CLUSTERS.find((c) => clusterSlug(c) === slug.toLowerCase());
