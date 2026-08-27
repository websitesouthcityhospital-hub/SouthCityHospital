import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@sch/types";

export interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  dob: string;
  totalVisits: number;
  lastVisitDate: string;
  appointments: Appointment[];
}

export async function fetchPatientsCRM(): Promise<PatientProfile[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      // 1. Fetch appointments with doctor and department joins
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors(name),
          departments(name)
        `)
        .order("preferred_date", { ascending: false });

      if (!error && appointmentsData) {
        const patientsMap = new Map<string, PatientProfile>();

        appointmentsData.forEach((a: any) => {
          const phoneKey = (a.patient_phone || "").replace(/\D/g, "") || a.patient_name;
          const apt: Appointment = {
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
          };

          if (!patientsMap.has(phoneKey)) {
            patientsMap.set(phoneKey, {
              id: a.patient_id || a.id,
              name: a.patient_name,
              phone: a.patient_phone,
              dob: a.patient_dob,
              totalVisits: 1,
              lastVisitDate: a.preferred_date,
              appointments: [apt],
            });
          } else {
            const existing = patientsMap.get(phoneKey)!;
            existing.totalVisits += 1;
            existing.appointments.push(apt);
            if (new Date(apt.preferredDate) > new Date(existing.lastVisitDate)) {
              existing.lastVisitDate = apt.preferredDate;
            }
          }
        });

        return Array.from(patientsMap.values());
      }
    } catch (err) {
      console.warn("Supabase fetchPatientsCRM error:", err);
    }
  }

  return [];
}
