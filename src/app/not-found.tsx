import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { zoneOf } from "@/lib/clusters";
import { CLUSTERS, clusterSlug } from "@/lib/types";

/**
 * Caught by a dead /shed/[slug] or an unknown cluster, so the likeliest reader
 * followed a link to a listing that has since come down. It names the way back
 * rather than apologising: the map, then the eight clusters.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader subtitle="Page not found" />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl">That page is not here</h1>

        <div className="mt-4 flex max-w-[70ch] flex-col gap-4 text-base">
          <p>
            The listing may have been taken down since the link was made, or the address may be
            wrong. Nothing is lost — every property on the site is reachable from the map.
          </p>

          <p>
            <Link href="/" className="btn-action">
              Back to the map
            </Link>
          </p>

          <h2 className="group-heading mt-4">Or start from a cluster</h2>
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
        </div>
      </main>
    </>
  );
}
