"use client";

import { useState, useEffect, useRef } from "react";
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useDoctors, saveDoctor, deleteDoctor, clearAllDoctors } from "@/services/doctors";
import { uploadDoctorAvatar } from "@/services/storage";
import { useDepartments } from "@/services/departments";
import type { Doctor, UserRole } from "@sch/types";

function getDoctorInitials(name: string): string {
  const clean = name.replace(/^dr\.?\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || "DR";
}

export default function AdminDoctorsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const { data: initialDoctors, isLoading, refresh } = useDoctors({ activeOnly: false });
  const { departments } = useDepartments();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [deptSlug, setDeptSlug] = useState("cardiology");
  const [qualifications, setQualifications] = useState("MBBS, MD");
  const [experience, setExperience] = useState(10);
  const [languages, setLanguages] = useState("English, Bengali, Hindi");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  useEffect(() => {
    if (initialDoctors) {
      setDoctorsList(initialDoctors);
    }
  }, [initialDoctors]);

  const handleOpenCreate = () => {
    setName("");
    setDeptSlug("cardiology");
    setQualifications("MBBS, MD");
    setExperience(10);
    setLanguages("English, Bengali, Hindi");
    setPhotoUrl("");
    setIsActive(true);
    setIsCreating(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setDeptSlug(doc.departmentSlug);
    setQualifications(doc.qualifications.join(", "));
    setExperience(doc.experienceYears);
    setLanguages(
      doc.languages && doc.languages.length > 0
        ? doc.languages.join(", ")
        : "English, Bengali, Hindi"
    );
    setPhotoUrl(doc.photoUrl || "");
    setIsActive(doc.active);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadDoctorAvatar(file);
      setPhotoUrl(res.url);
      setFeedback({
        type: "success",
        message: `Photo optimized (${res.originalSizeKB} KB → ${res.compressedSizeKB} KB) & uploaded to Supabase storage.`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to upload photo." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const quals = qualifications.split(",").map((q) => q.trim()).filter(Boolean);
    const spokenLangs = languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    if (isCreating) {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        name: name.trim().startsWith("Dr.") ? name.trim() : `Dr. ${name.trim()}`,
        departmentSlug: deptSlug,
        qualifications: quals,
        experienceYears: Number(experience),
        photoUrl: photoUrl.trim() || null,
        active: isActive,
        consultationSchedule: [
          { day: "Monday–Wednesday", startTime: "09:00", endTime: "13:00" },
        ],
        languages: spokenLangs.length > 0 ? spokenLangs : ["English", "Bengali", "Hindi"],
      };
      await saveDoctor(newDoc);
      setDoctorsList((prev) => [newDoc, ...prev]);
      setIsCreating(false);
      setFeedback({ type: "success", message: `${newDoc.name} registered successfully.` });
    } else if (editingDoctor) {
      const updatedDoc: Doctor = {
        ...editingDoctor,
        name: name.trim().startsWith("Dr.") ? name.trim() : `Dr. ${name.trim()}`,
        departmentSlug: deptSlug,
        qualifications: quals,
        experienceYears: Number(experience),
        photoUrl: photoUrl.trim() || null,
        active: isActive,
        languages: spokenLangs.length > 0 ? spokenLangs : ["English", "Bengali", "Hindi"],
      };
      await saveDoctor(updatedDoc);
      setDoctorsList((prev) =>
        prev.map((d) => (d.id === editingDoctor.id ? updatedDoc : d))
      );
      setEditingDoctor(null);
      setFeedback({ type: "success", message: `Profile updated for ${updatedDoc.name}.` });
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleActive = async (doc: Doctor) => {
    const updated: Doctor = { ...doc, active: !doc.active };
    await saveDoctor(updated);
    setDoctorsList((prev) =>
      prev.map((d) => (d.id === doc.id ? updated : d))
    );
    setFeedback({
      type: "success",
      message: `${doc.name} marked ${updated.active ? "Active" : "Inactive"}.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoctor) return;
    await deleteDoctor(deletingDoctor.id);
    setDoctorsList((prev) => prev.filter((d) => d.id !== deletingDoctor.id));
    setFeedback({ type: "success", message: `${deletingDoctor.name} has been deleted.` });
    setDeletingDoctor(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePurgeAll = () => {
    if (!confirm("Are you sure you want to remove ALL doctors from the database?")) return;
    clearAllDoctors();
    setDoctorsList([]);
    setFeedback({ type: "success", message: "All doctors have been cleared." });
    setTimeout(() => setFeedback(null), 3000);
  };

  if (currentRole !== "admin") {
    return (
      <AdminLayout userRole="staff">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">403 — Access Forbidden</h2>
          <p className="text-xs text-[var(--slate)] mt-1">Staff accounts cannot modify doctor profiles.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
              Doctor Management
            </h1>
            <p className="text-xs text-[var(--slate)] mt-0.5">
              Add new specialists, manage medical credentials, upload photos (up to 50MB), and toggle clinic visibility.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {doctorsList.length > 0 && (
              <button
                onClick={handlePurgeAll}
                className="btn btn-outline text-xs py-2.5 px-3.5 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                title="Wipe all doctors from system"
              >
                <Trash2 size={14} />
                <span>Delete All Doctors</span>
              </button>
            )}

            <button
              onClick={handleOpenCreate}
              className="btn btn-primary text-xs py-2.5 px-4 gap-2"
            >
              <Plus size={16} />
              <span>Add New Doctor</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Doctor Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-xs text-[var(--slate)]">
              Loading doctor profiles...
            </div>
          ) : doctorsList.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[var(--mist)] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[var(--cloud)] border border-[var(--mist)] flex items-center justify-center mx-auto mb-3 text-[var(--primary)]">
                <Stethoscope size={32} />
              </div>
              <h3 className="text-base font-bold text-[var(--navy-950)] mb-1">
                No Doctors in System
              </h3>
              <p className="text-xs text-[var(--slate)] max-w-md mx-auto mb-5">
                All hardcoded doctors have been removed. Click &quot;Add New Doctor&quot; below to register hospital physicians and specialists.
              </p>
              <button
                onClick={handleOpenCreate}
                className="btn btn-primary text-xs py-2.5 px-5 gap-1.5 inline-flex items-center"
              >
                <Plus size={15} />
                <span>Add First Doctor</span>
              </button>
            </div>
          ) : (
            doctorsList.map((doc) => {
              const dept = departments.find((d) => d.slug === doc.departmentSlug);
              const initials = getDoctorInitials(doc.name);

              return (
                <div
                  key={doc.id}
                  className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4 hover:border-[var(--primary)]/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {doc.photoUrl ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[var(--mist)] bg-[var(--cloud)]">
                            <img
                              src={doc.photoUrl}
                              alt={doc.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--navy-900)] to-[var(--primary)] text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs border border-white/20">
                            {initials}
                          </div>
                        )}

                        <div>
                          <h3 className="font-display font-semibold text-sm text-[var(--navy-950)] leading-snug">
                            {doc.name}
                          </h3>
                          <p className="text-[11px] text-[var(--slate)] font-medium">
                            {dept?.name || doc.departmentSlug}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleActive(doc)}
                        className={`chip text-[10px] font-bold py-0.5 px-2 cursor-pointer uppercase transition-colors ${
                          doc.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {doc.active ? "Active" : "Inactive"}
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="text-xs text-[var(--slate)] space-y-1.5 pt-2 border-t border-[var(--mist)]">
                      <p>
                        <strong className="text-[var(--navy-950)]">Qualifications:</strong>{" "}
                        {doc.qualifications.length > 0 ? doc.qualifications.join(", ") : "MBBS"}
                      </p>
                      <p>
                        <strong className="text-[var(--navy-950)]">Experience:</strong>{" "}
                        {doc.experienceYears} Years
                      </p>
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="font-semibold text-[var(--navy-950)] mr-1">Languages:</span>
                        {(doc.languages && doc.languages.length > 0 ? doc.languages : ["English", "Bengali", "Hindi"]).map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[var(--mist)] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setDeletingDoctor(doc)}
                      className="btn btn-outline text-xs py-1.5 px-2.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-1 cursor-pointer"
                      title={`Delete ${doc.name}`}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="btn btn-outline text-xs py-1.5 px-3 gap-1.5 border-[var(--mist)] hover:border-[var(--primary)] cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create / Edit Doctor Modal */}
        {(isCreating || editingDoctor) && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[var(--mist)] space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--mist)] pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--navy-950)]">
                    {isCreating ? "Register New Doctor" : `Edit ${editingDoctor?.name}`}
                  </h3>
                  <p className="text-xs text-[var(--slate)] mt-0.5">
                    Configure doctor credentials, clinical department, and profile photo.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingDoctor(null);
                  }}
                  className="p-1 rounded-lg text-[var(--slate)] hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Rajesh Sen"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Clinical Department
                  </label>
                  <select
                    value={deptSlug}
                    onChange={(e) => setDeptSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none bg-white font-medium"
                  >
                    {departments.map((dept) => (
                      <option key={dept.slug} value={dept.slug}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Qualifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="MBBS, MD (General Medicine)"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Spoken Languages (comma-separated, any language string supported)
                  </label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="English, Bengali, Hindi, Assamese, Sylheti"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                {/* Profile Photo Uploader */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Doctor Portrait Photo (Any size — Auto-compressed &lt; 200 KB)
                  </label>

                  <div className="flex items-center gap-3">
                    {photoUrl ? (
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[var(--mist)] bg-[var(--cloud)] shrink-0 group">
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl("")}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[var(--cloud)] border border-dashed border-[var(--mist)] flex items-center justify-center shrink-0 text-[var(--slate)]">
                        <ImageIcon size={20} />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn btn-outline text-xs py-2 px-3 gap-1.5 w-full flex items-center justify-center border-[var(--mist)] hover:border-[var(--primary)] font-medium"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-[var(--primary)]" />
                            <span>Optimizing &amp; Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} />
                            <span>Choose Photo (Auto-compressed &lt; 200 KB)</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-[var(--slate)]">
                        Uploads of any size are automatically compressed into optimized WebP under 200 KB before saving to Supabase.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="doctor-active-check"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[var(--primary)]"
                  />
                  <label htmlFor="doctor-active-check" className="text-xs font-semibold text-[var(--navy-950)]">
                    Profile Active for Public Consultations
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--mist)]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingDoctor(null);
                    }}
                    className="btn btn-ghost text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs py-2 px-4">
                    {isCreating ? "Save Doctor" : "Update Doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[var(--mist)] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <Trash2 size={24} />
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-[var(--navy-950)]">
                  Delete Doctor Profile
                </h3>
                <p className="text-xs text-[var(--slate)] mt-1.5">
                  Are you sure you want to delete <strong>{deletingDoctor.name}</strong> from the database? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingDoctor(null)}
                  className="btn btn-outline text-xs py-2 px-4 border-[var(--mist)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-primary text-xs py-2 px-4 bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
