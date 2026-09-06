"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

import { zoneOf } from "@/lib/clusters";
import { CLUSTERS, clusterSlug } from "@/lib/types";

/**
 * Sections and clusters, in a drawer that slides in on request.
 *
 * They were a permanent 244px rail, which cost the map a quarter of its width
 * on every screen whether or not anyone was navigating. The map is the thing
 * being read; navigation is something you reach for. So it waits off-canvas.
 *
 * Built on a native <dialog>: the browser owns focus trapping, Esc and making
 * the page behind it inert, none of which is worth reimplementing.
 *
 * Drawn icons rather than glyph characters: an emoji standing in for an icon
 * set renders differently on every platform and belongs to none of them.
 */

const ICONS = {
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
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
  close: <path d="M4 4l8 8M12 4l-8 8" />,
} as const;

function Icon({ name, size = 15 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export function SiteMenu({
  active = "search",
  clusters = [],
  counts,
  onToggle,
}: {
  active?: "search" | "list" | "about";
  /** Selected clusters, when the menu is filtering a live search. */
  clusters?: string[];
  counts: Record<string, number>;
  /**
   * Present on the search screen, where a cluster is a filter to toggle. Absent
   * on a reading page, where the same row is a link to that cluster instead -
   * one menu, two jobs, rather than two to keep in step.
   */
  onToggle?: (cluster: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  const close = useCallback(() => ref.current?.close(), []);

  // A drawer that fills the height still has a backdrop to its right, and a
  // click there should dismiss it the way a scrim does.
  const onBackdropClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) ref.current.close();
  }, []);

  // Navigating away from a page that opened it would otherwise leave the
  // drawer standing in front of the page the user asked for.
  useEffect(() => close, [close]);

  return (
    <>
      <button
        type="button"
        className="icon-btn"
        aria-label="Sections and clusters"
        onClick={() => ref.current?.showModal()}
      >
        <Icon name="menu" size={16} />
      </button>

      <dialog ref={ref} className="drawer" onClick={onBackdropClick}>
        <nav className="flex h-full flex-col p-2.5" aria-label="Sections and clusters">
          <div className="flex items-center gap-2 px-2 pb-3.5 pt-1">
            <span className="text-[0.9375rem] font-bold leading-tight tracking-[-0.012em]">
              Pune Industrial Space
            </span>
            <button
              type="button"
              className="icon-btn ms-auto"
              aria-label="Close menu"
              onClick={close}
            >
              <Icon name="close" size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            <Link
              className="rail-link"
              href="/search"
              aria-current={active === "search" ? "page" : undefined}
              onClick={close}
            >
              <span className="ic">
                <Icon name="search" />
              </span>
              Search the map
            </Link>
            <Link
              className="rail-link"
              href="/list-your-space"
              aria-current={active === "list" ? "page" : undefined}
              onClick={close}
            >
              <span className="ic">
                <Icon name="plus" />
              </span>
              List a property
            </Link>
            <Link
              className="rail-link"
              href="/about"
              aria-current={active === "about" ? "page" : undefined}
              onClick={close}
            >
              <span className="ic">
                <Icon name="info" />
              </span>
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
                  onClick={() => {
                    onToggle(c);
                    close();
                  }}
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
                  onClick={close}
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
              onClick={close}
            >
              List it free, no fee
            </Link>
          </div>
        </nav>
      </dialog>
    </>
  );
}
