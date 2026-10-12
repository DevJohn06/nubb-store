import { NextRequest, NextResponse } from "next/server";
import { addSubscriber, getSubscribersCount } from "@/lib/turso";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Basic regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email format." },
        { status: 400 }
      );
    }

    const trimmedName = typeof name === "string" ? name.trim() : undefined;

    // Add to Turso database
    const dbResult = await addSubscriber(email, trimmedName);

    // Send welcome email if new subscription
    if (dbResult.isNew) {
      await sendWelcomeEmail(email.trim(), trimmedName);
    }

    const currentCount = await getSubscribersCount();

    return NextResponse.json({
      success: true,
      message: dbResult.isNew
        ? "Welcome to NUBB! You are officially on the early access list."
        : "You're already on our early access list!",
      isNew: dbResult.isNew,
      subscriberCount: currentCount,
    });
  } catch (error: unknown) {
    console.error("[Subscribe API Error]:", error);
    return NextResponse.json(
      { error: "Failed to save email. Please try again in a moment." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await getSubscribersCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
