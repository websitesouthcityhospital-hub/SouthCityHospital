/**
 * South City Hospital — Facilities & Services (12 total)
 * Hardcoded static content. Verbatim from spec.
 */

export type FacilityCategory = "Diagnostic" | "Critical Care" | "Outpatient";

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  description: string;
  icon: string; // Lucide icon component name
}

export const facilities: Facility[] = [
  {
    id: "endoscopy",
    name: "Endoscopy",
    category: "Diagnostic",
    description: "Upper and lower GI endoscopic diagnostic procedures.",
    icon: "ScanSearch",
  },
  {
    id: "laboratory-lis",
    name: "Laboratory (LIS)",
    category: "Diagnostic",
    description:
      "Laboratory Information System integrated 24/7 pathology & biochemistry.",
    icon: "FlaskConical",
  },
  {
    id: "echo-cardiography",
    name: "Echo Cardiography",
    category: "Diagnostic",
    description:
      "Color Doppler 2D and 3D echocardiography for cardiac evaluation.",
    icon: "HeartPulse",
  },
  {
    id: "uroflowmetry",
    name: "Uroflowmetry",
    category: "Diagnostic",
    description:
      "Non-invasive measurement of urinary flow rate and bladder function.",
    icon: "Gauge",
  },
  {
    id: "icu-critical-care",
    name: "ICU & Critical Care",
    category: "Critical Care",
    description:
      "24/7 intensive monitoring & life support (ICU, CCU, NICU, PICU, SICU).",
    icon: "MonitorHeart",
  },
  {
    id: "ct-scan",
    name: "CT-Scan",
    category: "Diagnostic",
    description:
      "High-resolution multi-slice Computed Tomography cross-sectional imaging.",
    icon: "Scan",
  },
  {
    id: "colonoscopy",
    name: "Colonoscopy",
    category: "Diagnostic",
    description:
      "Endoscopic evaluation of the large intestine and colon health.",
    icon: "TestTube",
  },
  {
    id: "high-end-digital-xray",
    name: "High End Digital Xray",
    category: "Diagnostic",
    description:
      "Low-radiation digital radiography for rapid diagnostic imaging.",
    icon: "Radiation",
  },
  {
    id: "ultra-sound-sonography",
    name: "Ultra-Sound Sonography",
    category: "Diagnostic",
    description:
      "High-frequency ultrasound imaging for abdominal, pelvic, and obstetrical exams.",
    icon: "Waves",
  },
  {
    id: "eeg-ncv",
    name: "EEG & NCV",
    category: "Diagnostic",
    description:
      "Electroencephalogram and Nerve Conduction Velocity diagnostic testing.",
    icon: "BrainCircuit",
  },
  {
    id: "dialysis",
    name: "Dialysis",
    category: "Outpatient",
    description:
      "Modern hemodialysis units for acute & chronic renal management.",
    icon: "Droplets",
  },
  {
    id: "ecg-holter-ecg",
    name: "ECG & Holter ECG",
    category: "Diagnostic",
    description:
      "24-hour continuous Holter rhythm recording and resting ECG.",
    icon: "Waveform",
  },
  {
    id: "pain-clinic",
    name: "Pain Clinic",
    category: "Outpatient",
    description: "Specialized care for acute and chronic pain management.",
    icon: "Activity",
  },
];

export const facilityCategories: FacilityCategory[] = [
  "Diagnostic",
  "Critical Care",
  "Outpatient",
];
