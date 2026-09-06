"use client";

import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { ZONE, zoneOf } from "@/lib/clusters";
import { basemapStyle, type BasemapId } from "@/lib/map-style";
import type { Listing } from "@/lib/types";

import "maplibre-gl/dist/maplibre-gl.css";

/** Fallback view, used only when not one listing carries coordinates. */
const PUNE_CENTRE: [number, number] = [73.9, 18.66];

/** The corners of the listings that have coordinates, or null if none do. */
function boundsOf(listings: Listing[]): [[number, number], [number, number]] | null {
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  let found = false;

  for (const l of listings) {
    if (l.lat === null || l.lng === null) continue;
    found = true;
    w = Math.min(w, l.lng);
    e = Math.max(e, l.lng);
    s = Math.min(s, l.lat);
    n = Math.max(n, l.lat);
  }

  return found ? [[w, s], [e, n]] : null;
}

/**
 * The chrome standing on the map, so the opening view frames the pins inside
 * what is actually visible rather than behind the list column and the tray.
 * The column width is read from --list-w rather than repeated here, and is
 * simply absent below the breakpoint where the column appears.
 */
function chromePadding() {
  const listW = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--list-w"),
    10,
  );

  // The sample-data warning is conditional and sits under the band, so its
  // height is measured rather than assumed - it is 0 once real listings land.
  const notice = document.querySelector(".notice-strip");
  const noticeH = notice ? Math.round(notice.getBoundingClientRect().height) : 0;

  return {
    top: 76 + (noticeH > 8 ? noticeH + 12 : 0),
    bottom: 96,
    left: Number.isFinite(listW) ? listW + 24 : 24,
    right: 24,
  };
}

/** Pin size reads built-up area before the user reads anything. */
const RADIUS_BY_AREA: maplibregl.ExpressionSpecification = [
  "step",
  ["coalesce", ["get", "area"], 0],
  6,
  20_000,
  8,
  50_000,
  10,
  120_000,
  13,
];

/**
 * Hue is the cluster zone, always. Availability is carried by the ring.
 * Read straight off the feature so the expression stays typed and the palette
 * has a single home in lib/clusters.
 */
const ZONE_COLOUR: maplibregl.ExpressionSpecification = [
  "coalesce",
  ["get", "zone"],
  ZONE.Other,
];

/**
 * A grouped pin carries a zone colour only when every listing inside it belongs
 * to that zone. Pune clusters are geographically distinct, so that is the usual
 * case; a genuinely mixed group stays white rather than averaging two hues into
 * a colour that means nothing.
 */
const CLUSTER_TALLIES = Object.fromEntries(
  Object.keys(ZONE).map((name) => [
    `z_${name}`,
    ["+", ["case", ["==", ["get", "cluster"], name], 1, 0]],
  ]),
);

const HOMOGENEOUS: unknown[] = Object.entries(ZONE).flatMap(([name, hex]) => [
  ["==", ["get", `z_${name}`], ["get", "point_count"]],
  hex,
]);

const CLUSTER_ZONE_COLOUR = [
  "case",
  ...HOMOGENEOUS,
  "#ffffff",
] as unknown as maplibregl.ExpressionSpecification;

/** True when no single zone accounts for the whole group. */
const IS_MIXED = [
  "all",
  ...Object.keys(ZONE).map((name) => [
    "!=",
    ["get", `z_${name}`],
    ["get", "point_count"],
  ]),
] as unknown as maplibregl.ExpressionSpecification;

function toGeoJson(listings: Listing[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: listings
      .filter((l) => l.lat !== null && l.lng !== null)
      .map((l) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [l.lng as number, l.lat as number] },
        properties: {
          slug: l.slug,
          cluster: l.cluster,
          zone: zoneOf(l.cluster),
          availability: l.availability,
          leased: l.availability === "Leased out" ? 1 : 0,
          area: l.total_builtup ?? 0,
        },
      })),
  };
}

type Props = {
  listings: Listing[];
  activeSlug: string | null;
  hoverSlug: string | null;
  basemap: BasemapId;
  onSelect: (slug: string) => void;
};

