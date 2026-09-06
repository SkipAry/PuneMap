import Link from "next/link";

import { SampleNotice } from "@/components/listing-card";
import { SpecStrip } from "@/components/spec-strip";
import { zoneOf } from "@/lib/clusters";
import { fmtNumber, listingTitle } from "@/lib/derive";
import { getListings } from "@/lib/data";
import { EMPTY_FILTERS, serialiseFilters } from "@/lib/filters";
import { applyFilters } from "@/lib/query";
import { railCounts } from "@/lib/rail-counts";
import { addressed } from "@/lib/site-url";
import { CLUSTERS, clusterSlug, type Listing } from "@/lib/types";

export const metadata = {
  title: "Pune Industrial Space — filter sheds by clear height, crane and power",
  description:
    "Industrial sheds, warehouses and factory buildings on rent around Pune, searchable by the numbers that decide the deal: clear height, crane capacity, sanctioned power, flooring and docks.",
  ...addressed("/"),
};

/**
 * The requirement the hero is built around. It is run through the same
 * applyFilters() the search screen uses, against the same listings, so the
 * count under it is the real answer and cannot drift from the product.
 */
const HERO_REQUIREMENT = {
  ...EMPTY_FILTERS,
  minHeight: 12,
  crane: 10,
  minArea: 30_000,
};

/** Section marker. The page reads as a numbered specification, not as a brochure. */
function Marker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="sec-n">{n}</span>
      <h2 className="text-xl sm:text-2xl">{children}</h2>
    </div>
  );
}

/**
 * The same row written the way a general property portal writes it. Every
 * number in it is read off the listing beside it - the point of the comparison
 * is the form, not the facts, so inventing facts would break it.
 */
function asProse(l: Listing): string {
  const bits = [
    `Well-maintained ${l.property_type.toLowerCase()}${
      l.total_builtup === null ? "" : ` of ${fmtNumber(l.total_builtup)} sq ft`
    } available on lease at ${l.locality ?? l.cluster}, ${l.cluster}.`,
    l.height_m === null
      ? null
      : `The unit offers a clear height of approximately ${l.height_m} metres at centre.`,
    l.crane_capacity_ton
      ? `Fitted with a ${l.crane_capacity_ton}-ton EOT crane.`
      : null,
    l.power_hp === null ? null : `Sanctioned power ${fmtNumber(l.power_hp)} HP.`,
    l.flooring === null ? null : `${l.flooring} flooring.`,
    "Suitable for manufacturing and warehousing operations. Contact for further details and site visit.",
  ].filter(Boolean);
  return bits.join(" ");
}

