import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { Doctor } from "@sch/types";

const DATA_FILE = path.join(process.cwd(), "..", "..", "data", "doctors.json");

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project-ref") || url.includes("your-project-id")) {
    return null;
  }
  return createClient(url, key);
}

function readLocalDoctors(): Doctor[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw) || [];
    }
  } catch (err) {
    console.error("Error reading data/doctors.json:", err);
  }
  return [];
}

function writeLocalDoctors(doctors: Doctor[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(doctors, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing data/doctors.json:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentSlug = searchParams.get("departmentSlug");
  const activeOnly = searchParams.get("activeOnly") === "true";

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from("doctors").select("*");
      if (departmentSlug && departmentSlug !== "all") {
        query = query.eq("department_slug", departmentSlug);
      }
      if (activeOnly) {
        query = query.eq("active", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        const mapped: Doctor[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          departmentSlug: d.department_slug,
          qualifications: d.qualifications || [],
          experienceYears: d.experience_years || 0,
          photoUrl: d.photo_url || null,
          active: d.active ?? true,
          consultationSchedule: d.consultation_schedule || [],
          biography: d.biography || null,
          languages: d.languages || ["English", "Bengali", "Hindi"],
        }));
        return NextResponse.json({ success: true, doctors: mapped });
      }
    } catch (err) {
      console.warn("Supabase query error in GET /api/doctors:", err);
    }
  }

  let doctors = readLocalDoctors();
  if (departmentSlug && departmentSlug !== "all") {
    doctors = doctors.filter((d) => d.departmentSlug === departmentSlug);
  }
  if (activeOnly) {
    doctors = doctors.filter((d) => d.active);
  }

  return NextResponse.json({ success: true, doctors });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doctor: Doctor = body.doctor;

    if (!doctor || !doctor.id || !doctor.name || !doctor.departmentSlug) {
      return NextResponse.json(
        { success: false, error: "Missing required doctor fields." },
        { status: 400 }
      );
    }

    // 1. Sync to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("doctors").upsert({
          id: doctor.id,
          name: doctor.name,
          department_slug: doctor.departmentSlug,
          qualifications: doctor.qualifications,
          experience_years: doctor.experienceYears,
          photo_url: doctor.photoUrl,
          active: doctor.active,
          consultation_schedule: doctor.consultationSchedule,
          languages: doctor.languages || ["English", "Bengali", "Hindi"],
        });
      } catch (err) {
        console.warn("Supabase upsert error in POST /api/doctors:", err);
      }
    }

    // 2. Sync to local database file
    const current = readLocalDoctors();
    const idx = current.findIndex((d) => d.id === doctor.id);
    if (idx >= 0) {
      current[idx] = doctor;
    } else {
      current.unshift(doctor);
    }
    writeLocalDoctors(current);

    return NextResponse.json({ success: true, doctor });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save doctor." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const purgeAll = searchParams.get("all") === "true";

    const supabase = getSupabaseClient();

    if (purgeAll) {
      if (supabase) {
        try {
          await supabase.from("doctors").delete().neq("id", "");
        } catch (err) {
          console.warn("Supabase purge error:", err);
        }
      }
      writeLocalDoctors([]);
      return NextResponse.json({ success: true, message: "All doctors deleted." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing doctor ID" }, { status: 400 });
    }

    if (supabase) {
      try {
        await supabase.from("doctors").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    const current = readLocalDoctors();
    const filtered = current.filter((d) => d.id !== id);
    writeLocalDoctors(filtered);

    return NextResponse.json({ success: true, message: `Doctor ${id} deleted.` });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete doctor." },
      { status: 500 }
    );
  }
}
