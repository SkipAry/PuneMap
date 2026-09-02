"use client";

import { useActionState } from "react";

import { submitListing, type SubmitState } from "@/lib/submit-listing";
import { AVAILABILITY, CLUSTERS, FLOORING_TYPES, PROPERTY_TYPES } from "@/lib/types";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {hint ? <span className="ms-1.5 font-normal text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/**
 * Broker and owner submission. Contact details and location are required;
 * every spec is optional on purpose - the product treats an unstated spec as
 * unstated rather than guessing it, so a half-filled form is still useful and
 * demanding a full one would just cost submissions.
 */
export function AddSpaceForm({ onDone }: { onDone?: () => void }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitListing, null);

  if (state?.ok) {
    return (
      <div className="px-5 py-6">
        <h2 className="text-xl">Filed for review</h2>
        <p className="mt-2 max-w-[52ch] text-base text-muted">{state.message}</p>
        <div className="mt-5 flex gap-2">
          {onDone ? (
            <button type="button" className="btn-action" onClick={onDone}>
              Done
            </button>
          ) : (
            <a className="btn-action" href="/">
              Back to the map
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="px-5 pb-5">
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-px"
      />

      <p className="mb-4 max-w-[56ch] text-sm text-muted">
        Listing is free. Fill in what you know — every spec below is optional, and we show
        anything you leave blank as “not stated” rather than guessing. We call to confirm
        before it goes on the map.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input name="contact_name" required className="input" placeholder="Kiran Deshmukh" />
        </Field>
        <Field label="Phone">
          <input
            name="contact_phone"
            required
            type="tel"
            inputMode="tel"
            className="input"
            placeholder="98220 14455"
          />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Cluster">
          <select name="cluster" required className="input" defaultValue="">
            <option value="" disabled>
              Select area
            </option>
            {CLUSTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Property type">
          <select name="property_type" required className="input" defaultValue="">
            <option value="" disabled>
              Select type
            </option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Locality" hint="optional">
          <input
            name="locality"
            className="input"
            placeholder="Chakan MIDC Phase II, near Courtyard Marriott"
          />
        </Field>
      </div>

      <fieldset className="mt-5">
        <legend className="field-label mb-2">
          Specs <span className="font-normal text-muted">— all optional</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Built-up (sq ft)">
            <input name="total_builtup" inputMode="numeric" className="input" placeholder="45000" />
          </Field>
          <Field label="Clear height (m)">
            <input name="height_m" inputMode="decimal" className="input" placeholder="13" />
          </Field>
          <Field label="Crane (ton)">
            <input
              name="crane_capacity_ton"
              inputMode="decimal"
              className="input"
              placeholder="10"
            />
          </Field>
          <Field label="Power (HP)">
            <input name="power_hp" inputMode="numeric" className="input" placeholder="100" />
          </Field>
          <Field label="Docks">
            <input name="docks" inputMode="numeric" className="input" placeholder="4" />
          </Field>
          <Field label="Rate (₹/sq ft)">
            <input name="rate_per_sqft" inputMode="decimal" className="input" placeholder="33" />
          </Field>
          <Field label="Flooring">
            <select name="flooring" className="input" defaultValue="">
              <option value="">Not sure</option>
              {FLOORING_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Availability">
            <select name="availability" className="input" defaultValue="Ready">
              {AVAILABILITY.filter((a) => a !== "Leased out").map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Email" hint="optional">
            <input name="contact_email" type="email" className="input" placeholder="you@firm.com" />
          </Field>
        </div>
      </fieldset>

      <div className="mt-3">
        <Field label="Anything else" hint="optional">
          <textarea
            name="notes"
            rows={3}
            className="input"
            placeholder="Two 10T EOT cranes, fire NOC in place, available from March."
          />
        </Field>
      </div>

      <label className="mt-3 flex items-center gap-2">
        <input type="checkbox" name="is_owner" className="checkbox" />
        <span className="text-sm">I own this property (not a broker)</span>
      </label>

      {state && !state.ok ? (
        <p role="alert" className="mt-4 rounded-[10px] bg-[rgba(222,74,95,0.1)] px-3 py-2 text-sm">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
        {onDone ? (
          <button type="button" className="btn-quiet" onClick={onDone}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn-action" disabled={pending}>
          {pending ? "Sending…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}
