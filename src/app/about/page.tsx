import Link from "next/link";

import { SearchRail } from "@/components/search-rail";
import { SiteHeader } from "@/components/site-header";
import { railCounts } from "@/lib/rail-counts";
import { addressed } from "@/lib/site-url";
import { zoneOf } from "@/lib/clusters";
import { CLUSTERS, clusterSlug } from "@/lib/types";

export const metadata = {
  title: "About — Pune Industrial Space",
  description:
    "What this is, who runs it, and how to list an industrial shed or warehouse around Pune free of charge.",
  ...addressed("/about"),
};

export default async function AboutPage() {
  const clusterCounts = await railCounts();

  return (
    <>
      {/* Phone only: from 820px the rail carries identity and navigation. */}
      <div className="panel:hidden">
        <SiteHeader subtitle="About" />
      </div>

      {/*
        Two panes, not three: there is no map to hold a third. The reading
        column keeps its own measure rather than stretching to the window.
      */}
      <div className="shell shell--reading panel:fixed panel:inset-0 panel:overflow-hidden">
        <SearchRail active="about" counts={clusterCounts} />

        <main
          id="main"
          tabIndex={-1}
          className="detail-col mx-auto max-w-3xl px-4 py-8 panel:px-8 panel:py-10"
        >
        <h1 className="text-3xl">About this site</h1>

        <div className="mt-4 flex max-w-[70ch] flex-col gap-4 text-base">
          <p>
            Every property portal was built to sell apartments. Clear height, crane capacity and
            sanctioned power do appear in industrial listings, but only as free text buried in a
            paragraph, so there is no way to filter by them. A manager who needs 30,000 sq ft at 12m
            with a 10-ton crane ends up phoning ten brokers and asking the same questions each time.
          </p>
          <p>
            This site restructures publicly posted listings around those numbers. Every entry links
            back to its source. Where a broker did not state a spec, it shows{" "}
            <span className="num">—</span> rather than a guess, and filtering on that spec leaves the
            listing out — with a count of what was left out, and a button to put it back.
          </p>

          <h2 className="group-heading mt-4">Clusters covered</h2>
          <div className="flex flex-wrap gap-1.5">
            {CLUSTERS.map((c) => (
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

          <h2 className="group-heading mt-4">Listing a property</h2>
          <p>
            Listing is free. Send the plot number, built-up area, clear height, crane capacity,
            sanctioned power, flooring, docks and the rent you expect. Incomplete details are fine —
            the site is built to show what is known and mark the rest as unstated.
          </p>
          <p>
            <Link href="/list-your-space" className="btn-action">
              Add your space, free
            </Link>
          </p>
          <p>
            We are paid brokerage on a closed lease by the owner. There is no listing fee, no
            subscription, and no login.
          </p>

          <h2 className="group-heading mt-4">Accuracy</h2>
          <p>
            Each listing carries the date it was last verified. Specs come from the broker or owner
            and are not independently measured — confirm on site before you sign.
          </p>

          <h2 className="group-heading mt-4">Your details</h2>
          <p>
            Browsing the map collects nothing about you. If you send us a property we keep
            your name and number to call you about it.{" "}
            <Link href="/privacy" className="text-action underline">
              What we collect and why
            </Link>
            .
          </p>
        </div>
        </main>
      </div>
    </>
  );
}
