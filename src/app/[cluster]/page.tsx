import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingCard, SampleNotice } from "@/components/listing-card";
import { railCounts } from "@/lib/rail-counts";
import { SiteHeader } from "@/components/site-header";
import { StaticLocator } from "@/components/static-locator";
import { getListings } from "@/lib/data";
import { addressed, NOT_FOUND_METADATA } from "@/lib/site-url";
import { fmtArea, fmtNumber } from "@/lib/derive";
import { zoneOf } from "@/lib/clusters";
import { CLUSTERS, clusterFromSlug, clusterSlug, type Listing } from "@/lib/types";

type Params = { params: Promise<{ cluster: string }> };

export async function generateStaticParams() {
  return CLUSTERS.map((c) => ({ cluster: clusterSlug(c) }));
}

/** Only counts specs that were actually stated - never an average over nulls. */
function statedRange(rows: Listing[], pick: (l: Listing) => number | null) {
  const values = rows.map(pick).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values), n: values.length };
}

/**
 * A range reads as a range only when the ends differ. One listing, or several
 * that agree, produced "12–12m" and "80,000–80,000".
 */
function span(r: { min: number; max: number }, fmt: (n: number) => string) {
  return r.min === r.max ? fmt(r.min) : `${fmt(r.min)}–${fmt(r.max)}`;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { cluster: slug } = await params;
  const cluster = clusterFromSlug(slug);
  if (!cluster) return NOT_FOUND_METADATA;

  const all = await getListings();
  const rows = all.filter((l) => l.cluster === cluster && l.availability !== "Leased out");
  const area = statedRange(rows, (l) => l.total_builtup);

  const title = `Industrial sheds and warehouses on rent in ${cluster}, Pune`;
  const description =
    `${rows.length} industrial ${rows.length === 1 ? "property" : "properties"} available on rent in ${cluster}` +
    (area
      ? area.min === area.max
        ? `, at ${fmtArea(area.min)}`
        : `, from ${fmtArea(area.min)} to ${fmtArea(area.max)}`
      : "") +
    `. Filter by clear height, crane capacity, sanctioned power, flooring and docks.`;

  return {
    title,
    description,
    ...addressed(`/${slug}`, { title, description }),
  };
}

export default async function ClusterPage({ params }: Params) {
  const { cluster: slug } = await params;
  const cluster = clusterFromSlug(slug);
  if (!cluster) notFound();

  const all = await getListings();
  const rows = all.filter((l) => l.cluster === cluster && l.availability !== "Leased out");
  if (rows.length === 0) notFound();

  const clusterCounts = await railCounts();

  const height = statedRange(rows, (l) => l.height_m);
  /*
    A crane of 0 tons is the gantry-provision cast, not a crane. Counting it
    printed "0–30T", and the product's rule is that a spec is never shown as 0 -
    the card for that same listing reads "Prov.".
  */
  const crane = statedRange(rows, (l) => (l.crane_capacity_ton ? l.crane_capacity_ton : null));
  const power = statedRange(rows, (l) => l.power_hp);
  const area = statedRange(rows, (l) => l.total_builtup);

  const facts: { label: string; value: string; note: string }[] = [
    {
      label: "built-up",
      value: area ? span(area, fmtNumber) : "—",
      note: area ? `sq ft, across ${plural(area.n, "listing", "listings")}` : "not stated",
    },
    {
      label: "clear height",
      value: height ? `${span(height, String)}m` : "—",
      note: height ? `stated on ${height.n} of ${rows.length}` : "not stated",
    },
    {
      label: "crane",
      value: crane ? `${span(crane, String)}T` : "—",
      note: crane ? `stated on ${crane.n} of ${rows.length}` : "not stated",
    },
    {
      label: "power",
      value: power ? span(power, fmtNumber) : "—",
      note: power ? `HP, stated on ${power.n} of ${rows.length}` : "not stated",
    },
  ];

  return (
    <>
      <SiteHeader
        subtitle={`${cluster} · ${rows.length} available`}
        counts={clusterCounts}
        currentCluster={cluster}
      />

      <div className="shell shell--detail">
        <main
          id="main"
          tabIndex={-1}
          className="detail-col mx-auto max-w-5xl px-4 py-6 panel:mx-0 panel:max-w-none panel:px-5"
        >
        <p className="label flex items-center gap-2">
          <span
            className="chip-dot"
            aria-hidden="true"
            style={{ ["--zone" as string]: zoneOf(cluster) }}
          />
          {cluster}
        </p>
        <h1 className="mt-1 text-3xl">Industrial sheds and warehouses on rent in {cluster}</h1>
        <p className="mt-2 max-w-[70ch] text-base text-muted">
          {rows.length} {rows.length === 1 ? "property" : "properties"} currently available around{" "}
          {cluster}. The ranges below count only what brokers actually stated — nothing here is
          estimated.
        </p>

        {/* The sentence above claims live availability, so the qualifier belongs
            with it rather than further down beside the cards. */}
        <div className="mt-3 max-w-[70ch] overflow-hidden rounded-[10px]">
          <SampleNotice listings={rows} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="card px-3 py-2.5">
              {/* A range like 8,000–2,50,000 is one unbreakable token; at large
                  text sizes it ran past its tile. It may break when it has to. */}
              <dd className="num text-lg [overflow-wrap:anywhere]">{f.value}</dd>
              <dt className="label mt-1">
                {f.label}
                <span className="block">{f.note}</span>
              </dt>
            </div>
          ))}
        </dl>

        {/* Phone keeps the locator inline; wider, it becomes the third pane. */}
        <div className="mt-4 panel:hidden">
          <StaticLocator listing={rows[0]} context={rows} height={160} />
        </div>

        <p className="mt-5">
          <Link href={`/search?cluster=${slug}`} className="btn-action btn-action--wrap">
            Filter {rows.length === 1 ? "this listing" : `these ${rows.length} listings`} by
            height, crane and power →
          </Link>
        </p>

        <section className="mt-8">
          <h2 className="group-heading">Every {cluster} listing</h2>
          {/* One column. These cards sit in a 544px reading column, not in the
              viewport, so a viewport-keyed md:grid-cols-2 put a five-cell spec
              strip in 248px and ellipsed the height and power off every card. */}
          <div className="grid gap-2">
            {rows.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>

        {/* Phone only: the rail carries every cluster from 820px, so repeating
            them here would be the same list twice on one screen. */}
        <section className="mt-8 panel:hidden">
          <h2 className="group-heading">Other clusters</h2>
          <div className="flex flex-wrap gap-1.5">
            {CLUSTERS.filter((c) => c !== cluster).map((c) => (
              <Link
                key={c}
                href={`/${clusterSlug(c)}`}
                className="chip"
                style={{ ["--zone" as string]: zoneOf(c) }}
              >
                <span className="chip-dot" aria-hidden="true" />
                {c}
              </Link>
            ))}
          </div>
        </section>
        </main>

        <div className="detail-map hidden panel:block">
          <StaticLocator listing={rows[0]} context={rows} height="100%" frame="tall" />
        </div>
      </div>
    </>
  );
}
