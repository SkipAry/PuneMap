import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { zoneOf } from "@/lib/clusters";
import { railCounts } from "@/lib/rail-counts";
import { CLUSTERS, clusterSlug } from "@/lib/types";

/**
 * Caught by a dead /shed/[slug] or an unknown cluster, so the likeliest reader
 * followed a link to a listing that has since come down. It names the way back
 * rather than apologising: the map, then the clusters that still hold stock.
 *
 * Async, and it reads the listings: without counts the menu drawer opened on
 * an empty "Clusters" heading, and the chips below offered clusters whose own
 * pages 404 when they have nothing live - one dead end leading to another.
 */
export default async function NotFound() {
  const counts = await railCounts();
  const covered = CLUSTERS.filter((c) => counts[c]);

  return (
    <>
      <SiteHeader subtitle="Page not found" counts={counts} measure="reading" />

      <main
        id="main"
        tabIndex={-1}
        className="reading mx-auto my-6 max-w-3xl px-4 py-8 sm:px-8 sm:py-10"
      >
        <h1 className="text-3xl">That page is not here</h1>

        <div className="mt-4 flex max-w-[70ch] flex-col gap-4 text-base">
          <p>
            The listing may have been taken down since the link was made, or the address may be
            wrong. Nothing is lost — every property on the site is reachable from the map.
          </p>

          <p>
            <Link href="/search" className="btn-action">
              Back to the map
            </Link>
          </p>

          <h2 className="group-heading mt-4">Or start from a cluster</h2>
          <div className="flex flex-wrap gap-1.5">
            {covered.map((c) => (
              <Link
                key={c}
                href={`/${clusterSlug(c)}`}
                className="chip"
                style={{ ["--zone" as string]: zoneOf(c) }}
              >
                <span className="chip-dot" aria-hidden="true" />
                {c}
                <span className="num text-muted">{counts[c]}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
