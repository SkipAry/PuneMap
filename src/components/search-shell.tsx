"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { zoneOf } from "@/lib/clusters";
import { fmtNumber } from "@/lib/derive";
import { activeFilterCount, parseFilters, serialiseFilters, type Filters } from "@/lib/filters";
import { BASEMAPS, type BasemapId } from "@/lib/map-style";
import { PAGE_SIZE, applyFilters, describeMiss } from "@/lib/query";
import { CLUSTERS, clusterSlug, type Listing } from "@/lib/types";

import { FilterRail } from "./filter-rail";
import { ListingCard } from "./listing-card";

const ListingMap = dynamic(() => import("./listing-map"), {
  ssr: false,
  loading: () => <div className="size-full bg-ground" />,
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function SearchShell({ all }: { all: Listing[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the state. No filter value is mirrored in useState.
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const result = useMemo(() => applyFilters(all, filters), [all, filters]);

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

  /* Cards that stop matching fade, then the list reflows. The only motion. */
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

  // MapLibre parses ~200KB; loading it on idle keeps it out of blocking time.
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setMapReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setMapReady(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  const [basemap, setBasemap] = useState<BasemapId>("light");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(true);

  const selectFromMap = useCallback((slug: string) => {
    setActiveSlug(slug);
    setListOpen(true);
    const node = document.getElementById(`card-${slug}`);
    node?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const visible = displayed.slice(0, limit);
  const activeCount = activeFilterCount(filters);

  const toggleCluster = (c: string) =>
    patch({
      clusters: filters.clusters.includes(c)
        ? filters.clusters.filter((x) => x !== c)
        : [...filters.clusters, c],
    });

  return (
    /* The territory is the page: the map fills it and every panel floats on it. */
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0">
        {mapReady ? (
          <ListingMap
            listings={displayed}
            activeSlug={activeSlug}
            hoverSlug={hoverSlug}
            basemap={basemap}
            onSelect={selectFromMap}
          />
        ) : (
          <div className="size-full bg-ground" />
        )}
      </div>

      {/* Basemap switch, bottom-left, away from the result panel. */}
      <div className="panel absolute bottom-3 left-2 z-20 hidden p-1 sm:left-3 sm:block">
        <div className="segment">
          {BASEMAPS.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={basemap === b.id}
              onClick={() => setBasemap(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zone chips: the legend and the cluster filter, one control. */}
      <div className="absolute inset-x-0 bottom-3 z-20 hidden px-2 sm:px-3 lg:block">
        <div className="panel mx-auto flex w-fit max-w-full items-center gap-1.5 overflow-x-auto p-1.5 scrollbar-slim">
          {CLUSTERS.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              data-zone
              aria-pressed={filters.clusters.includes(c)}
              style={{ ["--zone" as string]: zoneOf(c) }}
              onClick={() => toggleCluster(c)}
            >
              <span className="chip-dot" aria-hidden="true" />
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Filter sheet. Floating panel on desktop, full sheet on phones. */}
      {filtersOpen ? (
        <div
          className="absolute inset-0 z-40 bg-[rgba(16,24,40,0.35)] lg:bg-transparent"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="panel absolute inset-x-0 bottom-0 top-16 flex flex-col overflow-hidden sm:inset-x-3 lg:inset-auto lg:bottom-3 lg:left-3 lg:top-[calc(var(--topbar-h)+1.25rem)] lg:w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-lg">Filters</h2>
              <button type="button" className="btn-quiet" onClick={() => setFiltersOpen(false)}>
                Show {fmtNumber(result.total)}
              </button>
            </div>
            <FilterRail
              filters={filters}
              patch={patch}
              clearAll={clearAll}
              shown={result.total}
              total={all.length}
            />
          </div>
        </div>
      ) : null}

      {/* Results: the map text-equivalent, always reachable. */}
      <section
        id="results"
        aria-label="Matching listings"
        className={`panel absolute z-20 flex flex-col overflow-hidden transition-transform ${
          listOpen ? "translate-y-0" : "translate-y-[calc(100%-3.5rem)]"
        } inset-x-2 bottom-2 top-[46%] sm:inset-x-3 lg:inset-x-auto lg:right-3 lg:top-[calc(var(--topbar-h)+1.25rem)] lg:bottom-3 lg:w-[390px] lg:translate-y-0`}
      >
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <button
            type="button"
            className="chip"
            aria-pressed={activeCount > 0}
            onClick={() => setFiltersOpen(true)}
          >
            Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          </button>
          <p className="text-sm" aria-live="polite">
            <span className="num">{fmtNumber(result.total)}</span>{" "}
            <span className="text-muted">{result.total === 1 ? "match" : "matches"}</span>
          </p>
          <button
            type="button"
            className="btn-quiet ms-auto !min-h-8 !px-2.5 lg:hidden"
            aria-expanded={listOpen}
            onClick={() => setListOpen((v) => !v)}
          >
            {listOpen ? "Hide list" : "Show list"}
          </button>
        </div>

        {/* What the null contract cost, and the one control that reverses it. */}
        {!filters.loose && result.nullExclusions.length > 0 ? (
          <div className="border-b border-line bg-[rgba(27,110,243,0.05)] px-3 py-2.5">
            <p className="text-sm">
              <span className="num">{fmtNumber(result.nullExcludedTotal)}</span> more{" "}
              {result.nullExcludedTotal === 1 ? "listing does" : "listings do"} not state{" "}
              {result.nullExclusions.map((n) => n.label).join(" or ")}. Unstated does not mean
              absent — these are worth a call.
            </p>
            <button
              type="button"
              className="btn-action mt-2 !min-h-8"
              onClick={() => patch({ loose: true })}
            >
              Include them
            </button>
          </div>
        ) : null}

        {filters.loose ? (
          <div className="border-b border-line px-3 py-2">
            <button
              type="button"
              className="text-sm text-action underline"
              onClick={() => patch({ loose: false })}
            >
              Exclude listings that do not state these specs
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim">
          {result.total === 0 ? (
            <div className="px-4 py-6">
              <p className="text-base">
                No shed matches all {activeCount} {activeCount === 1 ? "filter" : "filters"}.
                {result.closestMiss
                  ? ` The closest miss is ${describeMiss(result.closestMiss)}.`
                  : ""}
              </p>
              <button type="button" className="btn-quiet mt-3" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 p-2.5">
                {visible.map((listing) => (
                  <div
                    key={listing.slug}
                    data-leaving={leaving.has(listing.slug)}
                    className="result-card"
                  >
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
                <div className="px-2.5 pb-3">
                  <button
                    type="button"
                    className="btn-quiet w-full"
                    onClick={() => setLimit((n) => n + PAGE_SIZE)}
                  >
                    Show {Math.min(PAGE_SIZE, displayed.length - limit)} more
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <noscript>
          <p className="border-t border-line px-3 py-2 text-sm text-muted">
            Filters need JavaScript. Browse a cluster instead:{" "}
            {CLUSTERS.map((c) => (
              <a key={c} href={`/${clusterSlug(c)}`} className="underline">
                {c}{" "}
              </a>
            ))}
          </p>
        </noscript>
      </section>
    </div>
  );
}
