"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useDoctors } from "@/services/doctors";
import { format12Hour, formatDisplayDate } from "@/lib/date-utils";
import {
  getStoredWeeklySchedules,
  saveStoredWeeklySchedules,
  getStoredExceptions,
  addOrUpdateException,
  removeException,
} from "@/services/doctor-schedules";
import { exportSingleDoctorBookingsXlsx } from "@/lib/excel-export";
import { getBookingsForDate } from "@/services/admin-bookings";
import { departments } from "@/data/departments";
import type {
  DoctorWeeklySchedule,
  DoctorAvailabilityException,
  ExceptionType,
  DayOfWeek,
  UserRole,
} from "@sch/types";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AdminSchedulesPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const { data: doctors, isLoading } = useDoctors({ activeOnly: false });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [weeklySchedules, setWeeklySchedules] = useState<DoctorWeeklySchedule[]>([]);
  const [exceptions, setExceptions] = useState<DoctorAvailabilityException[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "calendar">("calendar");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [viewDate, setViewDate] = useState(() => new Date());

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [exceptionType, setExceptionType] = useState<ExceptionType>("full_day_unavailable");
  const [exceptionReason, setExceptionReason] = useState("");
  const [exceptionStart, setExceptionStart] = useState("09:00");
  const [exceptionEnd, setExceptionEnd] = useState("13:00");

  const [newDay, setNewDay] = useState<DayOfWeek>("Monday");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("13:00");
  const [newDuration, setNewDuration] = useState(30);

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

    setWeeklySchedules(getStoredWeeklySchedules());
    setExceptions(getStoredExceptions());
  }, []);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      if (!selectedDoctorId || !doctors.some((d) => d.id === selectedDoctorId)) {
        setSelectedDoctorId(doctors[0].id);
      }
    } else {
      setSelectedDoctorId("");
    }
  }, [doctors, selectedDoctorId]);

  const currentDoctor = doctors?.find((d) => d.id === selectedDoctorId);
  const currentDept = currentDoctor
    ? departments.find((dept) => dept.slug === currentDoctor.departmentSlug)
    : null;

  const doctorWeeklySchedules = weeklySchedules.filter((s) => s.doctorId === selectedDoctorId);
  const doctorExceptions = exceptions.filter((e) => e.doctorId === selectedDoctorId);

  const handleAddWeeklySlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    const newSlot: DoctorWeeklySchedule = {
      id: `ws-${Date.now()}`,
      doctorId: selectedDoctorId,
      dayOfWeek: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      slotDurationMinutes: Number(newDuration),
      isActive: true,
    };

    const updated = [...weeklySchedules, newSlot];
    setWeeklySchedules(updated);
    saveStoredWeeklySchedules(updated);

    setFeedback(`Weekly slot added for ${newDay} (${format12Hour(newStartTime)}–${format12Hour(newEndTime)}).`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemoveWeeklySlot = (id: string) => {
    const updated = weeklySchedules.filter((s) => s.id !== id);
    setWeeklySchedules(updated);
    saveStoredWeeklySchedules(updated);
    setFeedback("Weekly schedule updated.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const existing = doctorExceptions.find((e) => e.date === dateStr);
    if (existing) {
      setExceptionType(existing.type);
      setExceptionReason(existing.reason || "");
      setExceptionStart(existing.startTime || "09:00");
      setExceptionEnd(existing.endTime || "13:00");
    } else {
      setExceptionType("full_day_unavailable");
      setExceptionReason("On Leave");
      setExceptionStart("09:00");
      setExceptionEnd("13:00");
    }
  };

  const handleSaveException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDateStr) return;

    const newEx: DoctorAvailabilityException = {
      id: `ex-${Date.now()}`,
      doctorId: selectedDoctorId,
      date: selectedDateStr,
      type: exceptionType,
      reason: exceptionReason.trim() || null,
      startTime: exceptionType !== "full_day_unavailable" ? exceptionStart : null,
      endTime: exceptionType !== "full_day_unavailable" ? exceptionEnd : null,
      createdAt: new Date().toISOString(),
    };

    addOrUpdateException(newEx);
    setExceptions(getStoredExceptions());
    setSelectedDateStr(null);
    setFeedback(`Availability exception saved for ${formatDisplayDate(selectedDateStr)}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClearException = () => {
    if (!selectedDoctorId || !selectedDateStr) return;
    removeException(selectedDoctorId, selectedDateStr);
    setExceptions(getStoredExceptions());
    setSelectedDateStr(null);
    setFeedback(`Exception cleared. Default schedule restored for ${formatDisplayDate(selectedDateStr)}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportDoctorDay = async (dateStr: string) => {
    if (!currentDoctor) return;
    const appointments = await getBookingsForDate(dateStr, currentDoctor.id);
    await exportSingleDoctorBookingsXlsx(currentDoctor, currentDept?.name || "Specialist", dateStr, appointments);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  if (currentRole !== "admin") {
    return (
      <AdminLayout userRole="staff">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">403 — Access Forbidden</h2>
          <p className="text-xs text-[var(--slate)] mt-1">Staff accounts cannot configure doctor schedules.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
            Schedules &amp; Availability Calendar
          </h1>
          <p className="text-xs text-[var(--slate)] mt-0.5">
            Configure weekly recurring consultation windows and set date-specific leave or custom hours.
          </p>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="card p-4 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-3">
            <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-[var(--slate)] px-1">
              Select Specialist
            </h2>
            <div className="space-y-1">
              {isLoading ? (
                <p className="text-xs text-[var(--slate)] p-2">Loading physicians...</p>
              ) : !doctors || doctors.length === 0 ? (
                <div className="p-3 text-center text-xs text-[var(--slate)] bg-[var(--cloud)] rounded-xl">
                  No doctors registered yet.
                </div>
              ) : (
                doctors.map((doc) => {
                  const docWeeklyCount = weeklySchedules.filter((s) => s.doctorId === doc.id).length;
                  const docExCount = exceptions.filter((e) => e.doctorId === doc.id).length;
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-[var(--primary)] text-white shadow-xs"
                          : "text-[var(--slate)] hover:bg-[var(--cloud)] hover:text-[var(--navy-950)]"
                      }`}
                    >
                      <div>
                        <p className="leading-tight">{doc.name}</p>
                        <p className={`text-[10px] ${isSelected ? "text-white/80" : "text-[var(--slate)]"}`}>
                          {doc.departmentSlug}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold block">{docWeeklyCount} Slots</span>
                        {docExCount > 0 && (
                          <span className={`text-[9px] ${isSelected ? "text-amber-200" : "text-amber-600"}`}>
                            {docExCount} Overrides
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            {!currentDoctor ? (
              <div className="card p-12 bg-white border border-[var(--mist)] rounded-2xl shadow-xs text-center text-xs text-[var(--slate)]">
                <Clock size={36} className="mx-auto mb-3 text-[var(--primary)] opacity-60" />
                <h3 className="text-base font-bold text-[var(--navy-950)] mb-1">
                  No Doctor Selected
                </h3>
                <p className="max-w-md mx-auto">
                  {doctors && doctors.length > 0
                    ? "Select a physician from the sidebar to manage their consultation schedule."
                    : "No doctors registered in the system. Add doctors in the Doctor Management module first."}
                </p>
              </div>
            ) : (
              <div className="card p-6 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[var(--navy-950)]">
                      {currentDoctor.name}
                    </h3>
                    <p className="text-xs text-[var(--slate)]">
                      Department: {currentDept?.name || currentDoctor.departmentSlug}
                    </p>
                  </div>

                  <div className="flex rounded-xl bg-[var(--cloud)] p-1 border border-[var(--mist)] text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
                        activeTab === "calendar"
                          ? "bg-white text-[var(--navy-950)] shadow-xs"
                          : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                      }`}
                    >
                      <CalendarIcon size={14} />
                      <span>Availability Calendar</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("weekly")}
                      className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
                        activeTab === "weekly"
                          ? "bg-white text-[var(--navy-950)] shadow-xs"
                          : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                      }`}
                    >
                      <Clock size={14} />
                      <span>Weekly Pattern ({doctorWeeklySchedules.length})</span>
                    </button>
                  </div>
                </div>

                {activeTab === "calendar" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={prevMonth}
                          className="p-1.5 rounded-lg border border-[var(--mist)] hover:bg-[var(--cloud)]"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="font-display font-bold text-sm text-[var(--navy-950)] min-w-[140px] text-center">
                          {monthName} {year}
                        </span>
                        <button
                          onClick={nextMonth}
                          className="p-1.5 rounded-lg border border-[var(--mist)] hover:bg-[var(--cloud)]"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--slate)]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span>Leave / Blocked</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span>Custom / Partial</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                          <span>Off Day</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[var(--mist)] rounded-2xl overflow-hidden shadow-xs">
                      <div className="grid grid-cols-7 bg-[var(--cloud)]/70 border-b border-[var(--mist)] text-center text-[10px] font-bold uppercase tracking-wider text-[var(--slate)] py-2">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                      </div>

                      <div className="grid grid-cols-7 divide-x divide-y divide-[var(--mist)] bg-white text-xs">
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`empty-${i}`} className="min-h-[85px] bg-[var(--cloud)]/20 p-2" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const dateObj = new Date(year, month, dayNum);
                          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                          const dayOfWeek = DAYS[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];

                          const hasWeekly = doctorWeeklySchedules.some(
                            (s) => s.dayOfWeek === dayOfWeek && s.isActive !== false
                          );

                          const ex = doctorExceptions.find((e) => e.date === dateStr);

                          let statusStyle = "bg-gray-50 border-gray-200 text-gray-400";
                          let badgeText = "Off";

                          if (ex) {
                            if (ex.type === "full_day_unavailable") {
                              statusStyle = "bg-red-50/80 border-red-200 text-red-700";
                              badgeText = ex.reason || "On Leave";
                            } else if (ex.type === "partial_unavailable") {
                              statusStyle = "bg-amber-50/80 border-amber-200 text-amber-800";
                              badgeText = "Partial Block";
                            } else if (ex.type === "custom_hours") {
                              statusStyle = "bg-blue-50/80 border-blue-200 text-blue-800";
                              badgeText = `${format12Hour(ex.startTime)}–${format12Hour(ex.endTime)}`;
                            }
                          } else if (hasWeekly) {
                            statusStyle = "bg-emerald-50/60 border-emerald-200 text-emerald-800";
                            badgeText = "Available";
                          }

                          return (
                            <div
                              key={dateStr}
                              onClick={() => handleDateClick(dateStr)}
                              className={`min-h-[85px] p-2 flex flex-col justify-between cursor-pointer hover:bg-sky-50/50 transition-colors ${statusStyle}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[var(--navy-950)]">{dayNum}</span>
                                {ex && <Ban size={12} className="text-red-500 shrink-0" />}
                              </div>

                              <div className="mt-1">
                                <span className="text-[10px] font-semibold truncate block leading-tight">
                                  {badgeText}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[9px] opacity-75">
                                <span>Click to edit</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "weekly" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--slate)] mb-3">
                        Active Weekly Time Windows ({doctorWeeklySchedules.length})
                      </h4>

                      {doctorWeeklySchedules.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[var(--cloud)] border border-[var(--mist)] text-xs text-[var(--slate)] text-center">
                          No recurring schedule defined. Add consultation blocks below.
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {doctorWeeklySchedules.map((slot) => (
                            <div
                              key={slot.id}
                              className="p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--cloud)]/40 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white border border-[var(--mist)] text-[var(--primary)] font-bold text-xs">
                                  {slot.dayOfWeek.substring(0, 3)}
                                </div>
                                <div>
                                  <p className="font-bold text-[var(--navy-950)]">{slot.dayOfWeek}</p>
                                  <p className="text-[11px] text-[var(--slate)]">
                                    {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)} ({slot.slotDurationMinutes} min slots)
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveWeeklySlot(slot.id)}
                                className="p-1.5 rounded-lg text-[var(--slate)] hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Remove time block"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t border-[var(--mist)]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--slate)] mb-3">
                        Add Weekly Consultation Block (Supports Multiple Sessions/Day)
                      </h4>

                      <form onSubmit={handleAddWeeklySlot} className="grid sm:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--navy-950)] mb-1">
                            Day of Week
                          </label>
                          <select
                            value={newDay}
                            onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none bg-white font-medium"
                          >
                            {DAYS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--navy-950)] mb-1">
                            Session Start
                          </label>
                          <input
                            type="time"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--navy-950)] mb-1">
                            Session End
                          </label>
                          <input
                            type="time"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--navy-950)] mb-1">
                            Slot Duration (Minutes)
                          </label>
                          <select
                            value={newDuration}
                            onChange={(e) => setNewDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none bg-white font-medium"
                          >
                            <option value={15}>15 Minutes</option>
                            <option value={20}>20 Minutes</option>
                            <option value={30}>30 Minutes</option>
                            <option value={45}>45 Minutes</option>
                            <option value={60}>60 Minutes</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4 flex justify-end pt-2">
                          <button type="submit" className="btn btn-primary text-xs py-2 px-4 gap-1.5">
                            <Plus size={14} />
                            <span>Add Consultation Block</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedDateStr && currentDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[var(--mist)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--mist)] mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--navy-950)]">
                    Override Availability: {formatDisplayDate(selectedDateStr)}
                  </h3>
                  <p className="text-xs text-[var(--slate)]">{currentDoctor.name}</p>
                </div>
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="p-1.5 rounded-lg text-[var(--slate)] hover:bg-[var(--cloud)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveException} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Exception Type
                  </label>
                  <select
                    value={exceptionType}
                    onChange={(e) => setExceptionType(e.target.value as ExceptionType)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none bg-white font-medium"
                  >
                    <option value="full_day_unavailable">Mark Entire Day Unavailable (Leave / Block)</option>
                    <option value="partial_unavailable">Mark Specific Time Window Unavailable</option>
                    <option value="custom_hours">Set Custom Consultation Hours for This Date</option>
                  </select>
                </div>

                {exceptionType === "full_day_unavailable" ? (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                      Reason / Internal Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={exceptionReason}
                      onChange={(e) => setExceptionReason(e.target.value)}
                      placeholder="e.g. Conference, Medical Leave"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={exceptionStart}
                        onChange={(e) => setExceptionStart(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={exceptionEnd}
                        onChange={(e) => setExceptionEnd(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[var(--mist)]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearException}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Clear Override
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportDoctorDay(selectedDateStr)}
                      className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <FileSpreadsheet size={12} />
                      <span>Download .xlsx</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDateStr(null)}
                      className="btn btn-ghost text-xs py-2 px-3"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary text-xs py-2 px-4">
                      Save Override
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
