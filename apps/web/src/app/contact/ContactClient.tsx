"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Globe,
  Send, CheckCircle2, User, MessageSquare,
} from "lucide-react";
import { hospital } from "@/data/hospital";
import { ScrollReveal, Floating } from "@/components/ui/motion";
import { FloatingBlobs, DotGrid, PulseLineWatermark } from "@/components/ui/svg-patterns";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (_data: ContactFormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <div className="card border bg-white p-6 md:p-8 rounded-[var(--radius-card)] shadow-[var(--shadow-card)]" style={{ borderColor: "rgba(208,213,221,0.5)" }}>
      <h2 className="font-display font-semibold text-2xl mb-6" style={{ color: "var(--blue-950)" }}>
        Send us a message
      </h2>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="success" className="flex flex-col items-center text-center gap-4 py-6"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle2 size={48} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <div>
              <p className="font-display font-semibold text-lg mb-1" style={{ color: "var(--primary-dark)" }}>
                Message Received
              </p>
              <p className="text-sm" style={{ color: "var(--slate)" }}>
                We&apos;ll get back to you shortly. For urgent matters, call <a href="tel:+916901271223" style={{ color: "var(--primary)" }} className="font-semibold underline">+91 6901271223</a>.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: "var(--ink)" }}>
                Name <span style={{ color: "var(--emergency)" }}>*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--slate)" }} />
                <input id="contact-name" type="text" placeholder="Your name"
                  className={cn("input-base w-full pl-9 pr-4 py-2.5 border rounded-[var(--radius-button)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-400)] focus:border-transparent transition-all",
                    errors.name ? "border-[var(--coral-500)]" : "border-[var(--mist)] bg-[var(--cloud)]/50")}
                  {...register("name")} />
              </div>
              {errors.name && <p className="mt-1 text-xs" style={{ color: "var(--emergency)" }}>{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: "var(--ink)" }}>
                Phone <span style={{ color: "var(--emergency)" }}>*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--slate)" }} />
                <input id="contact-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                  className={cn("input-base w-full pl-9 pr-4 py-2.5 border rounded-[var(--radius-button)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-400)] focus:border-transparent transition-all",
                    errors.phone ? "border-[var(--coral-500)]" : "border-[var(--mist)] bg-[var(--cloud)]/50")}
                  {...register("phone")} />
              </div>
              {errors.phone && <p className="mt-1 text-xs" style={{ color: "var(--emergency)" }}>{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: "var(--ink)" }}>
                Email <span className="text-xs font-normal" style={{ color: "var(--slate)" }}>(optional)</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--slate)" }} />
                <input id="contact-email" type="email" placeholder="your@email.com"
                  className="input-base w-full pl-9 pr-4 py-2.5 border border-[var(--mist)] bg-[var(--cloud)]/50 rounded-[var(--radius-button)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-400)] focus:border-transparent transition-all"
                  {...register("email")} />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs sm:text-sm font-medium mb-1.5" style={{ color: "var(--ink)" }}>
                Message <span style={{ color: "var(--emergency)" }}>*</span>
              </label>
              <div className="relative">
                <MessageSquare size={15} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: "var(--slate)" }} />
                <textarea id="contact-message" rows={4} placeholder="How can we help you?"
                  className={cn("input-base w-full pl-9 pr-4 py-2.5 border rounded-[var(--radius-button)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-400)] focus:border-transparent transition-all resize-none",
                    errors.message ? "border-[var(--coral-500)]" : "border-[var(--mist)] bg-[var(--cloud)]/50")}
                  {...register("message")} />
              </div>
              {errors.message && <p className="mt-1 text-xs" style={{ color: "var(--emergency)" }}>{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full gap-2 disabled:opacity-60 min-h-[44px]">
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />Sending...</>
              ) : (
                <><Send size={16} aria-hidden="true" />Send Message</>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactClient() {
  return (
    <>
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Contact hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-xl">
            <p className="eyebrow text-[var(--accent)] mb-4">Contact Us</p>
            <h1 className="font-display text-display-xl text-white mb-4">
              We&apos;re here<br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>for you.</em>
            </h1>
            <p className="text-white/75 text-lg">
              Reach out for appointments, general enquiries, or to find your way to our hospital in Meherpur, Silchar.
            </p>
            </ScrollReveal>
        </div>
      </section>



      <section className="py-[var(--section-y)]" style={{ background: "var(--cloud)" }} aria-labelledby="contact-section-heading">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-10">
            <ScrollReveal className="space-y-6">
              <h2 id="contact-section-heading" className="font-display text-display-md" style={{ color: "var(--primary-dark)" }}>
                Get in touch
              </h2>

              <div className="card p-6 border border-[var(--mist)] space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: hospital.contact.phone, href: `tel:${hospital.contact.phone.replace(/\s/g, "")}` },
                  { icon: Phone, label: "Emergency (24/7)", value: hospital.contact.emergency, href: `tel:${hospital.contact.emergency.replace(/\s/g, "")}` },
                  { icon: Mail, label: "Email", value: hospital.contact.email, href: `mailto:${hospital.contact.email}` },
                  { icon: MapPin, label: "Address", value: hospital.location.address },
                  { icon: Clock, label: "OPD Hours", value: `${hospital.opd.days}, ${hospital.opd.hours}` },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--primary-light)" }}>
                      <Icon size={16} style={{ color: "var(--primary)" }} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="eyebrow" style={{ color: "var(--primary-mid)" }}>{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium hover:underline" style={{ color: "var(--ink)" }}>{value}</a>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--ink)" }}>{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="w-full h-48 rounded-[var(--radius-card)] border border-[rgba(208,213,221,0.5)] flex items-center justify-center relative overflow-hidden bg-white shadow-sm"
                aria-label="Map placeholder — South City Hospital, Meherpur, Silchar"
                role="img"
              >
                <DotGrid className="opacity-40" />
                <div className="text-center relative z-10">
                  <MapPin size={28} style={{ color: "var(--blue-600)" }} className="mx-auto mb-2 drop-shadow-md" aria-hidden="true" />
                  <p className="text-sm font-semibold" style={{ color: "var(--blue-950)" }}>South City Hospital</p>
                  <p className="text-xs mt-1" style={{ color: "var(--slate)" }}>Meherpur, Silchar, Assam</p>
                  <a
                    href="https://maps.google.com/?q=Meherpur+Silchar+Assam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold"
                    style={{ color: "var(--blue-600)" }}
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a href={hospital.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Website"
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-[var(--mist)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  style={{ color: "var(--slate)" }}>
                  <Globe size={16} aria-hidden="true" /> {hospital.social.instagramHandle}
                </a>
                <a href={hospital.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Portal"
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-[var(--mist)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  style={{ color: "var(--slate)" }}>
                  <Globe size={16} aria-hidden="true" /> Portal
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
