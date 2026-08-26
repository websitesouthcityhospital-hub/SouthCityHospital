"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Phone, CalendarCheck, ArrowRight, MapPin } from "lucide-react";
import { PulseLine } from "@/components/ui/PulseLine";
import { hospital } from "@/data/hospital";
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants, Floating } from "@/components/ui/motion";

export function HeroSection() {

  return (
    <section
      aria-label="Hero — South City Hospital"
      className="relative overflow-hidden bg-hero-gradient min-h-auto lg:min-h-[90vh] flex items-center"
    >
      {/* Background decoration for the blue area */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0 lg:w-1/2"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 40%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 20% 80%, var(--primary-light) 0%, transparent 40%)`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0 lg:w-1/2"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(var(--mist) 1px, transparent 1px), linear-gradient(90deg, var(--mist) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Mobile & Tablet full-bleed image with smooth vertical fade mask */}
      <div 
        className="absolute inset-0 z-0 lg:hidden pointer-events-none overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.2) 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.2) 88%, transparent 100%)"
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1400&auto=format&fit=crop"
          alt="South City Hospital corridor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-50"
        />
        {/* Soft tinted overlay to blend seamlessly with hospital brand blues */}
        <div className="absolute inset-0 bg-[var(--blue-950)]/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--blue-950)] via-[var(--blue-950)]/45 to-transparent" />
      </div>

      {/* Desktop right-side full-bleed image with smooth horizontal fade mask */}
      <div 
        className="absolute inset-y-0 right-0 z-0 hidden lg:block lg:w-[60%]"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 25%, black 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%, black 100%)"
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop"
          alt="South City Hospital corridor"
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-[var(--blue-950)]/10 mix-blend-multiply" />
      </div>

      <div className="container-site w-full pt-8 pb-12 sm:pt-14 sm:pb-16 lg:pt-24 lg:pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column ── */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Eyebrow */}
            <motion.div variants={staggerItemVariants} className="flex items-center gap-3">
              <span
                className="eyebrow text-white/60"
              >
                Est. {hospital.established} · Meherpur, Silchar, Assam
              </span>
              <MapPin size={12} className="text-white/40" aria-hidden="true" />
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={staggerItemVariants}
              className="font-display text-white leading-tight"
              style={{ fontSize: "var(--text-display-2xl)" }}
            >
              Healthcare
              <br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>
                focused on you.
              </em>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={staggerItemVariants}
              className="text-white/75 text-lg max-w-md leading-relaxed"
            >
              {hospital.tagline}. {hospital.stats.yearsOfService}+ years of
              trusted multi-specialty care for Silchar and the Barak Valley.
            </motion.p>

            {/* Pulse Line */}
            <motion.div variants={staggerItemVariants}>
              <PulseLine color="var(--accent)" width={300} height={44} />
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={staggerItemVariants}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/doctors"
                className="btn btn-primary gap-2 text-base px-6 py-3"
                style={{ background: "white", color: "var(--primary-dark)" }}
              >
                <CalendarCheck size={18} aria-hidden="true" />
                Book Appointment
              </Link>
              <a
                href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                className="btn btn-emergency gap-2 text-base px-6 py-3"
              >
                <Phone size={18} aria-hidden="true" />
                Call ER Now
              </a>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              variants={staggerItemVariants}
              className="pt-6 mt-6 border-t border-white/10"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {[
                  "11 Specialized Departments",
                  "24/7 ICU & Critical Care",
                  "Same-Day LIS Lab Diagnostics",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--accent)]"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <span className="text-sm text-white/80">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Column (Empty to let background image show cleanly) ── */}
          <div className="relative hidden lg:block h-full w-full pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
