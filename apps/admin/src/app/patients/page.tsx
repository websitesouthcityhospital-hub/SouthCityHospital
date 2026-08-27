"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Clock,
  Stethoscope,
  AlertCircle,
  Download,
  Calendar,
  Phone,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { formatDisplayDate } from "@/lib/date-utils";
import { downloadBookingSlipPdf } from "@/lib/pdf-slip";
import { fetchPatientsCRM, type PatientProfile } from "@/services/patients";
import type { UserRole } from "@sch/types";

export default function AdminPatientsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientPhone, setSelectedPatientPhone] = useState<string | null>(null);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPatientsCRM();
      setPatients(data);
    } catch (err) {
      console.error("Patients CRM fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  const selectedPatient = selectedPatientPhone
    ? patients.find((p) => p.phone === selectedPatientPhone) || null
    : null;

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

          <div className="flex items-center gap-2">
            <button
              onClick={loadPatients}
              disabled={isLoading}
              className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 border-[var(--mist)] bg-white hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin text-[var(--primary)]" : ""} />
              <span>Refresh</span>
            </button>

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
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patients Directory */}
          <div className="card p-4 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
              <span className="font-display font-semibold text-xs text-[var(--navy-950)]">
                Registered Patients ({filteredPatients.length})
              </span>
              <Users size={15} className="text-[var(--primary)]" />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-[var(--slate)]">
                  Loading patient database...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--slate)]">
                  No patient records matching your search.
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatientPhone === patient.phone;
                  return (
                    <button
                      key={patient.phone}
                      type="button"
                      onClick={() => setSelectedPatientPhone(patient.phone)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--primary)] bg-sky-50/50 shadow-xs"
                          : "border-[var(--mist)] bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-[var(--navy-950)]">{patient.name}</p>
                        <span className="chip chip-diagnostic text-[10px] py-0.5 px-2">
                          {patient.totalVisits} {patient.totalVisits === 1 ? "visit" : "visits"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--slate)] mt-1 font-mono">{patient.phone}</p>
                      <p className="text-[10px] text-[var(--slate)] mt-0.5">
                        DOB: {formatDisplayDate(patient.dob)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Patient Detail & Cross-Visit Timeline */}
          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <div className="card p-12 bg-white border border-[var(--mist)] rounded-2xl shadow-xs text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--cloud)] flex items-center justify-center text-[var(--slate)] mb-3">
                  <Users size={24} />
                </div>
                <h3 className="font-display font-semibold text-base text-[var(--navy-950)]">
                  Select a Patient
                </h3>
                <p className="text-xs text-[var(--slate)] mt-1 max-w-sm">
                  Click on any patient record on the left to view their complete lifetime consultation history, diagnosis notes, and booking slips.
                </p>
              </div>
            ) : (
              <div className="card p-6 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--mist)] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-lg text-[var(--navy-950)]">
                        {selectedPatient.name}
                      </h2>
                      <span className="chip chip-diagnostic text-xs py-0.5 px-2">
                        {selectedPatient.totalVisits} Lifetime Consultations
                      </span>
                    </div>
                    <p className="text-xs text-[var(--slate)] mt-1 font-mono">
                      Phone: {selectedPatient.phone} &bull; DOB: {formatDisplayDate(selectedPatient.dob)}
                    </p>
                  </div>
                </div>

                {/* Consultation History Timeline */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-sm text-[var(--navy-950)]">
                    Cross-Visit Timeline &amp; History
                  </h3>

                  <div className="space-y-3">
                    {selectedPatient.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl border border-[var(--mist)] bg-[var(--cloud)]/20 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[var(--primary)] bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                              {apt.bookingReference}
                            </span>
                            <span
                              className={`chip text-[10px] font-bold py-0.5 px-2 ${
                                apt.status === "Confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : apt.status === "Completed"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : apt.status === "Cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => downloadBookingSlipPdf(apt)}
                            className="btn btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1 border-[var(--mist)] hover:border-[var(--primary)] hover:text-[var(--primary)] bg-white cursor-pointer"
                          >
                            <Download size={12} />
                            <span>Download Slip</span>
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 text-xs text-[var(--slate)] pt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[var(--primary)] shrink-0" />
                            <span>Date: <strong className="text-[var(--navy-950)]">{formatDisplayDate(apt.preferredDate)}</strong> ({apt.preferredTimeSlot || "OPD"})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Stethoscope size={13} className="text-[var(--primary)] shrink-0" />
                            <span>Physician: <strong className="text-[var(--navy-950)]">{apt.doctorName}</strong> ({apt.departmentName})</span>
                          </div>
                        </div>

                        {apt.message && (
                          <div className="mt-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900">
                            <span className="font-semibold">Patient Symptoms / Clinical Notes:</span> {apt.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
