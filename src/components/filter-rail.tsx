"use client";

import { fmtNumber, fmtRupees } from "@/lib/derive";
import {
  AREA_MAX,
  AREA_MIN,
  HEIGHT_MAX,
  HEIGHT_MIN,
  HEIGHT_STEP,
  POWER_MAX,
  POWER_MIN,
  POWER_STEP,
  RATE_MAX,
  RATE_MIN,
  RENT_MAX,
  RENT_MIN,
  activeFilterCount,
  type CraneFilter,
  type Filters,
} from "@/lib/filters";
import { zoneOf } from "@/lib/clusters";
import { CLUSTERS, FLOORING_TYPES } from "@/lib/types";

import { CheckboxList, Chip, ChipRow, DualRange, MinRange, Toggle } from "./filter-controls";

/* Log scale so the small end of the area range is usable. */
const areaScale = (n: number) => Math.round(Math.log(n) * 100);
const areaUnscale = (s: number) => Math.round(Math.exp(s / 100) / 100) * 100;

/** The sizes managers actually ask for, in sq ft. */
const AREA_CHIPS = [25_000, 50_000, 100_000];

const CRANE_CHIPS: { label: string; value: CraneFilter | null }[] = [
  { label: "Any", value: null },
  { label: "Provision only", value: "provision" },
  { label: "5T+", value: 5 },
  { label: "10T+", value: 10 },
  { label: "20T+", value: 20 },
];

/** Reads the live crane value, whichever chip (if any) happens to match it. */
const craneReadout = (v: CraneFilter | null) => {
  if (v === null) return "any";
  if (v === "provision") return "provision";
  return `${v}T+`;
};

const DOCK_CHIPS = [
  { label: "Any", value: null },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "4+", value: 4 },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="group-heading">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

type Props = {
  filters: Filters;
  patch: (next: Partial<Filters>, history?: "push" | "replace") => void;
  clearAll: () => void;
  shown: number;
  total: number;
};

/**
 * Spec filters come first because they are the reason the site exists - area
 * and rent sit below them, not at the top where a property portal would put
 * them.
 */
