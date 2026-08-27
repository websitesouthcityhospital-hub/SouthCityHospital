/**
 * Doctor data-fetching service
 *
 * Fetches exclusively from Supabase `doctors` database table and `/api/doctors` endpoint.
 * Zero hardcoded doctors.
 */

import { useQuery } from "@tanstack/react-query";
import type { Doctor, DoctorFilterParams } from "@sch/types";
import { createClient } from "@/lib/supabase/client";

async function fetchDoctors(params: DoctorFilterParams = {}): Promise<Doctor[]> {
  // 1. Try Supabase direct client if configured
  const supabase = createClient();
  if (supabase) {
    try {
      let query = supabase.from("doctors").select("*");

      if (params.activeOnly !== false) {
        query = query.eq("active", true);
      }

      if (params.departmentSlug && params.departmentSlug !== "all") {
        query = query.eq("department_slug", params.departmentSlug);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          departmentSlug: d.department_slug,
          qualifications: d.qualifications || [],
          experienceYears: d.experience_years || 0,
          consultationSchedule: d.consultation_schedule || [],
          photoUrl: d.photo_url || null,
          active: d.active ?? true,
          biography: d.biography || null,
          languages: d.languages || ["English", "Bengali", "Hindi"],
          registrationNumber: d.registration_number || "PENDING",
        }));
      }
    } catch (err) {
      console.warn("Direct Supabase query failed, querying /api/doctors:", err);
    }
  }

  // 2. Fetch from backend API /api/doctors
  try {
    const url = new URL("/api/doctors", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (params.departmentSlug) url.searchParams.set("departmentSlug", params.departmentSlug);
    if (params.activeOnly !== undefined) url.searchParams.set("activeOnly", String(params.activeOnly));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.doctors)) {
        return json.doctors;
      }
    }
  } catch (err) {
    console.error("Failed to fetch doctors from /api/doctors:", err);
  }

  return [];
}

// ─── Public Service API ───────────────────────────────────────────────────────

export async function getDoctors(params: DoctorFilterParams = {}): Promise<Doctor[]> {
  return fetchDoctors(params);
}

// ─── React Query Hook ─────────────────────────────────────────────────────────

export function useDoctors(params: DoctorFilterParams = {}) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => fetchDoctors(params),
    staleTime: 1000 * 5, // 5 seconds
    refetchOnWindowFocus: true,
  });
}
