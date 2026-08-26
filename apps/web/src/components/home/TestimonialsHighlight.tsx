"use client";

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";

export function TestimonialsHighlight() {
  const highlighted = testimonials.slice(0, 2);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-[var(--section-y)]"
      style={{ background: "var(--primary-light)" }}
    >
      <div className="container-site">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <ScrollReveal>
            <p className="eyebrow mb-3">Patient Stories</p>
            <h2
              id="testimonials-heading"
              className="font-display text-display-lg"
              style={{ color: "var(--primary-dark)" }}
            >
              What our patients say.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              href="/testimonials"
              className="btn btn-outline gap-2 whitespace-nowrap self-start"
            >
              All Stories
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>

        <StaggerReveal className="grid sm:grid-cols-2 gap-6">
          {highlighted.map((t) => (
            <StaggerItem
              key={t.id}
              variants={staggerItemVariants}
              className="card p-7 border border-[var(--mist)] flex flex-col gap-5"
            >
              {/* Large quote mark */}
              <Quote
                size={36}
                aria-hidden="true"
                className="opacity-20 shrink-0"
                style={{ color: "var(--primary)" }}
              />
              <blockquote>
                <p className="text-base leading-relaxed italic" style={{ color: "var(--ink)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <div className="flex items-center gap-3 pt-1 border-t" style={{ borderColor: "var(--mist)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-white text-sm shrink-0"
                  style={{ background: "var(--primary-mid)" }}
                  aria-hidden="true"
                >
                  {t.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                    {t.patientName}
                  </p>
                  <span className="chip chip-diagnostic text-[10px]">{t.department}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
