-- Owners and brokers submit a property here; the site owner reviews each row in
-- the Supabase table editor and copies the accepted ones into `listings`.
-- Nothing submitted is ever published automatically.
create table listing_submissions (
  id                  bigint generated always as identity primary key,

  -- Contact. The only genuinely required block: everything else can be
  -- confirmed on the phone, which is the point of reviewing before listing.
  contact_name        text not null,
  contact_phone       text not null,
  contact_email       text,
  is_owner            boolean,

  -- Where and what.
  cluster             text not null,
  locality            text,
  property_type       text not null,

  -- Specs, all optional. Incomplete submissions are expected and fine - the
  -- product renders unstated values as unstated rather than guessing them.
  total_builtup       integer,
  height_m            numeric(4,1),
  crane_capacity_ton  numeric(5,1),
  power_hp            integer,
  flooring            text,
  docks               smallint,
  rate_per_sqft       numeric(6,2),

  notes               text,

  status              text not null default 'New',  -- New | Contacted | Listed | Rejected
  review_note         text,
  created_at          timestamptz default now()
);

create index on listing_submissions (status);
create index on listing_submissions (created_at desc);

alter table listing_submissions enable row level security;

-- The public may add a submission and nothing else. There is deliberately no
-- select policy: submissions carry contact details and are readable only with
-- the service role, i.e. the owner in the dashboard.
create policy "anyone may submit a property"
  on listing_submissions for insert
  to anon, authenticated
  with check (true);
