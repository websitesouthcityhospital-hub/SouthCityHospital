"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { faqs } from "@/data/faqs";
import { ScrollReveal } from "@/components/ui/motion";
import { renderTextWithTelLinks } from "@/lib/text-utils";

export function FaqHighlight() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);
  const highlighted = faqs.slice(0, 3);

  return (
    <section
      aria-labelledby="faq-heading"
      className="py-[var(--section-y)]"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <ScrollReveal className="lg:sticky lg:top-28">
            <p className="eyebrow mb-3">Frequently Asked</p>
            <h2
              id="faq-heading"
              className="font-display text-display-lg mb-4"
              style={{ color: "var(--primary-dark)" }}
            >
              Common questions,
              <br />
              clear answers.
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--slate)" }}>
              Find answers to the most common questions about our services,
              emergency care, and how to reach us.
            </p>
            <Link href="/faq" className="btn btn-outline gap-2 inline-flex">
              All Questions
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="space-y-3">
            {highlighted.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border rounded-[var(--radius-card)] overflow-hidden"
                  style={{ borderColor: isOpen ? "var(--primary)" : "var(--mist)" }}
                >
                  <button
                    id={`faq-btn-${faq.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
                    style={{ background: isOpen ? "var(--primary-light)" : "var(--white)" }}
                  >
                    <span
                      className="font-semibold text-sm pr-2"
                      style={{ color: isOpen ? "var(--primary-dark)" : "var(--ink)" }}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0"
                    >
                      <ChevronDown size={18} style={{ color: "var(--slate)" }} aria-hidden="true" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${faq.id}`}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <p
                          className="px-5 pb-5 pt-1 text-sm leading-relaxed"
                          style={{ color: "var(--slate)" }}
                        >
                          {renderTextWithTelLinks(faq.answer)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
