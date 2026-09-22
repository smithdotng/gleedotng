import "server-only";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";

/**
 * Operator authentication.
 * - Passwords: scrypt with a per-user random salt, stored as `scrypt$<salt>$<hash>`.
 * - Sessions: signed cookie (HMAC-SHA256 with AUTH_SECRET), 30-day expiry.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
export const SESSION_COOKIE = "glee_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

export const passwordProblem = (pw: string) =>
  pw.length < 8 ? "Password must be at least 8 characters." : pw.length > 128 ? "Password is too long." : "";

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set (min 16 characters). Add it to your environment variables.");
  }
  return "glee-dev-only-secret-change-me";
}

export interface Session {
  email: string;
  slug: string;
  exp: number;
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function createSessionToken(email: string, slug: string): string {
  const payload: Session = { email, slug, exp: Date.now() + SESSION_DAYS * 864e5 };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const good = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return null;
  try {
    const s = JSON.parse(Buffer.from(data, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86400,
};

/** Current operator session (server components & route handlers). */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}
