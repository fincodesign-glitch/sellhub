import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "im_admin_session";

function getSecret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return password;
}

export function createAdminSessionToken(): string {
  return createHmac("sha256", getSecret()).update("intentmate-admin").digest("hex");
}

export function verifyPassword(password: string): boolean {
  const expected = getSecret();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const expected = createAdminSessionToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}
