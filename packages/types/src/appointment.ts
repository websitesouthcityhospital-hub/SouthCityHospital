export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'No-show';

export interface Appointment {
  id: string;
  bookingReference: string;
  doctorId: string;
  doctorName: string;
  departmentSlug: string;
  departmentName: string;
  patientName: string;
  patientPhone: string;
  patientDob: string; // YYYY-MM-DD
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot?: string | null;
  message?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  doctorId: string;
  doctorName: string;
  departmentSlug: string;
  departmentName: string;
  patientName: string;
  patientPhone: string;
  patientDob: string;
  preferredDate: string;
  preferredTimeSlot?: string | null;
  message?: string | null;
}

export interface LookupBookingParams {
  bookingReference?: string;
  patientPhone?: string;
  patientDob?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: Appointment;
  bookings?: Appointment[];
  error?: string;
}
