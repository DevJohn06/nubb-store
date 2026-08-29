import crypto from "crypto";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || "nubb-super-secret-tactile-key-2026";
export const ADMIN_COOKIE_NAME = "nubb_admin_session";
export const STAGING_COOKIE_NAME = "nubb_staging_access";

/**
 * Generates a salt and hashes a password using PBKDF2 with SHA-512.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

/**
 * Verifies a plaintext password against a stored hash and salt.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
}

export interface AdminSessionPayload {
  userId: number;
  username: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

/**
 * Creates a signed session token.
 */
export function createSessionToken(user: {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}): string {
  const payload: AdminSessionPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token and returns the payload if valid.
 */
export function verifySessionToken(token: string): AdminSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Checks if the provided staging PIN is valid.
 */
export function isValidStagingPin(inputPin: string, configPin?: string): boolean {
  const validPin = (configPin || process.env.DEV_STAGING_PIN || "nubb2026").trim();
  return inputPin.trim() === validPin;
}
