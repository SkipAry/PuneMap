import { SearchShell } from "@/components/search-shell";
import { getListings } from "@/lib/data";
import { addressed } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Industrial sheds and warehouses on rent around Pune — filter by height, crane and power",
  description:
    "Search industrial sheds, warehouses and factory buildings for rent or lease in Chakan, Bhosari, Talegaon, Ranjangaon, Wagholi, Hinjawadi and Pirangut. Filter by clear height, crane capacity, sanctioned power, flooring and docks.",
  ...addressed("/search"),
};

export default async function SearchPage() {
  const listings = await getListings();

  return (
    <main id="main" tabIndex={-1}>
      {/* The page had no h1 and no landmark: the accessibility tree opened on
          the filter group names. Visually redundant with the masthead, so it
          is carried for assistive tech only. */}
      <h1 className="sr-only">
        Industrial sheds, warehouses and factory buildings on rent around Pune
      </h1>
      {/*
        No Suspense boundary. The page is force-dynamic, so useSearchParams()
        never needs one, and the boundary was not resolving on the client: the
        shell rendered server-side, sat in React's holding div, and the fallback
        stayed on screen for good.
      */}
      <SearchShell all={listings} />
    </main>
  );
}
