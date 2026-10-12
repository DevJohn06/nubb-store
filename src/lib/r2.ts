import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export interface R2Config {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicUrl?: string;
}

export function getR2Config(): R2Config {
  return {
    accountId: process.env.R2_ACCOUNT_ID?.trim(),
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim(),
    bucketName: process.env.R2_BUCKET_NAME?.trim(),
    publicUrl: process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, ""),
  };
}

export function getMissingR2Variables(): string[] {
  const { accountId, accessKeyId, secretAccessKey, bucketName } = getR2Config();
  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucketName) missing.push("R2_BUCKET_NAME");
  return missing;
}

export interface MediaItem {
  key: string;
  url: string;
  filename: string;
  size: number;
  lastModified: string;
  storage: "r2" | "local";
  folder?: string;
}

export interface StorageStatus {
  configured: boolean;
  provider: "r2" | "local";
  bucket: string | null;
  publicUrl: string | null;
  missingVariables?: string[];
}

export function isR2Configured(): boolean {
  return getMissingR2Variables().length === 0;
}

export function getStorageStatus(): StorageStatus {
  const { bucketName, publicUrl } = getR2Config();
  const missing = getMissingR2Variables();
  const configured = missing.length === 0;
  return {
    configured,
    provider: configured ? "r2" : "local",
    bucket: bucketName || null,
    publicUrl: publicUrl || null,
    missingVariables: missing.length > 0 ? missing : undefined,
  };
}

export function getR2Client(): S3Client | null {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  if (!isR2Configured() || !accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export interface UploadOptions {
  storage?: "r2" | "local" | "auto";
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  storage: "r2" | "local";
  size?: number;
  filename?: string;
  folder?: string;
}

/**
 * Uploads a file buffer to Cloudflare R2 or local storage (/public/uploads/{folder}).
 */
export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  contentType: string,
  options?: UploadOptions
): Promise<UploadResult> {
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const timestamp = Date.now();
  const folder = (options?.folder || "products").replace(/^\/+|\/+$/g, "").toLowerCase().replace(/[^a-z0-9-_/]/g, "-") || "products";
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;
  const size = fileBuffer.length;
  const targetStorage = options?.storage || "auto";

  const { accountId, bucketName, publicUrl } = getR2Config();
  const client = getR2Client();
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");

  // If user requested R2 explicitly, ensure R2 is configured
  if (targetStorage === "r2" && (!client || !bucketName)) {
    const missing = getMissingR2Variables();
    throw new Error(
      `Cloudflare R2 is not configured on this server. Missing environment variables: ${missing.join(", ")}. Please add them to your Vercel Project Settings > Environment Variables and redeploy.`
    );
  }

  // If user requested R2 (or auto when R2 is configured)
  if (targetStorage !== "local" && client && bucketName) {
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
        size,
        filename: sanitizedFilename,
        folder,
      };
    } catch (err: unknown) {
      if (targetStorage === "r2" || isServerless) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new Error(`Cloudflare R2 upload error: ${errorMsg}`);
      }
      console.warn("Cloudflare R2 upload failed, falling back to local storage:", err);
    }
  }

  // Local fallback: In serverless environments (Vercel), local disk is read-only
  if (isServerless) {
    const missing = getMissingR2Variables();
    throw new Error(
      `Serverless production cannot write to local disk. Cloudflare R2 is required. Missing environment variables: ${missing.length > 0 ? missing.join(", ") : "R2 credentials"}. Please add them to your Vercel Project Settings > Environment Variables.`
    );
  }

  // Local storage (local development only): Save into public/uploads/{folder}
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localFilename = `${timestamp}-${sanitizedFilename}`;
  const localPath = path.join(uploadDir, localFilename);
  fs.writeFileSync(localPath, fileBuffer);

  const localRelativeUrl = `/uploads/${folder}/${localFilename}`;
  return {
    url: localRelativeUrl,
    key: `local:${localRelativeUrl}`,
    storage: "local",
    size,
    filename: sanitizedFilename,
    folder,
  };
}

/**
 * Migrates an existing local image from /public/uploads/ to Cloudflare R2.
 */
export async function migrateLocalFileToR2(
  localUrlOrKey: string,
  folder = "products"
): Promise<UploadResult | null> {
  if (!isR2Configured()) {
    return null;
  }

  let relativePath = localUrlOrKey.replace(/^local:/, "");
  relativePath = relativePath.replace(/^\/+/, "");

  if (localUrlOrKey.startsWith("http://") || localUrlOrKey.startsWith("https://")) {
    return {
      url: localUrlOrKey,
      key: localUrlOrKey,
      storage: "r2",
    };
  }

  const fullLocalPath = path.join(process.cwd(), "public", relativePath);
  if (!fs.existsSync(fullLocalPath)) {
    console.warn(`Local file not found for R2 migration: ${fullLocalPath}`);
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(fullLocalPath);
    const filename = path.basename(fullLocalPath);
    const ext = path.extname(filename).toLowerCase();

    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".avif") contentType = "image/avif";

    return await uploadFile(fileBuffer, filename, contentType, {
      storage: "r2",
      folder,
    });
  } catch (err) {
    console.error(`Failed to migrate local file ${localUrlOrKey} to R2:`, err);
    return null;
  }
}

