import { zoneOf } from "@/lib/clusters";
import type { Listing } from "@/lib/types";

/**
 * A locator diagram, not an interactive map: nearby listings as zone-coloured
 * ticks, this one called out. Inline SVG, so the page needs no tile service, no
 * key and no client JavaScript.
 */
export function StaticLocator({
  listing,
  context,
  height = 190,
}: {
  listing: Listing;
  context: Listing[];
  height?: number;
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

  const lats = [...points.map((p) => p.lat as number), listing.lat];
  const lngs = [...points.map((p) => p.lng as number), listing.lng];
  const padLat = (Math.max(...lats) - Math.min(...lats)) * 0.08 || 0.02;
  const padLng = (Math.max(...lngs) - Math.min(...lngs)) * 0.08 || 0.02;

  const minLat = Math.min(...lats) - padLat;
  const maxLat = Math.max(...lats) + padLat;
  const minLng = Math.min(...lngs) - padLng;
  const maxLng = Math.max(...lngs) + padLng;

  const W = 600;
  const H = 360;
  const x = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * W;
  const y = (lat: number) => H - ((lat - minLat) / (maxLat - minLat)) * H;

  const cx = x(listing.lng);
  const cy = y(listing.lat);

  return (
    <figure className="card overflow-hidden" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Plot plan locating this ${listing.property_type.toLowerCase()} in ${listing.cluster} relative to other listings around Pune`}
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
              r="3"
              fill={zoneOf(p.cluster)}
              opacity="0.45"
            />
          ))}

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
        <text
          x={Math.min(Math.max(cx + 12, 14), W - 190)}
          y={Math.min(Math.max(cy < 70 ? cy + 32 : cy - 14, 52), H - 28)}
          fill="var(--color-ink)"
          fontSize="14"
          fontWeight="600"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {listing.lat.toFixed(4)}, {listing.lng.toFixed(4)}
        </text>
      </svg>
    </figure>
  );
}
