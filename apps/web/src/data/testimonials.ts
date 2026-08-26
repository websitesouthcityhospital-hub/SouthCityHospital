/**
 * South City Hospital — Patient Testimonials (3 total)
 * Hardcoded static content. Verbatim from spec.
 */

export interface Testimonial {
  id: string;
  patientName: string;
  department: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "rakhi-das",
    patientName: "Rakhi Das",
    department: "General Care",
    quote:
      "The care and attention my family received at South City Hospital was exceptional. The staff were attentive, professional, and compassionate throughout our stay.",
  },
  {
    id: "akash-debnath",
    patientName: "Akash Debnath",
    department: "Neuro Surgery",
    quote:
      "Deeply grateful to the neurology team and critical care nursing staff. Their rapid diagnosis and treatment made all the difference in recovery.",
  },
  {
    id: "paramita-bhatt",
    patientName: "Paramita Bhatt",
    department: "Internal Medicine",
    quote:
      "Clean facilities, clear guidance from doctors, and quick lab report delivery. South City Hospital is a dependable healthcare institution in Silchar.",
  },
];
