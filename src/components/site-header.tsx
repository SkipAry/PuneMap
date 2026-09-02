import Link from "next/link";

/** Shared masthead. Deliberately plain - a plot-plan title bar, not a nav. */
export function SiteHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-2">
      <div className="flex items-baseline gap-3 min-w-0">
        <Link href="/" className="text-sm font-bold tracking-tight whitespace-nowrap">
          Pune Industrial Space
        </Link>
        {subtitle ? (
          <span className="spec-label truncate">{subtitle}</span>
        ) : null}
      </div>
      <nav className="flex items-baseline gap-4 text-xs">
        <Link href="/" className="spec-label hover:text-ink">
          Search
        </Link>
        <Link href="/about" className="spec-label hover:text-ink">
          About
        </Link>
      </nav>
    </header>
  );
}
