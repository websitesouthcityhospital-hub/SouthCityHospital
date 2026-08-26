/**
 * South City Hospital — Privacy-First Analytics & Booking Funnel Tracker
 * All event dispatches are strictly gated behind cookie consent (Phase 1).
 */

const COOKIE_CONSENT_KEY = "sch_cookie_consent_v1";

export function isAnalyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export interface FunnelEvent {
  name:
    | "page_view"
    | "doctor_view"
    | "slot_selected"
    | "booking_submitted"
    | "booking_confirmed"
    | "pdf_slip_downloaded"
    | "status_lookup_searched";
  properties?: Record<string, any>;
}

export function trackEvent(name: FunnelEvent["name"], properties: Record<string, any> = {}): void {
  if (!isAnalyticsAllowed()) {
    // Suppressed when consent has not been granted by user
    return;
  }

  const payload = {
    event: name,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  // 1. Dispatch to global dataLayer if Google Analytics / GTM is initialized
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push(payload);
  }

  // 2. Dispatch to custom event for modular integrations
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sch-analytics-event", { detail: payload }));
  }
}

// Convenient Booking Funnel Helpers
export const analytics = {
  pageView: (path: string) => trackEvent("page_view", { path }),
  doctorView: (doctorId: string, doctorName: string, department: string) =>
    trackEvent("doctor_view", { doctorId, doctorName, department }),
  slotSelect: (doctorId: string, date: string, slot: string) =>
    trackEvent("slot_selected", { doctorId, date, slot }),
  bookingSubmit: (doctorId: string, department: string) =>
    trackEvent("booking_submitted", { doctorId, department }),
  bookingSuccess: (bookingReference: string, doctorId: string, department: string) =>
    trackEvent("booking_confirmed", { bookingReference, doctorId, department }),
  pdfDownload: (bookingReference: string) =>
    trackEvent("pdf_slip_downloaded", { bookingReference }),
  statusLookup: (method: "reference" | "identity") =>
    trackEvent("status_lookup_searched", { method }),
};
