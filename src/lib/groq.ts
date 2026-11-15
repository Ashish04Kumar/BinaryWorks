// Minimal Groq client (OpenAI-compatible chat completions). Server-only: the key never reaches the browser.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const URL = "https://api.groq.com/openai/v1/chat/completions";
// Same models as ScholarLens: a big one for answers, a small one for routing and grading
export const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
export const FAST_MODEL = process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b";

export class LlmUnavailable extends Error {}

export const llmConfigured = () => Boolean(process.env.GROQ_API_KEY);

export async function chat(
  messages: ChatMessage[],
  { model = MODEL, json = false, maxTokens = 700 }: { model?: string; json?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new LlmUnavailable("GROQ_API_KEY is not set");

  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: json ? 0 : 0.6,
      reasoning_effort: "low",
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

export async function chatJson<T>(messages: ChatMessage[], fallback: T): Promise<T> {
  const text = await chat(messages, { model: FAST_MODEL, json: true, maxTokens: 300 });
  try {
    return { ...fallback, ...JSON.parse(text) };
  } catch {
    return fallback;
  }
}

/** Same as chat(), but yields the reply as it is generated (server-sent events from Groq). */
export async function* chatStream(
  messages: ChatMessage[],
  { model = MODEL, maxTokens = 900 }: { model?: string; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new LlmUnavailable("GROQ_API_KEY is not set");
  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.4, reasoning_effort: "low", stream: true }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.startsWith("data:") ? line.slice(5).trim() : "";
      if (!data || data === "[DONE]") continue;
      try {
        const piece = JSON.parse(data).choices?.[0]?.delta?.content;
        if (piece) yield piece;
      } catch {
        /* a partial line; the next read completes it */
      }
    }
  }
}
