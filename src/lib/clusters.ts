/**
 * Zone colour per cluster - the wayfinding move.
 *
 * An industrial estate signs its zones by colour so you can find your corridor
 * before you read a word. The same hue is used on the map pin, the filter chip
 * and the card's leading edge, so a user learns "Chakan is amber" once and then
 * reads the map without decoding a legend.
 *
 * Hues are spread around the wheel at similar chroma and lightness, so no zone
 * shouts louder than another, and every one clears 3:1 against both basemaps.
 * Availability is never carried by hue - it rides the pin's ring instead.
 */
export const ZONE: Record<string, string> = {
  Chakan: "#E07B39",
  Bhosari: "#2E7FD4",
  Talegaon: "#12A594",
  Ranjangaon: "#8659D6",
  Wagholi: "#DE4A5F",
  Nigdi: "#C79213",
  Hinjawadi: "#1B96B8",
  Pirangut: "#3E9E5A",
  Other: "#7A8290",
};

export const zoneOf = (cluster: string) => ZONE[cluster] ?? ZONE.Other;

/**
 * Availability reads as ring treatment, never as hue, so it can coexist with
 * the zone colour on a single pin.
 */
export const AVAILABILITY_RING: Record<string, { label: string; ring: string }> = {
  Ready: { label: "Ready", ring: "solid" },
  "Under construction": { label: "Under construction", ring: "dashed" },
  "Built-to-suit": { label: "Built-to-suit", ring: "hollow" },
  "Leased out": { label: "Leased out", ring: "faded" },
};
