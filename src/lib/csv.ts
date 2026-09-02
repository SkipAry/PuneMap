import type { Listing } from "./types.ts";

/**
 * Minimal RFC4180 reader: handles quoted fields, embedded commas, doubled quotes
 * and CRLF. The owner exports this from a spreadsheet, so quoted commas are the
 * normal case, not an edge case.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** "" -> null. Anything the broker did not state stays null forever. */
const str = (v: string | undefined): string | null => {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
};

const num = (v: string | undefined): number | null => {
  const t = str(v);
  if (t === null) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const bool = (v: string | undefined): boolean | null => {
  const t = str(v)?.toLowerCase();
  if (t === null || t === undefined) return null;
  if (t === "true" || t === "yes" || t === "y" || t === "1") return true;
  if (t === "false" || t === "no" || t === "n" || t === "0") return false;
  return null;
};

/**
 * Maps CSV rows onto Listing by header name, so column order in the owner's
 * spreadsheet does not have to match the table.
 */
export function listingsFromCsv(text: string): Listing[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim());
  const at = (row: string[], key: string) => {
    const i = header.indexOf(key);
    return i === -1 ? undefined : row[i];
  };

  return rows.slice(1).map((row, index) => ({
    id: index + 1,
    slug: str(at(row, "slug")) ?? `listing-${index + 1}`,
    cluster: str(at(row, "cluster")) ?? "Other",
    locality: str(at(row, "locality")),
    property_type: str(at(row, "property_type")) ?? "Shed",
    lat: num(at(row, "lat")),
    lng: num(at(row, "lng")),
    shed_area: num(at(row, "shed_area")),
    office_area: num(at(row, "office_area")),
    total_builtup: num(at(row, "total_builtup")),
    open_area: num(at(row, "open_area")),
    height_m: num(at(row, "height_m")),
    crane_capacity_ton: num(at(row, "crane_capacity_ton")),
    crane_count: num(at(row, "crane_count")),
    power_hp: num(at(row, "power_hp")),
    flooring: str(at(row, "flooring")),
    floor_load_mt: num(at(row, "floor_load_mt")),
    docks: num(at(row, "docks")),
    ramps: num(at(row, "ramps")),
    fire_system: str(at(row, "fire_system")),
    factory_plan_approved: bool(at(row, "factory_plan_approved")),
    parking_slots: num(at(row, "parking_slots")),
    rate_per_sqft: num(at(row, "rate_per_sqft")),
    quoted_monthly_rent: num(at(row, "quoted_monthly_rent")),
    deposit_months: num(at(row, "deposit_months")),
    availability: str(at(row, "availability")) ?? "Ready",
    broker_name: str(at(row, "broker_name")),
    broker_phone: str(at(row, "broker_phone")),
    source_url: str(at(row, "source_url")),
    notes: str(at(row, "notes")),
    last_verified: str(at(row, "last_verified")) ?? "",
  }));
}
