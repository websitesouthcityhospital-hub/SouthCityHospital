"use client";

import { useState } from "react";
import { Search, Hash, Phone, X, Calendar, User, Stethoscope, AlertCircle, Copy, Check, Download } from "lucide-react";
import type { Appointment } from "@sch/types";
import { searchBookingsAdmin } from "@/services/admin-bookings";
import { formatDisplayDate } from "@/lib/date-utils";
import { downloadBookingSlipPdf } from "@/lib/pdf-slip";

interface BookingSearchBarProps {
  onSelectBooking?: (booking: Appointment) => void;
}

export function BookingSearchBar({ onSelectBooking }: BookingSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPhoneSearch, setIsPhoneSearch] = useState(false);
  const [results, setResults] = useState<Appointment[]>([]);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { isPhoneSearch: isPhone, results: found } = await searchBookingsAdmin(query);
      setIsPhoneSearch(isPhone);
      setResults(found);
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setHasSearched(false);
    setResults([]);
  };

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const isRefPattern = query.trim().toUpperCase().startsWith("SCH-");

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none">
          {isRefPattern ? <Hash size={16} className="text-[var(--primary)]" /> : <Search size={16} />}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Reference ID (SCH-...) or Patient Phone Number..."
          className="w-full pl-10 pr-24 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none shadow-xs transition-all"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-[var(--slate)] hover:text-[var(--navy-950)] hover:bg-[var(--cloud)] transition-colors"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="btn btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>
      </form>

      {hasSearched && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-[var(--mist)] rounded-2xl shadow-xl p-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--mist)] mb-3">
            <div>
              <p className="text-xs font-bold text-[var(--navy-950)]">
                {isPhoneSearch ? "Phone Number Match (All Historical & Upcoming)" : "Booking Reference Match"}
              </p>
              <p className="text-[11px] text-[var(--slate)]">
                Found {results.length} {results.length === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-[var(--slate)] hover:text-[var(--navy-950)] font-semibold"
            >
              Close
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--slate)] flex flex-col items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              <p className="font-semibold text-[var(--navy-950)]">No booking found</p>
              <p>No appointments match &quot;{query}&quot;. Please check the reference number or phone digits.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl border border-[var(--mist)] hover:border-[var(--primary)]/40 transition-colors bg-[var(--cloud)]/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[var(--navy-950)]">
                        {apt.bookingReference}
                      </span>
                      <button
                        onClick={() => handleCopy(apt.bookingReference)}
                        className="p-1 text-[var(--slate)] hover:text-[var(--navy-950)]"
                        title="Copy reference"
                      >
                        {copiedRef === apt.bookingReference ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>

                    <span
                      className={`chip text-[10px] font-bold py-0.5 px-2 ${
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

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--slate)]">
                      <Stethoscope size={13} className="text-[var(--primary)] shrink-0" />
                      <span className="truncate">{apt.doctorName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[var(--slate)]">
                      <Calendar size={13} className="text-[var(--primary)] shrink-0" />
                      <span>{formatDisplayDate(apt.preferredDate)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[var(--slate)]">
                      <User size={13} className="text-[var(--primary)] shrink-0" />
                      <span className="font-medium text-[var(--navy-950)]">{apt.patientName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[var(--slate)]">
                      <Phone size={13} className="text-[var(--primary)] shrink-0" />
                      <span>{apt.patientPhone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--mist)] flex items-center justify-between">
                    <span className="text-[10px] text-[var(--slate)]">
                      Slot: {apt.preferredTimeSlot || "OPD"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadBookingSlipPdf(apt)}
                        className="btn btn-outline text-[10px] py-1 px-2.5 gap-1"
                      >
                        <Download size={12} />
                        <span>PDF Slip</span>
                      </button>

                      {onSelectBooking && (
                        <button
                          onClick={() => {
                            onSelectBooking(apt);
                            handleClear();
                          }}
                          className="btn btn-primary text-[10px] py-1 px-2.5"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
