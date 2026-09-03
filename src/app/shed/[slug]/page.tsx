import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AvailabilityTag, ListingCard } from "@/components/listing-card";
import { SiteHeader } from "@/components/site-header";
import { StaticLocator } from "@/components/static-locator";
import { getListingBySlug, getListings } from "@/lib/data";
import {
  DASH,
  effectiveMonthlyRent,
  effectiveRatePerSqft,
  fmtArea,
  fmtBool,
  fmtCount,
  fmtCrane,
  fmtHeight,
  fmtNumber,
  fmtPower,
  fmtRupees,
  fmtText,
  listingTitle,
  rateIsDerived,
  rentIsDerived,
  verifiedAgo,
} from "@/lib/derive";
import { similarListings } from "@/lib/query";
import { zoneOf } from "@/lib/clusters";
import { clusterSlug, type Listing } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

/** Card-strip order first, so the eye already knows the layout. */
function specRows(l: Listing): { label: string; value: string }[] {
  return [
    { label: "Clear height at centre", value: fmtHeight(l.height_m) },
    { label: "Crane capacity", value: fmtCrane(l.crane_capacity_ton) },
    { label: "Number of cranes", value: fmtCount(l.crane_count) },
    { label: "Sanctioned power", value: fmtPower(l.power_hp) },
    { label: "Docks", value: fmtCount(l.docks) },
    { label: "Flooring", value: fmtText(l.flooring) },
    { label: "Floor load", value: l.floor_load_mt === null ? DASH : `${l.floor_load_mt} MT/sqm` },
    { label: "Ramps", value: fmtCount(l.ramps) },
    { label: "Fire system", value: fmtText(l.fire_system) },
    { label: "Factory plan approved", value: fmtBool(l.factory_plan_approved) },
    { label: "Parking slots", value: fmtCount(l.parking_slots) },
    { label: "Shed area", value: fmtArea(l.shed_area) },
    { label: "Office area", value: fmtArea(l.office_area) },
    { label: "Total built-up", value: fmtArea(l.total_builtup) },
    { label: "Open area", value: fmtArea(l.open_area) },
  ];
}

export async function generateStaticParams() {
  const all = await getListings();
  return all.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) return { title: "Listing not found" };

  const where = l.locality ?? `${l.cluster} MIDC`;
  const specs = [
    l.height_m === null ? null : `${l.height_m}m height`,
    l.crane_capacity_ton ? `${fmtCrane(l.crane_capacity_ton)} crane` : null,
    l.power_hp === null ? null : `${l.power_hp} HP`,
  ].filter(Boolean);

  const title = `${listingTitle(l)} on rent in ${where}${specs.length ? ` — ${specs.join(", ")}` : ""}`;

  const description =
    `${listingTitle(l)} available on ${l.availability.toLowerCase() === "ready" ? "immediate" : l.availability.toLowerCase()} basis in ${where}. ` +
    `Clear height ${fmtHeight(l.height_m)}, crane ${fmtCrane(l.crane_capacity_ton)}, ` +
    `sanctioned power ${fmtPower(l.power_hp)}, ${fmtCount(l.docks)} docks, ${fmtText(l.flooring)} flooring. ` +
    `Verified ${verifiedAgo(l.last_verified)}.`;

  return {
    title,
    description,
    alternates: { canonical: `/shed/${l.slug}` },
    openGraph: { title, description, type: "article" },
  };
}

