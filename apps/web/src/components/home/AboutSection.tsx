"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Users, Building2, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/motion";
import { hospital } from "@/data/hospital";

export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="py-[var(--section-y)]"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Stats block */}
          <ScrollReveal variants={{ hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } } }}>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: hospital.established.toString(),
                  label: "Year Established",
                  icon: Building2,
                },
                {
                  value: `${hospital.stats.yearsOfService}+`,
                  label: "Years of Service",
                  icon: ShieldCheck,
                },
                {
                  value: `${hospital.stats.departments}`,
                  label: "Clinical Departments",
                  icon: Users,
                },
                {
                  value: `${hospital.stats.facilities}`,
                  label: "Diagnostic Facilities",
                  icon: MapPin,
                },
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="card p-4 sm:p-6 border border-[var(--mist)] text-center"
                >
                  <Icon
                    size={20}
                    className="mx-auto mb-1.5 sm:mb-2"
                    style={{ color: "var(--primary)" }}
                    aria-hidden="true"
                  />
                  <p
                    className="font-display font-bold text-2xl sm:text-3xl"
                    style={{ color: "var(--primary-dark)" }}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] sm:text-xs mt-1" style={{ color: "var(--slate)" }}>
                    {label}
                  </p>
                </div>
              ))}

              {/* Managing Partner */}
              <div
                className="card col-span-2 p-4 sm:p-6 border border-[var(--mist)] flex items-center gap-3.5 sm:gap-4"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-white text-base sm:text-lg shadow-sm"
                  style={{ background: "var(--primary)" }}
                  aria-hidden="true"
                >
                  N
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                    {hospital.managingPartner}
                  </p>
                  <p className="text-xs" style={{ color: "var(--slate)" }}>
                    Managing Partner
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right — About text */}
          <ScrollReveal
            variants={{ hidden: { opacity: 0, x: 32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } } }}
            className="space-y-6"
          >
            <div>
              <p className="eyebrow mb-3">About South City Hospital</p>
              <h2
                id="about-heading"
                className="font-display text-display-lg mb-5"
                style={{ color: "var(--primary-dark)" }}
              >
                A legacy of care
                <br />
                since 2006.
              </h2>
            </div>

            <p className="text-base leading-relaxed" style={{ color: "var(--slate)" }}>
              {hospital.about}
            </p>

            <div className="flex items-start gap-2.5 text-sm" style={{ color: "var(--slate)" }}>
              <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} aria-hidden="true" />
              {hospital.location.address}
            </div>

            <Link
              href="/about"
              className="btn btn-outline gap-2 self-start inline-flex"
            >
              Learn More About Us
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
