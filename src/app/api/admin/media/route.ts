import { NextRequest, NextResponse } from "next/server";
import { listMediaFiles, deleteFile, getStorageStatus } from "@/lib/r2";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const prefix = searchParams.get("prefix") || undefined;

    let items = await listMediaFiles(prefix);

    if (search) {
      items = items.filter(
        (item) =>
          item.filename.toLowerCase().includes(search) ||
          item.key.toLowerCase().includes(search)
      );
    }

    const storageStatus = getStorageStatus();

    return NextResponse.json({
      success: true,
      media: items,
      total: items.length,
      storageStatus,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media library";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const keysToDelete: string[] = [];

    if (body.key) keysToDelete.push(body.key);
    if (body.url) keysToDelete.push(body.url);
    if (Array.isArray(body.keys)) {
      keysToDelete.push(...body.keys);
    }

    if (keysToDelete.length === 0) {
      return NextResponse.json(
        { error: "No key or url specified for deletion" },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    for (const k of keysToDelete) {
      const ok = await deleteFile(k);
      if (ok) deletedCount++;
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      totalRequested: keysToDelete.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete media item";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
