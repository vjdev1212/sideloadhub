import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sideloadhub_admin";

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not configured.");
  return secret;
}

export function createAdminToken() {
  return crypto.createHmac("sha256", getSecret()).update("sideloadhub-admin").digest("hex");
}

export function isValidAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = createAdminToken();
  const actual = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)) throw new Error("Unauthorized");
}
