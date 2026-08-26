import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Appointment } from "@sch/types";
import { formatDisplayDate } from "./date-utils";

export async function generateBookingSlipPdf(appointment: Appointment): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size (points)
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const navy = rgb(10 / 255, 37 / 255, 64 / 255); // #0A2540
  const gold = rgb(201 / 255, 161 / 255, 92 / 255); // #C9A15C
  const darkGray = rgb(31 / 255, 41 / 255, 55 / 255); // #1F2937
  const muted = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B
  const lightBg = rgb(248 / 255, 250 / 255, 252 / 255); // #F8FAFC
  const borderCol = rgb(226 / 255, 232 / 255, 240 / 255); // #E2E8F0

  // 1. Header Banner Background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: navy,
  });

  // Top accent gold line
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: gold,
  });

  // Hospital Name & Title
  page.drawText("SOUTH CITY HOSPITAL", {
    x: 40,
    y: height - 55,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("We care with a difference. | Meherpur, Silchar, Assam - 788015", {
    x: 40,
    y: height - 75,
    size: 9.5,
    font: fontRegular,
    color: gold,
  });

  page.drawText("24x7 Emergency Helpline: +91 6901271223", {
    x: 40,
    y: height - 92,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.95),
  });

  // Slip Title Badge
  page.drawText("APPOINTMENT CONFIRMATION SLIP", {
    x: 40,
    y: height - 150,
    size: 13,
    font: fontBold,
    color: navy,
  });

  // 2. Reference Number Card Box
  const cardY = height - 235;
  page.drawRectangle({
    x: 40,
    y: cardY,
    width: width - 80,
    height: 65,
    color: lightBg,
    borderColor: borderCol,
    borderWidth: 1,
  });

  page.drawText("BOOKING REFERENCE NUMBER", {
    x: 55,
    y: cardY + 45,
    size: 9,
    font: fontBold,
    color: muted,
  });

  page.drawText(appointment.bookingReference, {
    x: 55,
    y: cardY + 18,
    size: 20,
    font: fontMono,
    color: navy,
  });

  page.drawText("Status: CONFIRMED", {
    x: width - 200,
    y: cardY + 24,
    size: 11,
    font: fontBold,
    color: rgb(22 / 255, 101 / 255, 52 / 255), // Emerald
  });

  // 3. Appointment & Patient Details Table
  let currentY = height - 280;
  const col1 = 55;
  const col2 = 200;

  const drawRow = (label: string, value: string, isHighlight = false) => {
    page.drawText(label, {
      x: col1,
      y: currentY,
      size: 10,
      font: fontBold,
      color: muted,
    });
    page.drawText(value, {
      x: col2,
      y: currentY,
      size: 10.5,
      font: isHighlight ? fontBold : fontRegular,
      color: isHighlight ? navy : darkGray,
    });
    currentY -= 26;
  };

  page.drawText("CONSULTATION DETAILS", {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: navy,
  });
  currentY -= 20;

  drawRow("Doctor / Specialist:", appointment.doctorName, true);
  drawRow("Department:", appointment.departmentName);
  drawRow("Appointment Date:", formatDisplayDate(appointment.preferredDate), true);
  drawRow("Time Slot:", appointment.preferredTimeSlot || "Hospital OPD Hours");

  currentY -= 15;
  page.drawText("PATIENT DETAILS", {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: navy,
  });
  currentY -= 20;

  drawRow("Patient Full Name:", appointment.patientName, true);
  drawRow("Registered Phone:", appointment.patientPhone);
  drawRow("Date of Birth:", appointment.patientDob);
  if (appointment.message) {
    drawRow("Notes / Symptoms:", appointment.message);
  }

  // 4. Instructions / Important Notice Box
  const noticeY = 160;
  page.drawRectangle({
    x: 40,
    y: noticeY,
    width: width - 80,
    height: 105,
    color: rgb(254 / 255, 243 / 255, 199 / 255), // Amber 100
    borderColor: rgb(251 / 255, 191 / 255, 36 / 255),
    borderWidth: 1,
  });

  page.drawText("IMPORTANT PATIENT INSTRUCTIONS:", {
    x: 55,
    y: noticeY + 85,
    size: 9.5,
    font: fontBold,
    color: rgb(146 / 255, 64 / 255, 14 / 255),
  });

  const instructions = [
    "* Please arrive at the hospital reception 15 minutes prior to your consultation slot.",
    "* Present this booking reference number or show this PDF slip at the OPD registration desk.",
    "* No advance payment was charged. Consultation fee is payable directly at reception counter.",
    "* For urgent inquiries or rescheduling, call our 24x7 helpdesk at +91 6901271223.",
  ];

  let instY = noticeY + 68;
  for (const text of instructions) {
    page.drawText(text, {
      x: 55,
      y: instY,
      size: 8.5,
      font: fontRegular,
      color: rgb(120 / 255, 53 / 255, 15 / 255),
    });
    instY -= 15;
  }

  // 5. Footer
  page.drawRectangle({
    x: 40,
    y: 80,
    width: width - 80,
    height: 1,
    color: borderCol,
  });

  page.drawText(`Generated on ${new Date().toLocaleString()} | South City Hospital Official System`, {
    x: 40,
    y: 60,
    size: 8,
    font: fontRegular,
    color: muted,
  });

  return await pdfDoc.save();
}

export async function downloadBookingSlipPdf(appointment: Appointment): Promise<void> {
  const pdfBytes = await generateBookingSlipPdf(appointment);
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SouthCityHospital_Booking_${appointment.bookingReference}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
