"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "sch_cookie_consent_v1";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!storedConsent) {
        // Small delay to prevent layout pop on initial render
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage access failures
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
      window.dispatchEvent(new CustomEvent("sch-cookie-consent", { detail: "accepted" }));
    } catch {
      // Ignore localStorage error
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
      window.dispatchEvent(new CustomEvent("sch-cookie-consent", { detail: "declined" }));
    } catch {
      // Ignore localStorage error
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-3 inset-x-3 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="bg-[#1e2430]/95 backdrop-blur-md text-slate-100 p-4 sm:p-5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-slate-700/70 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <p className="font-display font-semibold text-sm text-slate-100">
              Cookie &amp; Privacy Notice
            </p>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors p-1.5 rounded-lg shrink-0"
            aria-label="Dismiss cookie notice"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use essential cookies and anonymized session logs to maintain hospital booking security and site performance. We never sell your personal data. Read our{" "}
          <Link
            href="/privacy-policy"
            className="text-sky-400 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={handleAccept}
            className="btn text-xs py-2 px-4 flex-1 text-center font-semibold bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-sm rounded-lg transition-colors"
          >
            Accept &amp; Continue
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="btn text-xs py-2 px-3 text-slate-300 bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 hover:text-white rounded-lg transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
