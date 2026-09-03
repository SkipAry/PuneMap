/**
 * The one place that decides what this site calls itself.
 *
 * It used to be a hardcoded `puneindustrialspace.in`, a domain that does not
 * resolve, stamped as the canonical on every page - which invites a crawler to
 * drop the page it is reading in favour of a host that is not there.
 *
 * The order below is deliberate:
 *
 * - A preview deployment always names itself, so a preview can never claim the
 *   production URL and compete with it for the same pages.
 * - `NEXT_PUBLIC_SITE_URL` is the explicit override, for when the domain is
 *   known but not yet attached to the Vercel project.
 * - `VERCEL_PROJECT_PRODUCTION_URL` is Vercel's production domain, and it
 *   becomes the custom domain by itself the moment one is added - so buying the
 *   domain finishes this with no code change.
 * - `VERCEL_URL` is the last resort that still resolves; localhost is for
 *   `next dev` only.
 */
const candidate =
  process.env.VERCEL_ENV === "preview"
    ? process.env.VERCEL_URL
    : (process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.VERCEL_URL);

/** Vercel supplies bare hostnames; an explicit override may carry a scheme. */
const withScheme = (host: string) =>
  /^https?:\/\//.test(host) ? host : `https://${host}`;

export const SITE_URL = candidate ? withScheme(candidate) : "http://localhost:3000";

/** True only for the real production site, so previews can be kept out of search. */
export const IS_PRODUCTION_SITE = process.env.VERCEL_ENV === "production";
