"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Clock,
  Stethoscope,
  AlertCircle,
  Download,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { formatDisplayDate } from "@/lib/date-utils";
import { downloadBookingSlipPdf } from "@/lib/pdf-slip";
import type { Appointment, UserRole } from "@sch/types";

export default function AdminPatientsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientPhone, setSelectedPatientPhone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentRole(data.user.role);
          if (data.user.role !== "admin") {
            window.location.href = "/bookings";
          }
        }
      })
      .catch(() => {});

    try {
      const raw = localStorage.getItem("sch_appointments_store");
      if (raw) setAppointments(JSON.parse(raw));
    } catch {}
  }, []);

  const patientsMap = new Map<string, { name: string; phone: string; dob: string; appointments: Appointment[] }>();
  appointments.forEach((apt) => {
    const phone = apt.patientPhone;
    const existing = patientsMap.get(phone) || {
      name: apt.patientName,
      phone: apt.patientPhone,
      dob: apt.patientDob,
      appointments: [],
    };
    existing.appointments.push(apt);
    patientsMap.set(phone, existing);
  });

  const allPatients = Array.from(patientsMap.values());
  const filteredPatients = allPatients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const selectedPatient = selectedPatientPhone ? patientsMap.get(selectedPatientPhone) : null;

  if (currentRole !== "admin") {
    return (
      <AdminLayout userRole="staff">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">403 — Access Forbidden</h2>
          <p className="text-xs text-[var(--slate)] mt-1">Staff accounts cannot view the Patients CRM module.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
              Patients CRM &amp; Cross-Visit History
            </h1>
            <p className="text-xs text-[var(--slate)] mt-0.5">
              Comprehensive patient registry with lifetime consultation timeline.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none bg-white"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-4 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-3">
            <h2 className="font-display font-semibold text-sm text-[var(--navy-950)] px-2">
              Registered Patients ({filteredPatients.length})
            </h2>

            <div className="space-y-1 max-h-[70vh] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <p className="text-xs text-[var(--slate)] p-3 text-center">No patients found.</p>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.phone}
                    onClick={() => setSelectedPatientPhone(patient.phone)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedPatientPhone === patient.phone
                        ? "bg-[var(--primary)] text-white shadow-xs"
                        : "text-[var(--slate)] hover:bg-[var(--cloud)] hover:text-[var(--navy-950)]"
                    }`}
                  >
                    <div>
                      <p className="leading-tight">{patient.name}</p>
                      <p className={`text-[10px] font-mono ${selectedPatientPhone === patient.phone ? "text-white/80" : "text-[var(--slate)]"}`}>
                        {patient.phone}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold">
                      {patient.appointments.length} {patient.appointments.length === 1 ? "Visit" : "Visits"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            {selectedPatient ? (
              <div className="card p-6 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-[var(--mist)]">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[var(--navy-950)]">
                      {selectedPatient.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-[var(--slate)] mt-1">
                      <span>Phone: <strong className="font-mono">{selectedPatient.phone}</strong></span>
                      <span>DOB: <strong>{selectedPatient.dob}</strong></span>
                    </div>
                  </div>
                  <span className="chip chip-diagnostic text-xs py-1 px-3">
                    {selectedPatient.appointments.length} Total Visits
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--slate)]">
                    Lifetime Consultation Timeline
                  </h4>

                  <div className="space-y-3">
                    {selectedPatient.appointments
                      .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime())
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 rounded-xl border border-[var(--mist)] bg-[var(--cloud)]/30 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[var(--navy-950)]">
                                {apt.bookingReference}
                              </span>
                              <span className="text-[11px] text-[var(--slate)]">
                                ({formatDisplayDate(apt.preferredDate)})
                              </span>
                            </div>

                            <span
                              className={`chip text-[10px] font-bold py-0.5 px-2 ${
                                apt.status === "Confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-[var(--slate)]">
                              <Stethoscope size={14} className="text-[var(--primary)] shrink-0" />
                              <span>{apt.doctorName} ({apt.departmentName})</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[var(--slate)]">
                              <Clock size={14} className="text-[var(--primary)] shrink-0" />
                              <span>{apt.preferredTimeSlot || "OPD Hours"}</span>
                            </div>
                          </div>

                          {apt.message && (
                            <p className="text-[11px] text-[var(--slate)] bg-white p-2 rounded-lg border border-[var(--mist)]">
                              <strong>Notes:</strong> {apt.message}
                            </p>
                          )}

                          <div className="pt-2 border-t border-[var(--mist)] flex justify-end">
                            <button
                              onClick={() => downloadBookingSlipPdf(apt)}
                              className="btn btn-outline text-[10px] py-1 px-2.5 gap-1"
                            >
                              <Download size={12} />
                              <span>Download PDF Slip</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 bg-white border border-[var(--mist)] rounded-2xl shadow-xs text-center text-xs text-[var(--slate)]">
                <Users size={32} className="mx-auto mb-2 text-[var(--mist)]" />
                <p className="font-semibold text-[var(--navy-950)]">Select a patient</p>
                <p className="mt-0.5">Click on any patient record to view their lifetime cross-visit history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
