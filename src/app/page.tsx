import { Suspense } from "react";

import { SearchShell } from "@/components/search-shell";
import { SiteHeader } from "@/components/site-header";
import { getListings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Industrial sheds and warehouses on rent around Pune — filter by height, crane and power",
  description:
    "Search industrial sheds, warehouses and factory buildings for rent or lease in Chakan, Bhosari, Talegaon, Ranjangaon, Wagholi, Hinjawadi and Pirangut. Filter by clear height, crane capacity, sanctioned power, flooring and docks.",
};

export default async function SearchPage() {
  const listings = await getListings();

  return (
    <>
      <SiteHeader subtitle="Sheds, warehouses and factory buildings on rent around Pune" floating />
      <main>
        {/* The page had no h1 and no landmark: the accessibility tree opened on
            the filter group names. Visually redundant with the masthead, so it
            is carried for assistive tech only. */}
        <h1 className="sr-only">
          Industrial sheds, warehouses and factory buildings on rent around Pune
        </h1>
        <Suspense fallback={<div className="p-4 text-sm text-muted">Loading listings…</div>}>
          <SearchShell all={listings} />
        </Suspense>
      </main>
    </>
  );
}
