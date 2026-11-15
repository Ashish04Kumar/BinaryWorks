// Page activity from the visitor's browser (sections viewed, clicks, demo actions), sent in small batches.
// The server adds who it came from (IP, country, browser); the page can't fake those.
import { record, type EventType, type StoredEvent } from "@/lib/analytics/store";
import { isOwner, visitorOf } from "@/lib/analytics/server";

const ALLOWED: EventType[] = ["session_start", "section", "click", "activity", "leave"];
const MAX_EVENTS = 50;

// Keep only small, flat values: nothing the page sends can grow the log much
function clean(data: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!data || typeof data !== "object") return out;
  for (const [k, v] of Object.entries(data).slice(0, 12)) {
    if (typeof v === "string") out[k.slice(0, 30)] = v.slice(0, 200);
    else if (typeof v === "number" && Number.isFinite(v)) out[k.slice(0, 30)] = v;
    else if (typeof v === "boolean") out[k.slice(0, 30)] = v;
  }
  return out;
}

export async function POST(req: Request) {
  if (isOwner(req)) return new Response(null, { status: 204 });
  const body = await req.json().catch(() => null);
  const list: unknown[] = Array.isArray(body?.events) ? body.events.slice(0, MAX_EVENTS) : [];
  const who = visitorOf(req);
  const now = Date.now();

  const events: StoredEvent[] = [];
  for (const raw of list) {
    const e = raw as { type?: string; t?: number; data?: unknown };
    if (!ALLOWED.includes(e?.type as EventType)) continue;
    // trust the browser's clock only within a few minutes of ours
    const t = typeof e.t === "number" && Math.abs(e.t - now) < 10 * 60_000 ? e.t : now;
    events.push({ t, type: e.type as EventType, ...who, data: clean(e.data) });
  }
  await record(events).catch((err) => console.error("analytics:", err));
  return new Response(null, { status: 204 });
}
