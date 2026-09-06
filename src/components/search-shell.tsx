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

import { AddSpaceButton } from "./add-space-button";
import { FilterRail } from "./filter-rail";
import { ListingCard, SampleNotice } from "./listing-card";
import { SiteMenu } from "./site-menu";

const ListingMap = dynamic(() => import("./listing-map"), {
  ssr: false,
  loading: () => <div className="size-full bg-ground" />,
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Map or list. The map is the default; the list is the same rows, read down. */
type View = "map" | "list";

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
  const [view, setView] = useState<View>("map");

  const filtersRef = useRef<HTMLDialogElement>(null);
  const openFilters = useCallback(() => filtersRef.current?.showModal(), []);
  const closeFilters = useCallback(() => filtersRef.current?.close(), []);

  /*
    Typing is the one filter that must not push a history entry per keystroke,
    so the field is local and the URL is caught up on a pause.
  */
  const [q, setQ] = useState(filters.q);
  useEffect(() => setQ(filters.q), [filters.q]);
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => write({ ...filters, q }, "replace"), 250);
    return () => clearTimeout(t);
  }, [q, filters, write]);

  const selectFromMap = useCallback((slug: string) => {
    setActiveSlug(slug);
    setView("list");
    // The card is in a list that has just been mounted, so wait a frame.
    requestAnimationFrame(() => {
      const node = document.getElementById(`card-${slug}`);
      node?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
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

  const toggleCluster = (c: string) =>
    patch({
      clusters: filters.clusters.includes(c)
        ? filters.clusters.filter((x) => x !== c)
        : [...filters.clusters, c],
    });

  const countLine = (
    <>
      <span className="num">{fmtNumber(result.total)}</span>{" "}
      <span className="text-muted">
        {result.total === 1 ? "match" : "matches"} of {fmtNumber(all.length)}
      </span>
    </>
  );

  return (
    /* The map is the page. Everything else is chrome floating on it. */
    <div className="shell fixed inset-0 overflow-hidden">
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
      </div>

      {/*
        One band across the top of the map. It is transparent with a hairline
        under it, and every control in it is its own translucent tile, so the
        territory still reads through the bar instead of being walled off.
      */}
      <div className="toolbar">
        <div className="toolbar-inner">
          <div className="tool tool-brand">
            <SiteMenu
              clusters={filters.clusters}
              counts={clusterCounts}
              onToggle={toggleCluster}
              onFilters={openFilters}
              activeFilters={activeCount}
            />
            <span className="hidden truncate pe-2.5 text-sm font-bold tracking-[-0.012em] lg:block">
              Pune Industrial Space
            </span>
          </div>

          <div className="tool-seg tool-seg--view">
            <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>
              Map
            </button>
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
              List
            </button>
          </div>

          <label className="tool-field">
            <span className="sr-only">Search by locality, cluster or building type</span>
            <svg
              viewBox="0 0 16 16"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.2" />
              <path d="M10.2 10.2 14 14" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Chakan, MIDC Phase II, warehouse…"
            />
          </label>

          <button
            type="button"
            className="tool-btn"
            aria-pressed={activeCount > 0}
            onClick={openFilters}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2.5 4.5h11M2.5 11.5h11" />
              <circle cx="6" cy="4.5" r="1.6" />
              <circle cx="10.5" cy="11.5" r="1.6" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 ? <span className="num">{activeCount}</span> : null}
          </button>

          <div className="tool-seg tool-seg--basemap">
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

          <div className="flex-none">
            <AddSpaceButton />
          </div>
        </div>
      </div>

      {/* Reads the whole set, not the filtered page: a count and a map full of
          pins imply real inventory whatever the current filters show. */}
      <div className="notice-strip">
        <div className="panel overflow-hidden">
          <SampleNotice listings={all} />
        </div>
      </div>

      {/* ── The list. Same rows as the map, read down instead of across. ── */}
      {view === "list" ? (
        <div className="list-view panel">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <h2 className="text-base font-bold">Matching listings</h2>
            <p className="ms-auto text-sm" aria-live="polite">
              {countLine}
            </p>
          </div>

          {/* What the null contract cost, and the one control that reverses it. */}
          {!filters.loose && result.nullExclusions.length > 0 ? (
            <div className="border-b border-line bg-[rgba(27,110,243,0.05)] px-4 py-2.5">
              <p className="text-sm">
                <span className="num">{fmtNumber(result.nullExcludedTotal)}</span> more{" "}
                {result.nullExcludedTotal === 1 ? "listing does" : "listings do"} not state{" "}
                {result.nullExclusions.map((n) => n.label).join(" or ")}. Unstated does not
                mean absent — these are worth a call.
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
            <div className="border-b border-line px-4 py-2">
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
                  No shed matches all {activeCount}{" "}
                  {activeCount === 1 ? "filter" : "filters"}.
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
                <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-3">
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
                  <div className="px-3 pb-4">
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
        </div>
      ) : null}

      {/*
        Clusters along the bottom. They were here once, as loose chips that the
        result panel covered two to four of at every width. There is no result
        panel over the map any more, so they can come back - and they now sit
        in one tray rather than floating individually.
      */}
      <div className="chipbar">
        <div className="chipbar-tray scrollbar-none">
          {/* Phone has no room for Map/List in the bar, so the switch rides
              here, where a thumb already is. */}
          <button
            type="button"
            className="chip chip--view sm:hidden"
            onClick={() => setView((v) => (v === "map" ? "list" : "map"))}
          >
            {view === "map" ? "List" : "Map"}
            <span className="num">{fmtNumber(result.total)}</span>
          </button>

          <button
            type="button"
            className="chip"
            aria-pressed={filters.clusters.length === 0}
            onClick={() => patch({ clusters: [] })}
          >
            All Pune
            <span className="num opacity-70">{fmtNumber(all.length)}</span>
          </button>

          {CLUSTERS.filter((c) => clusterCounts[c]).map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              data-zone=""
              aria-pressed={filters.clusters.includes(c)}
              style={{ ["--zone" as string]: zoneOf(c) }}
              onClick={() => toggleCluster(c)}
            >
              <span className="chip-dot" aria-hidden="true" />
              {c}
              <span className="num opacity-70">{clusterCounts[c]}</span>
            </button>
          ))}
        </div>
      </div>

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

      <noscript>
        <p className="panel absolute inset-x-3 bottom-20 z-30 px-3 py-2 text-sm text-muted">
          Filters need JavaScript. Browse a cluster instead:{" "}
          {CLUSTERS.map((c) => (
            <a key={c} href={`/${clusterSlug(c)}`} className="underline">
              {c}{" "}
            </a>
          ))}
        </p>
      </noscript>
    </div>
  );
}
