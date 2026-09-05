import { zoneOf } from "@/lib/clusters";
import type { Listing } from "@/lib/types";

/**
 * A locator diagram, not an interactive map: nearby listings as zone-coloured
 * ticks, this one called out. Inline SVG, so the page needs no tile service, no
 * key and no client JavaScript.
 *
 * It carries no basemap, so it has to label its own geography: the plot is read
 * against Pune, a scale bar and the locality name. Decimal degrees are not a
 * location to anyone sourcing a shed.
 */

/** Pune city centre, the one reference every reader of this page shares. */
const PUNE: { lng: number; lat: number } = { lng: 73.8567, lat: 18.5204 };

const EARTH_KM = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

function distanceKm(a: typeof PUNE, b: typeof PUNE) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

const POINTS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

function compass(from: typeof PUNE, to: typeof PUNE) {
  const y = Math.sin(rad(to.lng - from.lng)) * Math.cos(rad(to.lat));
  const x =
    Math.cos(rad(from.lat)) * Math.sin(rad(to.lat)) -
    Math.sin(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.cos(rad(to.lng - from.lng));
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return POINTS[Math.round(((deg + 360) % 360) / 45) % 8];
}

/** The longest round distance that still fits comfortably inside the frame. */
const NICE_KM = [1, 2, 5, 10, 20, 50];

export function StaticLocator({
  listing,
  context,
  height = 190,
}: {
  listing: Listing;
  context: Listing[];
  /** A number of pixels, or a CSS length when the locator fills a pane. */
  height?: number | string;
}) {
  const points = context.filter((l) => l.lat !== null && l.lng !== null);

  if (listing.lat === null || listing.lng === null) {
    return (
      <div
        className="card flex items-center justify-center px-4 text-center"
        style={{ height }}
      >
        <p className="label">
          Coordinates not stated by the broker. Location confirmed on enquiry.
        </p>
      </div>
    );
  }

  const here = { lng: listing.lng, lat: listing.lat };

  // Pune is part of the frame, not just the plot: the reference has to be on
  // screen for the crosshair to mean anything.
  const lats = [...points.map((p) => p.lat as number), listing.lat, PUNE.lat];
  const lngs = [...points.map((p) => p.lng as number), listing.lng, PUNE.lng];
  const padLat = (Math.max(...lats) - Math.min(...lats)) * 0.08 || 0.02;
  const padLng = (Math.max(...lngs) - Math.min(...lngs)) * 0.08 || 0.02;

  let minLat = Math.min(...lats) - padLat;
  let maxLat = Math.max(...lats) + padLat;
  let minLng = Math.min(...lngs) - padLng;
  let maxLng = Math.max(...lngs) + padLng;

  const W = 600;
  const H = 360;

  /*
    Fit the bounds to the frame's own aspect before projecting. Mapping latitude
    and longitude to the axes independently stretches one of them - Chakan sat
    12x taller than it was wide - which both distorts where the plots lie and
    makes a single scale bar untrue in every direction but one.
  */
  const KM_PER_LAT = 110.57;
  const kmPerLng = 111.32 * Math.cos(rad((minLat + maxLat) / 2));
  const wideKm = (maxLng - minLng) * kmPerLng;
  const tallKm = (maxLat - minLat) * KM_PER_LAT;

  if (wideKm / tallKm < W / H) {
    const grow = ((tallKm * W) / H - wideKm) / kmPerLng / 2;
    minLng -= grow;
    maxLng += grow;
  } else {
    const grow = ((wideKm * H) / W - tallKm) / KM_PER_LAT / 2;
    minLat -= grow;
    maxLat += grow;
  }

  const x = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * W;
  const y = (lat: number) => H - ((lat - minLat) / (maxLat - minLat)) * H;

  const cx = x(here.lng);
  const cy = y(here.lat);
  const px = x(PUNE.lng);
  const py = y(PUNE.lat);

  const km = distanceKm(PUNE, here);
  const direction = compass(PUNE, here);

  // One scale for both axes now, so the roundest bar that fits is honest.
  const kmPerUnit = ((maxLng - minLng) * kmPerLng) / W;
  const barKm = NICE_KM.filter((n) => n / kmPerUnit < W * 0.32).pop() ?? NICE_KM[0];
  const barUnits = barKm / kmPerUnit;

  /*
    The cluster, not the locality: a locality runs to "Chakan MIDC Phase II,
    near Courtyard Marriott" and SVG text does not wrap, so it was clipped by
    the frame. The full locality is already set beside this figure, and the
    cluster is the unit the whole map is colour-coded by.
  */
  const place = listing.cluster;

  return (
    /*
      "meet" rather than "slice" on the svg below: the projection is uniform
      now, so cropping to fill would drop the Pune mark or the scale bar
      depending on the shape of the box this figure is given.
    */
    <figure className="card overflow-hidden" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Plot plan locating this ${listing.property_type.toLowerCase()} in ${place}, about ${Math.round(km)} kilometres ${direction} of Pune centre.`}
      >
        {/* Grid: the drawing's setting-out lines. */}
        <g stroke="var(--color-line)" strokeWidth="1">
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={`v${f}`} x1={W * f} y1={0} x2={W * f} y2={H} />
          ))}
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={`h${f}`} x1={0} y1={H * f} x2={W} y2={H * f} />
          ))}
        </g>

        {points
          .filter((p) => p.slug !== listing.slug)
          .map((p) => (
            <circle
              key={p.slug}
              cx={x(p.lng as number)}
              cy={y(p.lat as number)}
              r="4"
              fill={zoneOf(p.cluster)}
              opacity="0.6"
            />
          ))}

        {/* Pune, the shared reference the reader already holds. */}
        <g>
          <circle cx={px} cy={py} r="5" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
          <circle cx={px} cy={py} r="1.5" fill="var(--color-muted)" />
          <text
            x={px + 10}
            y={py + 5}
            fill="var(--color-muted)"
            fontSize="14"
            fontWeight="600"
          >
            Pune
          </text>
        </g>

        {/* This listing: full-width cross-hair, the way a plot is called out. */}
        <g stroke="var(--color-action)" strokeWidth="1.5">
          <line x1={0} y1={cy} x2={W} y2={cy} />
          <line x1={cx} y1={0} x2={cx} y2={H} />
        </g>
        <circle cx={cx} cy={cy} r="7" fill={zoneOf(listing.cluster)} stroke="#fff" strokeWidth="3" />

        {/*
          preserveAspectRatio="slice" crops the viewBox to cover the figure, so
          the callout is clamped well inside the frame rather than positioned
          purely relative to the plot.
        */}
        <g
          transform={`translate(${Math.min(Math.max(cx + 12, 14), W - 230)} ${Math.min(
            Math.max(cy < 70 ? cy + 32 : cy - 26, 52),
            H - 58,
          )})`}
        >
          <text fill="var(--color-ink)" fontSize="15" fontWeight="600">
            {place}
          </text>
          {/* The number a reader can actually act on, in place of coordinates. */}
          <text
            y="17"
            fill="var(--color-muted)"
            fontSize="13"
            fontWeight="500"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(km)} km {direction} of Pune
          </text>
        </g>

        {/*
          Scale bar: without it the grid states no distance at all. Held 40
          units off the foot because "slice" crops the viewBox vertically on
          the wider figure a phone gives it.
        */}
        <g transform={`translate(16 ${H - 40})`}>
          <line x1={0} y1={0} x2={barUnits} y2={0} stroke="var(--color-ink)" strokeWidth="2" />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="var(--color-ink)" strokeWidth="2" />
          <line
            x1={barUnits}
            y1={-4}
            x2={barUnits}
            y2={4}
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <text
            x={barUnits + 8}
            y={5}
            fill="var(--color-ink)"
            fontSize="13"
            fontWeight="600"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {barKm} km
          </text>
        </g>
      </svg>

      <figcaption className="sr-only">
        {place}, about {Math.round(km)} km {direction} of Pune centre, calculated from the
        listing coordinates.
      </figcaption>
    </figure>
  );
}
