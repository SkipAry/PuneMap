import type { StyleSpecification } from "maplibre-gl";

/**
 * Basemap under the pins, drawn by MapLibre GL JS over OpenStreetMap data.
 *
 * Default is OpenFreeMap's Positron - the same near-monochrome design as CARTO
 * light_all, but genuinely keyless. CARTO's CDN still answers without a key,
 * yet stamps every tile with an "API KEY REQUIRED" watermark, so it is only
 * usable once a key exists.
 *
 * Resolution order:
 *   NEXT_PUBLIC_MAP_STYLE_URL  - a full style JSON, wins over everything
 *   NEXT_PUBLIC_CARTO_API_KEY  - CARTO raster basemaps, unwatermarked
 *   otherwise                  - OpenFreeMap Positron vector tiles
 */
const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

/** CARTO raster style: light_all (Positron) or voyager. */
const CARTO_STYLE = process.env.NEXT_PUBLIC_CARTO_STYLE ?? "light_all";

const OPENFREEMAP_POSITRON = "https://tiles.openfreemap.org/styles/positron";

/** @2x tiles at tileSize 256 render at device resolution on retina screens. */
function cartoStyle(key: string): StyleSpecification {
  const tiles = ["a", "b", "c", "d"].map(
    (sub) =>
      `https://${sub}.basemaps.cartocdn.com/${CARTO_STYLE}/{z}/{x}/{y}@2x.png?api_key=${encodeURIComponent(key)}`,
  );

  return {
    version: 8,
    // A raster basemap serves no glyphs, but the cluster counts are text.
    glyphs: "https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf",
    sources: {
      carto: {
        type: "raster",
        tiles,
        tileSize: 256,
        maxzoom: 20,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#E9EBE8" } },
      { id: "carto", type: "raster", source: "carto" },
    ],
  };
}

/** A style URL or an inline style - MapLibre accepts either. */
export function buildMapStyle(): StyleSpecification | string {
  if (STYLE_URL) return STYLE_URL;
  if (CARTO_KEY) return cartoStyle(CARTO_KEY);
  return OPENFREEMAP_POSITRON;
}
