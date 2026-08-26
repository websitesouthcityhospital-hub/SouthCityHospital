import type {
  DoctorWeeklySchedule,
  DoctorAvailabilityException,
} from "@sch/types";

const SCHEDULES_STORAGE_KEY = "sch_doctor_weekly_schedules";
const EXCEPTIONS_STORAGE_KEY = "sch_doctor_exceptions";

const DEFAULT_WEEKLY_SCHEDULES: DoctorWeeklySchedule[] = [];

export function getStoredWeeklySchedules(): DoctorWeeklySchedule[] {
  if (typeof window === "undefined") return DEFAULT_WEEKLY_SCHEDULES;
  try {
    const raw = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_WEEKLY_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WEEKLY_SCHEDULES;
  }
}

export function saveStoredWeeklySchedules(schedules: DoctorWeeklySchedule[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  } catch (err) {
    console.error("Failed to save weekly schedules", err);
  }
}

export function getStoredExceptions(): DoctorAvailabilityException[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXCEPTIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredExceptions(exceptions: DoctorAvailabilityException[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXCEPTIONS_STORAGE_KEY, JSON.stringify(exceptions));
  } catch (err) {
    console.error("Failed to save exceptions", err);
  }
}

export function addOrUpdateException(exception: DoctorAvailabilityException): void {
  const all = getStoredExceptions();
  const existingIndex = all.findIndex(
    (e) => e.doctorId === exception.doctorId && e.date === exception.date
  );

  if (existingIndex >= 0) {
    all[existingIndex] = exception;
  } else {
    all.push(exception);
  }

  saveStoredExceptions(all);
}

export function removeException(doctorId: string, date: string): void {
  const all = getStoredExceptions();
  const filtered = all.filter(
    (e) => !(e.doctorId === doctorId && e.date === date)
  );
  saveStoredExceptions(filtered);
}
