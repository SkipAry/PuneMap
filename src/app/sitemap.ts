import type { MetadataRoute } from "next";

import { getListings } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";
import { CLUSTERS, clusterSlug } from "@/lib/types";

/**
 * Built from getListings(), the same source the pages render from, so the
 * sitemap cannot list a shed that does not exist or miss one that does.
 *
 * lastModified carries last_verified rather than the build date: it is the
 * credibility signal the product already keeps, and a date that changed on
 * every deploy would tell a crawler nothing.
 *
 * The search page is listed once, without filters. Every filtered view is the
 * same listings in a different order, and inviting a crawler into a
 * combinatorial URL space would bury the pages that matter.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getListings();
  const at = (path: string) => `${SITE_URL}${path}`;

  // Leased-out stock is absent from the cluster pages and from the default
  // search, so listing it here would invite a crawler to the one part of the
  // site the product itself treats as not inventory.
  const listings = all.filter((l) => l.availability !== "Leased out");

  const clusters = CLUSTERS.map((cluster) => {
    const rows = listings.filter((l) => l.cluster === cluster);
    // A cluster page is as fresh as the most recently verified listing on it.
    const newest = rows
      .map((l) => l.last_verified)
      .sort()
      .at(-1);

    return { cluster, count: rows.length, newest };
  })
    // A cluster page 404s when it has nothing to show, so it does not belong
    // in the sitemap either.
    .filter((c) => c.count > 0)
    .map((c) => ({
      url: at(`/${clusterSlug(c.cluster)}`),
      ...(c.newest ? { lastModified: new Date(c.newest) } : {}),
    }));

  return [
    { url: at("/") },
    { url: at("/search") },
    { url: at("/about") },
    { url: at("/list-your-space") },
    { url: at("/privacy") },
    ...clusters,
    ...listings.map((l) => ({
      url: at(`/shed/${l.slug}`),
      lastModified: new Date(l.last_verified),
    })),
  ];
}
