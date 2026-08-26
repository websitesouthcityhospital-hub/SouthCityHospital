"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Hash,
  Phone,
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import type { Appointment } from "@sch/types";
import { lookupBooking } from "@/services/appointments";
import { formatDisplayDate } from "@/lib/date-utils";
import { downloadBookingSlipPdf } from "@/lib/pdf-slip";
import { analytics } from "@/lib/analytics";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";

type SearchTab = "reference" | "identity";

export function BookingStatusClient() {
  const [tab, setTab] = useState<SearchTab>("reference");
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Appointment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Rate Limiting Protection (Max 5 attempts per 30s)
  const [attemptCount, setAttemptCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldownSeconds > 0) return;

    // Throttle check
    const nextAttempts = attemptCount + 1;
    setAttemptCount(nextAttempts);
    if (nextAttempts >= 5) {
      setCooldownSeconds(30);
      setAttemptCount(0);
      setErrorMessage("Too many lookup attempts. For security, please wait 30 seconds.");
      return;
    }

    setErrorMessage(null);
    setHasSearched(false);
    setIsLoading(true);
    analytics.statusLookup(tab);

    try {
      const response = await lookupBooking(
        tab === "reference"
          ? { bookingReference: reference.trim() }
          : { patientPhone: phone.trim(), patientDob: dob }
      );

      setHasSearched(true);
      if (response.success && response.bookings && response.bookings.length > 0) {
        setResults(response.bookings);
      } else {
        setResults([]);
        setErrorMessage("No matching appointment found. Please verify your details.");
      }
    } catch {
      setErrorMessage("Unable to perform lookup. Please try again in a few moments.");
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Booking status hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-xl">
            <p className="eyebrow text-[var(--accent)] mb-4">Patient Portal</p>
            <h1 className="font-display text-display-xl text-white mb-4">
              Check Booking Status
            </h1>
            <p className="text-white/75 text-lg">
              Look up your upcoming and past doctor appointments without needing an account.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Main Lookup Section ── */}
      <section className="py-[var(--section-y)] bg-[var(--cloud)] min-h-[60vh]">
        <div className="container-site max-w-2xl">
          {/* Lookup Card */}
          <ScrollReveal className="card p-6 md:p-8 bg-white border border-[var(--mist)] rounded-2xl shadow-card mb-10">
            {/* Search Tabs */}
            <div className="flex rounded-xl bg-[var(--cloud)] p-1 mb-6 border border-[var(--mist)]" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "reference"}
                onClick={() => {
                  setTab("reference");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                  tab === "reference"
                    ? "bg-white text-[var(--navy-950)] shadow-xs"
                    : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                }`}
              >
                <Hash size={15} className="shrink-0" />
                <span className="hidden xs:inline">Reference Number</span>
                <span className="xs:hidden">Reference</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tab === "identity"}
                onClick={() => {
                  setTab("identity");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                  tab === "identity"
                    ? "bg-white text-[var(--navy-950)] shadow-xs"
                    : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                }`}
              >
                <Phone size={15} className="shrink-0" />
                <span className="hidden xs:inline">Phone + Date of Birth</span>
                <span className="xs:hidden">Phone + DOB</span>
              </button>
            </div>

            {/* Lookup Form */}
            <form onSubmit={handleSearch} className="space-y-4">
              {tab === "reference" ? (
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5">
                    Booking Reference ID
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)]" />
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. SCH-2026-00042"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      className="input-base w-full pl-10 pr-4 py-2.5 rounded-xl font-mono border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none uppercase transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[var(--slate)] mt-1.5">
                    Found on your appointment reference slip or confirmation screen.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="input-base w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      max={todayStr}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="input-base w-full px-3.5 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors text-[var(--navy-950)]"
                    />
                  </div>
                </div>
              )}

              {/* Cooldown / Error Alerts */}
              {cooldownSeconds > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                  <span>
                    Rate limit active. Please wait <strong>{cooldownSeconds}s</strong> before searching again.
                  </span>
                </div>
              ) : errorMessage ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || cooldownSeconds > 0}
                className="btn btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching Appointments...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Find Appointment</span>
                  </>
                )}
              </button>
            </form>
          </ScrollReveal>

          {/* ── Search Results List ── */}
          {hasSearched && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg text-[var(--navy-950)]">
                  Found {results.length} {results.length === 1 ? "Booking" : "Bookings"}
                </h2>
                <span className="text-xs text-[var(--slate)]">Sorted by most recent</span>
              </div>

              <StaggerReveal className="space-y-4">
                {results.map((apt) => (
                  <StaggerItem
                    key={apt.id}
                    variants={staggerItemVariants}
                    className="card p-6 bg-white border border-[var(--mist)] rounded-2xl shadow-card hover:border-[var(--primary)]/30 transition-all space-y-4"
                  >
                    {/* Card Top: Reference + Status Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--mist)]">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--slate)]">
                          Booking ID
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="font-mono font-bold text-base text-[var(--navy-950)]">
                            {apt.bookingReference}
                          </p>
                          <button
                            onClick={() => handleCopy(apt.bookingReference)}
                            className="p-1 text-[var(--slate)] hover:text-[var(--navy-950)] transition-colors"
                            title="Copy reference"
                          >
                            {copiedRef === apt.bookingReference ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <span
                        className={`chip text-xs font-bold py-1 px-3 ${
                          apt.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : apt.status === "Cancelled"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[var(--slate)]">
                        <Stethoscope size={15} className="text-[var(--primary)] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase text-[var(--slate)]/80 block">Doctor</span>
                          <span className="font-semibold text-[var(--navy-950)] text-xs">
                            {apt.doctorName} ({apt.departmentName})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--slate)]">
                        <Calendar size={15} className="text-[var(--primary)] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase text-[var(--slate)]/80 block">Date</span>
                          <span className="font-semibold text-[var(--navy-950)] text-xs">
                            {formatDisplayDate(apt.preferredDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--slate)]">
                        <Clock size={15} className="text-[var(--primary)] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase text-[var(--slate)]/80 block">Time Slot</span>
                          <span className="font-semibold text-[var(--navy-950)] text-xs">
                            {apt.preferredTimeSlot || "Hospital OPD Hours"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--slate)]">
                        <User size={15} className="text-[var(--primary)] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase text-[var(--slate)]/80 block">Patient</span>
                          <span className="font-semibold text-[var(--navy-950)] text-xs">{apt.patientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between border-t border-[var(--mist)]">
                      <p className="text-[11px] text-[var(--slate)]">
                        Booked on {new Date(apt.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => downloadBookingSlipPdf(apt)}
                        className="btn btn-outline text-xs py-2 px-3 gap-1.5 w-full sm:w-auto justify-center min-h-[38px]"
                      >
                        <Download size={14} />
                        <span>Download PDF Slip</span>
                      </button>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </div>
          )}

          {/* Quick Doctor Booking CTA if no appointments */}
          {hasSearched && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--slate)] mb-3">Looking to book a new appointment?</p>
              <Link href="/doctors" className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-2">
                Browse Doctors & Book
              </Link>
            </div>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
