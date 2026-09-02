create table listings (
  id                  bigint generated always as identity primary key,
  slug                text unique not null,          -- "chakan-45000-sqft-shed-13m-crane"
  cluster             text not null,                 -- Chakan | Bhosari | Talegaon | Ranjangaon | Wagholi | Nigdi | Hinjawadi | Pirangut | Other
  locality            text,                          -- "Chakan MIDC, near Courtyard Marriott"
  property_type       text not null,                 -- Shed | Warehouse | Factory building | Industrial plot
  lat                 double precision,
  lng                 double precision,

  -- areas, sq ft
  shed_area           integer,
  office_area         integer,
  total_builtup       integer,
  open_area           integer,

  -- the spec fields that make this product exist
  height_m            numeric(4,1),                  -- clear height at centre
  crane_capacity_ton  numeric(5,1),
  crane_count         smallint,
  power_hp            integer,
  flooring            text,                          -- Trimix | Tremix | VDF | Epoxy | Plain RCC | Unknown
  floor_load_mt       numeric(4,1),
  docks               smallint,
  ramps               smallint,
  fire_system         text,                          -- "Sprinkler + hydrant" | "Fire NOC" | null
  factory_plan_approved boolean,
  parking_slots       smallint,

  -- commercials
  rate_per_sqft       numeric(6,2),                  -- Rs / sq ft / month
  quoted_monthly_rent bigint,                        -- Rs, when the broker quotes a lump sum
  deposit_months      smallint,

  availability        text not null default 'Ready', -- Ready | Under construction | Built-to-suit | Leased out
  broker_name         text,
  broker_phone        text,
  source_url          text,
  notes               text,
  last_verified       date not null,
  created_at          timestamptz default now()
);

create index on listings (cluster);
create index on listings (total_builtup);
create index on listings (height_m);
create index on listings (crane_capacity_ton);
create index on listings (power_hp);

-- The site is a public read-only catalogue. Writes happen in the Supabase dashboard
-- under the service role, which bypasses RLS; the anon key may only select.
alter table listings enable row level security;

create policy "listings are publicly readable"
  on listings for select
  to anon, authenticated
  using (true);
