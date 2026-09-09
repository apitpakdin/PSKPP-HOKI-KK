import { createClient } from "@supabase/supabase-js";

// The anon key is safe to ship in client code by design — Supabase enforces
// access with Row Level Security policies on the database side, not by
// keeping this key secret.
const SUPABASE_URL = "https://rixymtsdnbipfokrpugi.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHltdHNkbmJpcGZva3JwdWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MTgzMzYsImV4cCI6MjEwNDQ5NDMzNn0.n9UMjYYC6OqMchThYszK81Tko60vzLtrA6ajXXXZHxg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
