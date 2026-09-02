import Link from "next/link";

import { zoneOf } from "@/lib/clusters";
import {
  effectiveMonthlyRent,
  effectiveRatePerSqft,
  fmtRupees,
  listingTitle,
  verifiedAgo,
} from "@/lib/derive";
import type { Listing } from "@/lib/types";

import { SpecStrip } from "./spec-strip";

/**
 * Availability is a ring treatment, never a hue - hue belongs to the cluster.
 * Here that reads as a small marker plus the word.
 */
export function AvailabilityTag({ value }: { value: string }) {
  const style =
    value === "Ready"
      ? "bg-ink text-white"
      : value === "Leased out"
        ? "bg-[rgba(16,24,40,0.06)] text-muted"
        : "border border-line-strong text-muted";
  return (
    <span
      className={`label whitespace-nowrap rounded-full px-2 py-0.5 font-medium ${style}`}
    >
      {value}
    </span>
  );
}

/** "₹33/sq ft · ₹14,85,000 per month", omitting whichever half is unknown. */
export function CommercialLine({ listing }: { listing: Listing }) {
  const rate = effectiveRatePerSqft(listing);
  const rent = effectiveMonthlyRent(listing);

  if (rate === null && rent === null) {
    return <p className="text-sm text-muted">Rent on request</p>;
  }

  return (
    <p className="text-sm">
      {rate !== null ? <span className="num">{fmtRupees(rate)}/sq ft</span> : null}
      {rate !== null && rent !== null ? <span className="text-faint"> · </span> : null}
      {rent !== null ? (
        <>
          <span className="num">{fmtRupees(rent)}</span>
          <span className="text-muted"> per month</span>
        </>
      ) : null}
    </p>
  );
}

type Props = {
  listing: Listing;
  active?: boolean;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
};

export function ListingCard({ listing, active = false, onHover, onSelect }: Props) {
  return (
    <article
      id={`card-${listing.slug}`}
      data-slug={listing.slug}
      data-active={active || undefined}
      className="card result-card px-3 py-3"
      // The locality dot is the card's zone carrier.
      style={{ ["--zone" as string]: zoneOf(listing.cluster) }}
      onMouseEnter={onHover ? () => onHover(listing.slug) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      onClick={onSelect ? () => onSelect(listing.slug) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="label flex min-w-0 items-center gap-1.5">
          <span className="chip-dot" aria-hidden="true" />
          <span className="truncate">{listing.locality ?? listing.cluster}</span>
        </p>
        <AvailabilityTag value={listing.availability} />
      </div>

      <h3 className="mt-1 text-lg">
        {/* inline-block plus padding so the thumb target clears 24px; the bare
            text line is only 22px tall. */}
        <Link
          href={`/shed/${listing.slug}`}
          className="inline-block py-0.5 hover:text-action"
        >
          {listingTitle(listing)}
        </Link>
      </h3>

      <div className="mt-2.5">
        <SpecStrip listing={listing} />
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <CommercialLine listing={listing} />
        <p className="label whitespace-nowrap">
          {verifiedAgo(listing.last_verified)}
          {listing.lat === null || listing.lng === null ? " · approx." : ""}
        </p>
      </div>
    </article>
  );
}
