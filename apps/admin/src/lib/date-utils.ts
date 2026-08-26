import type { ConsultationSchedule } from "@sch/types";

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getAvailableDaysOfWeek(schedules: ConsultationSchedule[]): Set<number> {
  const allowed = new Set<number>();

  for (const item of schedules) {
    const raw = item.day.toLowerCase().replace(/\s+/g, "");
    
    if (raw.includes("–") || raw.includes("-") || raw.includes("to")) {
      const separator = raw.includes("–") ? "–" : raw.includes("-") ? "-" : "to";
      const [startStr, endStr] = raw.split(separator);
      const startDay = DAY_MAP[startStr];
      const endDay = DAY_MAP[endStr];

      if (startDay !== undefined && endDay !== undefined) {
        if (startDay <= endDay) {
          for (let d = startDay; d <= endDay; d++) allowed.add(d);
        } else {
          for (let d = startDay; d <= 6; d++) allowed.add(d);
          for (let d = 0; d <= endDay; d++) allowed.add(d);
        }
      }
    } else {
      const dayNum = DAY_MAP[raw];
      if (dayNum !== undefined) allowed.add(dayNum);
    }
  }

  return allowed;
}

export function isDateOnDoctorSchedule(
  dateStr: string,
  schedules: ConsultationSchedule[]
): { valid: boolean; dayName: string; matchingSchedule?: ConsultationSchedule } {
  if (!dateStr) return { valid: false, dayName: "" };
  
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayIndex = dateObj.getDay();
  const dayName = DAY_NAMES[dayIndex];

  if (!schedules || schedules.length === 0) {
    return { valid: true, dayName };
  }

  const allowedDays = getAvailableDaysOfWeek(schedules);
  const valid = allowedDays.has(dayIndex);

  let matchingSchedule: ConsultationSchedule | undefined;
  if (valid) {
    matchingSchedule = schedules.find((s) => {
      const allowed = getAvailableDaysOfWeek([s]);
      return allowed.has(dayIndex);
    });
  }

  return { valid, dayName, matchingSchedule };
}

export function format12Hour(time24?: string | null): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
