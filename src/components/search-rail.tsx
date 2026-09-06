"use client";

import Link from "next/link";

import { zoneOf } from "@/lib/clusters";
import { CLUSTERS, clusterSlug } from "@/lib/types";

/**
 * The navigation rail, and the permanent home of the nine clusters.
 *
 * They used to be chips floating along the bottom of the map, where the result
 * panel covered between two and four of them at every width they rendered, and
 * a click on a covered one opened an unrelated listing. A rail cannot be
 * covered by a panel, because there is no panel.
 *
 * Drawn icons rather than glyph characters: an emoji standing in for an icon
 * set renders differently on every platform and belongs to none of them.
 */

const ICONS = {
  search: (
    <>
      <circle cx="7" cy="7" r="4.2" />
      <path d="M10.2 10.2 14 14" />
    </>
  ),
  plus: <path d="M8 3.2v9.6M3.2 8h9.6" />,
  info: (
    <>
      <circle cx="8" cy="8" r="5.6" />
      <path d="M8 7.4v3.8M8 5v.1" />
    </>
  ),
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <span className="ic" aria-hidden="true">
      <svg
        viewBox="0 0 16 16"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[name]}
      </svg>
    </span>
  );
}

export function SearchRail({
  active = "search",
  clusters = [],
  counts,
  onToggle,
}: {
  active?: "search" | "list" | "about";
  /** Selected clusters, when the rail is filtering a live search. */
  clusters?: string[];
  counts: Record<string, number>;
  /**
   * Present on the search screen, where a cluster is a filter to toggle. Absent
   * on a reading page, where the same row is a link to that cluster instead -
   * one rail, two jobs, rather than two rails to keep in step.
   */
  onToggle?: (cluster: string) => void;
}) {
  return (
    <nav className="rail" aria-label="Sections and clusters">
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-1">
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-[7px] bg-ink text-sm font-bold text-white"
        >
          P
        </span>
        <span className="text-[0.9375rem] font-bold leading-tight tracking-[-0.012em]">
          Pune Industrial Space
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {active === "search" ? (
          <span className="rail-link" aria-current="page">
            <Icon name="search" />
            Search
          </span>
        ) : (
          <Link className="rail-link" href="/search">
            <Icon name="search" />
            Search
          </Link>
        )}
        <Link
          className="rail-link"
          href="/list-your-space"
          aria-current={active === "list" ? "page" : undefined}
        >
          <Icon name="plus" />
          List a property
        </Link>
        <Link
          className="rail-link"
          href="/about"
          aria-current={active === "about" ? "page" : undefined}
        >
          <Icon name="info" />
          About
        </Link>
      </div>

      <hr className="mx-2 my-3.5 border-0 border-t border-line" />

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim">
        <p className="label px-2 pb-2">Clusters</p>
        {CLUSTERS.filter((c) => counts[c]).map((c) =>
          onToggle ? (
            <button
              key={c}
              type="button"
              className="cluster-row"
              aria-pressed={clusters.includes(c)}
              style={{ ["--zone" as string]: zoneOf(c) }}
              onClick={() => onToggle(c)}
            >
              <span className="dot" aria-hidden="true" />
              {c}
              <span className="n">{counts[c]}</span>
            </button>
          ) : (
            <Link
              key={c}
              href={`/${clusterSlug(c)}`}
              className="cluster-row"
              style={{ ["--zone" as string]: zoneOf(c) }}
            >
              <span className="dot" aria-hidden="true" />
              {c}
              <span className="n">{counts[c]}</span>
            </Link>
          ),
        )}
      </div>

      <div className="mt-3 border-t border-line px-2 pt-3">
        <p className="text-[0.78125rem] text-muted">Own or broker a shed?</p>
        <Link
          href="/list-your-space"
          className="text-[0.78125rem] font-semibold text-action underline"
        >
          List it free, no fee
        </Link>
      </div>
    </nav>
  );
}
