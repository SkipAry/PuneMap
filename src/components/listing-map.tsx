"use client";

import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { buildMapStyle } from "@/lib/map-style";
import { AVAILABILITY_COLOUR, type Listing } from "@/lib/types";

import "maplibre-gl/dist/maplibre-gl.css";

const PUNE_CENTRE: [number, number] = [73.9, 18.66];

/** Pin size reads built-up area before the user reads anything. */
const RADIUS_BY_AREA: maplibregl.ExpressionSpecification = [
  "step",
  ["coalesce", ["get", "area"], 0],
  4,
  20_000,
  6,
  50_000,
  8,
  120_000,
  11,
];

const COLOUR_BY_AVAILABILITY: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "availability"],
  "Ready",
  AVAILABILITY_COLOUR.Ready,
  "Under construction",
  AVAILABILITY_COLOUR["Under construction"],
  "Built-to-suit",
  AVAILABILITY_COLOUR["Built-to-suit"],
  "Leased out",
  AVAILABILITY_COLOUR["Leased out"],
  "#4A5C6A",
];

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
          availability: l.availability,
          area: l.total_builtup ?? 0,
        },
      })),
  };
}

type Props = {
  listings: Listing[];
  activeSlug: string | null;
  hoverSlug: string | null;
  onSelect: (slug: string) => void;
};

export default function ListingMap({ listings, activeSlug, hoverSlug, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const ready = useRef(false);
  // Kept in a ref so the click handler is registered once and never goes stale.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!container.current || map.current) return;

    const instance = new maplibregl.Map({
      container: container.current,
      center: PUNE_CENTRE,
      zoom: 8.6,
      attributionControl: { compact: true },
      style: buildMapStyle(),
    });

    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    instance.scrollZoom.disable();

    instance.on("load", () => {
      instance.addSource("listings", {
        type: "geojson",
        data: toGeoJson(listings),
        // Above 40 markers the pins collide, so let MapLibre group them and
        // split them again as the user zooms in.
        cluster: listings.filter((l) => l.lat !== null).length > 40,
        clusterRadius: 44,
        clusterMaxZoom: 12,
      });

      instance.addLayer({
        id: "clusters",
        type: "circle",
        source: "listings",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#E9EBE8",
          "circle-radius": ["step", ["get", "point_count"], 12, 10, 16, 25, 20],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#16191A",
        },
      });

      instance.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "listings",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["noto_sans_regular"],
          "text-size": 11,
        },
        paint: { "text-color": "#16191A" },
      });

      instance.addLayer({
        id: "pins",
        type: "circle",
        source: "listings",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": COLOUR_BY_AVAILABILITY,
          "circle-radius": RADIUS_BY_AREA,
          "circle-opacity": [
            "case",
            ["==", ["get", "availability"], "Leased out"],
            0.6,
            0.9,
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#FBFBFA",
        },
      });

      // Drawn on top; empty filter until a card is hovered or a pin selected.
      instance.addLayer({
        id: "pin-highlight",
        type: "circle",
        source: "listings",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "circle-color": "#E24A0F",
          "circle-radius": ["+", RADIUS_BY_AREA, 2],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#16191A",
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

      ready.current = true;
    });

    map.current = instance;

    return () => {
      ready.current = false;
      instance.remove();
      map.current = null;
    };
    // Sources are updated in the effects below; this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-filtering the list re-feeds the map. No auto-fly, no fitBounds - the
  // viewport stays where the user put it.
  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready.current) return;
    const source = instance.getSource("listings") as GeoJSONSource | undefined;
    source?.setData(toGeoJson(listings));
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
