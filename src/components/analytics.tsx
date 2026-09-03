import Script from "next/script";

import { IS_PRODUCTION_SITE } from "@/lib/site-url";

/**
 * The single analytics tag PRODUCT.md allows, and nothing more.
 *
 * Plausible because it sets no cookies and stores no personal data, which
 * keeps the privacy page short and means the site needs no consent banner in
 * front of the map. Umami is the same shape if you would rather self-host:
 * swap the src and the data attribute.
 *
 * Renders nothing until NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, and never on a
 * preview, so branch deploys cannot pollute the numbers.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain || !IS_PRODUCTION_SITE) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
