import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminUser } from "@/services/admin-auth";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdminUser(email, password);

    if (!authResult.success || !authResult.session) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Invalid email or password." },
        { status: 401 }
      );
    }

    await setSessionCookie(authResult.session);

    return NextResponse.json({
      success: true,
      session: authResult.session,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
