import type { MetadataRoute } from "next";

import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site-url";

/**
 * There was no robots.txt at all, so the sitemap had nothing pointing at it.
 *
 * A preview deployment refuses crawling outright. That is the belt to the
 * noindex braces in the root layout: a preview is a copy of the whole site, and
 * two copies competing for the same queries costs the real one.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    // /api/listings answers the same data the pages already carry as text, so
    // there is nothing for a crawler to gain and a budget to waste.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
