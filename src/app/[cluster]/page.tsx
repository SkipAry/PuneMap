import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingCard, SampleNotice } from "@/components/listing-card";
import { SiteHeader } from "@/components/site-header";
import { StaticLocator } from "@/components/static-locator";
import { getListings } from "@/lib/data";
import { addressed } from "@/lib/site-url";
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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { cluster: slug } = await params;
  const cluster = clusterFromSlug(slug);
  if (!cluster) return { title: "Cluster not found" };

  const all = await getListings();
  const rows = all.filter((l) => l.cluster === cluster && l.availability !== "Leased out");
  const area = statedRange(rows, (l) => l.total_builtup);

  const title = `Industrial sheds and warehouses on rent in ${cluster}, Pune`;
  const description =
    `${rows.length} industrial ${rows.length === 1 ? "property" : "properties"} available on rent in ${cluster}` +
    (area ? `, from ${fmtArea(area.min)} to ${fmtArea(area.max)}` : "") +
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

  const height = statedRange(rows, (l) => l.height_m);
  const crane = statedRange(rows, (l) => l.crane_capacity_ton);
  const power = statedRange(rows, (l) => l.power_hp);
  const area = statedRange(rows, (l) => l.total_builtup);

  const facts: { label: string; value: string; note: string }[] = [
    {
      label: "built-up",
      value: area ? `${fmtNumber(area.min)}–${fmtNumber(area.max)}` : "—",
      note: area ? `sq ft, across ${area.n} listings` : "not stated",
    },
    {
      label: "clear height",
      value: height ? `${height.min}–${height.max}m` : "—",
      note: height ? `stated on ${height.n} of ${rows.length}` : "not stated",
    },
    {
      label: "crane",
      value: crane ? `${crane.min}–${crane.max}T` : "—",
      note: crane ? `stated on ${crane.n} of ${rows.length}` : "not stated",
    },
    {
      label: "power",
      value: power ? `${fmtNumber(power.min)}–${fmtNumber(power.max)}` : "—",
      note: power ? `HP, stated on ${power.n} of ${rows.length}` : "not stated",
    },
  ];

  return (
    <>
      <SiteHeader subtitle={`${cluster} · ${rows.length} available`} />

      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6">
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

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_320px]">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="card px-3 py-2.5">
                <dd className="num text-lg">{f.value}</dd>
                <dt className="label mt-1">
                  {f.label}
                  <span className="block">{f.note}</span>
                </dt>
              </div>
            ))}
          </dl>
          <StaticLocator listing={rows[0]} context={rows} height={160} />
        </div>

        <p className="mt-5">
          <Link href={`/?cluster=${slug}`} className="btn-action">
            Filter these {rows.length} listings by height, crane and power →
          </Link>
        </p>

        <section className="mt-8">
          <h2 className="group-heading">Every {cluster} listing</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {rows.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>

        <section className="mt-8">
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
    </>
  );
}
