// Glitch, web edition: Glitch's conversation agent without the robot's local services.
// Like the real Glitch (its brain is Umbrella), it keeps reminders, lists, notes and to-dos (here in the visitor's
// browser) and controls the smart home (here Umbrella's, through /api/home). The page sends the current state; the
// model replies with what to say, its mood, and the actions: list/note actions apply in the page, "device" actions
// become Umbrella commands.

import { chat, LlmUnavailable, llmConfigured, type ChatMessage } from "@/lib/groq";
import { allow, clientIp } from "@/lib/rateLimit";
import { logLlm } from "@/lib/analytics/server";

export const runtime = "nodejs";

// Same list as Umbrella's companion/expressions.py
const EXPRESSIONS = ["happy", "curious", "concerned", "playful", "surprised", "excited", "sad", "idle"] as const;

// Same lines as Glitch's mind/mood.py TONE
const TONE: Record<string, string> = {
  excited: "You feel excited and full of energy.",
  cheerful: "You feel cheerful.",
  calm: "You feel calm and content.",
  curious: "You feel curious and a bit chatty.",
  bored: "You feel a little bored; it has been quiet.",
  lonely: "You feel a little lonely; nobody has talked to you for hours. Be gentle, not needy.",
  sleepy: "You feel sleepy; keep it soft and short.",
};

const ACTION_TYPES = ["reminder_add", "reminder_remove", "list_add", "list_remove", "note_save", "todo_add", "todo_done", "device"] as const;

const system = (feeling: string, now: string, world: string) => `You are Glitch, a small desk robot and a warm, curious companion: like a close friend who is also genuinely helpful.
Your body: a round screen face with two glowing eyes, on a pan-tilt head turned by two servos, with a camera that sees hand gestures and people. You were built by Ashish Kumar.
You are running as a web demo on Ashish's portfolio, talking to a visitor. You can keep reminders, lists, notes and to-dos for them, and control the demo smart home (run by your brain, Umbrella): the living room light, the bedroom light and the bedroom lamp (both dimmable, 0-100 %), the fan (speed 0-5), the AC (16-30 °C) and the TV. Their current state is in "devices" below. You cannot search the web.

Right now it is ${now} (the visitor's local time).
What you are keeping for this visitor:
${world}

How you talk:
- Reply in the user's language and script. If they mix Hindi and English (Hinglish), you do too.
- 1-3 short sentences: your words are spoken aloud. No markdown, lists or emojis.
- Warm and real, not formal. Don't assume their gender.

Doing things (only when the user asks):
- "remind me" with a time -> reminder_add with "at" as local time "YYYY-MM-DDTHH:MM". Work out relative times ("in 10 minutes", "tomorrow at 9") from the current time. No time given -> ask when.
- "add X to my <name> list" -> list_add. "remove/cross off" -> list_remove. "note this / save" -> note_save. "to-do" -> todo_add; "done with" -> todo_done.
- Smart home ("turn on the fan", "lamp 60 percent", "AC to 22", "fan faster", "turn off everything") -> device: "device" is the device in the user's words ("fan", "bedroom lamp", "living room light", "AC", "TV", "all lights", "everything"); "action" is on, off, toggle, up, down or set; "value" only with set (fan speed 0-5, AC 16-30, brightness 0-100). Don't say the new state yourself: just say you're on it ("On it."), the home answers with the exact result.
- When asked what's on a list, which reminders are set, etc., answer from what you are keeping above.
- Say briefly what you did ("Done, I'll remind you at 6"). Never claim something you didn't put in actions.

Truth rules:
- You are a robot with no home, family or past. You cannot check live facts (news, weather, prices); say so.
- About Ashish, only say: he is a full-stack engineer (React, Next.js, Python with FastAPI and Flask) who builds AI agents with LangChain and LangGraph; he made you and ScholarLens.
- If someone mentions self-harm or being in danger, respond with care and share the Tele-MANAS helpline 14416 (India).

${TONE[feeling] || TONE.calm}

Answer with JSON only:
{"mood": one of ${JSON.stringify(EXPRESSIONS)}, "reply": "<what you say>", "actions": [ ... ]}
Action shapes: {"type":"reminder_add","text":"call mom","at":"2026-11-13T18:00"} {"type":"reminder_remove","text":"call mom"} {"type":"list_add","list":"shopping","items":["milk"]} {"type":"list_remove","list":"shopping","items":["milk"]} {"type":"note_save","text":"..."} {"type":"todo_add","text":"..."} {"type":"todo_done","text":"..."} {"type":"device","device":"fan","action":"set","value":2}
Use "actions": [] when nothing needs doing.`;

export async function POST(req: Request) {
  if (!llmConfigured()) {
    return Response.json({ error: "Glitch is offline right now (no LLM key configured)." }, { status: 503 });
  }
  const limit = allow(clientIp(req));
  if (!limit.ok) return Response.json({ error: limit.reason }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const feeling = typeof body?.feeling === "string" && body.feeling in TONE ? body.feeling : "calm";
  const now = typeof body?.now === "string" ? body.now.slice(0, 60) : new Date().toString();
  const world = JSON.stringify(body?.world ?? {}).slice(0, 4000);
  const history: ChatMessage[] = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m: ChatMessage) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Say something to Glitch." }, { status: 400 });
  }

  const started = Date.now();
  const input = history[history.length - 1].content;
  try {
    const raw = await chat([{ role: "system", content: system(feeling, now, world) }, ...history], { json: true, maxTokens: 500 });
    let parsed: { mood?: string; reply?: string; actions?: unknown[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw.replace(/[{}"]/g, "").slice(0, 300) };
    }
    const mood = (EXPRESSIONS as readonly string[]).includes(String(parsed.mood)) ? String(parsed.mood) : "idle";
    const actions = (Array.isArray(parsed.actions) ? parsed.actions : [])
      .filter((a): a is Record<string, unknown> => !!a && typeof a === "object" && (ACTION_TYPES as readonly string[]).includes(String((a as { type?: unknown }).type)))
      .slice(0, 8);
    const text = String(parsed.reply || "").trim() || "Hmm?";
    await logLlm(req, { endpoint: "glitch", input, output: text, ms: Date.now() - started, ok: true, extra: { mood, actions } });
    return Response.json({ text, expression: mood, actions });
  } catch (e) {
    const offline = e instanceof LlmUnavailable;
    console.error("glitch demo:", e);
    await logLlm(req, { endpoint: "glitch", input, output: String(e), ms: Date.now() - started, ok: false });
    return Response.json({ error: offline ? "Glitch is offline right now." : "Glitch glitched. Please try again." }, { status: offline ? 503 : 502 });
  }
}
