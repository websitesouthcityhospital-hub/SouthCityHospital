import type { Metadata } from "next";
import { FaqClient } from "./FaqClient";

export const metadata: Metadata = {
  title: "Patient FAQs & Hospital Guide",
  description:
    "Find answers to frequently asked questions about emergency admissions, doctor appointment booking, visiting hours, diagnostic reports, and medical departments in Silchar, Assam.",
  alternates: {
    canonical: "https://southcityhospital.in/faq",
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
