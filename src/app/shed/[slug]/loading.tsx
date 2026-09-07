import { SiteHeader } from "@/components/site-header";

/**
 * Shown from the moment a listing is tapped until its page streams in.
 *
 * Without it, tapping a result did nothing visible: the request went out, the
 * old screen stayed, and on a slow connection that is indistinguishable from
 * the tap having been missed. The band renders immediately so the page does
 * not appear to reload, and the blocks below stand where the real content
 * lands, in its measures - a skeleton that moves things when it resolves is
 * worse than none.
 *
 * The counts are empty here: this renders before any data is read, and an
 * invented number would be a lie the drawer then corrects.
 */
function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded-[8px] bg-[rgba(16,24,40,0.06)] ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <>
      <SiteHeader counts={{}} />

      <div className="shell shell--detail">
        <div
          className="detail-col mx-auto max-w-5xl px-4 pb-28 pt-6 panel:mx-0 panel:max-w-none panel:px-5 panel:pb-8"
          role="status"
          aria-label="Loading this property"
        >
          <Block className="h-3 w-40" />
          <Block className="mt-4 h-8 w-[min(28rem,90%)]" />
          <Block className="mt-2.5 h-4 w-56" />

          {/* The five-cell spec strip, in its real grid so nothing shifts. */}
          <div className="mt-6 grid grid-cols-5 gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Block key={i} className="h-14" />
            ))}
          </div>

          <Block className="mt-6 h-24 w-full" />
          <Block className="mt-3 h-24 w-full" />

          <span className="sr-only">Loading this property</span>
        </div>
      </div>
    </>
  );
}
