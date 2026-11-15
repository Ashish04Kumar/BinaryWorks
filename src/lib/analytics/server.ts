// Who is asking: IP, country and browser from the request, and the visitor/session ids the page keeps in cookies.
import { record, type StoredEvent } from "./store";
import { analyticsEnabled } from "./enabled";

export const VID_COOKIE = "bw_vid";
export const SID_COOKIE = "bw_sid";
export const NO_TRACK_COOKIE = "bw_notrack"; // set when the site owner logs in to /admin

function cookie(req: Request, name: string) {
  const m = req.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}

/** Real visitor IP: Cloudflare's header first (tunnel or proxy), then the usual proxy headers. */
export function ipOf(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export function visitorOf(req: Request) {
  return {
    vid: cookie(req, VID_COOKIE).slice(0, 40) || "unknown",
    sid: cookie(req, SID_COOKIE).slice(0, 40) || "unknown",
    ip: ipOf(req),
    country: req.headers.get("cf-ipcountry") || undefined,
    ua: req.headers.get("user-agent")?.slice(0, 300) || undefined,
  };
}

export const isOwner = (req: Request) => cookie(req, NO_TRACK_COOKIE) === "1";

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);

/** Log one LLM call made by a demo: what was asked, what came back, how long it took. Never throws. */
export async function logLlm(
  req: Request,
  call: { endpoint: string; input: string; output: string; ms: number; ok: boolean; extra?: Record<string, unknown> }
) {
  if (!analyticsEnabled || isOwner(req)) return;
  const e: StoredEvent = {
    t: Date.now(),
    type: "llm",
    ...visitorOf(req),
    data: { endpoint: call.endpoint, input: clip(call.input, 1000), output: clip(call.output, 2000), ms: Math.round(call.ms), ok: call.ok, ...call.extra },
  };
  await record([e]).catch((err) => console.error("analytics:", err));
}
