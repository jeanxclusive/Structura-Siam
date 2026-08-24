-- ============================================================
-- Structura Siam — Lead Capture
-- Run this once in Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- pgcrypto provides gen_random_uuid(). Supabase projects usually have
-- this enabled already, but this line is safe to run either way.
create extension if not exists "pgcrypto";

-- ---- Table -------------------------------------------------
create table if not exists public.enquiries (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  email               text not null,
  phone               text not null,
  business_name       text,                 -- optional: owner may not have a company yet
  service_interested  text,
  message             text not null,
  status              text not null default 'new',   -- e.g. new / contacted / closed
  created_at          timestamptz not null default now()
);

comment on table public.enquiries is 'Leads submitted through the Structura Siam website contact form.';

-- ---- Row Level Security -------------------------------------
-- RLS is off by default (fully open). Turning it on with only an
-- INSERT policy means: public visitors can submit, but cannot read,
-- update, or delete anything — including their own submission.
alter table public.enquiries enable row level security;

-- Allow the public "anon" key (used by the website) to insert new leads.
create policy "Public can submit enquiries"
  on public.enquiries
  for insert
  to anon
  with check (true);

-- No SELECT policy for anon -> public visitors cannot read any rows.
-- No UPDATE policy for anon -> public visitors cannot edit rows.
-- No DELETE policy for anon -> public visitors cannot delete rows.
--
-- You still have full visibility as the site owner: open the
-- Supabase Dashboard -> Table Editor -> enquiries. Your dashboard
-- session authenticates with the service_role key, which bypasses
-- RLS entirely — so this doubles as your "admin view" without
-- building a separate admin system.
