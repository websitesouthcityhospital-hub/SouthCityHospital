import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createServerClient();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
  } catch {
    // Ignore Supabase signout errors
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
