import type { Metadata } from "next";
import { DepartmentsClient } from "./DepartmentsClient";

export const metadata: Metadata = {
  title: "Clinical Departments & Specialties in Silchar",
  description:
    "Explore 13 clinical departments at South City Hospital in Silchar, Assam — Orthopaedics, Neuro Surgery, Cardiology, Gynaecology, Paediatrics, Nephrology, Urology, and General Surgery.",
  alternates: {
    canonical: "https://southcityhospital.in/departments",
  },
};

export default function DepartmentsPage() {
  return <DepartmentsClient />;
}