/**
 * Takes a list of image URLs for a product. If any are local paths (/uploads/...),
 * it automatically migrates them to Cloudflare R2 and returns the updated array of URLs.
 */
export async function ensureR2ProductImages(images: string[]): Promise<string[]> {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  if (!isR2Configured()) {
    return images;
  }

  const migratedImages: string[] = [];

  for (const imgUrl of images) {
    if (!imgUrl || typeof imgUrl !== "string") continue;

    // If already on R2 / external CDN (http/https), keep as is
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
      migratedImages.push(imgUrl);
      continue;
    }

    // Check if it's a local upload
    if (
      imgUrl.startsWith("/uploads/") ||
      imgUrl.startsWith("uploads/") ||
      imgUrl.startsWith("local:")
    ) {
      try {
        const migrated = await migrateLocalFileToR2(imgUrl, "products");
        if (migrated && migrated.url) {
          migratedImages.push(migrated.url);
          continue;
        }
      } catch (err) {
        console.warn(`Failed to auto-migrate product image ${imgUrl} to R2:`, err);
      }
    }

    migratedImages.push(imgUrl);
  }

  return migratedImages;
}

/**
 * Lists all media files from Cloudflare R2 and local filesystem fallback.
 */
export async function listMediaFiles(prefix?: string): Promise<MediaItem[]> {
  const mediaMap = new Map<string, MediaItem>();

  // 1. Fetch from Cloudflare R2 if configured
  const { accountId, bucketName, publicUrl } = getR2Config();
  const client = getR2Client();
  if (client && bucketName) {
    try {
      let continuationToken: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const command: ListObjectsV2Command = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix || undefined,
          ContinuationToken: continuationToken,
          MaxKeys: 200,
        });

        const res: ListObjectsV2CommandOutput = await client.send(command);

        if (res.Contents) {
          for (const item of res.Contents) {
            if (!item.Key) continue;
            // Skip folder placeholders
            if (item.Key.endsWith("/")) continue;

            const url = publicUrl
              ? `${publicUrl}/${item.Key}`
              : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${item.Key}`;

            const parts = item.Key.split("/");
            const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "root";
            const filename = parts.pop() || item.Key;

            mediaMap.set(item.Key, {
              key: item.Key,
              url,
              filename,
              size: item.Size || 0,
              lastModified: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
              storage: "r2",
              folder,
            });
          }
        }

        hasMore = Boolean(res.IsTruncated && res.NextContinuationToken);
        continuationToken = res.NextContinuationToken;
      }
    } catch (err) {
      console.warn("Failed to list objects from Cloudflare R2:", err);
    }
  }

  // 2. Scan local uploads directories (/public/uploads)
  try {
    const baseUploadsDir = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(baseUploadsDir)) {
      const readDirRecursive = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            readDirRecursive(fullPath);
          } else if (entry.isFile()) {
            // Only include image files
            const ext = path.extname(entry.name).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(ext)) {
              const relativePath = path.relative(path.join(process.cwd(), "public"), fullPath);
              const url = `/${relativePath.replace(/\\/g, "/")}`;
              const key = `local:${url}`;
              const stats = fs.statSync(fullPath);

              const relativeUploadPath = path.relative(baseUploadsDir, fullPath);
              const folderParts = path.dirname(relativeUploadPath).split(path.sep);
              const folder = folderParts[0] === "." ? "general" : folderParts.join("/");

              // Don't overwrite if already in map
              if (!mediaMap.has(key)) {
                mediaMap.set(key, {
                  key,
                  url,
                  filename: entry.name,
                  size: stats.size,
                  lastModified: stats.mtime.toISOString(),
                  storage: "local",
                  folder,
                });
              }
            }
          }
        }
      };

      readDirRecursive(baseUploadsDir);
    }
  } catch (err) {
    console.warn("Failed to scan local uploads directory:", err);
  }

  // Convert map to array and sort descending by lastModified (newest first)
  return Array.from(mediaMap.values()).sort(
    (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
}

/**
 * Deletes a file from R2 or local storage given its key or url.
 */
export async function deleteFile(keyOrUrl: string): Promise<boolean> {
  if (!keyOrUrl) return false;

  // Handle local storage deletions
  if (keyOrUrl.startsWith("local:") || keyOrUrl.startsWith("/uploads/")) {
    const relativeUrl = keyOrUrl.replace("local:", "");
    const localPath = path.join(process.cwd(), "public", relativeUrl.replace(/^\//, ""));
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  const { bucketName, publicUrl } = getR2Config();

  // Handle R2 key or public URL
  let key = keyOrUrl;
  if (publicUrl && key.startsWith(publicUrl)) {
    key = key.replace(`${publicUrl}/`, "");
  } else if (key.startsWith("https://") || key.startsWith("http://")) {
    const parsed = new URL(key);
    key = parsed.pathname.replace(/^\//, "");
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
    } catch (err) {
      console.warn(`Failed to delete object from R2 (Key: ${key}):`, err);
      return false;
    }
  }

  return false;
}

