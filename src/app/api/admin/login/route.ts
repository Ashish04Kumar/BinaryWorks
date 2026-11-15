import { ADMIN_COOKIE, SESSION_DAYS, adminConfigured, checkLogin, createSession, loginAllowed, loginFailed } from "@/lib/admin/auth";
import { ipOf, NO_TRACK_COOKIE } from "@/lib/analytics/server";

export async function POST(req: Request) {
  if (!adminConfigured()) return Response.json({ error: "Admin login isn't set up on this server." }, { status: 503 });
  const ip = ipOf(req);
  if (!loginAllowed(ip)) return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  if (!checkLogin(String(body?.email || ""), String(body?.password || ""))) {
    loginFailed(ip);
    return Response.json({ error: "Wrong email or password." }, { status: 401 });
  }
  const secure = new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https" ? "; Secure" : "";
  const headers = new Headers();
  headers.append("Set-Cookie", `${ADMIN_COOKIE}=${createSession()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${secure}`);
  // this browser is the owner's: stop counting its visits
  headers.append("Set-Cookie", `${NO_TRACK_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=${365 * 86400}${secure}`);
  return Response.json({ ok: true }, { headers });
}
