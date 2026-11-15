// Login for the /admin dashboard: one account from .env (ADMIN_EMAIL, ADMIN_PASSWORD_HASH as "salt:scrypt-hash",
// ADMIN_SECRET). A successful login gets a signed, http-only cookie that lasts 7 days.
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "bw_admin";
export const SESSION_DAYS = 7;

const secret = () => process.env.ADMIN_SECRET || "";
export const adminConfigured = () => Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && secret());

function sameBytes(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkLogin(email: string, password: string) {
  if (!adminConfigured()) return false;
  const [salt, hash] = String(process.env.ADMIN_PASSWORD_HASH).split(":");
  const emailOk = email.trim().toLowerCase() === String(process.env.ADMIN_EMAIL).trim().toLowerCase();
  // always run scrypt, so a wrong email takes as long as a wrong password
  const passOk = sameBytes(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
  return emailOk && passOk;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

export function createSession() {
  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  return `${exp}.${sign(exp)}`;
}

export function validSession(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  return sameBytes(Buffer.from(mac, "hex"), Buffer.from(sign(exp), "hex"));
}

export function sessionFrom(req: Request) {
  const m = req.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return validSession(m?.[1]);
}

// At most 5 wrong logins per IP every 15 minutes (kept in memory: a server restart clears it)
const attempts = new Map<string, number[]>();
export function loginAllowed(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60_000);
  attempts.set(ip, recent);
  return recent.length < 5;
}
export function loginFailed(ip: string) {
  attempts.set(ip, [...(attempts.get(ip) || []), Date.now()]);
}
