import Link from "next/link";

import { AddSpaceButton } from "./add-space-button";
import { SiteMenu } from "./site-menu";

/**
 * The masthead on every page that is a document rather than the map.
 *
 * Same band and same tiles as the search screen's, so clicking a result does
 * not appear to move the reader to a different site. It sticks rather than
 * floats, because there is no territory underneath it to keep in view - only
 * the page, which it stays out of the way of.
 */
export function SiteHeader({
  subtitle,
  counts = {},
  active,
  currentCluster,
  measure = "wide",
}: {
  subtitle?: string;
  /** Cluster counts for the drawer. Empty on the 404, which has no data to read. */
  counts?: Record<string, number>;
  active?: "search" | "list" | "about";
  /** Marks this cluster's own row in the drawer as the current page. */
  currentCluster?: string;
  /**
   * "reading" centres the band's tiles on the same 48rem column the page uses,
   * so the two line up. "wide" spans, for pages whose content starts at the
   * window edge.
   */
  measure?: "wide" | "reading";
}) {
  return (
    <div className={`toolbar toolbar--doc${measure === "reading" ? " toolbar--reading" : ""}`}>
      <div className="toolbar-inner">
        <div className="tool tool-brand">
          <SiteMenu counts={counts} active={active} currentCluster={currentCluster} />
          <Link
            href="/"
            className="hidden truncate pe-2.5 text-sm font-bold tracking-[-0.012em] sm:block"
          >
            Pune Industrial Space
          </Link>
        </div>

        {subtitle ? <span className="label hidden truncate lg:block">{subtitle}</span> : null}

        <div className="ms-auto flex flex-none items-center gap-2">
          {/* Marked rather than hidden on the About page: dropping it would
              shuffle the row every time the reader lands there. */}
          <Link
            href="/about"
            className="tool-btn"
            aria-current={active === "about" ? "page" : undefined}
          >
            About
          </Link>
          {/* Not on the page that already carries the form. It rendered a
              second copy of all 21 fields inside a dialog, so the page held
              two sets of controls with the same names. */}
          {active === "list" ? null : <AddSpaceButton />}
        </div>
      </div>
    </div>
  );
}
