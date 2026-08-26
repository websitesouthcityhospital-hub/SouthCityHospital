import type { Metadata } from "next";
import { DoctorsClient } from "./DoctorsClient";

export const metadata: Metadata = {
  title: "Specialist Doctors in Silchar",
  description:
    "Consult top medical specialists in Silchar across Cardiology, Neuro Surgery, Orthopaedics, Paediatrics, Gynaecology, Urology, and Nephrology. Book your appointment online.",
  alternates: {
    canonical: "https://southcityhospital.in/doctors",
  },
};

export default function DoctorsPage() {
  return <DoctorsClient />;
}
