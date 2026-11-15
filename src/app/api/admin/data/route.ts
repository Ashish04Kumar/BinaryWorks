// Everything the dashboard shows, built from the raw event log: visitors, their visits, time per section,
// LLM calls and a timeline of what they did. Admin only.
import { sessionFrom } from "@/lib/admin/auth";
import { readRecent, type StoredEvent } from "@/lib/analytics/store";
import { analyticsEnabled } from "@/lib/analytics/enabled";

function device(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  const kind = /Mobi|iPhone|Android(?!.*Tablet)/.test(ua) ? "Mobile" : /iPad|Tablet/.test(ua) ? "Tablet" : "Desktop";
  const bot = /bot|crawler|spider|preview|curl|wget|headless/i.test(ua);
  return { browser, os, kind, bot };
}

type Session = {
  sid: string;
  vid: string;
  ip: string;
  ips: string[];
  country?: string;
  ua?: string;
  device: ReturnType<typeof device>;
  start: number;
  end: number;
  activeMs: number;
  entry?: Record<string, unknown>;
  sections: Record<string, number>;
  llm: { t: number; endpoint: string; input: string; output: string; ms: number; ok: boolean; extra: Record<string, unknown> }[];
  timeline: { t: number; type: string; text: string }[];
};

function describe(e: StoredEvent): string {
  const d = e.data;
  switch (e.type) {
    case "session_start":
      return `opened ${d.path}${d.referrer ? ` (from ${d.referrer})` : ""}`;
    case "click":
      return `clicked "${d.label}"${d.section ? ` in ${d.section}` : ""}`;
    case "activity":
      return d.name === "page" ? `went to ${d.path}` : `${d.name}${Object.entries(d).filter(([k]) => k !== "name").map(([k, v]) => ` ${k}=${v}`).join("")}`;
    case "llm":
      return `asked ${d.endpoint}: "${String(d.input).slice(0, 120)}"`;
    default:
      return e.type;
  }
}

export async function GET(req: Request) {
  if (!analyticsEnabled) return new Response(null, { status: 404 });
  if (!sessionFrom(req)) return Response.json({ error: "Not logged in." }, { status: 401 });
  const days = Math.min(30, Math.max(1, Number(new URL(req.url).searchParams.get("days")) || 7));
  const events = await readRecent(days);

  const sessions = new Map<string, Session>();
  for (const e of events) {
    let s = sessions.get(e.sid);
    if (!s) {
      s = { sid: e.sid, vid: e.vid, ip: e.ip, ips: [], country: e.country, ua: e.ua, device: device(e.ua), start: e.t, end: e.t, activeMs: 0, sections: {}, llm: [], timeline: [] };
      sessions.set(e.sid, s);
    }
    s.end = Math.max(s.end, e.t);
    if (!s.ips.includes(e.ip)) s.ips.push(e.ip);
    s.country ||= e.country;
    if (e.type === "session_start") s.entry = e.data;
    if (e.type === "section") {
      const name = String(e.data.section);
      const ms = Number(e.data.ms) || 0;
      s.sections[name] = (s.sections[name] || 0) + ms;
      s.activeMs += ms;
      continue; // section spans are summed, not listed in the timeline
    }
    if (e.type === "llm") s.llm.push({ t: e.t, endpoint: String(e.data.endpoint), input: String(e.data.input), output: String(e.data.output), ms: Number(e.data.ms), ok: Boolean(e.data.ok), extra: e.data });
    s.timeline.push({ t: e.t, type: e.type, text: describe(e) });
  }

  const list = [...sessions.values()].sort((a, b) => b.end - a.end);
  // totals count people only; bots and scripts are still listed (the dashboard can show them)
  const people = list.filter((s) => !s.device.bot);
  const visitors = new Map<string, { vid: string; ips: string[]; country?: string; sessions: number; first: number; last: number; activeMs: number; llm: number; device: string }>();
  for (const s of people) {
    const v = visitors.get(s.vid) ?? { vid: s.vid, ips: [], country: s.country, sessions: 0, first: s.start, last: s.end, activeMs: 0, llm: 0, device: `${s.device.kind} · ${s.device.os} · ${s.device.browser}` };
    v.sessions += 1;
    v.first = Math.min(v.first, s.start);
    v.last = Math.max(v.last, s.end);
    v.activeMs += s.activeMs;
    v.llm += s.llm.length;
    for (const ip of s.ips) if (!v.ips.includes(ip)) v.ips.push(ip);
    visitors.set(s.vid, v);
  }

  const dayStart = new Date().setHours(0, 0, 0, 0);
  const sectionTotals: Record<string, number> = {};
  for (const s of people) for (const [k, ms] of Object.entries(s.sections)) sectionTotals[k] = (sectionTotals[k] || 0) + ms;

  return Response.json({
    days,
    summary: {
      visitors: visitors.size,
      visitorsToday: [...visitors.values()].filter((v) => v.last >= dayStart).length,
      sessions: people.length,
      llmCalls: people.reduce((n, s) => n + s.llm.length, 0),
      avgActiveMs: people.length ? Math.round(people.reduce((n, s) => n + s.activeMs, 0) / people.length) : 0,
      sectionTotals,
    },
    visitors: [...visitors.values()].sort((a, b) => b.last - a.last),
    sessions: list.slice(0, 300),
  });
}
