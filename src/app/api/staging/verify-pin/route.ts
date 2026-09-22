import { NextRequest, NextResponse } from "next/server";
import { getStoreSetting } from "@/lib/turso";
import { STAGING_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const validPin = await getStoreSetting("staging_pin", process.env.DEV_STAGING_PIN || "nubb2026");

    if (pin.trim() !== validPin.trim()) {
      return NextResponse.json({ error: "Invalid developer PIN" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Staging unlocked" });

    // Set cookie valid for 30 days
    response.cookies.set({
      name: STAGING_COOKIE_NAME,
      value: "granted",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify PIN";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
