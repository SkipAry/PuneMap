import type { StyleSpecification } from "maplibre-gl";

/**
 * A hand-built basemap in the five-value palette: land, water, the road
 * hierarchy and place names, and nothing else. Ornament would compete with the
 * pins, which are the only thing on this map that carries information.
 *
 * Tiles are VersaTiles' free, keyless, CORS-enabled OpenStreetMap service in the
 * Shortbread schema. Set NEXT_PUBLIC_MAP_STYLE_URL to a self-hosted style to
 * take the dependency off a public endpoint before launch.
 */
const TILES = "https://tiles.versatiles.org/tiles/osm/{z}/{x}/{y}";
const GLYPHS = "https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf";

const PAPER = "#E9EBE8";
const INK = "#16191A";
const STEEL = "#4A5C6A";

/** Roads thicken with zoom; the hierarchy is carried by width, not colour. */
const roadWidth = (base: number): [
  "interpolate",
  ["linear"],
  ["zoom"],
  ...number[],
] => ["interpolate", ["linear"], ["zoom"], 7, base * 0.4, 11, base, 16, base * 4];

export function buildMapStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      osm: {
        type: "vector",
        tiles: [TILES],
        maxzoom: 14,
        attribution:
          '<a href="https://versatiles.org" target="_blank" rel="noopener">VersaTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": PAPER } },
      {
        id: "ocean",
        type: "fill",
        source: "osm",
        "source-layer": "ocean",
        paint: { "fill-color": STEEL, "fill-opacity": 0.5 },
      },
      {
        id: "water",
        type: "fill",
        source: "osm",
        "source-layer": "water_polygons",
        paint: { "fill-color": STEEL, "fill-opacity": 0.5 },
      },
      {
        id: "water-lines",
        type: "line",
        source: "osm",
        "source-layer": "water_lines",
        minzoom: 9,
        paint: { "line-color": STEEL, "line-opacity": 0.5, "line-width": 0.7 },
      },
      // Industrial land reads slightly darker - it is where every listing sits.
      {
        id: "sites",
        type: "fill",
        source: "osm",
        "source-layer": "sites",
        minzoom: 10,
        paint: { "fill-color": INK, "fill-opacity": 0.05 },
      },
      {
        id: "buildings",
        type: "fill",
        source: "osm",
        "source-layer": "buildings",
        minzoom: 14,
        paint: { "fill-color": INK, "fill-opacity": 0.08 },
      },
      {
        id: "streets-minor",
        type: "line",
        source: "osm",
        "source-layer": "streets",
        minzoom: 12,
        filter: ["!", ["in", ["get", "kind"], ["literal", ["motorway", "trunk", "primary"]]]],
        paint: { "line-color": INK, "line-opacity": 0.18, "line-width": roadWidth(0.5) },
      },
      {
        id: "streets-major",
        type: "line",
        source: "osm",
        "source-layer": "streets",
        filter: ["in", ["get", "kind"], ["literal", ["motorway", "trunk", "primary"]]],
        paint: { "line-color": INK, "line-opacity": 0.42, "line-width": roadWidth(1.1) },
      },
      {
        id: "boundaries",
        type: "line",
        source: "osm",
        "source-layer": "boundaries",
        filter: ["<=", ["get", "admin_level"], 4],
        paint: {
          "line-color": INK,
          "line-opacity": 0.25,
          "line-width": 1,
          "line-dasharray": [3, 3],
        },
      },
      {
        id: "place-labels",
        type: "symbol",
        source: "osm",
        "source-layer": "place_labels",
        filter: ["in", ["get", "kind"], ["literal", ["city", "town", "village", "suburb"]]],
        layout: {
          "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
          "text-font": ["noto_sans_regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 8, 10, 14, 13],
          "text-max-width": 7,
        },
        paint: {
          "text-color": STEEL,
          "text-halo-color": PAPER,
          "text-halo-width": 1.2,
        },
      },
    ],
  };
}
