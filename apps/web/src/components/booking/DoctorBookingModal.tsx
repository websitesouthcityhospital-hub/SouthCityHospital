"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  User,
  Phone,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Ban,
} from "lucide-react";
import Image from "next/image";
import type { Doctor, Appointment, BookableSlot } from "@sch/types";
import { departments } from "@/data/departments";
import { createBooking } from "@/services/appointments";
import { fetchDoctorAvailableSlots } from "@/services/slots";
import { formatDisplayDate } from "@/lib/date-utils";
import { analytics } from "@/lib/analytics";

const bookingSchema = z.object({
  name: z.string().min(2, "Please enter the patient's full name (at least 2 characters)"),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number so we can reach you")
    .regex(/^[+\d\s-()]{10,}$/, "Please enter a valid phone number with digits only"),
  dob: z.string().min(1, "Please select the patient's date of birth for identity verification"),
  preferredDate: z.string().min(1, "Please select your preferred consultation date"),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface DoctorBookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export function DoctorBookingModal({
  doctor,
  isOpen,
  onClose,
  onSuccess,
}: DoctorBookingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [slotsState, setSlotsState] = useState<{
    slots: BookableSlot[];
    isFullyUnavailable: boolean;
    reason?: string;
  }>({ slots: [], isFullyUnavailable: false });
  const [serverError, setServerError] = useState<string | null>(null);

  const dept = doctor ? departments.find((d) => d.slug === doctor.departmentSlug) : null;
  const displayName = doctor ? (doctor.name.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`) : "";

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      preferredDate: todayStr,
    },
  });

  const selectedDate = watch("preferredDate") || todayStr;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      setValue("preferredDate", todayStr);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, setValue, todayStr]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live slots using Single Postgres RPC Engine / local fallback
  useEffect(() => {
    if (!doctor || !selectedDate) {
      setSlotsState({ slots: [], isFullyUnavailable: false });
      setSelectedSlot(null);
      setIsFetchingSlots(false);
      return;
    }

    let isMounted = true;
    setIsFetchingSlots(true);

    fetchDoctorAvailableSlots(doctor.id, selectedDate)
      .then((res) => {
        if (!isMounted) return;
        setSlotsState(res);
        const firstAvail = res.slots.find((s) => s.isAvailable);
        if (firstAvail) {
          setSelectedSlot(firstAvail.label);
        } else {
          setSelectedSlot(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsFetchingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, doctor]);

  // Reset form when modal closes or doctor changes
  useEffect(() => {
    if (!isOpen) {
      reset({ preferredDate: todayStr });
      setSlotsState({ slots: [], isFullyUnavailable: false });
      setServerError(null);
      setSelectedSlot(null);
      setIsFetchingSlots(false);
    }
  }, [isOpen, reset, todayStr]);

  if (!mounted || !isOpen || !doctor) return null;

  const onSubmit = async (data: BookingFormData) => {
    setServerError(null);

    if (slotsState.isFullyUnavailable || slotsState.slots.length === 0) {
      setServerError("Doctor is unavailable on this date. Please select another date.");
      return;
    }

    if (!selectedSlot) {
      setServerError("Please select an available consultation time slot.");
      return;
    }

    analytics.bookingSubmit(doctor.id, doctor.departmentSlug);

    const response = await createBooking({
      doctorId: doctor.id,
      doctorName: displayName,
      departmentSlug: doctor.departmentSlug,
      departmentName: dept?.name || "General Medicine",
      patientName: data.name,
      patientPhone: data.phone,
      patientDob: data.dob,
      preferredDate: data.preferredDate,
      preferredTimeSlot: selectedSlot,
      message: data.message,
    });

    if (!response.success || !response.booking) {
      setServerError(response.error || "Failed to create appointment. Please try again.");
      return;
    }

    analytics.bookingSuccess(
      response.booking.bookingReference,
      doctor.id,
      doctor.departmentSlug
    );

    onSuccess(response.booking);
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6"
      style={{ isolation: "isolate" }}
    >
      {/* Fixed Fullscreen Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#071b3d]/80 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Strict Viewport Containment) */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg lg:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[var(--mist)] flex flex-col text-left z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-doctor-name"
      >
        {/* 1. Sticky / Fixed Header */}
        <div className="bg-white z-20 border-b border-[var(--mist)] px-4 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {doctor.photoUrl ? (
              <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-[var(--mist)] bg-[var(--cloud)]">
                <Image
                  src={doctor.photoUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="52px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl bg-[var(--sky-100)] flex items-center justify-center shrink-0 border border-[var(--mist)] text-[var(--primary)]">
                <Stethoscope size={18} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="chip chip-diagnostic text-[10px] py-0.5 px-2 font-mono">
                  {dept?.name || "Specialist"}
                </span>
              </div>
              <h2 id="modal-doctor-name" className="font-display font-bold text-sm sm:text-lg text-[var(--navy-950)] truncate">
                Book with {displayName}
              </h2>
              <p className="text-xs text-[var(--slate)] truncate">{doctor.qualifications.join(", ")}</p>
              {doctor.languages && doctor.languages.length > 0 && (
                <p className="text-[11px] text-[var(--slate)] truncate hidden xs:block">
                  <span className="font-medium text-[var(--navy-950)]">Languages:</span> {doctor.languages.join(", ")}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-[var(--slate)] hover:text-[var(--navy-950)] hover:bg-[var(--cloud)] transition-colors shrink-0 ml-1"
            aria-label="Close booking form"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Form Container with Internal Scroll and Sticky Footer */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3.5 sm:px-6 sm:py-5 space-y-3.5 sm:space-y-4 overscroll-contain">
            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Patient Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none" />
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g. Ananya Roy"
                  className="input-base w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Phone & DOB Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none" />
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="+91 98765 43210"
                    className="input-base w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={todayStr}
                  {...register("dob")}
                  className="input-base w-full px-3.5 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors text-[var(--navy-950)]"
                />
                {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob.message}</p>}
              </div>
            </div>

            {/* Preferred Appointment Date */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                Preferred Appointment Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  {...register("preferredDate")}
                  className={`input-base w-full px-3.5 py-2.5 rounded-xl border outline-none transition-colors text-[var(--navy-950)] ${
                    slotsState.isFullyUnavailable
                      ? "border-red-400 bg-red-50/50"
                      : "border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  }`}
                />
              </div>
              {errors.preferredDate && (
                <p className="text-xs text-red-500 mt-1">{errors.preferredDate.message}</p>
              )}

              {/* Fully Unavailable / Leave Notice */}
              {slotsState.isFullyUnavailable && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <Ban size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Doctor Unavailable on {selectedDate ? formatDisplayDate(selectedDate) : "this date"}</p>
                    <p className="text-[11px] mt-0.5">{slotsState.reason || "Please select another consultation date."}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Consultation Slots */}
            {selectedDate && !slotsState.isFullyUnavailable && (
              <div>
                <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5">
                  Available Consultation Slots ({formatDisplayDate(selectedDate)}) <span className="text-red-500">*</span>
                </label>

                {isFetchingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 border border-[var(--mist)]/60 rounded-xl bg-[var(--cloud)]/50">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded-xl bg-white border border-[var(--mist)] flex flex-col items-center justify-center gap-1 animate-pulse"
                      >
                        <div className="h-2.5 w-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : slotsState.slots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1.5 border border-[var(--mist)]/60 rounded-xl bg-[var(--cloud)]/50">
                    {slotsState.slots.map((slot) => {
                      const isSelected = selectedSlot === slot.label;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => {
                            setSelectedSlot(slot.label);
                            setServerError(null);
                          }}
                          className={`p-2 sm:p-2.5 rounded-xl text-xs font-medium text-center border transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                              : slot.isAvailable
                              ? "bg-white border-[var(--mist)] text-[var(--navy-950)] hover:border-[var(--primary)]/60 hover:bg-white shadow-2xs"
                              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <span className="font-semibold">{slot.label}</span>
                          {!slot.isAvailable && <span className="text-[9px] text-red-500 font-bold mt-0.5">Taken / Passed</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            )}

            {/* Optional Symptoms / Message */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                Reason for Visit / Symptoms <span className="text-[var(--slate)] font-normal">(Optional)</span>
              </label>
              <textarea
                {...register("message")}
                rows={2}
                placeholder="Briefly describe what you'd like to consult about..."
                className="input-base w-full px-3.5 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* 3. Sticky / Fixed Footer with Action Button */}
          <div className="shrink-0 bg-[var(--cloud)]/60 border-t border-[var(--mist)] px-4 py-3 sm:px-6 sm:py-4 space-y-2">
            {/* Realtime Feedback if user clicks submit with missing slots */}
            {serverError && (
              <p className="text-xs text-red-600 font-medium text-center">{serverError}</p>
            )}

            {/* No Payment Notice */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--sky-100)] text-[11px] sm:text-xs text-[var(--blue-900)] flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--primary)] shrink-0" />
              <span>
                <strong>No advance payment required.</strong> Consultation fee is payable at hospital reception.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 sm:py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Confirming Appointment...</span>
                </>
              ) : (
                <>
                  <CalendarCheck size={18} />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
