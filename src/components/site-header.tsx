import Link from "next/link";

import { AddSpaceButton } from "./add-space-button";
import { SiteMenu } from "./site-menu";

/**
 * The masthead, and the only permanent chrome. It carries the menu button,
 * because the sections and clusters live behind it in a drawer rather than in
 * a rail that would hold territory it is not using.
 *
 * Floating over the map on the search screen; solid at the top of a document
 * everywhere else.
 */
export function SiteHeader({
  subtitle,
  floating = false,
  counts = {},
  active,
  menu,
}: {
  subtitle?: string;
  floating?: boolean;
  /** Cluster counts for the drawer. Empty on the 404, which has no data to read. */
  counts?: Record<string, number>;
  active?: "search" | "list" | "about";
  /**
   * The search screen supplies its own menu so a cluster row can toggle a
   * filter rather than navigate. Everywhere else the header builds its own.
   */
  menu?: React.ReactNode;
}) {
  const inner = (
    <div className="flex h-full items-center gap-2 px-3 sm:gap-3 sm:px-4">
      {menu ?? <SiteMenu counts={counts} active={active} />}

      <Link href="/" className="min-w-0">
        <span className="truncate text-base font-bold tracking-tight">
          Pune Industrial Space
        </span>
      </Link>

      {subtitle ? <span className="label hidden truncate lg:block">{subtitle}</span> : null}

      <div className="ms-auto flex items-center gap-2">
        <Link href="/about" className="btn-quiet hidden sm:inline-flex">
          About
        </Link>
        <AddSpaceButton />
      </div>
    </div>
  );

  if (floating) {
    return (
      <header
        className="panel absolute inset-x-2 top-2 z-30 sm:inset-x-3 sm:top-3"
        style={{ height: "var(--topbar-h)" }}
      >
        {inner}
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur"
      style={{ height: "var(--topbar-h)" }}
    >
      {inner}
    </header>
  );
}
