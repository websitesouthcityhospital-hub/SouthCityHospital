/**
 * South City Hospital — Terms of Service & Medical Disclaimer
 * Static source of truth for hospital terms, emergency disclaimers, and cancellation policies.
 */

export const termsOfService = {
  title: "Terms of Service & Medical Disclaimer",
  lastUpdated: "August 2026",
  emergencyDisclaimer: {
    title: "Critical Medical Emergency Disclaimer",
    message:
      "If you are experiencing a life-threatening medical emergency (such as severe chest pain, stroke symptoms, major trauma, heavy bleeding, or severe breathing distress), call our 24/7 Emergency Helpline immediately at +91 6901271223 or proceed directly to our Emergency Department in Meherpur, Silchar. Do not use this website or the online appointment booking form for emergency medical care.",
  },
  sections: [
    {
      id: "general-terms",
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using the South City Hospital website (southcityhospital.in) and its digital services, you agree to comply with and be bound by these Terms of Service and all applicable laws and regulations of India.",
        "If you do not agree with any part of these terms, you should discontinue use of this website immediately.",
      ],
    },
    {
      id: "medical-disclaimer",
      title: "2. Medical Advice & Information Disclaimer",
      content: [
        "The informational content provided on this website—including descriptions of clinical departments, medical facilities, health FAQs, and doctor biographies—is intended solely for general informational and educational purposes.",
        "Nothing contained on this website constitutes professional medical advice, clinical diagnosis, or a personalized treatment plan.",
        "Always consult a qualified healthcare practitioner for diagnosis and treatment of any medical condition. Never disregard professional medical advice or delay seeking medical attention because of information read on this website.",
      ],
    },
    {
      id: "appointment-booking",
      title: "3. Appointment Booking & Consultation Policy",
      content: [
        "The online booking system allows patients to request and schedule outpatient consultation time slots with available hospital specialists.",
        "Consultation Fees: No advance payment is collected online. All doctor consultation fees and diagnostic charges are payable at the hospital reception registration desk upon arrival.",
        "Slot Timing: While we make every reasonable effort to honor scheduled appointment slots, consultation start times may occasionally be subject to minor delays due to emergency surgical cases or inpatient critical care priorities.",
      ],
    },
    {
      id: "cancellation-policy",
      title: "4. Cancellation & Rescheduling Policy",
      content: [
        "We understand that personal circumstances may require changing your schedule. If you need to cancel or reschedule an appointment, we kindly request notice at least 2 hours prior to your scheduled consultation window.",
        "Cancellations can be made by calling our 24/7 hospital helpdesk at +91 6901271223 with your Booking Reference ID.",
        "No cancellation fees or penalties apply for missed or rescheduled consultations.",
      ],
    },
    {
      id: "user-conduct",
      title: "5. Patient Conduct & System Usage",
      content: [
        "Users agree to provide accurate, current, and truthful information when scheduling appointments or making enquiries.",
        "Submitting fraudulent bookings, attempting to bypass security rate limits, or scraping doctor schedules is strictly prohibited.",
      ],
    },
    {
      id: "jurisdiction",
      title: "6. Governing Law & Jurisdiction",
      content: [
        "These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of the use of this website shall be subject to the exclusive jurisdiction of the competent courts in Silchar, Cachar District, Assam.",
      ],
    },
  ],
};
