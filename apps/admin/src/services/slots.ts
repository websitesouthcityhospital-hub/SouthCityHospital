/**
 * Shared Doctor Availability Slot Service for Admin Portal
 * Calls Supabase get_doctor_availability_range RPC directly.
 */

import { createClient } from "@/lib/supabase/client";

export interface AvailabilityRangeResponse {
  available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  error?: string;
}

export async function fetchDoctorAvailabilityRange(
  doctorId: string,
  targetDate: string
): Promise<AvailabilityRangeResponse> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("get_doctor_availability_range", {
        p_doctor_id: doctorId,
        p_target_date: targetDate,
      });

      if (!error && data) {
        return {
          available: data.available,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason,
        };
      }
    } catch (err) {
      console.warn("Error calling get_doctor_availability_range in admin:", err);
    }
  }

  // Admin OPD hours default window preview if offline / local dev
  return {
    available: true,
    start_time: "09:00 AM",
    end_time: "05:00 PM",
    reason: null,
  };
}
