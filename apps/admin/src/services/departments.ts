"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface DepartmentItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export async function fetchDepartments(): Promise<DepartmentItem[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("id, slug, name, description, icon")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id || d.slug,
          slug: d.slug,
          name: d.name,
          description: d.description || "",
          icon: d.icon || "Stethoscope",
        }));
      }
    } catch (err) {
      console.warn("Supabase fetchDepartments error:", err);
    }
  }

  // Fallback if network issue or client not configured
  return [];
}

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments()
      .then((data) => setDepartments(data))
      .finally(() => setIsLoading(false));
  }, []);

  return { departments, isLoading };
}
