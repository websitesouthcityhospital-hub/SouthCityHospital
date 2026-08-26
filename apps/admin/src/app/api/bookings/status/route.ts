import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateBookingStatus } from "@/services/admin-bookings";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { appointmentId, status } = await req.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Appointment ID and status are required." },
        { status: 400 }
      );
    }

    const result = await updateBookingStatus(appointmentId, status);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Staff accounts are not permitted to change booking status." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
}
