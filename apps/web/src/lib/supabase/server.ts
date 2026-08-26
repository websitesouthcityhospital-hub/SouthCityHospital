import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!);
}

export function createAdminClient() {
  if (!isSupabaseConfigured() || !supabaseServiceKey) {
    return null;
  }
  return createSupabaseClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
