"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Menu, X, ChevronRight, ShieldAlert } from "lucide-react";
import { hospital } from "@/data/hospital";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/facilities", label: "Facilities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Focus trap on mobile menu open
  useEffect(() => {
    if (!mobileOpen) return;
    const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
      "a, button, [tabindex]:not([tabindex='-1'])"
    );
    if (focusable && focusable.length > 0) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
      if (e.key === "Tab" && focusable) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Emergency Bar ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-2 text-white text-xs font-semibold bg-[#b83e28]"
        role="banner"
        aria-label="Emergency contact"
      >
        <div className="hidden sm:block opacity-90 font-medium">
          {hospital.location.address}
        </div>
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <ShieldAlert size={14} aria-hidden="true" className="opacity-90" />
          <span>
            24×7 Emergency & Ambulance:{" "}
            <a
              href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
              className="font-bold hover:text-white/80 transition-colors underline underline-offset-2 decoration-[1.5px]"
            >
              {hospital.contact.emergency}
            </a>
          </span>
        </div>
      </div>

      {/* ── Main Nav ── */}
      <nav
        aria-label="Main navigation"
        className={cn(
          "transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/80 backdrop-blur-xl border-[var(--mist)] shadow-[var(--shadow-card)]" 
            : "bg-transparent border-transparent"
        )}
      >
        <div className="container-site flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <Link
            href="/"
            aria-label="South City Hospital — Home"
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0"
          >
            <Image
              src="/logo.jpg"
              alt="South City Hospital Logo"
              width={40}
              height={40}
              className="rounded-lg object-cover w-9 h-9 sm:w-11 sm:h-11 shrink-0 shadow-xs"
            />
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-display font-bold text-sm sm:text-lg leading-tight text-[var(--primary-dark)] truncate">
                South City Hospital
              </span>
              <span className="text-[10px] text-[var(--slate)] font-medium leading-none hidden xs:block">
                Meherpur, Silchar
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-6 xl:ml-10 2xl:ml-14" role="list">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative px-2 xl:px-2.5 py-1.5 h-9 flex items-center text-xs xl:text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap",
                      isActive
                        ? "text-[var(--primary-dark)]"
                        : "text-[var(--slate)] hover:text-[var(--primary)]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--primary-mid)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center shrink-0 ml-3 xl:ml-6">
            <Link
              href="/doctors"
              className="btn btn-primary text-xs xl:text-sm py-2 px-4"
            >
              Book Appointment
            </Link>
          </div>

          {/* Mobile Hamburger (Strictly hidden on desktop, visible on mobile) */}
          <button
            ref={hamburgerRef}
            className="flex lg:hidden items-center justify-center p-2 rounded-lg text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--cloud)] transition-colors shrink-0 -mr-1 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* ── Mobile Menu Drawer (Portalled to document.body) ── */}
        {mounted && createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <div className="fixed inset-0 z-[99999] lg:hidden" style={{ isolation: "isolate" }}>
                {/* Backdrop */}
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 bg-[#071b3d]/60 backdrop-blur-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileOpen(false)}
                  aria-hidden="true"
                />
                {/* Drawer */}
                <motion.div
                  key="mobile-menu"
                  ref={mobileMenuRef}
                  id="mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation Menu"
                  className="fixed top-0 right-0 bottom-0 w-[min(300px,82vw)] bg-white z-[99999] shadow-2xl flex flex-col justify-between overflow-hidden"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b flex items-center justify-between bg-white shrink-0" style={{ borderColor: "var(--mist)" }}>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.jpg"
                        alt="Logo"
                        width={28}
                        height={28}
                        className="rounded-md object-cover"
                      />
                      <span className="font-display font-bold text-xs text-[var(--primary-dark)]">
                        South City Hospital
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-1.5 rounded-lg text-[var(--slate)] hover:bg-[var(--cloud)] transition-colors"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Links */}
                  <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile menu links">
                    <ul className="space-y-0.5" role="list">
                      {NAV_LINKS.map((link, i) => {
                        const isActive =
                          link.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(link.href);
                        return (
                          <motion.li
                            key={link.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 + 0.05 }}
                          >
                            <Link
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                                isActive
                                  ? "bg-[var(--primary-light)] text-[var(--primary-dark)] font-bold shadow-2xs"
                                  : "text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--cloud)]"
                              )}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <span>{link.label}</span>
                              <ChevronRight size={14} className="opacity-40" />
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Drawer Footer CTAs */}
                  <div
                    className="p-4 border-t space-y-2.5 bg-[var(--cloud)]/50 shrink-0"
                    style={{ borderColor: "var(--mist)" }}
                  >
                    <Link
                      href="/doctors"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-primary w-full text-center py-2.5 text-xs font-semibold"
                    >
                      Book Appointment
                    </Link>
                    <a
                      href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                      className="btn btn-emergency w-full text-center py-2 text-xs font-semibold whitespace-normal flex items-center justify-center gap-1.5"
                    >
                      <Phone size={14} aria-hidden="true" />
                      <span>24/7 ER: {hospital.contact.emergency}</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </nav>
    </header>
  );
}
