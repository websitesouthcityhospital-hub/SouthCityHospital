export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface DoctorWeeklySchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "13:00"
  slotDurationMinutes: number; // e.g. 30
  isActive: boolean;
}

export type ExceptionType =
  | "full_day_unavailable"
  | "partial_unavailable"
  | "custom_hours";

export interface DoctorAvailabilityException {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  type: ExceptionType;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface BookableSlot {
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  label: string;     // "9:00 AM – 9:30 AM"
  isAvailable: boolean;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt: string;
  totalVisits: number;
  lastVisitDate?: string | null;
}

export interface ConsultationSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentSlug: string;
  qualifications: string[];
  experienceYears: number;
  consultationSchedule: ConsultationSchedule[];
  photoUrl: string | null;
  active: boolean;
  biography?: string | null;
  languages?: string[];
  registrationNumber: string;
  weeklySchedules?: DoctorWeeklySchedule[];
}

export type DoctorFilterParams = {
  departmentSlug?: string;
  activeOnly?: boolean;
};
