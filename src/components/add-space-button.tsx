"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AddSpaceForm } from "./add-space-form";

/**
 * The nav action, and the sheet it opens.
 *
 * A native <dialog> carries focus trapping, Esc, inertness and the backdrop, so
 * none of that is hand-rolled. Without JavaScript the control degrades to a
 * link to /list-your-space, which renders the same form as a page.
 */
export function AddSpaceButton() {
  const ref = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => ref.current?.close(), []);

  // Clicking the backdrop closes; clicking the panel must not.
  const onBackdropClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) ref.current.close();
  }, []);

  return (
    <>
      <a
        href="/list-your-space"
        className="btn-action"
        onClick={
          mounted
            ? (e) => {
                e.preventDefault();
                ref.current?.showModal();
              }
            : undefined
        }
      >
        <span aria-hidden="true">+</span>
        <span className="hidden sm:inline">Add space for free</span>
        <span className="sm:hidden">Add space</span>
      </a>

      <dialog ref={ref} className="sheet" onClick={onBackdropClick} aria-labelledby="add-space-title">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-4">
          <div>
            <h2 id="add-space-title" className="text-xl">
              List your space, free
            </h2>
            <p className="label mt-0.5">
              Brokers and owners — we review every property before it goes on the map.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="btn-quiet !min-h-8 !px-2.5"
          >
            ✕
          </button>
        </div>
        <AddSpaceForm onDone={close} />
      </dialog>
    </>
  );
}
