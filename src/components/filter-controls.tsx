"use client";

import { useId } from "react";

/** Toggle chip. Native button + aria-pressed, so it is keyboard-operable. */
export function Chip({
  label,
  pressed,
  onClick,
  /** Cluster chips carry their zone hue, so chip, pin and card edge agree. */
  zone,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  zone?: string;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={pressed}
      data-zone={zone ? "" : undefined}
      style={zone ? ({ ["--zone"]: zone } as React.CSSProperties) : undefined}
      onClick={onClick}
    >
      {zone ? <span className="chip-dot" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

/**
 * Single-ended range. Arrow keys work because it is a real input[type=range];
 * `null` means no constraint and parks the handle at the low end.
 */
export function MinRange({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number | null;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (v: number | null) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <span className="num text-sm">{value === null ? "any" : format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        aria-valuetext={value === null ? "any" : format(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(n <= min ? null : n);
        }}
      />
    </div>
  );
}

/**
 * Two stacked handles rather than an overlapping custom control: each is a real
 * slider with its own label, which keeps arrow-key and screen-reader behaviour
 * intact. `scale`/`unscale` carry the log mapping for area.
 */
export function DualRange({
  label,
  low,
  high,
  min,
  max,
  step = 1,
  format,
  scale = (n) => n,
  unscale = (n) => n,
  onChange,
}: {
  label: string;
  low: number | null;
  high: number | null;
  min: number;
  max: number;
  step?: number;
  format: (n: number) => string;
  /** domain value -> slider position */
  scale?: (n: number) => number;
  /** slider position -> domain value */
  unscale?: (n: number) => number;
  onChange: (low: number | null, high: number | null) => void;
}) {
  const lowId = useId();
  const highId = useId();

  const sMin = scale(min);
  const sMax = scale(max);
  const sLow = scale(low ?? min);
  const sHigh = scale(high ?? max);

  const clean = (v: number, isLow: boolean) =>
    isLow ? (v <= min ? null : v) : v >= max ? null : v;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="field-label">{label}</span>
        <span className="num text-sm">
          {low === null && high === null
            ? "any"
            : `${format(low ?? min)} – ${format(high ?? max)}`}
        </span>
      </div>

      <label className="sr-only" htmlFor={lowId}>
        {label}, minimum
      </label>
      <input
        id={lowId}
        type="range"
        min={sMin}
        max={sMax}
        step={step}
        value={sLow}
        aria-valuetext={format(low ?? min)}
        onChange={(e) => {
          const next = unscale(Number(e.target.value));
          const capped = high !== null && next > high ? high : next;
          onChange(clean(capped, true), high);
        }}
      />

      <label className="sr-only" htmlFor={highId}>
        {label}, maximum
      </label>
      <input
        id={highId}
        type="range"
        min={sMin}
        max={sMax}
        step={step}
        value={sHigh}
        aria-valuetext={format(high ?? max)}
        onChange={(e) => {
          const next = unscale(Number(e.target.value));
          const floored = low !== null && next < low ? low : next;
          onChange(low, clean(floored, false));
        }}
      />
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox"
      />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
}

export function CheckboxList({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {options.map((option) => (
          <Toggle
            key={option}
            label={option}
            checked={selected.includes(option)}
            onChange={(on) =>
              onChange(on ? [...selected, option] : selected.filter((s) => s !== option))
            }
          />
        ))}
      </div>
    </fieldset>
  );
}
