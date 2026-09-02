/**
 * Two basemaps, switchable from the map: Light and Voyager.
 *
 * Both come from OpenFreeMap, which is keyless and unmetered. CARTO ships the
 * originals of these two looks but stamps every tile "API KEY REQUIRED" without
 * a key, so setting NEXT_PUBLIC_CARTO_API_KEY swaps in the real ones.
 */
export type BasemapId = "light" | "voyager";

export const BASEMAPS: { id: BasemapId; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "voyager", label: "Voyager" },
];

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

/** OpenFreeMap Positron reads as CARTO Light; Liberty as CARTO Voyager. */
const OPENFREEMAP: Record<BasemapId, string> = {
  light: "https://tiles.openfreemap.org/styles/positron",
  voyager: "https://tiles.openfreemap.org/styles/liberty",
};

const CARTO_STYLE: Record<BasemapId, string> = {
  light: "light_all",
  voyager: "rastertiles/voyager",
};

function cartoStyle(id: BasemapId, key: string) {
  const tiles = ["a", "b", "c", "d"].map(
    (sub) =>
      `https://${sub}.basemaps.cartocdn.com/${CARTO_STYLE[id]}/{z}/{x}/{y}@2x.png?api_key=${encodeURIComponent(key)}`,
  );

  return {
    version: 8 as const,
    // A raster basemap serves no glyphs, but the cluster counts are text. Use
    // the same font endpoint as the vector styles so one fontstack name works
    // for both basemaps.
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      carto: {
        type: "raster" as const,
        tiles,
        tileSize: 256,
        maxzoom: 20,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      },
    },
    layers: [
      { id: "bg", type: "background" as const, paint: { "background-color": "#eef1f5" } },
      { id: "carto", type: "raster" as const, source: "carto" },
    ],
  };
}

/** A style URL or an inline style - MapLibre accepts either. */
export function basemapStyle(id: BasemapId) {
  if (process.env.NEXT_PUBLIC_MAP_STYLE_URL) return process.env.NEXT_PUBLIC_MAP_STYLE_URL;
  if (CARTO_KEY) return cartoStyle(id, CARTO_KEY);
  return OPENFREEMAP[id];
}
