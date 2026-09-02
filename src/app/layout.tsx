import type { Metadata } from "next";
import { Archivo } from "next/font/google";

import "./globals.css";

/*
  One family. Archivo's width axis is the design device - this is signage
  typography, which is what industrial estates are actually labelled with.
*/
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://puneindustrialspace.in"),
  title: {
    default: "Industrial sheds and warehouses on rent around Pune",
    template: "%s",
  },
  description:
    "Filter industrial sheds, warehouses and factory buildings around Pune by clear height, crane capacity, sanctioned power, flooring and docks.",
  openGraph: { type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={archivo.variable}>
      <body className="min-h-dvh">
        <a
          href="#results"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-chalk focus:px-3 focus:py-2"
        >
          Skip to results
        </a>
        {children}
      </body>
    </html>
  );
}
