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
import { ListingCard, SampleNotice } from "./listing-card";
import { SiteHeader } from "./site-header";
import { SiteMenu } from "./site-menu";

const ListingMap = dynamic(() => import("./listing-map"), {
  ssr: false,
  loading: () => <div className="size-full bg-ground" />,
});

/**
 * Areas run to six figures, and a dial is a hundred pixels wide. "2,50,000"
 * does not fit and "2.5L" is not what a spec sheet says, so thousands it is.
 * Only the dial uses this - a listing still shows its area in full.
 */
const compactSqft = (n: number) => (n >= 1_000 ? `${Math.round(n / 1000)}k` : fmtNumber(n));

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
  const [listOpen, setListOpen] = useState(false);

  const filtersRef = useRef<HTMLDialogElement>(null);
  const openFilters = useCallback(() => filtersRef.current?.showModal(), []);
  const closeFilters = useCallback(() => filtersRef.current?.close(), []);

  const selectFromMap = useCallback((slug: string) => {
    setActiveSlug(slug);
    setListOpen(true);
    const node = document.getElementById(`card-${slug}`);
    node?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const visible = displayed.slice(0, limit);
  const activeCount = activeFilterCount(filters);

  /* Counts are of what is actually on offer, matching the cluster pages. */
  const clusterCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const l of all) {
      if (l.availability === "Leased out") continue;
      out[l.cluster] = (out[l.cluster] ?? 0) + 1;
    }
    return out;
  }, [all]);

  /*
    What the listings actually span on each spec. An untouched dial shows this
    rather than the word "Any": a requirement block that has not been touched
    yet should still be telling the reader what there is to ask for.
  */
  const spans = useMemo(() => {
    const span = (pick: (l: Listing) => number | null, fmt: (n: number) => string) => {
      const vs = all.map(pick).filter((v): v is number => v !== null);
      if (vs.length === 0) return "—";
      const lo = Math.min(...vs);
      const hi = Math.max(...vs);
      return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
    };
    const floors = new Set(all.map((l) => l.flooring).filter(Boolean));
    return {
      height: span((l) => l.height_m, (n) => n.toFixed(1)),
      crane: span((l) => l.crane_capacity_ton, (n) => String(n)),
      power: span((l) => l.power_hp, fmtNumber),
      docks: span((l) => l.docks, (n) => String(n)),
      floor: `${floors.size} kinds`,
      area: span((l) => l.total_builtup, compactSqft),
    };
  }, [all]);

  /*
    The six dials, in spec order. Area and rent sit last because putting them
    first is the inversion this product exists to refuse.
  */
  const dials = [
    { k: "Height", set: filters.minHeight !== null,
      v: filters.minHeight === null ? spans.height : filters.minHeight.toFixed(1),
      u: filters.minHeight === null ? "m" : "m+" },
    { k: "Crane", set: filters.crane !== null,
      v: filters.crane === null ? spans.crane : filters.crane === "provision" ? "Prov." : String(filters.crane),
      u: filters.crane === null ? "T" : typeof filters.crane === "number" ? "T+" : "" },
    { k: "Power", set: filters.minPower !== null,
      v: filters.minPower === null ? spans.power : fmtNumber(filters.minPower),
      u: filters.minPower === null ? "HP" : "HP+" },
    { k: "Docks", set: filters.minDocks !== null && filters.minDocks > 0,
      v: filters.minDocks ? String(filters.minDocks) : spans.docks,
      u: filters.minDocks ? "+" : "" },
    { k: "Floor", set: filters.flooring.length > 0,
      v: filters.flooring.length === 0 ? spans.floor
        : filters.flooring.length === 1 ? filters.flooring[0]
        : `${filters.flooring.length} types`,
      u: "" },
    { k: "Area", set: filters.minArea !== null,
      v: filters.minArea === null ? spans.area : compactSqft(filters.minArea),
      u: filters.minArea === null ? "sq ft" : "sq ft+" },
  ];

  const toggleCluster = (c: string) =>
    patch({
      clusters: filters.clusters.includes(c)
        ? filters.clusters.filter((x) => x !== c)
        : [...filters.clusters, c],
    });

  return (
    /* The map is the ground. Everything else floats on it: the masthead, the
       result column, and the filters when they replace that column. */
    <div className="shell fixed inset-0 overflow-hidden">
      <SiteHeader
        floating
        subtitle="Sheds, warehouses and factory buildings on rent around Pune"
        counts={clusterCounts}
        menu={
          <SiteMenu
            clusters={filters.clusters}
            counts={clusterCounts}
            onToggle={toggleCluster}
          />
        }
      />

      {/* The filter set waits off-canvas beside the menu and slides in from the
          same edge, so nothing covers the map until it is asked for. */}
      <dialog
        ref={filtersRef}
        className="drawer drawer--wide"
        onClick={(e) => {
          if (e.target === filtersRef.current) filtersRef.current.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg">Filters</h2>
            <button type="button" className="btn-quiet" onClick={closeFilters}>
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
      </dialog>

      {/* Results: the map text-equivalent, always reachable. */}
      <section
        id="results"
        aria-label="Matching listings"
        // Position lives in .results-dock; data-open drives the sheet states.
        data-open={listOpen ? "true" : "false"}
        className="panel results-dock flex flex-col overflow-hidden"
      >
        {/* The card headings are h3, so the list needs its own h2 to keep the
            document outline unbroken. Visually redundant with the count. */}
        <h2 className="sr-only">Matching listings</h2>

        {/* Phone: one compact bar, because the sheet has to stay a sheet. */}
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5 panel:hidden">
          <button
            type="button"
            className="chip"
            aria-pressed={activeCount > 0}
            onClick={openFilters}
          >
            Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          </button>
          <p className="text-sm" aria-live="polite">
            <span className="num">{fmtNumber(result.total)}</span>{" "}
            <span className="text-muted">{result.total === 1 ? "match" : "matches"}</span>
          </p>
          <button
            type="button"
            className="btn-quiet ms-auto !min-h-8 !px-2.5"
            aria-expanded={listOpen}
            onClick={() => setListOpen((v) => !v)}
          >
            {listOpen ? "Hide list" : "Show list"}
          </button>
        </div>

        {/*
          Wide: the requirement stands above the results it produces and does
          not scroll away with them. Each dial opens the full set at the group
          it names, so a value is never more than one press from being changed.
        */}
        <div className="hidden shrink-0 border-b border-line px-4 pb-4 pt-4 panel:block">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg">Requirement</h2>
            <p className="label">unset shows what the listings span</p>
          </div>

          <div className="dial-grid mt-3">
            {dials.map((d) => (
              <button
                key={d.k}
                type="button"
                className="dial"
                data-set={d.set ? "true" : "false"}
                onClick={openFilters}
              >
                <span className="k">{d.k}</span>
                <span className="v">
                  {d.v}
                  {d.u ? <span className="u">{d.u}</span> : null}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-sm" aria-live="polite">
              <span className="num font-bold">{fmtNumber(result.total)}</span>{" "}
              <span className="text-muted">
                {result.total === 1 ? "match" : "matches"} of {fmtNumber(all.length)}
              </span>
            </p>
            <button
              type="button"
              className="ms-auto text-sm text-action underline"
              onClick={openFilters}
            >
              All filters{activeCount > 0 ? ` · ${activeCount}` : ""}
            </button>
          </div>
        </div>

        {/* Reads the whole set, not the filtered page: a count and a map full of
            pins imply real inventory whatever the current filters show. */}
        <SampleNotice listings={all} />

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

      {/*
        The map pane. Its controls sit inside it rather than on the shell, so
        they float over the map they belong to and never over the rail.
      */}
      <div className="shell-map absolute inset-0">
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

        <div className="panel absolute bottom-3 left-3 z-20 hidden p-1 sm:block">
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
      </div>
    </div>
  );
}
