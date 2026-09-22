import { NextRequest, NextResponse } from "next/server";
import { migrateLocalFileToR2 } from "@/lib/r2";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { key, url, folder } = body;

    const target = key || url;
    if (!target) {
      return NextResponse.json({ error: "File key or URL is required" }, { status: 400 });
    }

    const result = await migrateLocalFileToR2(target, folder || "products");
    if (!result) {
      return NextResponse.json(
        { error: "Migration to Cloudflare R2 failed or file not found locally" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: {
        key: result.key,
        url: result.url,
        filename: result.filename,
        size: result.size,
        storage: "r2",
        folder: result.folder,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to migrate media to R2";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
