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

  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];

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

  let ranges: { start: string; end: string; duration: number }[] = [];

  if (exception && exception.type === "custom_hours" && exception.startTime && exception.endTime) {
    ranges = [{ start: exception.startTime, end: exception.endTime, duration: 30 }];
  } else {
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

  let availableSlots = rawSlots;
  if (exception && exception.type === "partial_unavailable" && exception.startTime && exception.endTime) {
    const blockStart = timeToMinutes(exception.startTime);
    const blockEnd = timeToMinutes(exception.endTime);

    availableSlots = rawSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      const overlaps = slotStart < blockEnd && slotEnd > blockStart;
      return !overlaps;
    });
  }

  const doctorAppointments = existingAppointments.filter(
    (a) =>
      a.doctorId === doctorId &&
      a.preferredDate === dateStr &&
      a.status !== "Cancelled"
  );

  const takenStarts = new Set(
    doctorAppointments.map((a) => {
      if (a.preferredTimeSlot && a.preferredTimeSlot.includes("–")) {
        return a.preferredTimeSlot.split("–")[0].trim();
      }
      return "";
    })
  );

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const isToday = dateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const finalSlots: BookableSlot[] = availableSlots.map((slot) => {
    const slotStartMin = timeToMinutes(slot.start);
    const formattedLabel = `${format12Hour(slot.start)} – ${format12Hour(slot.end)}`;

    const isTaken = takenStarts.has(slot.start) || takenStarts.has(formattedLabel) || takenStarts.has(format12Hour(slot.start));
    const isPast = isToday && slotStartMin <= currentMinutes + 15;

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
