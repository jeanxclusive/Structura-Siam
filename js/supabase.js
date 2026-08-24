// ============================================================
// js/supabase.js
// Creates one shared Supabase client for the whole site.
// ============================================================
//
// WHERE TO GET YOUR KEYS:
//   Supabase Dashboard -> your project -> Project Settings -> API
//     - "Project URL"        -> SUPABASE_URL
//     - "anon" "public" key  -> SUPABASE_ANON_KEY
//
// IS IT SAFE TO PUT THE ANON KEY IN FRONTEND CODE? Yes.
//   The anon key is meant to be public — it identifies your project,
//   not a user. What it's allowed to DO is controlled by the Row
//   Level Security (RLS) policies in /sql/supabase-enquiries.sql,
//   which only allow INSERT on the enquiries table. Never put your
//   "service_role" key in frontend code — that one bypasses RLS
//   entirely and must stay server-side / out of the browser.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/[email protected]/+esm';

const SUPABASE_URL = 'https://pooclgsnrvtqorecfunt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2NsZ3NucnZ0cW9yZWNmdW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjEwMDYsImV4cCI6MjEwMzEzNzAwNn0.4sh0gMjYbI3a_4Kfk2J7uhV3j1DxE2C4HBWvzes_TxY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
