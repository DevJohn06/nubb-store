import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

let r2Client: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucketName);
}

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }

  return r2Client;
}

export interface UploadResult {
  url: string;
  key: string;
  storage: "r2" | "local";
}

/**
 * Uploads a file buffer to Cloudflare R2, or falls back to local /public/uploads/ if R2 is not configured.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const key = `products/${Date.now()}-${sanitizedFilename}`;

  const client = getR2Client();

  if (client && bucketName) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      const url = publicUrl
        ? `${publicUrl}/${key}`
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;

      return {
        url,
        key,
        storage: "r2",
      };
    } catch (err) {
      console.warn("Cloudflare R2 upload failed, falling back to local storage:", err);
    }
  }

  // Local fallback: Save into public/uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localPath = path.join(uploadDir, `${Date.now()}-${sanitizedFilename}`);
  fs.writeFileSync(localPath, fileBuffer);

  const localRelativeUrl = `/uploads/products/${path.basename(localPath)}`;
  return {
    url: localRelativeUrl,
    key: `local:${localRelativeUrl}`,
    storage: "local",
  };
}

/**
 * Deletes a file from R2 or local storage.
 */
export async function deleteFile(key: string): Promise<boolean> {
  if (key.startsWith("local:")) {
    const relativePath = key.replace("local:", "");
    const localPath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  }

  const client = getR2Client();
  if (client && bucketName) {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