export default async function ShedPage({ params }: Params) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const all = await getListings();
  const rows = specRows(listing);
  const stated = rows.filter((r) => r.value !== DASH);
  const unstated = rows.filter((r) => r.value === DASH);

  const rate = effectiveRatePerSqft(listing);
  const rent = effectiveMonthlyRent(listing);
  const similar = similarListings(all, listing);

  // Machine-readable specs, so the numbers a portal buries in prose are structured here.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${listingTitle(listing)} in ${listing.locality ?? listing.cluster}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.locality ?? listing.cluster,
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    ...(listing.lat !== null && listing.lng !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng } }
      : {}),
    ...(listing.total_builtup !== null
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: listing.total_builtup,
            unitCode: "FTK",
          },
        }
      : {}),
    additionalProperty: rows
      .filter((r) => r.value !== DASH)
      .map((r) => ({ "@type": "PropertyValue", name: r.label, value: r.value })),
    ...(listing.source_url ? { isBasedOn: listing.source_url } : {}),
  };

  return (
    <>
      <SiteHeader subtitle={`${listing.cluster} · ${listing.property_type}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* pb-28 clears the fixed call bar so the last section is never trapped. */}
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-6">
        <p className="label mb-3">
          <Link href="/" className="hover:text-ink">
            Search
          </Link>
          {" / "}
          <Link href={`/${clusterSlug(listing.cluster)}`} className="hover:text-ink">
            {listing.cluster}
          </Link>
        </p>

        {/* 1. Title block */}
        <section className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="label flex items-center gap-2">
                <span
                  className="chip-dot"
                  aria-hidden="true"
                  style={{ ["--zone" as string]: zoneOf(listing.cluster) }}
                />
                {listing.locality ?? listing.cluster}
              </p>
              <AvailabilityTag value={listing.availability} />
            </div>
            <h1 className="mt-1 text-3xl">{listingTitle(listing)}</h1>
            <p className="mt-2 max-w-[70ch] text-base text-muted">
              {listing.property_type} in {listing.cluster}. Verified{" "}
              {verifiedAgo(listing.last_verified)}.
              {listing.notes ? ` ${listing.notes}.` : ""}
            </p>

            {/*
              Closing a lease happens on the phone, not in a form, so the call
              is the page's primary action and sits with the headline rather
              than four sections down beside the attribution.
            */}
            {listing.broker_phone ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <a href={`tel:${listing.broker_phone}`} className="btn-action">
                  Call {listing.broker_name ?? "the broker"}
                </a>
                <span className="num text-sm text-muted">{listing.broker_phone}</span>
              </div>
            ) : null}
          </div>
          <StaticLocator listing={listing} context={all} />
        </section>

        {/* 2. Full spec table */}
        <section className="mt-8">
          <h2 className="group-heading">Specification</h2>
          <dl className="card grid gap-x-8 px-4 py-2 sm:grid-cols-2">
            {stated.map((r) => (
              <div
                key={r.label}
                className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0"
              >
                <dt className="label">{r.label}</dt>
                <dd className="num text-base">{r.value}</dd>
              </div>
            ))}
          </dl>

          {unstated.length > 0 ? (
            <div className="mt-4 rounded-[14px] bg-[rgba(27,110,243,0.06)] px-4 py-3">
              <h3 className="text-sm font-bold">Not stated by the broker</h3>
              <p className="mt-1 max-w-[70ch] text-sm text-muted">
                These were not in the original listing. We have not guessed them.
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {unstated.map((r) => (
                  <li key={r.label} className="label">
                    {r.label}
                  </li>
                ))}
              </ul>
              {listing.broker_phone ? (
                <a
                  href={`tel:${listing.broker_phone}`}
                  className="btn-action mt-3"
                >
                  Call to confirm
                </a>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* 3. Commercials - what came from the broker vs what came from arithmetic */}
        <section className="mt-8">
          <h2 className="group-heading">Commercials</h2>
          <dl className="card grid gap-x-8 px-4 py-2 sm:grid-cols-2">
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-2">
              <dt className="label">
                Rate per sq ft
                {rate !== null && rateIsDerived(listing) && rent !== null ? (
                  <span className="block">calculated from {fmtRupees(rent)} per month</span>
                ) : null}
              </dt>
              <dd className="num text-base">{rate === null ? DASH : `${fmtRupees(rate)}`}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-1.5">
              <dt className="label">
                Monthly rent
                {rent !== null && rentIsDerived(listing) && listing.rate_per_sqft !== null ? (
                  <span className="block">
                    calculated from {fmtRupees(listing.rate_per_sqft)}/sq ft
                  </span>
                ) : null}
              </dt>
              <dd className="num text-base">{fmtRupees(rent)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-1.5">
              <dt className="label">Deposit</dt>
              <dd className="num text-base">
                {listing.deposit_months === null
                  ? DASH
                  : `${fmtNumber(listing.deposit_months)} months`}
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. Broker - and attribution for the source listing */}
        <section className="mt-8">
          <h2 className="group-heading">Broker</h2>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="text-base">{fmtText(listing.broker_name)}</p>
            {listing.broker_phone ? (
              <a href={`tel:${listing.broker_phone}`} className="num text-base text-action underline">
                {listing.broker_phone}
              </a>
            ) : (
              <span className="text-base text-muted">{DASH}</span>
            )}
            {listing.source_url ? (
              <a
                href={listing.source_url}
                rel="noopener nofollow"
                target="_blank"
                className="text-sm underline"
              >
                Source listing
              </a>
            ) : null}
          </div>
          <p className="label mt-2 max-w-[70ch]">
            This entry restructures a publicly posted listing. The original is linked above and
            remains the broker&rsquo;s.
          </p>
        </section>

        {/* 5. Similar sheds */}
        {similar.length > 0 ? (
          <section className="mt-8">
            <h2 className="group-heading">Similar sheds in {listing.cluster}</h2>
            <div className="grid gap-2 md:grid-cols-3">
              {similar.map((s) => (
                <ListingCard key={s.slug} listing={s} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {/*
        On a phone the call sits below several screens of specification, so it
        is repeated in a bar that stays put. Desktop keeps the headline action
        in view without one.
      */}
      {listing.broker_phone ? (
        <div className="call-bar">
          <div>
            <p className="label">{listing.broker_name ?? "Broker"}</p>
            <p className="num text-sm">
              {rent === null ? "Rent on request" : `${fmtRupees(rent)} per month`}
            </p>
          </div>
          <a href={`tel:${listing.broker_phone}`} className="btn-action !min-h-11 px-5">
            Call
          </a>
        </div>
      ) : null}
    </>
  );
}
