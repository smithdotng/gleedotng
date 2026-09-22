import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { verifyPassword } from "./auth";

/**
 * Admin (glee.ng team) authentication — used only for the Journal.
 *
 * There is no admin user table: the password comes from the environment, so the only way
 * to become an admin is to hold the deployment's secret.
 *   ADMIN_PASSWORD_HASH  scrypt hash from `npm run hash -- "your password"`  (preferred)
 *   ADMIN_PASSWORD       plain password, compared in constant time           (simpler)
 * The session is a signed cookie, like the operator one, but a separate name and secret salt
 * so an operator session can never be mistaken for an admin session.
 */

export const ADMIN_COOKIE = "glee_admin";
const ADMIN_DAYS = 7;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return `admin:${s}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set (min 16 characters). Add it to your environment variables.");
  }
  return "admin:glee-dev-only-secret-change-me";
}

/** True when an admin password is configured — otherwise the admin area cannot be signed into at all. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyPassword(password, hash);
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(plain);
  return a.length === b.length && timingSafeEqual(a, b);
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function createAdminToken(): string {
  const data = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + ADMIN_DAYS * 864e5 })).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function readAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const [data, sig] = token.split(".");
  if (!data || !sig) return false;
  const good = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return false;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString()) as { role?: string; exp?: number };
    return p.role === "admin" && typeof p.exp === "number" && p.exp > Date.now();
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_DAYS * 86400,
};

/** True when the current request carries a valid admin session. */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return readAdminToken(jar.get(ADMIN_COOKIE)?.value);
}
