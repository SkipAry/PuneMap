import { getListings } from "@/lib/data";
import { parseFilters } from "@/lib/filters";
import { applyFilters, describeMiss } from "@/lib/query";

export const dynamic = "force-dynamic";

/**
 * GET /api/listings?cluster=chakan&minHeight=12&crane=10
 *
 * Same filter engine as the server-rendered page, so a URL means the same thing
 * whether it is opened in a browser or curled.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseFilters(url.searchParams);

  const limitRaw = Number(url.searchParams.get("limit") ?? "200");
  const offsetRaw = Number(url.searchParams.get("offset") ?? "0");
  const limit = Number.isFinite(limitRaw) ? Math.min(500, Math.max(1, limitRaw)) : 200;
  const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : 0;

  let all;
  try {
    all = await getListings();
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "listing source unavailable" },
      { status: 503 },
    );
  }

  const result = applyFilters(all, filters);

  return Response.json(
    {
      total: result.total,
      offset,
      limit,
      listings: result.listings.slice(offset, offset + limit),
      nullExclusions: result.nullExclusions,
      nullExcludedTotal: result.nullExcludedTotal,
      closestMiss: result.closestMiss
        ? { slug: result.closestMiss.listing.slug, description: describeMiss(result.closestMiss) }
        : null,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
