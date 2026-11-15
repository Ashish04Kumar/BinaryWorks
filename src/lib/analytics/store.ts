// Visitor analytics, kept as one JSON line per event in .data/analytics/<date>.jsonl (git-ignored).
// Plain files on purpose: no database to run. Works wherever the app has a writable disk (local, a VPS, Docker);
// on serverless hosts like Vercel the disk is temporary, so a real database would be needed there.
import { appendFile, mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type EventType = "session_start" | "section" | "click" | "activity" | "llm" | "leave";

export type StoredEvent = {
  t: number; // ms since epoch
  type: EventType;
  vid: string; // visitor id: a random id kept in the visitor's browser
  sid: string; // session id: one per visit (tab)
  ip: string;
  country?: string;
  ua?: string;
  data: Record<string, unknown>;
};

const DIR = path.join(process.cwd(), ".data", "analytics");
const fileFor = (t: number) => path.join(DIR, `${new Date(t).toISOString().slice(0, 10)}.jsonl`);

export async function record(events: StoredEvent[]) {
  if (!events.length) return;
  await mkdir(DIR, { recursive: true });
  // group by day so an event lands in the file for its own date
  const byFile = new Map<string, string>();
  for (const e of events) byFile.set(fileFor(e.t), (byFile.get(fileFor(e.t)) || "") + JSON.stringify(e) + "\n");
  await Promise.all([...byFile].map(([f, lines]) => appendFile(f, lines, "utf8")));
}

/** Events from the last `days` days, oldest first. */
export async function readRecent(days: number): Promise<StoredEvent[]> {
  const files = await readdir(DIR).catch(() => [] as string[]);
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const wanted = files.filter((f) => f.endsWith(".jsonl") && f.slice(0, 10) >= since).sort();
  const out: StoredEvent[] = [];
  for (const f of wanted) {
    const text = await readFile(path.join(DIR, f), "utf8").catch(() => "");
    for (const line of text.split("\n")) {
      if (!line) continue;
      try {
        out.push(JSON.parse(line));
      } catch {
        /* a half-written line */
      }
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
