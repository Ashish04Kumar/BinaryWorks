// Browser side of the visitor analytics: ids, a small queue, and batched sends to /api/track.
// The visitor id lives in the browser (localStorage + cookie) so repeat visits group together; the session id
// is per tab. Both are cookies too, so the demo APIs can tie LLM calls to the same visitor.

import { analyticsEnabled } from "./analytics/enabled";

type Pending = { type: string; t: number; data?: Record<string, unknown> };

const queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const rid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, "").slice(0, 20);

function setCookie(name: string, value: string, maxAgeDays?: number) {
  const age = maxAgeDays ? `; max-age=${maxAgeDays * 86400}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax${age}`;
}

/** Off when analytics is switched off, for the site owner (logged in to /admin) and on the admin page itself. */
export function trackingOff() {
  if (!analyticsEnabled || typeof window === "undefined") return true;
  return document.cookie.includes("bw_notrack=1") || location.pathname.startsWith("/admin");
}

/** Make sure this browser has a visitor id and this tab a session id. Returns true for a new session. */
export function ensureIds(): boolean {
  let vid = "";
  try {
    vid = localStorage.getItem("bw_vid") || "";
    if (!vid) localStorage.setItem("bw_vid", (vid = rid()));
  } catch {
    vid = document.cookie.match(/bw_vid=([^;]+)/)?.[1] || rid();
  }
  setCookie("bw_vid", vid, 365);

  let sid = "";
  let fresh = false;
  try {
    sid = sessionStorage.getItem("bw_sid") || "";
    if (!sid) {
      sessionStorage.setItem("bw_sid", (sid = rid()));
      fresh = true;
    }
  } catch {
    sid = rid();
    fresh = true;
  }
  setCookie("bw_sid", sid);
  return fresh;
}

export function flush(useBeacon = false) {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const body = JSON.stringify({ events: queue.splice(0, queue.length) });
  if (useBeacon && navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  else fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

/** Queue an event; sent within a few seconds (or right away when the page is hidden). */
export function track(type: "session_start" | "section" | "click" | "activity" | "leave", data?: Record<string, unknown>) {
  if (trackingOff()) return;
  queue.push({ type, t: Date.now(), data });
  if (queue.length >= 20) flush();
  else if (!timer) timer = setTimeout(() => flush(), 4000);
}

/** Something a visitor did in a demo: switched a view, turned the camera on, played the video... */
export const trackActivity = (name: string, data?: Record<string, unknown>) => track("activity", { name, ...data });
