import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { CoreValuesSection } from "@/components/home/CoreValuesSection";
import { DepartmentsHighlight } from "@/components/home/DepartmentsHighlight";
import { FacilitiesHighlight } from "@/components/home/FacilitiesHighlight";
import { DoctorsHighlight } from "@/components/home/DoctorsHighlight";
import { TestimonialsHighlight } from "@/components/home/TestimonialsHighlight";
import { AboutSection } from "@/components/home/AboutSection";
import { CtaBand } from "@/components/home/CtaBand";
import { FaqHighlight } from "@/components/home/FaqHighlight";

export const metadata: Metadata = {
  title: {
    absolute: "South City Hospital — Multi-Specialty Hospital in Silchar, Assam",
  },
  description:
    "South City Hospital is a premier multi-specialty healthcare institution in Meherpur, Silchar, Assam with 13 clinical departments, 13 diagnostic facilities, and 24/7 emergency services.",
  alternates: {
    canonical: "https://southcityhospital.in",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CoreValuesSection />
      <DepartmentsHighlight />
      <AboutSection />
      <FacilitiesHighlight />
      <DoctorsHighlight />
      <TestimonialsHighlight />
      <FaqHighlight />
      <CtaBand />
    </>
  );
}
