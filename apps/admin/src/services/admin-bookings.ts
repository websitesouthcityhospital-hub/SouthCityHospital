import type { Appointment, AppointmentStatus } from "@sch/types";
import { createClient } from "@/lib/supabase/client";

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
      console.warn("Supabase bookings fetch error:", err);
    }
  }

  return [];
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
          .select("*, doctors(name), departments(name)")
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
        const cleanDigits = clean.replace(/\D/g, "");
        const { data, error } = await supabase
          .from("appointments")
          .select("*, doctors(name), departments(name)")
          .ilike("patient_phone", `%${cleanDigits}%`)
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
      console.warn("Supabase search error:", err);
    }
  }

  return { isPhoneSearch: isReference ? false : true, results: [] };
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
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);

      if (!error) {
        return { success: true };
      }
      return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: "Database client unavailable" };
}

export interface DashboardMetrics {
  totalToday: number;
  remainingToday: number;
  unavailableDoctorsToday: number;
  patientsTriagedToday: number;
  todayAppointments: Appointment[];
  recentRegistrations: Appointment[];
  forecast7Days: Array<{ dateStr: string; dayLabel: string; count: number }>;
}

export async function fetchOperationalDashboard(todayStr: string): Promise<DashboardMetrics> {
  const supabase = createClient();

  const emptyResult: DashboardMetrics = {
    totalToday: 0,
    remainingToday: 0,
    unavailableDoctorsToday: 0,
    patientsTriagedToday: 0,
    todayAppointments: [],
    recentRegistrations: [],
    forecast7Days: Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        dateStr: d.toISOString().split("T")[0],
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      };
    }),
  };

  if (!supabase) return emptyResult;

  try {
    // 1. Fetch today's appointments
    const { data: todayData } = await supabase
      .from("appointments")
      .select("*, doctors(name), departments(name)")
      .eq("preferred_date", todayStr)
      .order("preferred_time_slot", { ascending: true });

    const todayList: Appointment[] = (todayData || []).map((a: any) => ({
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

    // 2. Fetch doctors unavailable today
    const { data: allDoctors } = await supabase.from("doctors").select("id").eq("active", true);
    let unavailableDoctorsCount = 0;
    if (allDoctors) {
      await Promise.all(
        allDoctors.map(async (doc: any) => {
          try {
            const { data: avail } = await supabase.rpc("get_doctor_availability_range", {
              p_doctor_id: doc.id,
              p_target_date: todayStr,
            });
            if (avail && avail.available === false) {
              unavailableDoctorsCount++;
            }
          } catch (e) {
            console.warn("Failed to fetch availability for doctor", doc.id);
          }
        })
      );
    }

    // 3. Fetch recent appointments
    const { data: recentData } = await supabase
      .from("appointments")
      .select("*, doctors(name), departments(name)")
      .order("created_at", { ascending: false })
      .limit(6);

    const recentList: Appointment[] = (recentData || []).map((a: any) => ({
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

    // 4. Fetch 7-day forecast
    const d0 = new Date();
    const dEnd = new Date();
    dEnd.setDate(dEnd.getDate() + 7);

    const { data: forecastData } = await supabase
      .from("appointments")
      .select("preferred_date")
      .gte("preferred_date", d0.toISOString().split("T")[0])
      .lte("preferred_date", dEnd.toISOString().split("T")[0]);

    const forecast7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const count = (forecastData || []).filter((row: any) => row.preferred_date === dateStr).length;
      return {
        dateStr,
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      };
    });

    const totalToday = todayList.length;
    const remainingToday = todayList.filter(
      (a) => a.status !== "Completed" && a.status !== "Cancelled"
    ).length;
    const patientsTriagedToday = new Set(todayList.map((a) => a.patientPhone.replace(/\D/g, ""))).size;

    return {
      totalToday,
      remainingToday,
      unavailableDoctorsToday: unavailableDoctorsCount,
      patientsTriagedToday,
      todayAppointments: todayList,
      recentRegistrations: recentList,
      forecast7Days,
    };
  } catch (err) {
    console.warn("Supabase dashboard metrics error:", err);
    return emptyResult;
  }
}
