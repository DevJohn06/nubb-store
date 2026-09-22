import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Allow uploads from authenticated admins or during checkout for proof of payment
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAdmin = token ? Boolean(verifySessionToken(token)) : false;

  try {
    const formData = await req.formData();
    const isProofOfPayment = formData.get("purpose") === "payment_proof";

    if (!isAdmin && !isProofOfPayment) {
      return NextResponse.json({ error: "Unauthorized upload" }, { status: 401 });
    }

    // Support both single file ("file") and multiple files ("files")
    const allFiles = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToUpload: File[] = [];
    if (allFiles && allFiles.length > 0) {
      filesToUpload.push(...allFiles.filter((f) => f instanceof File && f.size > 0));
    }
    if (singleFile && singleFile instanceof File && singleFile.size > 0) {
      if (!filesToUpload.some((f) => f.name === singleFile.name && f.size === singleFile.size)) {
        filesToUpload.push(singleFile);
      }
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: "No valid image files provided" }, { status: 400 });
    }

    const targetStorage = (formData.get("storage") as "r2" | "local" | "auto") || "auto";
    const targetFolder = (formData.get("folder") as string) || (isProofOfPayment ? "payment-proofs" : "products");

    const uploadedResults = [];

    for (const file of filesToUpload) {
      // Check file size (max 12MB)
      if (file.size > 12 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 12MB size limit` },
          { status: 400 }
        );
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a recognized image format` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadFile(buffer, file.name, file.type, {
        storage: targetStorage,
        folder: targetFolder,
      });
      uploadedResults.push({
        url: result.url,
        key: result.key,
        storage: result.storage,
        size: result.size,
        filename: result.filename || file.name,
        folder: result.folder,
      });
    }

    // If single file uploaded, maintain backward compatibility format
    if (uploadedResults.length === 1) {
      return NextResponse.json({
        success: true,
        url: uploadedResults[0].url,
        key: uploadedResults[0].key,
        storage: uploadedResults[0].storage,
        size: uploadedResults[0].size,
        filename: uploadedResults[0].filename,
        files: uploadedResults,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
      count: uploadedResults.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
