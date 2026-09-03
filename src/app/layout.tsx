import type { Metadata } from "next";

import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site-url";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Industrial sheds and warehouses on rent around Pune",
    template: "%s",
  },
  description:
    "Filter industrial sheds, warehouses and factory buildings around Pune by clear height, crane capacity, sanctioned power, flooring and docks.",
  // The home page had no canonical at all; the inner pages set their own.
  alternates: { canonical: "/" },
  // Resolved against metadataBase, so og:url tracks the same host as canonical.
  openGraph: { type: "website", locale: "en_IN", url: "/" },
  // A preview deployment is a copy of the site. Keeping it out of the index is
  // the other half of not letting it claim the production URL.
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      {/*
        Only gstatic is contacted now - the @font-face rules are inlined in
        google-sans.css, so no stylesheet request blocks first paint.
      */}
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
