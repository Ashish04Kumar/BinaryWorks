import { ADMIN_COOKIE } from "@/lib/admin/auth";
import { analyticsEnabled } from "@/lib/analytics/enabled";

export async function POST() {
  if (!analyticsEnabled) return new Response(null, { status: 404 });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` } });
}