export default async function LandingPage() {
  const all = await getListings();
  const live = all.filter((l) => l.availability !== "Leased out");

  const match = applyFilters(all, HERO_REQUIREMENT);
  const heroHref = `/search?${serialiseFilters(HERO_REQUIREMENT).toString()}`;

  // The comparison needs a row that actually states the specs, or the left side
  // has nothing to bury and the right side has nothing to line up.
  const specimen =
    live.find(
      (l) =>
        l.height_m !== null &&
        l.crane_capacity_ton !== null &&
        l.power_hp !== null &&
        l.flooring !== null &&
        l.total_builtup !== null,
    ) ?? live[0];

  const noCrane = live.filter((l) => l.crane_capacity_ton === null).length;

  // "Other" is the catch-all bucket for a listing outside the named corridors,
  // not a place anyone drives to, so it is not coverage to advertise.
  const counts = await railCounts();
  const covered = CLUSTERS.filter((c) => c !== "Other" && counts[c]);

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="wrap flex items-center gap-3" style={{ height: "var(--topbar-h)" }}>
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-7 flex-none place-content-center rounded-lg bg-ink text-[13px] font-bold text-white"
            >
              P
            </span>
            <span className="truncate text-base font-bold tracking-tight">
              Pune Industrial Space
            </span>
          </span>

          <nav className="ms-auto flex items-center gap-2">
            <Link href="/about" className="btn-quiet hidden sm:inline-flex">
              About
            </Link>
            <Link href="/list-your-space" className="btn-quiet hidden md:inline-flex">
              List a property
            </Link>
            <Link href="/search" className="btn-action">
              Open the map
            </Link>
          </nav>
        </div>
      </header>

      <SampleNotice listings={all} />

      <main id="main" tabIndex={-1}>
        {/* ── Hero. The claim on the left, the claim executed on the right. ── */}
        <section className="wrap grid gap-10 pb-14 pt-12 lg:grid-cols-[1fr_25rem] lg:gap-14 lg:pb-20 lg:pt-16">
          <div className="self-center">
            <p className="label tracking-[0.14em] uppercase">Pune · industrial</p>
            {/* The measure belongs on the h1, where a ch resolves against the
                display size rather than against the 15px body text. */}
            <h1 className="display mt-3 max-w-[19ch]">
              Filter sheds by clear height, crane and power.
            </h1>
            <p className="lede mt-5 max-w-[46ch]">
              Every property portal was built to sell apartments. The numbers that decide
              an industrial lease are in there — buried in a paragraph, with no way to
              search on them. So a manager who needs 12 metres and a 10-ton crane phones
              ten brokers and asks the same five questions.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link href="/search" className="btn-action">
                Open the map
              </Link>
              <Link href="/about" className="btn-quiet">
                Why it exists
              </Link>
            </div>
          </div>

          {/* Not a mockup: these three constraints run through the product's own
              filter, against the listings the search screen reads. */}
          <div className="card overflow-hidden p-0">
            <p className="label border-b border-line px-4 py-2.5 tracking-[0.12em] uppercase">
              Requirement
            </p>

            <div className="dial-grid p-3">
              <div className="dial" data-set="true">
                <span className="k">Height</span>
                <span className="v">
                  12<span className="u">m+</span>
                </span>
              </div>
              <div className="dial" data-set="true">
                <span className="k">Crane</span>
                <span className="v">
                  10<span className="u">T+</span>
                </span>
              </div>
              <div className="dial" data-set="true">
                <span className="k">Built-up</span>
                <span className="v">
                  30k<span className="u">sqft+</span>
                </span>
              </div>
            </div>

            <p className="border-y border-line bg-[rgba(16,24,40,0.025)] px-4 py-2.5 text-sm">
              <span className="num text-lg">{match.total}</span>
              <span className="text-muted">
                {" "}
                of {live.length} buildings match
              </span>
            </p>

            <ul className="rule-list">
              {match.listings.slice(0, 3).map((l) => (
                <li key={l.slug} className="px-4 py-3">
                  <p className="label flex items-center gap-1.5">
                    <span
                      className="chip-dot"
                      aria-hidden="true"
                      style={{ ["--zone" as string]: zoneOf(l.cluster) }}
                    />
                    {l.locality ?? l.cluster}
                  </p>
                  <Link
                    href={`/shed/${l.slug}`}
                    className="mt-0.5 block text-base font-semibold hover:text-action"
                  >
                    {listingTitle(l)}
                  </Link>
                </li>
              ))}
            </ul>

            {match.nullExcludedTotal > 0 ? (
              <p className="border-t border-line px-4 py-3 text-sm text-muted">
                <span className="num text-ink">{match.nullExcludedTotal}</span> more do not
                state one of these three. They are left out, counted, and put back by one
                control.
              </p>
            ) : null}

            <p className="border-t border-line px-4 py-3">
              <Link href={heroHref} className="text-sm font-semibold text-action underline">
                Open this exact search →
              </Link>
            </p>
          </div>
        </section>

        {/* ── 01 The gap, shown rather than argued. ── */}
        <section className="sec">
          <div className="wrap">
            <Marker n="01">The same building, two ways</Marker>
            <p className="lede mt-3 max-w-[62ch]">
              Both panels below are the one listing. On the left it is written the way a
              general portal writes it. On the right it is the same numbers, in fixed
              positions, where a filter can reach them.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="card flex flex-col p-4">
                <p className="label tracking-[0.12em] uppercase">On a property portal</p>
                <p className="mt-3 flex-1 text-base leading-relaxed text-muted">
                  {asProse(specimen)}
                </p>
                <p className="mt-4 border-t border-line pt-3 text-sm">
                  <span className="text-muted">Searchable fields</span>
                  <span className="mt-1 block">locality · property type · area · budget</span>
                </p>
              </div>

              <div
                className="card flex flex-col p-4"
                style={{ ["--zone" as string]: zoneOf(specimen.cluster) }}
              >
                <p className="label tracking-[0.12em] uppercase">Here</p>
                <p className="label mt-3 flex items-center gap-1.5">
                  <span className="chip-dot" aria-hidden="true" />
                  {specimen.locality ?? specimen.cluster}
                </p>
                <p className="mt-0.5 text-lg font-bold">{listingTitle(specimen)}</p>
                <div className="mt-3 flex-1">
                  <SpecStrip listing={specimen} />
                </div>
                <p className="mt-4 border-t border-line pt-3 text-sm">
                  <span className="text-muted">Filterable fields</span>
                  <span className="mt-1 block">
                    clear height · crane capacity · sanctioned power · flooring · docks ·
                    floor load · built-up area · rate · rent · factory plan approval
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 The null contract: the trust argument. ── */}
        <section className="sec">
          <div className="wrap grid gap-8 md:grid-cols-[1fr_18rem] md:items-start md:gap-12">
            <div>
              <Marker n="02">Unstated is not zero</Marker>
              <div className="mt-4 flex max-w-[62ch] flex-col gap-4 text-base">
                <p>
                  Real broker listings are half-empty, and that is the normal case rather
                  than an edge one. Of the {live.length} buildings on the site right now,{" "}
                  <span className="num">{noCrane}</span> say nothing at all about a crane.
                </p>
                <p>
                  A shed that never mentions a crane is not a match for a 10-ton
                  requirement, so it drops out of that search. What it never does is render
                  as <span className="num">0</span>. The site shows an em dash, tells you
                  how many listings dropped out for being silent rather than for not
                  fitting, and puts them back with one control.
                </p>
                <p className="text-muted">
                  Nothing on this site is estimated, interpolated or filled in. A missing
                  number is a reason to phone the broker — which is the point, because the
                  phone call is the transaction.
                </p>
              </div>
            </div>

            <dl className="spec-strip !grid-cols-2 self-center">
              <div className="spec-cell">
                <dd className="num spec-value">10T</dd>
                <dt className="label mt-0.5">stated</dt>
              </div>
              <div className="spec-cell">
                <dd className="num spec-value" data-unknown="true">
                  —
                </dd>
                <dt className="label mt-0.5">not stated</dt>
              </div>
            </dl>
          </div>
        </section>

        {/* ── 03 Coverage, with counts read off the same data. ── */}
        <section className="sec">
          <div className="wrap">
            <Marker n="03">{covered.length} clusters around Pune</Marker>
            <p className="lede mt-3 max-w-[62ch]">
              Each cluster owns a colour, used identically on the pin, the filter and the
              card, so the map reads without a legend.
            </p>

            <ul className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {covered.map((c) => (
                <li key={c}>
                  <Link
                    href={`/${clusterSlug(c)}`}
                    className="card flex items-center gap-2 px-3 py-2.5"
                    style={{ ["--zone" as string]: zoneOf(c) }}
                  >
                    <span className="chip-dot" aria-hidden="true" />
                    <span className="truncate text-sm font-medium">{c}</span>
                    <span className="num ms-auto text-sm text-muted">{counts[c]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 04 How the business runs. Investors and brokers read this one. ── */}
        <section className="sec">
          <div className="wrap">
            <Marker n="04">How it works</Marker>

            <dl className="rule-list mt-6 max-w-[62ch] border-t border-line">
              {[
                {
                  t: "Listing is free",
                  d: "Send the plot number, built-up area, height, crane, power, flooring, docks and the rent you expect. Incomplete is fine — the site is built to show what is known and mark the rest unstated.",
                },
                {
                  t: "We are paid brokerage on a closed lease",
                  d: "By the owner, once a deal actually closes. No listing fee, no subscription, no ads, no featured placement.",
                },
                {
                  t: "There is no account",
                  d: "No login, no dashboard, no saved searches. A search is a URL, so it can be pasted into a message and it restores exactly.",
                },
                {
                  t: "Every listing credits its source",
                  d: "The site restructures publicly posted listings around industrial specs. It does not claim them, and each one links back.",
                },
              ].map((row) => (
                <div key={row.t} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-5">
                  <dt className="font-semibold">{row.t}</dt>
                  <dd className="text-base text-muted">{row.d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Close. ── */}
        <section className="sec">
          <div className="wrap flex flex-col items-start gap-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="display max-w-[16ch] !text-[clamp(1.5rem,3.6vw,2.25rem)]">
              Start from the numbers, not the neighbourhood.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/search" className="btn-action">
                Open the map
              </Link>
              <Link href="/list-your-space" className="btn-quiet">
                List a property, free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-[#fbfbfa]">
        <div className="wrap flex flex-wrap items-center gap-x-5 gap-y-2 py-6 text-sm">
          <span className="font-semibold">Pune Industrial Space</span>
          <Link href="/search" className="text-muted hover:text-ink">
            Search
          </Link>
          <Link href="/about" className="text-muted hover:text-ink">
            About
          </Link>
          <Link href="/list-your-space" className="text-muted hover:text-ink">
            List a property
          </Link>
          <Link href="/privacy" className="text-muted hover:text-ink">
            Privacy
          </Link>
          <span className="label ms-auto">
            Specs come from the broker or owner and are not independently measured.
          </span>
        </div>
      </footer>
    </div>
  );
}
