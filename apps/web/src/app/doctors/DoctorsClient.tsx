"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarCheck, UserRound, Stethoscope, BadgeCheck, Phone } from "lucide-react";
import { useDoctors } from "@/services/doctors";
import { departments } from "@/data/departments";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";
import { DoctorBookingModal } from "@/components/booking/DoctorBookingModal";
import { BookingConfirmationModal } from "@/components/booking/BookingConfirmationModal";
import { cn } from "@/lib/utils";
import type { Doctor, Appointment } from "@sch/types";

function DoctorSkeleton() {
  return (
    <div className="card border border-[var(--mist)] p-6 animate-pulse space-y-4">
      <div className="w-20 h-20 rounded-full bg-[var(--mist)] mx-auto" />
      <div className="space-y-2 text-center">
        <div className="h-4 bg-[var(--mist)] rounded w-3/4 mx-auto" />
        <div className="h-3 bg-[var(--mist)] rounded w-1/2 mx-auto" />
      </div>
      <div className="h-6 bg-[var(--mist)] rounded-full w-24 mx-auto" />
      <div className="h-8 bg-[var(--mist)] rounded-lg w-full" />
    </div>
  );
}

function format12Hour(time24: string): string {
  if (!time24) return time24;
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

function DoctorCard({ doctor, onBook }: { doctor: Doctor; onBook: (doctor: Doctor) => void }) {
  const dept = departments.find((d) => d.slug === doctor.departmentSlug);
  const displayName = doctor.name.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`;

  return (
    <StaggerItem
      variants={staggerItemVariants}
      className="card p-6 flex flex-col items-center text-center gap-4 border border-[var(--mist)] hover:border-[var(--primary)]/40 transition-all bg-white shadow-xs hover:shadow-md"
    >
      {/* Avatar / Initials Frame */}
      {doctor.photoUrl ? (
        <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-[var(--navy-950)] via-[var(--primary)] to-[var(--accent)] shadow-md mb-2">
          <div
            className="relative w-24 h-24 rounded-xl overflow-hidden"
            style={{ background: "var(--primary-dark)" }}
            aria-hidden="true"
          >
            <Image
              src={doctor.photoUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="absolute bottom-[-6px] right-[-6px] z-20 bg-white rounded-full p-1 shadow-sm">
            <BadgeCheck size={22} style={{ color: "var(--accent)", fill: "var(--navy-950)" }} aria-hidden="true" />
          </div>
        </div>
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-[var(--sky-100)] border border-[var(--mist)] flex items-center justify-center shrink-0 mb-2 text-[var(--primary)] shadow-xs">
          <Stethoscope size={36} aria-hidden="true" />
        </div>
      )}

      <div>
        <h3 className="font-display font-semibold text-lg text-[var(--navy-950)]">{displayName}</h3>
        <p className="text-xs text-[var(--slate)] mt-0.5">{doctor.qualifications.join(", ")}</p>
        {doctor.experienceYears > 0 && (
          <p className="font-semibold text-xs mt-1.5 text-[var(--primary)]">{doctor.experienceYears} yrs experience</p>
        )}
      </div>

      {dept && <span className="chip chip-diagnostic text-[11px] py-0.5 px-2.5">{dept.name}</span>}

      {doctor.languages && doctor.languages.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 my-0.5">
          <span className="text-[10px] text-[var(--slate)] font-medium mr-0.5">Languages:</span>
          {doctor.languages.map((lang, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--blue-100)] text-[var(--navy-950)] border border-[var(--mist)]/40"
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      {doctor.consultationSchedule.length > 0 && (
        <div className="w-full text-left border-t border-[var(--mist)] pt-3">
          <p className="eyebrow mb-1.5 text-[var(--primary-mid)] text-[10px]">Consultation Hours</p>
          <div className="space-y-1">
            {doctor.consultationSchedule.slice(0, 2).map((s, i) => (
              <p key={i} className="text-xs text-[var(--slate)]">
                <span className="font-semibold text-[var(--navy-950)]">{s.day}:</span>{" "}
                {format12Hour(s.startTime)} – {format12Hour(s.endTime)}
              </p>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onBook(doctor)}
        className="btn btn-outline w-full gap-2 mt-auto text-xs py-2.5 min-h-[44px] border-[var(--mist)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-xs"
        aria-label={`Book appointment with ${displayName}`}
      >
        <CalendarCheck size={16} aria-hidden="true" />
        Book Appointment
      </button>
    </StaggerItem>
  );
}

export function DoctorsClient() {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const { data: doctors, isLoading, isError } = useDoctors({ activeOnly: true });

  // Map doctors by department in display order (Part C.1)
  const populatedDepartments = departments
    .map((dept) => {
      const deptDoctors = doctors ? doctors.filter((d) => d.departmentSlug === dept.slug && d.active !== false) : [];
      return {
        ...dept,
        doctors: deptDoctors,
      };
    })
    .filter((dept) => dept.doctors.length > 0); // Omit empty departments (zero active doctors)

  const activeDeptSlugs = populatedDepartments.map((d) => d.slug);

  const displayedDepartments =
    selectedDept === "all"
      ? populatedDepartments
      : populatedDepartments.filter((d) => d.slug === selectedDept);

  return (
    <>
      <section className="pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Doctors hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-xl">
            <p className="eyebrow text-white/60 mb-3 sm:mb-4 text-[var(--accent)]">Our Medical Team</p>
            <h1 className="font-display text-display-xl text-white mb-3 sm:mb-4">
              Specialists you<br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>can trust.</em>
            </h1>
            <p className="text-white/75 text-base sm:text-lg">
              Our multi-specialty doctors bring decades of combined clinical experience to patients across Silchar and the Barak Valley.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-[var(--section-y)] bg-[var(--cloud)]" aria-labelledby="doctors-list-heading">
        <div className="container-site">
          <ScrollReveal className="mb-4 sm:mb-6">
            <h2 id="doctors-list-heading" className="font-display text-display-md mb-2 text-[var(--primary-dark)]">
              Our Specialists by Department
            </h2>
            <p className="text-xs sm:text-sm text-[var(--slate)]">
              Browse experienced clinicians organized across dedicated medical specialties.
            </p>
          </ScrollReveal>

          {/* Department Filter Tabs (Horizontal Scroll) */}
          {!isLoading && !isError && activeDeptSlugs.length > 0 && (
            <ScrollReveal className="mb-6 sm:mb-10">
              <div className="flex items-center gap-x-4 sm:gap-x-6 border-b border-[var(--mist)] overflow-x-auto no-scrollbar whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter by department">
                <button
                  role="tab"
                  onClick={() => setSelectedDept("all")}
                  className={cn(
                    "shrink-0 pb-3 text-xs sm:text-sm font-semibold transition-colors relative",
                    selectedDept === "all" ? "text-[var(--primary-dark)]" : "text-[var(--slate)] hover:text-[var(--primary)]"
                  )}
                  aria-selected={selectedDept === "all"}
                >
                  All Departments
                  {selectedDept === "all" && (
                    <motion.div layoutId="doc-filter-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
                  )}
                </button>
                {populatedDepartments.map((dept) => (
                  <button
                    key={dept.slug}
                    role="tab"
                    onClick={() => setSelectedDept(dept.slug)}
                    className={cn(
                      "shrink-0 pb-3 text-xs sm:text-sm font-semibold transition-colors relative",
                      selectedDept === dept.slug ? "text-[var(--primary-dark)]" : "text-[var(--slate)] hover:text-[var(--primary)]"
                    )}
                    aria-selected={selectedDept === dept.slug}
                  >
                    {dept.name} ({dept.doctors.length})
                    {selectedDept === dept.slug && (
                      <motion.div layoutId="doc-filter-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          )}

          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <DoctorSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
              <p className="text-lg font-semibold mb-2 text-[var(--ink)]">Unable to load doctor profiles</p>
              <p className="text-sm mb-4 text-[var(--slate)]">Please try refreshing. For immediate help, contact us.</p>
              <a href="tel:+916901271223" className="btn btn-primary gap-2 inline-flex">Call +91 6901271223</a>
            </div>
          )}

          {/* Empty State when zero doctors exist */}
          {!isLoading && !isError && displayedDepartments.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-[var(--mist)] p-8 max-w-lg mx-auto shadow-xs">
              <Stethoscope size={40} className="text-[var(--primary)] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[var(--navy-950)] mb-1">No Specialists Currently Listed</h3>
              <p className="text-xs text-[var(--slate)] mb-6">
                Doctor schedules are currently being updated. For immediate consultation assistance or appointments, please contact our 24x7 helpdesk.
              </p>
              <a href="tel:+916901271223" className="btn btn-primary gap-2 inline-flex text-xs">
                <Phone size={14} />
                <span>Call Helpdesk (+91 6901271223)</span>
              </a>
            </div>
          )}

          {/* Department-Grouped Sections (Part C.1) */}
          {!isLoading && !isError && displayedDepartments.length > 0 && (
            <div className="space-y-12">
              {displayedDepartments.map((dept) => (
                <section key={dept.slug} className="space-y-5" aria-labelledby={`dept-heading-${dept.slug}`}>
                  <div className="flex items-center gap-3 pb-2 border-b border-[var(--mist)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--sky-100)] text-[var(--primary)] flex items-center justify-center shrink-0" aria-hidden="true">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <h3 id={`dept-heading-${dept.slug}`} className="font-display font-bold text-xl text-[var(--navy-950)]">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-[var(--slate)]">{dept.shortDescription}</p>
                    </div>
                  </div>

                  <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dept.doctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onBook={(d) => setSelectedDoctor(d)}
                      />
                    ))}
                  </StaggerReveal>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Doctor-Scoped Booking Modal */}
      <DoctorBookingModal
        doctor={selectedDoctor}
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onSuccess={(apt) => {
          setSelectedDoctor(null);
          setConfirmedAppointment(apt);
        }}
      />

      {/* Booking Confirmation Slip & PDF Download Modal */}
      <BookingConfirmationModal
        appointment={confirmedAppointment}
        isOpen={!!confirmedAppointment}
        onClose={() => setConfirmedAppointment(null)}
      />
    </>
  );
}
