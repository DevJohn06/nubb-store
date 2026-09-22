import { NextRequest, NextResponse } from "next/server";
import { getPaymentMethods, updatePaymentMethod } from "@/lib/turso";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const methods = await getPaymentMethods(false);
    return NextResponse.json({ paymentMethods: methods });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load payment methods";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, account_name, account_number, instructions, qr_code_url, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 });
    }

    await updatePaymentMethod(id, {
      name,
      account_name,
      account_number,
      instructions,
      qr_code_url,
      is_active,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update payment method";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
