import { createClient } from "@/lib/supabase/client";

export async function submitContactQuery(data: {
  name: string;
  phone: string;
  email?: string;
  message: string;
}) {
  const supabase = createClient();
  if (!supabase) throw new Error("Database connection not configured.");

  const { error } = await supabase
    .from("contact_queries")
    .insert([
      {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message,
      },
    ]);

  if (error) {
    console.error("Error submitting contact query:", error);
    throw new Error(error.message);
  }

  return true;
}
