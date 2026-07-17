import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "joshouatritto2020@gmail.com";
