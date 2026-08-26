import type {
  DoctorWeeklySchedule,
  DoctorAvailabilityException,
  BookableSlot,
  Appointment,
  DayOfWeek,
} from "@sch/types";
import { format12Hour } from "./date-utils";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // If starts with 91 and has 12 digits, return last 10
  if (digits.startsWith("91") && digits.length === 12) {
    return digits.substring(2);
  }
  return digits;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Single Authority Slot Generator (Part B)
 */
export function computeBookableSlots(
  doctorId: string,
  dateStr: string,
  weeklySchedules: DoctorWeeklySchedule[] = [],
  exceptions: DoctorAvailabilityException[] = [],
  existingAppointments: Appointment[] = []
): {
  slots: BookableSlot[];
  isFullyUnavailable: boolean;
  reason?: string;
} {
  if (!dateStr) return { slots: [], isFullyUnavailable: false };

  // Parse local day of week
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];

  // 1. Check date-specific exception (Part A.4)
  const exception = exceptions.find(
    (e) => e.doctorId === doctorId && e.date === dateStr
  );

  if (exception) {
    if (exception.type === "full_day_unavailable") {
      return {
        slots: [],
        isFullyUnavailable: true,
        reason: exception.reason || "Doctor is unavailable on this date.",
      };
    }
  }

  // 2. Determine time windows to generate slots from
  let ranges: { start: string; end: string; duration: number }[] = [];

  if (exception && exception.type === "custom_hours" && exception.startTime && exception.endTime) {
    ranges = [{ start: exception.startTime, end: exception.endTime, duration: 30 }];
  } else {
    // Look up weekly schedule rows matching day of week
    const matchingWeekly = weeklySchedules.filter(
      (s) => s.doctorId === doctorId && s.dayOfWeek === dayName && s.isActive !== false
    );

    if (matchingWeekly.length > 0) {
      ranges = matchingWeekly.map((s) => ({
        start: s.startTime,
        end: s.endTime,
        duration: s.slotDurationMinutes || 30,
      }));
    } else {
      // Fallback default: if no explicit weekly rows found, generate default morning hours for standard consultation days
      const isWeekend = dayName === "Sunday";
      if (!isWeekend) {
        ranges = [{ start: "09:00", end: "13:00", duration: 30 }];
      }
    }
  }

  if (ranges.length === 0) {
    return {
      slots: [],
      isFullyUnavailable: true,
      reason: `No consultation hours scheduled on ${dayName}s.`,
    };
  }

  // 3. Generate time slots
  const rawSlots: { start: string; end: string }[] = [];

  for (const r of ranges) {
    const startMin = timeToMinutes(r.start);
    const endMin = timeToMinutes(r.end);
    const step = r.duration || 30;

    for (let cur = startMin; cur + step <= endMin; cur += step) {
      rawSlots.push({
        start: minutesToTime(cur),
        end: minutesToTime(cur + step),
      });
    }
  }

  // 4. Filter against partial unavailable exception if present
  let availableSlots = rawSlots;
  if (exception && exception.type === "partial_unavailable" && exception.startTime && exception.endTime) {
    const blockStart = timeToMinutes(exception.startTime);
    const blockEnd = timeToMinutes(exception.endTime);

    availableSlots = rawSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      // Remove overlapping slots
      const overlaps = slotStart < blockEnd && slotEnd > blockStart;
      return !overlaps;
    });
  }

  // 5. Remove slots already taken by active appointments (booked or confirmed)
  const doctorAppointments = existingAppointments.filter(
    (a) =>
      a.doctorId === doctorId &&
      a.preferredDate === dateStr &&
      a.status !== "Cancelled"
  );

  const takenStarts = new Set(
    doctorAppointments.map((a) => {
      if (a.preferredTimeSlot && a.preferredTimeSlot.includes("–")) {
        // e.g. "09:00 AM – 09:30 AM" or "09:00 – 09:30"
        return a.preferredTimeSlot.split("–")[0].trim();
      }
      return "";
    })
  );

  // 6. Check if date is today -> remove past slots
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const isToday = dateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const finalSlots: BookableSlot[] = availableSlots.map((slot) => {
    const slotStartMin = timeToMinutes(slot.start);
    const formattedLabel = `${format12Hour(slot.start)} – ${format12Hour(slot.end)}`;

    const isTaken = takenStarts.has(slot.start) || takenStarts.has(formattedLabel) || takenStarts.has(format12Hour(slot.start));
    const isPast = isToday && slotStartMin <= currentMinutes + 15; // 15 min buffer

    return {
      startTime: slot.start,
      endTime: slot.end,
      label: formattedLabel,
      isAvailable: !isTaken && !isPast,
    };
  });

  return {
    slots: finalSlots,
    isFullyUnavailable: finalSlots.every((s) => !s.isAvailable),
    reason: finalSlots.length === 0 ? "No available slots on this date." : undefined,
  };
}

/**
 * Checks whether a doctor has any available slots on a given date (for date pickers)
 */
export function isDateDisabledForDoctor(
  doctorId: string,
  dateStr: string,
  weeklySchedules: DoctorWeeklySchedule[] = [],
  exceptions: DoctorAvailabilityException[] = []
): boolean {
  if (!dateStr) return true;

  // Check exception first
  const ex = exceptions.find((e) => e.doctorId === doctorId && e.date === dateStr);
  if (ex && ex.type === "full_day_unavailable") {
    return true;
  }

  // Check weekly schedule
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayName = DAYS_OF_WEEK[new Date(y, m - 1, d).getDay()];

  if (ex && ex.type === "custom_hours") {
    return false;
  }

  const hasWeekly = weeklySchedules.some(
    (s) => s.doctorId === doctorId && s.dayOfWeek === dayName && s.isActive !== false
  );

  if (weeklySchedules.length > 0 && !hasWeekly) {
    return true;
  }

  return false;
}
