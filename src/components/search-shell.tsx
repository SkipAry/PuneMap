"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fmtNumber } from "@/lib/derive";
import { activeFilterCount, parseFilters, serialiseFilters, type Filters } from "@/lib/filters";
import { PAGE_SIZE, applyFilters, describeMiss } from "@/lib/query";
import type { Listing } from "@/lib/types";

import { FilterRail } from "./filter-rail";
import { ListingCard } from "./listing-card";

/* MapLibre is heavy and useless without JS, so it never enters the server HTML. */
const ListingMap = dynamic(() => import("./listing-map"), {
  ssr: false,
  loading: () => <div className="size-full bg-paper" />,
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function SearchShell({ all }: { all: Listing[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the state. Nothing about the filters is mirrored in useState.
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const result = useMemo(() => applyFilters(all, filters), [all, filters]);

  /*
    Discrete choices push, so Back walks the filter stack the way a user expects.
    Continuous controls replace: a slider fires per step, and pushing each one
    would bury the previous filter under thirty history entries.
  */
  const write = useCallback(
    (next: Filters, history: "push" | "replace" = "push") => {
      const qs = serialiseFilters(next).toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (history === "replace") router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router, pathname],
  );

  const patch = useCallback(
    (part: Partial<Filters>, history: "push" | "replace" = "push") =>
      write({ ...filters, ...part }, history),
    [filters, write],
  );

  const clearAll = useCallback(() => router.push(pathname, { scroll: false }), [router, pathname]);

  /*
    The one orchestrated moment: cards that no longer match fade out over 120ms,
    then the list reflows. Presentation only - it never feeds back into filters.
  */
  const [displayed, setDisplayed] = useState<Listing[]>(result.listings);
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set());
  const displayedRef = useRef(displayed);
  displayedRef.current = displayed;

  useEffect(() => {
    const next = result.listings;
    const nextSlugs = new Set(next.map((l) => l.slug));
    const removed = displayedRef.current.filter((l) => !nextSlugs.has(l.slug)).map((l) => l.slug);

    if (removed.length === 0) {
      setDisplayed(next);
      setLeaving(new Set());
      return;
    }

    setLeaving(new Set(removed));
    const timer = setTimeout(
      () => {
        setDisplayed(next);
        setLeaving(new Set());
      },
      prefersReducedMotion() ? 0 : 120,
    );
    return () => clearTimeout(timer);
  }, [result.listings]);

  const [limit, setLimit] = useState(PAGE_SIZE);
  useEffect(() => setLimit(PAGE_SIZE), [searchParams]);

  // MapLibre parses ~200KB; loading it once the browser is idle keeps it out of
  // Total Blocking Time. The result list is fully usable before it arrives.
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    // Inside an effect we are always on the client.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setMapReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setMapReady(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  /* A pin click scrolls its card into view and outlines it. */
  const selectFromMap = useCallback((slug: string) => {
    setActiveSlug(slug);
    const node = document.getElementById(`card-${slug}`);
    node?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const visible = displayed.slice(0, limit);
  const activeCount = activeFilterCount(filters);

  const rail = (
    <FilterRail
      filters={filters}
      patch={patch}
      clearAll={clearAll}
      shown={result.total}
      total={all.length}
    />
  );

  return (
    <div className="lg:flex lg:h-[calc(100dvh-2.4rem)] lg:overflow-hidden">
      {/* Filters - 300px rail on desktop, full-height sheet on mobile. */}
      <aside className="hidden w-[300px] shrink-0 border-r border-rule lg:order-1 lg:block">{rail}</aside>

      {sheetOpen ? (
        <div className="fixed inset-0 z-40 bg-paper lg:hidden">
          <div className="flex items-center justify-between border-b border-rule px-4 py-2">
            <h2 className="text-lg">Filters</h2>
            <button type="button" className="chip" onClick={() => setSheetOpen(false)}>
              Show {fmtNumber(result.total)} sheds
            </button>
          </div>
          <div className="h-[calc(100dvh-3rem)]">{rail}</div>
        </div>
      ) : null}

      {/* Map - fixed to the top on mobile, sticky column on desktop. */}
      <div className="sticky top-0 z-20 h-[38vh] w-full border-b border-rule lg:static lg:order-3 lg:h-auto lg:flex-1 lg:border-b-0 lg:border-l">
        {mapReady ? (
          <ListingMap
            listings={displayed}
            activeSlug={activeSlug}
            hoverSlug={hoverSlug}
            onSelect={selectFromMap}
          />
        ) : (
          <div className="size-full bg-paper" />
        )}
      </div>

      {/* Results - always present, never behind a tab. This is the map's text equivalent. */}
      <section
        id="results"
        className="w-full pb-16 lg:order-2 lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:pb-0"
        aria-label="Matching listings"
      >
        <div className="border-b border-rule px-4 py-2">
          <p className="text-sm" aria-live="polite">
            <span className="num">{fmtNumber(result.total)}</span>{" "}
            {result.total === 1 ? "shed" : "sheds"} match
            {activeCount === 0 ? "" : ` ${activeCount} ${activeCount === 1 ? "filter" : "filters"}`}
          </p>

          {/* The cost of excluding unstated specs, made visible and reversible. */}
          {!filters.loose && result.nullExclusions.length > 0 ? (
            <div className="mt-1.5">
              {result.nullExclusions.map((n) => (
                <p key={n.key} className="spec-label">
                  {fmtNumber(n.count)} more {n.count === 1 ? "listing does" : "listings do"} not
                  state {n.label}.
                </p>
              ))}
              <button
                type="button"
                className="mt-1 text-sm text-signal underline"
                onClick={() => patch({ loose: true })}
              >
                Include them
              </button>
            </div>
          ) : null}

          {filters.loose ? (
            <button
              type="button"
              className="mt-1 text-sm text-signal underline"
              onClick={() => patch({ loose: false })}
            >
              Exclude listings that do not state these specs
            </button>
          ) : null}
        </div>

        {result.total === 0 ? (
          <div className="px-4 py-6">
            <p className="text-base">
              No shed matches all {activeCount} {activeCount === 1 ? "filter" : "filters"}.
              {result.closestMiss ? ` The closest miss is ${describeMiss(result.closestMiss)}.` : ""}
            </p>
            {/* A reset is the user's own action, so it stays ink; signal in this
                block belongs to Include them, the null reversal. */}
            <button type="button" className="mt-3 text-sm underline" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="result-list flex flex-col gap-2 px-3 py-3">
              {visible.map((listing) => (
                <div key={listing.slug} data-leaving={leaving.has(listing.slug)} className="result-card">
                  <ListingCard
                    listing={listing}
                    active={activeSlug === listing.slug}
                    onHover={setHoverSlug}
                    onSelect={setActiveSlug}
                  />
                </div>
              ))}
            </div>

            {displayed.length > limit ? (
              <div className="px-3 pb-4">
                <button
                  type="button"
                  className="chip w-full py-2"
                  onClick={() => setLimit((n) => n + PAGE_SIZE)}
                >
                  Show {Math.min(PAGE_SIZE, displayed.length - limit)} more
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* Mobile: sticky bar carrying the filter count. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper px-4 py-2 lg:hidden">
        <button
          type="button"
          className="chip w-full py-2"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
        >
          Filters{activeCount > 0 ? ` · ${activeCount} active` : ""}
        </button>
      </div>
    </div>
  );
}
