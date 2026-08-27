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

export async function getBookingsForDate(
  dateStr: string,
  doctorId?: string
): Promise<Appointment[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          doctors(name),
          departments(name)
        `)
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
          doctorName: a.doctors?.name || a.doctor_name || "Specialist",
          departmentSlug: a.department_slug,
          departmentName: a.departments?.name || a.department_name || "Department",
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

  const all = getStoredAppointments();
  return all.filter((a) => {
    const matchDate = a.preferredDate === dateStr;
    const matchDoc = !doctorId || doctorId === "all" || a.doctorId === doctorId;
    return matchDate && matchDoc;
  });
}

export async function searchBookingsAdmin(query: string): Promise<{
  isPhoneSearch: boolean;
  results: Appointment[];
}> {
  const clean = query.trim();
  if (!clean) return { isPhoneSearch: false, results: [] };

  const isReference = clean.toUpperCase().startsWith("SCH-");
  const supabase = createClient();

  if (supabase) {
    try {
      if (isReference) {
        const targetRef = clean.toUpperCase();
        const { data, error } = await supabase
          .from("appointments")
          .select('*, doctors(name), departments(name)')
          .eq("booking_reference", targetRef);

        if (!error && data) {
          const results = data.map((a: any) => ({
            id: a.id,
            bookingReference: a.booking_reference,
            doctorId: a.doctor_id,
            doctorName: a.doctors?.name || a.doctor_name || "Specialist",
            departmentSlug: a.department_slug,
            departmentName: a.departments?.name || a.department_name || "Department",
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
          return { isPhoneSearch: false, results };
        }
      } else {
        const queryDigits = clean.replace(/\D/g, "");
        const { data, error } = await supabase
          .from("appointments")
          .select('*, doctors(name), departments(name)')
          .like("patient_phone", `%${queryDigits}%`)
          .order("preferred_date", { ascending: false });

        if (!error && data) {
          const results = data.map((a: any) => ({
            id: a.id,
            bookingReference: a.booking_reference,
            doctorId: a.doctor_id,
            doctorName: a.doctors?.name || a.doctor_name || "Specialist",
            departmentSlug: a.department_slug,
            departmentName: a.departments?.name || a.department_name || "Department",
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
          return { isPhoneSearch: true, results };
        }
      }
    } catch (err) {
      console.warn("Supabase search fallback:", err);
    }
  }

  const all = getStoredAppointments();

  if (isReference) {
    const targetRef = clean.toUpperCase();
    const found = all.filter((a) => a.bookingReference.toUpperCase() === targetRef);
    return { isPhoneSearch: false, results: found };
  } else {
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

export async function updateBookingStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", appointmentId);
        
      if (!error) {
        // Also update local storage if it exists, to keep in sync for fallback
        const all = getStoredAppointments();
        const target = all.find((a) => a.id === appointmentId);
        if (target) {
          target.status = newStatus;
          target.updatedAt = new Date().toISOString();
          saveAppointments(all);
        }
        return { success: true };
      }
      console.warn("Supabase update error:", error);
    } catch (err) {
      console.warn("Supabase update fallback:", err);
    }
  }

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

export async function getDashboardStats(): Promise<{
  totalToday: number;
  confirmedToday: number;
  completedToday: number;
  totalAllTime: number;
  activeDoctors: number;
}> {
  const todayStr = new Date().toISOString().split("T")[0];
  const supabase = createClient();

  if (supabase) {
    try {
      const [{ data: todayData }, { count: totalAllTime }, { count: activeDoctors }] = await Promise.all([
        supabase.from("appointments").select("status").eq("preferred_date", todayStr),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("doctors").select("*", { count: "exact", head: true }).eq("active", true),
      ]);

      if (todayData && totalAllTime !== null && activeDoctors !== null) {
        const list = todayData as Array<{ status: string }>;
        return {
          totalToday: list.length,
          confirmedToday: list.filter((a) => a.status === "Confirmed").length,
          completedToday: list.filter((a) => a.status === "Completed").length,
          totalAllTime,
          activeDoctors,
        };
      }
    } catch (err) {
      console.warn("Supabase dashboard stats fallback:", err);
    }
  }

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
