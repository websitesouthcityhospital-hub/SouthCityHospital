/**
 * South City Hospital — Clinical Department Preparation Instructions
 * Guidance for patients prior to attending their outpatient consultation.
 */

export const departmentPrepInstructions: Record<string, string> = {
  "cardiology":
    "Please bring your recent ECG, Echocardiography (ECHO), or Holter monitoring reports, along with your current daily cardiac medications.",
  "orthopaedics":
    "Please carry any past X-Ray films, MRI/CT scans, and bone health records. Wear comfortable clothing for joint mobility assessment.",
  "neuro-surgery":
    "Please bring recent Brain/Spine MRI, CT scans, and detailed neurological prescription history.",
  "gynaecology-obstetrics":
    "Please carry your complete antenatal booklet, recent ultrasound scan plates, and latest blood test results.",
  "paediatrics":
    "Please bring the child's immunization card, birth record, and growth history tracking book.",
  "gastroenterology":
    "If abdominal ultrasound or endoscopy is expected, 6–8 hours of fasting is recommended. Bring previous liver function and ultrasound reports.",
  "nephrology":
    "Please bring latest Renal Function Tests (Serum Creatinine, Urea), Urine Routine reports, and daily blood pressure logs.",
  "urology":
    "Please arrive with a moderately full bladder if urinary ultrasound is requested. Carry previous KUB ultrasound or uroflowmetry reports.",
  "ent":
    "Please carry previous audiometry (hearing test) reports, sinus CT scans, and throat/nasal prescriptions.",
  "dermatology":
    "Avoid applying heavy cosmetic creams or medicated ointments on affected skin areas on the morning of your visit.",
  "internal-medicine":
    "Please bring your complete medical file, recent blood sugar/HbA1c tests, lipid profile, and current prescription list.",
  "general-surgery":
    "Please carry past surgical discharge summaries, imaging reports, and relevant biopsy/pathology reports.",
  "oncology":
    "Please bring all histopathology biopsy slides, PET-CT/contrast CT imaging, and chemotherapy/radiation records.",
};

export function getDepartmentPrepInstructions(departmentSlug?: string): string {
  if (departmentSlug && departmentPrepInstructions[departmentSlug]) {
    return departmentPrepInstructions[departmentSlug];
  }
  return "Please arrive 15 minutes prior to your time slot with your photo ID and any prior doctor prescriptions or diagnostic test reports.";
}
