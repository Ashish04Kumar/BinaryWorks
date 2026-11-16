// The page's side of Glitch's home demo. The home itself (rules, simulated devices, lines, action log) is
// Umbrella's; this file only talks to it through /api/home (see app/api/home). Shapes follow Umbrella's API.

export type HomeDevice = {
  id: string;
  kind: "light" | "fan" | "ac" | "tv";
  room: string;
  name: string;
  dimmable: boolean;
  on: boolean;
  speed?: number;
  temperature?: number;
  brightness?: number;
};
export type HomeRule = { name: string; when: string; hours: string; cooldown: number; repeat?: boolean };
export type HomeState = {
  home_id: string;
  present: boolean;
  devices: HomeDevice[];
  rules: HomeRule[];
  // the empty-room countdown (when Umbrella sends it)
  empty_for?: number | null;
  leave_seconds?: number;
  left_sent?: boolean;
  waiting_cooldown?: boolean;
};
export type HomeAction = {
  id: string;
  at: string;
  source: string;
  trigger: string;
  device_id: string;
  device_name?: string;
  action: string;
  value: number | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  status: string;
  error: string;
};
export type HomeMessage = { id: string; at: string; text: string; method: string };
export type HomeLog = { actions: HomeAction[]; messages: HomeMessage[] };

export class HomeOffline extends Error {}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/home${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 503 || data?.offline) throw new HomeOffline(data?.error || "The home demo is offline.");
  if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : data?.error || `Home request failed (${res.status})`);
  return data as T;
}

export const home = {
  state: () => call<HomeState>(""),
  log: (limit = 40) => call<HomeLog>(`/log?limit=${limit}`),
  /** What the camera sees: a people count, or a gesture that held (repeat = still held) */
  signals: (s: { people?: number; gesture?: string; repeat?: boolean; room?: string; source?: string }) =>
    call<{ events: unknown[]; records: HomeAction[] }>("/signals", { source: "yolo", ...s }),
  /** A clean event, as the simulator buttons send it */
  event: (e: { kind: "person_entered" | "person_left" | "gesture"; name?: string; repeat?: boolean; source?: string }) =>
    call<{ records: HomeAction[] }>("/events", { source: "sim", ...e }),
  /** A direct command ("fan" up, "everything" off): no rules; Umbrella answers with a line or a question */
  command: (device: string, action: string, value?: number | null) =>
    call<{ say?: string; ask?: string; records?: HomeAction[] }>("/command", { device, action, value: value ?? null }),
  /** Live updates (home_event, home_action, home_state, home_message). Returns a function that stops listening. */
  listen(onEvent: (kind: string, data: Record<string, unknown>, at: number, id: number) => void, onOpen?: (ok: boolean) => void) {
    const source = new EventSource("/api/home/trace");
    source.onopen = () => onOpen?.(true);
    source.onerror = () => onOpen?.(false);
    source.onmessage = (m) => {
      try {
        const e = JSON.parse(m.data) as { id: number; at: number; kind: string; data: Record<string, unknown> };
        if (String(e.kind).startsWith("home_")) onEvent(e.kind, e.data || {}, e.at, e.id);
      } catch {
        /* skip a malformed event */
      }
    };
    return () => source.close();
  },
};
