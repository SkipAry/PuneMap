/**
 * Whether the reader has asked the system for less motion.
 *
 * It lived as a local const in the search shell, so the one other place that
 * scrolls the page - the submission form, moving to the field it rejected -
 * scrolled smoothly whatever the reader had asked for. That is the worst
 * moment to move the page under someone: they have just been told they got
 * something wrong.
 *
 * Read at the call site rather than cached: the preference can change while
 * the page is open, and this is cheap.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The scroll behaviour that honours it. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}
