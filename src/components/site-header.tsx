import Link from "next/link";

import { AddSpaceButton } from "./add-space-button";

/**
 * The estate sign board. On the search screen it floats over the map; on the
 * reading pages it sits solid at the top of the document.
 */
export function SiteHeader({
  subtitle,
  floating = false,
}: {
  subtitle?: string;
  floating?: boolean;
}) {
  const inner = (
    <div className="flex h-full items-center gap-3 px-3 sm:px-4">
      <Link href="/" className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="grid size-7 flex-none place-content-center rounded-lg bg-ink text-[13px] font-bold text-white"
        >
          P
        </span>
        <span className="truncate text-base font-bold tracking-tight">
          Pune Industrial Space
        </span>
      </Link>

      {subtitle ? (
        <span className="label hidden truncate lg:block">{subtitle}</span>
      ) : null}

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
