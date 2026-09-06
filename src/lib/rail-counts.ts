import "server-only";

import { getListings } from "./data.ts";

/**
 * How many listings each cluster has on offer, for the navigation rail.
 *
 * Leased-out stock is excluded so the rail agrees with the cluster pages and
 * the default search: a count that included it would promise inventory the
 * page it links to does not show.
 *
 * getListings is request-cached, so every page that carries the rail can ask
 * for this without a second read.
 */
export async function railCounts(): Promise<Record<string, number>> {
  const all = await getListings();
  const counts: Record<string, number> = {};
  for (const l of all) {
    if (l.availability !== "Leased out") {
      counts[l.cluster] = (counts[l.cluster] ?? 0) + 1;
    }
  }
  return counts;
}
