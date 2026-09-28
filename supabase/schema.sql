-- Charge On Electric: lead pipeline schema (Supabase / Postgres)
-- Run in the Supabase SQL editor. The website writes with the service-role key
-- from the server only. RLS is enabled with no public policies, so the anon key
-- can't read or write anything.

create extension if not exists pgcrypto;

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text,
  phone_e164 text,
  preferred_contact_method text,
  sms_consent boolean default false,
  email_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  address_line_1 text not null,
  address_line_2 text,
  city text,
  state text default 'CA',
  postal_code text,
  country text default 'US',
  property_type text,
  occupancy_type text,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) not null,
  property_id uuid references properties(id),
  service_type text not null,
  lead_type text,
  lead_stage text not null default 'new',
  priority_score integer default 0,
  project_summary text,
  timeline text,
  source text,
  medium text,
  campaign text,
  term text,
  content text,
  landing_page text,
  referrer text,
  gclid text,
  gbraid text,
  wbraid text,
  fbclid text,
  msclkid text,
  device_type text,
  consent_version text,
  event_id text,
  in_service_area boolean,
  assigned_to uuid,
  next_followup_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists leads_stage_idx on leads (lead_stage, created_at desc);

create table if not exists lead_intake_details (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade not null,
  ev_owned boolean,
  vehicle_make_model text,
  charger_location text,
  panel_size_text text,
  commercial_property_type text,
  projected_charger_count integer,
  existing_service_known text,
  raw_form_data jsonb,
  created_at timestamptz default now()
);

create table if not exists lead_attachments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade not null,
  storage_path text not null,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  attachment_type text,
  created_at timestamptz default now()
);

create table if not exists communications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  contact_id uuid references contacts(id),
  channel text not null,
  direction text not null,
  body text,
  external_id text,
  status text,
  occurred_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) not null,
  appointment_type text not null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  assigned_to uuid,
  status text default 'scheduled',
  notes text,
  created_at timestamptz default now()
);

create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) not null,
  estimate_number text unique,
  status text default 'draft',
  scope_summary text,
  total_amount numeric(12,2),
  sent_at timestamptz,
  expires_at timestamptz,
  accepted_at timestamptz,
  declined_reason text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  status text default 'draft',
  service_type text,
  city text,
  region text,
  challenge text,
  scope text,
  outcome text,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  storage_path text not null,
  alt_text text not null,
  sort_order integer default 0,
  consent_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  reviewer_display_name text,
  rating numeric(2,1),
  review_text text,
  review_url text,
  service_type text,
  permission_status text default 'unknown',
  published boolean default false,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- Lock everything down: only the server (service role) can access.
alter table contacts enable row level security;
alter table properties enable row level security;
alter table leads enable row level security;
alter table lead_intake_details enable row level security;
alter table lead_attachments enable row level security;
alter table communications enable row level security;
alter table appointments enable row level security;
alter table estimates enable row level security;
alter table projects enable row level security;
alter table project_media enable row level security;
alter table reviews enable row level security;

-- Private bucket for customer uploads (panel photos, site plans).
insert into storage.buckets (id, name, public)
values ('lead-uploads', 'lead-uploads', false)
on conflict (id) do nothing;