export default function ListingMap({
  listings,
  activeSlug,
  hoverSlug,
  basemap,
  onSelect,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const ready = useRef(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const listingsRef = useRef(listings);
  listingsRef.current = listings;
  // Read once when the map is built, so the opening style is the chosen one.
  const basemapRef = useRef(basemap);

  /** Source and layers are re-added whenever the basemap style swaps them out. */
  const addLayers = (instance: MapLibreMap) => {
    if (instance.getSource("listings")) return;

    instance.addSource("listings", {
      type: "geojson",
      data: toGeoJson(listingsRef.current),
      cluster: listingsRef.current.filter((l) => l.lat !== null).length > 40,
      /*
        The radius is in pixels, so it means a different distance on the ground
        at every zoom. 22 was set when the map opened on the whole of
        Maharashtra; opening fitted to the listings is roughly three times
        closer, which left 22px covering about a third of the ground it was
        chosen for and split one MIDC into two same-coloured bubbles - a "2"
        sitting on an "11" where the tray said 13.

        44 restores about the same reach on the ground, so a corridor stays one
        group while Bhosari, Nigdi, Hinjawadi and Pirangut still separate.
      */
      clusterRadius: 44,
      clusterMaxZoom: 12,
      // One tally per zone, so a cluster knows whether it is all one cluster.
      clusterProperties: CLUSTER_TALLIES,
    });

    instance.addLayer({
      id: "clusters",
      type: "circle",
      source: "listings",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": CLUSTER_ZONE_COLOUR,
        "circle-radius": ["step", ["get", "point_count"], 15, 10, 19, 25, 24],
        "circle-stroke-width": 2,
        "circle-stroke-color": ["case", IS_MIXED, "#101828", "#ffffff"],
      },
    });

    instance.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "listings",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        // The name OpenFreeMap actually serves; the lowercase form 404s.
        "text-font": ["Noto Sans Regular"],
        "text-size": 12,
      },
      paint: { "text-color": ["case", IS_MIXED, "#101828", "#ffffff"] },
    });

    // Soft halo, so a pin stays findable over busy basemap colour.
    instance.addLayer({
      id: "pin-halo",
      type: "circle",
      source: "listings",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ZONE_COLOUR,
        "circle-radius": ["+", RADIUS_BY_AREA, 7],
        "circle-opacity": 0.18,
      },
    });

    instance.addLayer({
      id: "pins",
      type: "circle",
      source: "listings",
      filter: ["!", ["has", "point_count"]],
      paint: {
        // Built-to-suit reads hollow: white fill, zone ring.
        "circle-color": [
          "case",
          ["==", ["get", "availability"], "Built-to-suit"],
          "#ffffff",
          ZONE_COLOUR,
        ],
        "circle-radius": RADIUS_BY_AREA,
        "circle-opacity": ["case", ["==", ["get", "leased"], 1], 0.45, 1],
        "circle-stroke-width": 2.5,
        "circle-stroke-color": [
          "case",
          ["==", ["get", "availability"], "Built-to-suit"],
          ZONE_COLOUR,
          "#ffffff",
        ],
        "circle-stroke-opacity": ["case", ["==", ["get", "leased"], 1], 0.5, 1],
      },
    });

    instance.addLayer({
      id: "pin-highlight",
      type: "circle",
      source: "listings",
      filter: ["==", ["get", "slug"], ""],
      paint: {
        "circle-color": ZONE_COLOUR,
        "circle-radius": ["+", RADIUS_BY_AREA, 4],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#101828",
      },
    });

    instance.on("click", "pins", (e) => {
      const slug = e.features?.[0]?.properties?.slug;
      if (typeof slug === "string") onSelectRef.current(slug);
    });

    instance.on("click", "clusters", (e) => {
      const feature = e.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      if (clusterId === undefined) return;
      const source = instance.getSource("listings") as GeoJSONSource;
      void source.getClusterExpansionZoom(clusterId).then((zoom) => {
        instance.easeTo({
          center: (feature!.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
          duration: 250,
        });
      });
    });

    for (const id of ["pins", "clusters"]) {
      instance.on("mouseenter", id, () => {
        instance.getCanvas().style.cursor = "pointer";
      });
      instance.on("mouseleave", id, () => {
        instance.getCanvas().style.cursor = "";
      });
    }
  };

  useEffect(() => {
    if (!container.current || map.current) return;

    const instance = new maplibregl.Map({
      container: container.current,
      center: PUNE_CENTRE,
      zoom: 8.8,
      attributionControl: { compact: true },
      // The basemap the shell already chose. Opening on another one and
      // swapping costs a style load and shows the wrong map while it happens.
      style: basemapStyle(basemapRef.current),
    });

    // Top-left, under the toolbar: the bottom of the map is the cluster tray's.
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    instance.on("load", () => {
      addLayers(instance);
      ready.current = true;

      /*
        Open on the stock rather than on a fixed view of Maharashtra. Fitted
        once, on first load: after that the viewport is the user's, and a
        filter change must never move the map under them.

        maxZoom stops a single surviving listing from opening at street level,
        where a lone pin says nothing about where it is.
      */
      const bounds = boundsOf(listingsRef.current);
      if (bounds) {
        instance.fitBounds(bounds, {
          padding: chromePadding(),
          maxZoom: 11.5,
          animate: false,
        });
      }
    });

    // A style swap wipes custom sources, so they are re-added each time.
    instance.on("styledata", () => {
      if (ready.current) addLayers(instance);
    });

    map.current = instance;

    return () => {
      ready.current = false;
      instance.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready.current || basemap === basemapRef.current) return;
    basemapRef.current = basemap;
    instance.setStyle(basemapStyle(basemap) as never);
  }, [basemap]);

  // No auto-fly and no fitBounds: the viewport stays where the user put it.
  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready.current) return;
    (instance.getSource("listings") as GeoJSONSource | undefined)?.setData(toGeoJson(listings));
  }, [listings]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready.current || !instance.getLayer("pin-highlight")) return;
    instance.setFilter("pin-highlight", ["==", ["get", "slug"], hoverSlug ?? activeSlug ?? ""]);
  }, [hoverSlug, activeSlug]);

  return (
    <div
      ref={container}
      className="size-full"
      role="region"
      aria-label="Map of matching listings. The result list beside it carries the same listings as text."
    />
  );
}
