import { DASH, NOT_STATED, fmtCount, fmtCrane, fmtHeight, fmtPower, fmtText } from "@/lib/derive";
import type { Listing } from "@/lib/types";

export type SpecCell = { label: string; value: string };

/** The strip's cells are fixed-width, so long floor names get a short form. */
const FLOOR_SHORT: Record<string, string> = { "Plain RCC": "RCC", Unknown: "Unkn." };
const shortFlooring = (v: string | null) =>
  v === null ? fmtText(v) : (FLOOR_SHORT[v] ?? v);

/**
 * The five specs, always in this order. The detail table repeats the order so
 * the eye already knows the layout when it gets there.
 */
export function specCells(l: Listing): SpecCell[] {
  return [
    { label: "height", value: fmtHeight(l.height_m) },
    { label: "crane", value: fmtCrane(l.crane_capacity_ton) },
    { label: "power", value: fmtPower(l.power_hp) },
    { label: "docks", value: fmtCount(l.docks) },
    { label: "floor", value: shortFlooring(l.flooring) },
  ];
}

/**
 * Five fixed cells, number over a hairline-ruled label - the title block of an
 * engineering drawing. The grid never collapses or reorders: that alignment is
 * what lets a user scan twenty cards and compare the same number in the same
 * position every time.
 */
export function SpecStrip({ listing }: { listing: Listing }) {
  const cells = specCells(listing);

  return (
    <dl className="spec-strip">
      {cells.map((cell) => {
        const unknown = cell.value === DASH;
        return (
          <div key={cell.label} className="spec-cell">
            <dd
              className={`num spec-value ${unknown ? "text-steel" : ""}`}
              title={unknown ? NOT_STATED : undefined}
            >
              {cell.value}
            </dd>
            <div className="spec-rule" aria-hidden="true" />
            <dt className="spec-label">{cell.label}</dt>
          </div>
        );
      })}
    </dl>
  );
}
