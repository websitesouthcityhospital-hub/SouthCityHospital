import type { Metadata } from "next";
import { BookingStatusClient } from "./BookingStatusClient";

export const metadata: Metadata = {
  title: "Check Appointment Booking Status",
  description:
    "Track and download your doctor appointment slip at South City Hospital, Silchar without logging in. Lookup by Booking Reference ID or Phone & Date of Birth.",
  alternates: {
    canonical: "https://southcityhospital.in/booking-status",
  },
};

export default function BookingStatusPage() {
  return <BookingStatusClient />;
}