export function FilterRail({ filters, patch, clearAll, shown, total }: Props) {
  const active = activeFilterCount(filters);

  return (
    // flex-1 rather than h-full: as a flex child under the sheet's own header,
    // h-full resolved to the whole sheet and pushed the footer - the count and
    // Clear all - below the viewport on phones, where overflow-hidden ate it.
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <Group title="Building specs">
          <div>
            <MinRange
              label="Clear height at centre"
              value={filters.minHeight}
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              step={HEIGHT_STEP}
              format={(n) => `${n.toFixed(1)}m+`}
              onChange={(v) => patch({ minHeight: v }, "replace")}
            />
            <div className="mt-1.5">
              <ChipRow>
                {[9, 12, 15].map((h) => (
                  <Chip
                    key={h}
                    label={`${h}m+`}
                    pressed={filters.minHeight === h}
                    onClick={() => patch({ minHeight: filters.minHeight === h ? null : h })}
                  />
                ))}
              </ChipRow>
            </div>
          </div>

          <div>
            {/* The readout is driven by the value, not by a matching chip, so a
                crane constraint from a shared URL can never be invisible. */}
            <div className="flex items-baseline justify-between">
              <span className="field-label">Crane capacity</span>
              <span className="num text-sm">{craneReadout(filters.crane)}</span>
            </div>
            <ChipRow>
              {CRANE_CHIPS.map((c) => (
                <Chip
                  key={c.label}
                  label={c.label}
                  pressed={c.value !== null && filters.crane === c.value}
                  onClick={() => patch({ crane: c.value })}
                />
              ))}
            </ChipRow>
            {/* The one meaningful zero in the data, and not guessable from the
                chip alone. */}
            <p className="label mt-1.5">
              Provision only means the gantry provision is cast but no crane is fitted.
            </p>
          </div>

          <div>
            <MinRange
              label="Sanctioned power"
              value={filters.minPower}
              min={POWER_MIN}
              max={POWER_MAX}
              step={POWER_STEP}
              format={(n) => `${fmtNumber(n)} HP+`}
              onChange={(v) => patch({ minPower: v }, "replace")}
            />
            <div className="mt-1.5">
              <ChipRow>
                {[50, 100, 150].map((p) => (
                  <Chip
                    key={p}
                    label={`${p}+`}
                    pressed={filters.minPower === p}
                    onClick={() => patch({ minPower: filters.minPower === p ? null : p })}
                  />
                ))}
              </ChipRow>
            </div>
          </div>

          <CheckboxList
            label="Flooring"
            options={FLOORING_TYPES}
            selected={filters.flooring}
            onChange={(next) => patch({ flooring: next })}
          />

          <div>
            <span className="field-label">Docks</span>
            <ChipRow>
              {DOCK_CHIPS.map((d) => (
                <Chip
                  key={d.label}
                  label={d.label}
                  pressed={d.value !== null && filters.minDocks === d.value}
                  onClick={() => patch({ minDocks: d.value })}
                />
              ))}
            </ChipRow>
          </div>

          <Toggle
            label="Fire system present"
            checked={filters.fire}
            onChange={(v) => patch({ fire: v })}
          />
          <Toggle
            label="Factory plan approved"
            checked={filters.factoryPlan}
            onChange={(v) => patch({ factoryPlan: v })}
          />
        </Group>

        <Group title="Size">
          <div>
            <DualRange
              label="Total built-up"
              low={filters.minArea}
              high={filters.maxArea}
              min={AREA_MIN}
              max={AREA_MAX}
              format={(n) => `${fmtNumber(n)}`}
              scale={areaScale}
              unscale={areaUnscale}
              onChange={(lo, hi) => patch({ minArea: lo, maxArea: hi }, "replace")}
            />
            {/* Area is the requirement a manager usually arrives holding, so it
                gets the same one-tap shortcuts the spec rows have. */}
            <div className="mt-1.5">
              <ChipRow>
                {AREA_CHIPS.map((a) => (
                  <Chip
                    key={a}
                    label={`${fmtNumber(a)}+`}
                    pressed={filters.minArea === a}
                    onClick={() => patch({ minArea: filters.minArea === a ? null : a })}
                  />
                ))}
              </ChipRow>
            </div>
          </div>
        </Group>

        <Group title="Commercials">
          <DualRange
            label="Rate per sq ft"
            low={filters.minRate}
            high={filters.maxRate}
            min={RATE_MIN}
            max={RATE_MAX}
            format={(n) => fmtRupees(n)}
            onChange={(lo, hi) => patch({ minRate: lo, maxRate: hi }, "replace")}
          />
          <DualRange
            label="Monthly rent"
            low={filters.minRent}
            high={filters.maxRent}
            min={RENT_MIN}
            max={RENT_MAX}
            step={100_000}
            format={(n) => `${fmtRupees(Math.round(n / 100_000))}L`}
            onChange={(lo, hi) => patch({ minRent: lo, maxRent: hi }, "replace")}
          />
        </Group>

        <Group title="Location">
          <div>
            <span className="field-label">Cluster</span>
            <ChipRow>
              {CLUSTERS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  zone={zoneOf(c)}
                  pressed={filters.clusters.includes(c)}
                  onClick={() =>
                    patch({
                      clusters: filters.clusters.includes(c)
                        ? filters.clusters.filter((x) => x !== c)
                        : [...filters.clusters, c],
                    })
                  }
                />
              ))}
            </ChipRow>
          </div>
        </Group>

        <Group title="Status">
          <Toggle
            label="Include leased out"
            checked={filters.includeLeased}
            onChange={(v) => patch({ includeLeased: v })}
          />
        </Group>
      </div>

      <div className="flex items-baseline justify-between border-t border-line px-4 py-2.5">
        <p className="text-sm">
          Showing <span className="num">{fmtNumber(shown)}</span> of{" "}
          <span className="num">{fmtNumber(total)}</span>
        </p>
        {active > 0 ? (
          <button type="button" onClick={clearAll} className="text-sm underline">
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}
