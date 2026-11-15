// Best-effort rate limit for the public demos: per visitor IP and a daily total.
// In-memory, so on serverless each warm instance keeps its own counts. Enough to stop casual abuse.

const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = Number(process.env.DEMO_REQUESTS_PER_10_MIN || 20);
const PER_DAY = Number(process.env.DEMO_REQUESTS_PER_DAY || 1000);

const hits = new Map<string, number[]>();
let day = new Date().toDateString();
let today = 0;

export { ipOf as clientIp } from "./analytics/server";

export function allow(ip: string): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();
  if (new Date().toDateString() !== day) {
    day = new Date().toDateString();
    today = 0;
  }
  if (today >= PER_DAY) return { ok: false, reason: "The demo has hit its daily limit. Please try again tomorrow." };

  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_IP) return { ok: false, reason: "Too many questions in a short time. Please wait a few minutes." };

  recent.push(now);
  hits.set(ip, recent);
  today += 1;
  if (hits.size > 5000) hits.clear();
  return { ok: true };
}
