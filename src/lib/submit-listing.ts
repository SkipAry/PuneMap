"use server";

import { AVAILABILITY, CLUSTERS, FLOORING_TYPES, PROPERTY_TYPES } from "./types";

export type SubmitState = {
  ok: boolean;
  message: string;
  /** Field name to focus, when one field is at fault. */
  field?: string;
  /**
   * What was submitted, echoed back so a rejected form can be refilled. React
   * resets an uncontrolled form once the action resolves, and a broker who
   * mistypes one digit should not lose the other fourteen fields.
   */
  values?: Record<string, string>;
} | null;

const text = (fd: FormData, key: string, max = 400): string | null => {
  const raw = fd.get(key);
  if (typeof raw !== "string") return null;
  const t = raw.trim().slice(0, max);
  return t === "" ? null : t;
};

const num = (fd: FormData, key: string): number | null => {
  const t = text(fd, key, 24);
  if (t === null) return null;
  const n = Number(t.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Indian mobile numbers are ten digits starting 6-9, optionally +91 prefixed. */
const normalisePhone = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10 || !/^[6-9]/.test(local)) return null;
  return `+91${local}`;
};

/**
 * Takes a broker or owner submission and files it for review. Nothing here is
 * ever published automatically: rows land in `listing_submissions` with status
 * 'New' and the site owner promotes accepted ones into `listings` by hand.
 */
export async function submitListing(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // Honeypot: a real person never fills a field they cannot see.
  if (text(formData, "company_website") !== null) {
    return { ok: true, message: "Thanks - we have your details and will be in touch." };
  }

  // Everything the sender typed, minus the honeypot, ready to hand back with
  // any rejection.
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "company_website" && typeof value === "string") values[key] = value;
  }
  const fail = (message: string, field: string): SubmitState => ({
    ok: false,
    message,
    field,
    values,
  });

  const contact_name = text(formData, "contact_name", 120);
  const phoneRaw = text(formData, "contact_phone", 32);
  const cluster = text(formData, "cluster", 40);
  const property_type = text(formData, "property_type", 40);

  if (!contact_name) return fail("Add your name so we know who to call.", "contact_name");
  if (!phoneRaw) {
    return fail("Add a phone number - it is how we confirm the details.", "contact_phone");
  }

  const contact_phone = normalisePhone(phoneRaw);
  if (!contact_phone) {
    return fail(
      "That does not look like a 10-digit Indian mobile number.",
      "contact_phone",
    );
  }

  if (!cluster || !CLUSTERS.includes(cluster as (typeof CLUSTERS)[number])) {
    return fail("Pick the cluster the property sits in.", "cluster");
  }
  if (!property_type || !PROPERTY_TYPES.includes(property_type as (typeof PROPERTY_TYPES)[number])) {
    return fail("Pick what kind of property this is.", "property_type");
  }

  const flooring = text(formData, "flooring", 40);
  const availability = text(formData, "availability", 40);

  const row = {
    contact_name,
    contact_phone,
    contact_email: text(formData, "contact_email", 160),
    is_owner: formData.get("is_owner") === "on",
    cluster,
    locality: text(formData, "locality", 200),
    property_type,
    total_builtup: num(formData, "total_builtup"),
    height_m: num(formData, "height_m"),
    crane_capacity_ton: num(formData, "crane_capacity_ton"),
    power_hp: num(formData, "power_hp"),
    flooring:
      flooring && FLOORING_TYPES.includes(flooring as (typeof FLOORING_TYPES)[number])
        ? flooring
        : null,
    docks: num(formData, "docks"),
    rate_per_sqft: num(formData, "rate_per_sqft"),
    notes: [
      text(formData, "notes", 1200),
      availability && AVAILABILITY.includes(availability as (typeof AVAILABILITY)[number])
        ? `Availability: ${availability}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Better to say so than to accept a submission into nowhere.
    return {
      ok: false,
      message:
        "Submissions are not connected yet, so this would go nowhere. Please call or WhatsApp us instead - we will add your property the same day.",
      values,
    };
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await db.from("listing_submissions").insert(row);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("listing submission failed:", err);
    return {
      ok: false,
      message: "Something broke on our side and your details were not saved. Please try again.",
      values,
    };
  }

  return {
    ok: true,
    message:
      "Filed for review. We verify each property before it goes on the map, and will call you on that number to confirm the details.",
  };
}
