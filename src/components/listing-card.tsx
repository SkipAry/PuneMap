import Link from "next/link";

import {
  effectiveMonthlyRent,
  effectiveRatePerSqft,
  fmtRupees,
  listingTitle,
  verifiedAgo,
} from "@/lib/derive";
import { AVAILABILITY_COLOUR, type Listing } from "@/lib/types";

import { SpecStrip } from "./spec-strip";

export function AvailabilityTag({ value }: { value: string }) {
  return (
    <span
      className="spec-label whitespace-nowrap"
      style={{ color: AVAILABILITY_COLOUR[value] ?? "var(--color-steel)" }}
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
    return <p className="text-sm text-steel">Rent on request</p>;
  }

  return (
    <p className="text-sm">
      {rate !== null ? <span className="num">{fmtRupees(rate)}/sq ft</span> : null}
      {rate !== null && rent !== null ? <span className="text-steel"> · </span> : null}
      {rent !== null ? (
        <>
          <span className="num">{fmtRupees(rent)}</span> per month
        </>
      ) : null}
    </p>
  );
}

type Props = {
  listing: Listing;
  /** Set by a map pin click - draws the 2px outline. */
  active?: boolean;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
};

export function ListingCard({ listing, active = false, onHover, onSelect }: Props) {
  return (
    <article
      id={`card-${listing.slug}`}
      data-slug={listing.slug}
      className={`card result-card px-3 py-3 ${active ? "pin-focus" : ""}`}
      onMouseEnter={onHover ? () => onHover(listing.slug) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      onClick={onSelect ? () => onSelect(listing.slug) : undefined}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="spec-label truncate">{listing.locality ?? listing.cluster}</p>
        <AvailabilityTag value={listing.availability} />
      </div>

      <h3 className="mt-0.5 text-lg">
        <Link href={`/shed/${listing.slug}`} className="hover:text-signal">
          {listingTitle(listing)}
        </Link>
      </h3>

      <div className="mt-3">
        <SpecStrip listing={listing} />
      </div>

      <div className="mt-3">
        <CommercialLine listing={listing} />
        <p className="spec-label mt-0.5">
          Verified {verifiedAgo(listing.last_verified)}
          {listing.lat === null || listing.lng === null ? " · Location approximate" : ""}
        </p>
      </div>
    </article>
  );
}
