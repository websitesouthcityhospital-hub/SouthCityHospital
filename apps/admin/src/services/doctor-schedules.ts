import type {
  DoctorWeeklySchedule,
  DoctorAvailabilityException,
  ExceptionType,
  DayOfWeek,
} from "@sch/types";
import { createClient } from "@/lib/supabase/client";

export async function fetchWeeklySchedules(doctorId?: string): Promise<DoctorWeeklySchedule[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      let query = supabase.from("doctor_weekly_schedules").select("*");
      if (doctorId) {
        query = query.eq("doctor_id", doctorId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          doctorId: row.doctor_id,
          dayOfWeek: row.day_of_week as DayOfWeek,
          startTime: row.start_time,
          endTime: row.end_time,
          slotDurationMinutes: row.slot_duration_minutes || 30,
          isActive: row.is_active ?? true,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetchWeeklySchedules error:", err);
    }
  }
  return [];
}

export async function saveWeeklySchedules(
  doctorId: string,
  schedules: DoctorWeeklySchedule[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      // 1. Remove existing schedules for this doctor
      await supabase.from("doctor_weekly_schedules").delete().eq("doctor_id", doctorId);

      // 2. Insert updated schedules
      if (schedules.length > 0) {
        const rows = schedules.map((s) => ({
          id: s.id || `sched-${doctorId}-${s.dayOfWeek.toLowerCase()}-${Date.now()}`,
          doctor_id: doctorId,
          day_of_week: s.dayOfWeek,
          start_time: s.startTime,
          end_time: s.endTime,
          slot_duration_minutes: s.slotDurationMinutes || 30,
          is_active: s.isActive ?? true,
        }));

        const { error } = await supabase.from("doctor_weekly_schedules").insert(rows);
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error("Supabase saveWeeklySchedules error:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Database client unavailable" };
}

export async function fetchDoctorExceptions(doctorId?: string): Promise<DoctorAvailabilityException[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      let query = supabase.from("doctor_exceptions").select("*");
      if (doctorId) {
        query = query.eq("doctor_id", doctorId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          doctorId: row.doctor_id,
          date: row.date,
          type: row.type as ExceptionType,
          reason: row.reason || undefined,
          startTime: row.start_time || undefined,
          endTime: row.end_time || undefined,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetchDoctorExceptions error:", err);
    }
  }
  return [];
}

export async function addOrUpdateException(
  exception: DoctorAvailabilityException
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      const row = {
        id: exception.id || `ex-${exception.doctorId}-${exception.date}`,
        doctor_id: exception.doctorId,
        date: exception.date,
        type: exception.type,
        reason: exception.reason || null,
        start_time: exception.startTime || null,
        end_time: exception.endTime || null,
      };

      const { error } = await supabase
        .from("doctor_exceptions")
        .upsert(row, { onConflict: "doctor_id,date" });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Supabase addOrUpdateException error:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Database client unavailable" };
}

export async function removeException(
  doctorId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("doctor_exceptions")
        .delete()
        .eq("doctor_id", doctorId)
        .eq("date", date);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Supabase removeException error:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Database client unavailable" };
}
