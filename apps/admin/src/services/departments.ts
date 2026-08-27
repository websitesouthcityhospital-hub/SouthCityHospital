"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface DepartmentItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export async function fetchDepartments(): Promise<DepartmentItem[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("id, slug, name, description, icon")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id || d.slug,
          slug: d.slug,
          name: d.name,
          description: d.description || "",
          icon: d.icon || "Stethoscope",
        }));
      }
    } catch (err) {
      console.warn("Supabase fetchDepartments error:", err);
    }
  }

  // Fallback if network issue
  return [
    { id: "internal-medicine", slug: "internal-medicine", name: "Internal Medicine", description: "Primary care and adult diagnostics.", icon: "Stethoscope" },
    { id: "orthopaedic-surgery", slug: "orthopaedic-surgery", name: "Orthopaedic Surgery", description: "Bone, joint, and trauma care.", icon: "Bone" },
    { id: "gynaecology-obstetrics", slug: "gynaecology-obstetrics", name: "Gynaecology & Obstetrics", description: "Maternity and women's health.", icon: "HeartPulse" },
    { id: "cardiology", slug: "cardiology", name: "Cardiology", description: "Cardiac care and diagnostics.", icon: "HeartPulse" },
    { id: "general-laparoscopic-surgery", slug: "general-laparoscopic-surgery", name: "General & Laparoscopic Surgery", description: "Minimally invasive surgery.", icon: "Scissors" },
    { id: "neurology", slug: "neurology", name: "Neurology", description: "Brain, spine, and nerve disorders.", icon: "Brain" },
    { id: "urology-laser-surgery", slug: "urology-laser-surgery", name: "Urology & Laser Surgery", description: "Kidney stone and laser urology.", icon: "Zap" },
    { id: "nephrology", slug: "nephrology", name: "Nephrology", description: "Kidney disease and dialysis.", icon: "Droplets" },
    { id: "paediatrics", slug: "paediatrics", name: "Paediatrics & Neonatology", description: "Infant and child care.", icon: "ShieldCheck" },
    { id: "emergency", slug: "emergency", name: "Emergency & Trauma Care", description: "24/7 emergency response.", icon: "Siren" },
    { id: "critical-care", slug: "critical-care", name: "Critical Care (ICU)", description: "Intensive care unit.", icon: "Zap" },
    { id: "anaesthesiology", slug: "anaesthesiology", name: "Anaesthesiology", description: "Perioperative care.", icon: "Syringe" },
    { id: "oncology", slug: "oncology", name: "Oncology", description: "Cancer screening and therapy.", icon: "Dna" },
  ];
}

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments()
      .then((data) => setDepartments(data))
      .finally(() => setIsLoading(false));
  }, []);

  return { departments, isLoading };
}
