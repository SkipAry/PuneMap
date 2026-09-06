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
  measure = "wide",
}: {
  subtitle?: string;
  /** Cluster counts for the drawer. Empty on the 404, which has no data to read. */
  counts?: Record<string, number>;
  active?: "search" | "list" | "about";
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
          <SiteMenu counts={counts} active={active} />
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
          <AddSpaceButton />
        </div>
      </div>
    </div>
  );
}
