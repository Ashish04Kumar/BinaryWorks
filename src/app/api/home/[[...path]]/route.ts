// Glitch's home demo runs on Umbrella, the companion brain (a separate Python server): its rules, simulated
// devices, line bank and action log. This route is only the bridge, with no home logic of its own:
//   - it forwards a short list of Umbrella's home endpoints, server to server (UMBRELLA_URL never reaches the browser),
//   - it gives each visitor their own home on Umbrella (a "demo-…" id kept in a cookie),
//   - and it limits how often one visitor can call it.
// Umbrella unset or unreachable: 503 { offline: true }, and the page shows the demo as offline.

import { NextRequest } from "next/server";
import { clientIp } from "@/lib/rateLimit";

const HOME_COOKIE = "bw_home";
const ID_PATTERN = /^demo-[a-z0-9]{12}$/;

// path -> Umbrella endpoint (and the method it takes)
const ROUTES: Record<string, { method: "GET" | "POST"; to: string }> = {
  "GET ": { method: "GET", to: "/v1/home" },
  "GET log": { method: "GET", to: "/v1/home/log" },
  "POST signals": { method: "POST", to: "/v1/home/signals" },
  "POST events": { method: "POST", to: "/v1/home/events" },
  "POST command": { method: "POST", to: "/v1/home/command" },
};

// Per visitor (IP): a held gesture sends a step about every 0.8 s, so allow a steady stream, not a flood
const WINDOW_MS = 60_000;
const PER_MINUTE = 150;
const hits = new Map<string, number[]>();
function allowed(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_MINUTE) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

const offline = (why: string) => Response.json({ offline: true, error: why }, { status: 503 });

function homeIdOf(req: NextRequest) {
  const id = req.cookies.get(HOME_COOKIE)?.value;
  return id && ID_PATTERN.test(id) ? { id, fresh: false } : { id: `demo-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`, fresh: true };
}

function withCookie(res: Response, home: { id: string; fresh: boolean }, req: NextRequest) {
  if (!home.fresh) return res;
  const headers = new Headers(res.headers);
  const secure = req.nextUrl.protocol === "https:" ? "; Secure" : "";
  headers.append("Set-Cookie", `${HOME_COOKIE}=${home.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}${secure}`);
  return new Response(res.body, { status: res.status, headers });
}

async function forward(req: NextRequest, method: "GET" | "POST", path: string[]) {
  const base = process.env.UMBRELLA_URL;
  if (!base) return offline("The home demo is offline (Umbrella is not connected).");
  if (!allowed(clientIp(req))) return Response.json({ error: "Too many requests. Slow down a little." }, { status: 429 });
  const home = homeIdOf(req);
  const sub = path.join("/");

  // live updates: Umbrella's trace for this home (server-sent events), streamed through
  if (method === "GET" && sub === "trace") {
    try {
      const upstream = await fetch(`${base}/v1/users/${home.id}/trace`, { signal: req.signal, headers: { Accept: "text/event-stream" } });
      if (!upstream.ok || !upstream.body) return offline("The home demo's live updates are unavailable.");
      return withCookie(
        new Response(upstream.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" } }),
        home,
        req
      );
    } catch {
      return offline("The home demo is offline (Umbrella did not answer).");
    }
  }

  const route = ROUTES[`${method} ${sub}`];
  if (!route) return Response.json({ error: "Not found" }, { status: 404 });
  const url = new URL(base + route.to);
  url.searchParams.set("home_id", home.id);
  if (sub === "log") url.searchParams.set("limit", String(Math.min(100, Number(req.nextUrl.searchParams.get("limit")) || 40)));

  let body: string | undefined;
  if (method === "POST") {
    body = await req.text();
    if (body.length > 2000) return Response.json({ error: "Request too large." }, { status: 413 });
  }
  try {
    const upstream = await fetch(url, {
      method,
      body,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const text = await upstream.text();
    return withCookie(new Response(text, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }), home, req);
  } catch {
    return offline("The home demo is offline (Umbrella did not answer).");
  }
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, "GET", (await ctx.params).path ?? []);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, "POST", (await ctx.params).path ?? []);
}
