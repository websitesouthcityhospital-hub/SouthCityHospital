import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project")
  );
}

let browserClientInstance: any = null;
let serverClientInstance: any = null;

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // If executing in Node.js / Next.js Server Runtime / API routes
  if (typeof window === "undefined") {
    if (!serverClientInstance) {
      serverClientInstance = createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return serverClientInstance;
  }

  // If executing in browser environment
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClientInstance;
}
