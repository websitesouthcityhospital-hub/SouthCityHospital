import type { Appointment, AppointmentStatus } from "@sch/types";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "sch_appointments_store";

function getStoredAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error("Failed to persist appointment", err);
  }
}

/**
 * Fetches all appointments for a given date, optionally filtered by doctor ID.
 */
export async function getBookingsForDate(
  dateStr: string,
  doctorId?: string
): Promise<Appointment[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      let query = supabase
        .from("appointments")
        .select("*")
        .eq("preferred_date", dateStr)
        .order("created_at", { ascending: true });

      if (doctorId && doctorId !== "all") {
        query = query.eq("doctor_id", doctorId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((a: any) => ({
          id: a.id,
          bookingReference: a.booking_reference,
          doctorId: a.doctor_id,
          doctorName: a.doctor_name || "Specialist",
          departmentSlug: a.department_slug,
          departmentName: a.department_name || "Department",
          patientName: a.patient_name,
          patientPhone: a.patient_phone,
          patientDob: a.patient_dob,
          preferredDate: a.preferred_date,
          preferredTimeSlot: a.preferred_time_slot,
          message: a.message,
          status: a.status,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase bookings fetch fallback:", err);
    }
  }

  // Local fallback
  const all = getStoredAppointments();
  return all.filter((a) => {
    const matchDate = a.preferredDate === dateStr;
    const matchDoc = !doctorId || doctorId === "all" || a.doctorId === doctorId;
    return matchDate && matchDoc;
  });
}

/**
 * Unified Search (Part O.1):
 * Differentiates Reference number search (exact single match) vs Phone number search (all history).
 */
export async function searchBookingsAdmin(query: string): Promise<{
  isPhoneSearch: boolean;
  results: Appointment[];
}> {
  const clean = query.trim();
  if (!clean) return { isPhoneSearch: false, results: [] };

  const isReference = clean.toUpperCase().startsWith("SCH-");
  const all = getStoredAppointments();

  if (isReference) {
    const targetRef = clean.toUpperCase();
    const found = all.filter((a) => a.bookingReference.toUpperCase() === targetRef);
    return { isPhoneSearch: false, results: found };
  } else {
    // Phone search: normalize by removing non-digits
    const queryDigits = clean.replace(/\D/g, "");
    const found = all
      .filter((a) => {
        const storedDigits = a.patientPhone.replace(/\D/g, "");
        return storedDigits.endsWith(queryDigits) || queryDigits.endsWith(storedDigits);
      })
      .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());

    return { isPhoneSearch: true, results: found };
  }
}

/**
 * Updates status of an appointment. (Admin-only mutation)
 */
export async function updateBookingStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  const all = getStoredAppointments();
  const target = all.find((a) => a.id === appointmentId);

  if (!target) {
    return { success: false, error: "Appointment not found." };
  }

  target.status = newStatus;
  target.updatedAt = new Date().toISOString();
  saveAppointments(all);

  return { success: true };
}

/**
 * Calculates operational dashboard metrics. (Admin-only)
 */
export async function getDashboardStats(): Promise<{
  totalToday: number;
  confirmedToday: number;
  completedToday: number;
  totalAllTime: number;
  activeDoctors: number;
}> {
  const todayStr = new Date().toISOString().split("T")[0];
  const all = getStoredAppointments();
  const todayList = all.filter((a) => a.preferredDate === todayStr);

  return {
    totalToday: todayList.length,
    confirmedToday: todayList.filter((a) => a.status === "Confirmed").length,
    completedToday: todayList.filter((a) => a.status === "Completed").length,
    totalAllTime: all.length,
    activeDoctors: 6,
  };
}
