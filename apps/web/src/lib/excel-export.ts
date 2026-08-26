import ExcelJS from "exceljs";
import type { Appointment, Doctor } from "@sch/types";
import { formatDisplayDate } from "./date-utils";

/**
 * Part O.2: Export single doctor's bookings for a day as .xlsx
 */
export async function exportSingleDoctorBookingsXlsx(
  doctor: Doctor,
  departmentName: string,
  dateStr: string,
  appointments: Appointment[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "South City Hospital Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Doctor Appointments");

  // Navy: 0A2540, Gold: C9A15C, Light Gray: F1F5F9
  const navyFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0A2540" },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  // 1. Hospital Header Row
  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "SOUTH CITY HOSPITAL — DOCTOR APPOINTMENT ROSTER";
  titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = navyFill;
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 32;

  // 2. Doctor & Date Info Block
  sheet.mergeCells("A2:F2");
  const metaCell = sheet.getCell("A2");
  metaCell.value = `Doctor: ${doctor.name} (${departmentName})  |  Date: ${formatDisplayDate(dateStr)}  |  Total Bookings: ${appointments.length}`;
  metaCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0A2540" } };
  metaCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(2).height = 24;

  // 3. Table Column Headers
  const columns = [
    { header: "Time Slot", key: "timeSlot", width: 22 },
    { header: "Patient Name", key: "patientName", width: 26 },
    { header: "Contact Phone", key: "phone", width: 18 },
    { header: "Booking Reference", key: "reference", width: 22 },
    { header: "Status", key: "status", width: 15 },
    { header: "Notes / Symptoms", key: "notes", width: 35 },
  ];

  const headerRow = sheet.getRow(4);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = headerFont;
    cell.fill = navyFill;
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFC9A15C" } },
      bottom: { style: "medium", color: { argb: "FFC9A15C" } },
    };
    sheet.getColumn(idx + 1).width = col.width;
  });
  headerRow.height = 24;

  // 4. Data Rows
  let rowIndex = 5;
  if (appointments.length === 0) {
    sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
    const emptyCell = sheet.getCell(`A${rowIndex}`);
    emptyCell.value = "No appointments scheduled for this doctor on this date.";
    emptyCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: "FF64748B" } };
    emptyCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(rowIndex).height = 24;
  } else {
    for (const apt of appointments) {
      const row = sheet.getRow(rowIndex);
      row.values = [
        apt.preferredTimeSlot || "Hospital OPD Hours",
        apt.patientName,
        apt.patientPhone,
        apt.bookingReference,
        apt.status,
        apt.message || "—",
      ];

      row.alignment = { vertical: "middle", horizontal: "left" };
      row.font = { name: "Calibri", size: 10 };
      row.height = 20;

      // Zebra striping
      if (rowIndex % 2 === 0) {
        for (let c = 1; c <= 6; c++) {
          row.getCell(c).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }
      }

      rowIndex++;
    }
  }

  // 5. Trigger Browser Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanDocName = doctor.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  a.download = `SCH_Bookings_${cleanDocName}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Part O.3: Export all doctors' bookings for a day, grouped by doctor with styled sub-headers.
 * Doctors with 0 bookings on this day are cleanly omitted.
 */
export async function exportAllDoctorsGroupedXlsx(
  dateStr: string,
  appointments: Appointment[],
  doctors: Doctor[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "South City Hospital Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Daily All Doctors Roster");

  const navyFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0A2540" },
  };

  const doctorGroupFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  // 1. Hospital Header Row
  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "SOUTH CITY HOSPITAL — ALL DOCTORS DAILY APPOINTMENT ROSTER";
  titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = navyFill;
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 32;

  // 2. Metadata Banner
  sheet.mergeCells("A2:F2");
  const metaCell = sheet.getCell("A2");
  metaCell.value = `Appointment Date: ${formatDisplayDate(dateStr)}  |  Total Patients Booked: ${appointments.length}`;
  metaCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0A2540" } };
  metaCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(2).height = 24;

  // Set column widths
  sheet.getColumn(1).width = 22; // Time Slot
  sheet.getColumn(2).width = 26; // Patient Name
  sheet.getColumn(3).width = 18; // Phone
  sheet.getColumn(4).width = 22; // Booking Reference
  sheet.getColumn(5).width = 15; // Status
  sheet.getColumn(6).width = 35; // Notes

  // Group appointments by doctor
  const appointmentsByDoctor = new Map<string, Appointment[]>();
  for (const apt of appointments) {
    const list = appointmentsByDoctor.get(apt.doctorId) || [];
    list.push(apt);
    appointmentsByDoctor.set(apt.doctorId, list);
  }

  let currentRow = 4;

  if (appointments.length === 0) {
    sheet.mergeCells(`A4:F4`);
    const emptyCell = sheet.getCell(`A4`);
    emptyCell.value = "No appointments scheduled across any department for this date.";
    emptyCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: "FF64748B" } };
    emptyCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(4).height = 24;
  } else {
    // Render each doctor group with appointments
    for (const doctor of doctors) {
      const docAppointments = appointmentsByDoctor.get(doctor.id);
      if (!docAppointments || docAppointments.length === 0) {
        // Per Part O.3: Doctors with zero bookings that day may be omitted from this export
        continue;
      }

      // Group Sub-header
      sheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const groupHeader = sheet.getCell(`A${currentRow}`);
      groupHeader.value = `${doctor.name.toUpperCase()}  —  ${doctor.departmentSlug.toUpperCase()} (${docAppointments.length} Bookings)`;
      groupHeader.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0A2540" } };
      groupHeader.fill = doctorGroupFill;
      groupHeader.alignment = { vertical: "middle", horizontal: "left" };
      sheet.getRow(currentRow).height = 24;
      currentRow++;

      // Sub-table Column Headers
      const subHeaderRow = sheet.getRow(currentRow);
      const headers = ["Time Slot", "Patient Name", "Contact Phone", "Reference ID", "Status", "Notes"];
      headers.forEach((h, idx) => {
        const cell = subHeaderRow.getCell(idx + 1);
        cell.value = h;
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = navyFill;
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
      subHeaderRow.height = 20;
      currentRow++;

      // Doctor appointment rows
      for (const apt of docAppointments) {
        const row = sheet.getRow(currentRow);
        row.values = [
          apt.preferredTimeSlot || "Hospital OPD Hours",
          apt.patientName,
          apt.patientPhone,
          apt.bookingReference,
          apt.status,
          apt.message || "—",
        ];
        row.alignment = { vertical: "middle", horizontal: "left" };
        row.font = { name: "Calibri", size: 10 };
        row.height = 19;
        currentRow++;
      }

      currentRow++; // Blank spacer row between doctors
    }
  }

  // 3. Trigger Browser Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SCH_All_Doctors_Bookings_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
