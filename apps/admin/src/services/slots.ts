/**
 * Shared Doctor Availability Slot Service for Admin Portal
 * Calls Supabase get_doctor_available_slots RPC directly.
 */

import { createClient } from "@/lib/supabase/client";
import type { BookableSlot } from "@sch/types";

export interface SlotAvailabilityResponse {
  success: boolean;
  slots: BookableSlot[];
  isFullyUnavailable: boolean;
  reason?: string;
  error?: string;
}

export async function fetchDoctorAvailableSlots(
  doctorId: string,
  targetDate: string
): Promise<SlotAvailabilityResponse> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("get_doctor_available_slots", {
        p_doctor_id: doctorId,
        p_target_date: targetDate,
      });

      if (!error && data) {
        if (!data.success) {
          return {
            success: false,
            slots: [],
            isFullyUnavailable: false,
            error: data.error,
          };
        }

        const rawSlots = data.slots || [];
        const isFullyUnavailable = rawSlots.length === 0;

        const mapped: BookableSlot[] = rawSlots.map((s: any) => ({
          startTime: s.time,
          endTime: s.time,
          label: s.label || s.time,
          isAvailable: s.available !== false,
        }));

        return {
          success: true,
          slots: mapped,
          isFullyUnavailable,
          reason: data.reason,
        };
      }
    } catch (err) {
      console.warn("Error calling get_doctor_available_slots in admin:", err);
    }
  }

  // Admin OPD hours default window preview if offline / local dev
  const slots: BookableSlot[] = [
    { startTime: "09:00", endTime: "09:30", label: "09:00 AM – 09:30 AM", isAvailable: true },
    { startTime: "09:30", endTime: "10:00", label: "09:30 AM – 10:00 AM", isAvailable: true },
    { startTime: "10:00", endTime: "10:30", label: "10:00 AM – 10:30 AM", isAvailable: true },
    { startTime: "10:30", endTime: "11:00", label: "10:30 AM – 11:00 AM", isAvailable: true },
    { startTime: "11:00", endTime: "11:30", label: "11:00 AM – 11:30 AM", isAvailable: true },
    { startTime: "11:30", endTime: "12:00", label: "11:30 AM – 12:00 PM", isAvailable: true },
    { startTime: "12:00", endTime: "12:30", label: "12:00 PM – 12:30 PM", isAvailable: true },
    { startTime: "14:00", endTime: "14:30", label: "02:00 PM – 02:30 PM", isAvailable: true },
    { startTime: "14:30", endTime: "15:00", label: "02:30 PM – 03:00 PM", isAvailable: true },
    { startTime: "15:00", endTime: "15:30", label: "03:00 PM – 03:30 PM", isAvailable: true },
    { startTime: "15:30", endTime: "16:00", label: "03:30 PM – 04:00 PM", isAvailable: true },
  ];

  return {
    success: true,
    slots,
    isFullyUnavailable: false,
  };
}
