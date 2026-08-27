import { createClient } from "@/lib/supabase/client";

export interface ContactQuery {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
}

export async function fetchContactQueries(): Promise<ContactQuery[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("contact_queries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact queries:", error);
    throw new Error(error.message);
  }

  return data as ContactQuery[];
}

export async function updateContactQueryStatus(id: string, status: "new" | "in_progress" | "resolved") {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("contact_queries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating query status:", error);
    throw new Error(error.message);
  }

  return true;
}
