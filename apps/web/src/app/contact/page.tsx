import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & 24/7 Emergency Helpline in Silchar",
  description:
    "Contact South City Hospital in Meherpur, Silchar, Assam. 24/7 Emergency & Ambulance Helpline: +91 6901271223. Outpatient OPD Hours: Mon–Sat, 9AM–4PM.",
  alternates: {
    canonical: "https://southcityhospital.in/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
