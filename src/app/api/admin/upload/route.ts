import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Allow uploads from authenticated admins or during checkout for proof of payment
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAdmin = token ? Boolean(verifySessionToken(token)) : false;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isProofOfPayment = formData.get("purpose") === "payment_proof";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAdmin && !isProofOfPayment) {
      return NextResponse.json({ error: "Unauthorized upload" }, { status: 401 });
    }

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 8MB limit" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFile(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      storage: result.storage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
