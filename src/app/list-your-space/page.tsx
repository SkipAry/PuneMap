import { AddSpaceForm } from "@/components/add-space-form";
import { SearchRail } from "@/components/search-rail";
import { SiteHeader } from "@/components/site-header";
import { railCounts } from "@/lib/rail-counts";
import { addressed } from "@/lib/site-url";

export const metadata = {
  title: "List your industrial property in Pune — free, no listing fee",
  description:
    "Brokers and owners: add a shed, warehouse or factory building around Pune to the map free of charge. Fill in what you know — every spec is optional — and we verify before listing.",
  ...addressed("/list-your-space"),
};

/**
 * The same form the nav dialog renders, as a page. It is the no-JavaScript
 * fallback for that dialog and a landing page in its own right.
 */
export default async function ListYourSpacePage() {
  const clusterCounts = await railCounts();

  return (
    <>
      <div className="panel:hidden">
        <SiteHeader subtitle="List your space" />
      </div>

      <div className="shell shell--reading panel:fixed panel:inset-0 panel:overflow-hidden">
        <SearchRail active="list" counts={clusterCounts} />

        <main
          id="main"
          tabIndex={-1}
          className="detail-col mx-auto max-w-3xl px-4 py-8 panel:px-8 panel:py-10"
        >
        <h1 className="text-3xl">List your space, free</h1>
        <p className="mt-3 max-w-[62ch] text-base text-muted">
          There is no listing fee and no account to create. We are paid brokerage by the
          owner only when a lease closes, so putting a property here costs you nothing.
        </p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Send what you know", "Specs are optional. Blanks show as “not stated”, never as zero."],
            ["We call to confirm", "One call to check the numbers a manager will filter on."],
            ["It goes on the map", "Filterable by height, crane, power and docks — where buyers look."],
          ].map(([title, body], i) => (
            <li key={title} className="card px-3 py-3">
              <span className="num label">Step {i + 1}</span>
              <h2 className="mt-1 text-base font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>

        <div className="panel mt-6 !bg-white pt-5">
          <AddSpaceForm />
        </div>
        </main>
      </div>
    </>
  );
}
