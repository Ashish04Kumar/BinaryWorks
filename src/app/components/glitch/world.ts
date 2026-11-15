// What Glitch keeps for a visitor in the web demo: reminders, lists, notes, to-dos and the demo smart-home
// devices. Saved in the browser (localStorage); the real Glitch keeps these in Postgres via its brain (Umbrella).

export type Reminder = { id: string; text: string; at: string; done: boolean };
export type Todo = { id: string; text: string; done: boolean };
export type Devices = {
  lights: "on" | "off";
  fan: "off" | 1 | 2 | 3;
  ac: "off" | number;
  tv: "on" | "off";
};
export type World = {
  reminders: Reminder[];
  lists: Record<string, string[]>;
  notes: string[];
  todos: Todo[];
  devices: Devices;
};
export type Action = Record<string, unknown> & { type: string };

const KEY = "glitch-world";
const id = () => Math.random().toString(36).slice(2, 9);

export const EMPTY_WORLD: World = {
  reminders: [],
  lists: {},
  notes: [],
  todos: [],
  devices: { lights: "off", fan: "off", ac: "off", tv: "off" },
};

export function loadWorld(): World {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) {
      const { lights, fan, ac, tv } = { ...EMPTY_WORLD.devices, ...saved.devices }; // drops devices the demo no longer has
      return { ...EMPTY_WORLD, ...saved, devices: { lights, fan, ac, tv } };
    }
  } catch {
    /* storage blocked */
  }
  return structuredClone(EMPTY_WORLD);
}

export function saveWorld(w: World) {
  try {
    localStorage.setItem(KEY, JSON.stringify(w));
  } catch {
    /* storage blocked: this visit only */
  }
}

/** The visitor's local time, in a form the model can do date maths with. */
export function nowString() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${d.toLocaleDateString("en-GB", { weekday: "long" })} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())} (${tz})`;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const listName = (s: unknown) => String(s || "my").trim().toLowerCase().replace(/\s*list$/, "") || "my";

/** Is this reply an IoT command? The model returns actions as structured JSON, so a "device" action is the signal. */
export const isIot = (actions: Action[]) => actions.some((a) => a.type === "device");

/** Apply the model's actions to the world. Unknown or malformed actions are ignored. */
export function applyActions(w: World, actions: Action[]): World {
  const next: World = structuredClone(w);
  for (const a of actions) {
    switch (a.type) {
      case "reminder_add": {
        const at = String(a.at || "");
        if (a.text && !Number.isNaN(new Date(at).getTime())) next.reminders.push({ id: id(), text: String(a.text), at, done: false });
        break;
      }
      case "reminder_remove":
        next.reminders = next.reminders.filter((r) => !same(r.text, String(a.text || "")));
        break;
      case "list_add": {
        const name = listName(a.list);
        const items = (Array.isArray(a.items) ? a.items : [a.items]).filter(Boolean).map(String);
        next.lists[name] = [...(next.lists[name] || []), ...items.filter((i) => !(next.lists[name] || []).some((x) => same(x, i)))];
        break;
      }
      case "list_remove": {
        const name = listName(a.list);
        const items = (Array.isArray(a.items) ? a.items : [a.items]).filter(Boolean).map(String);
        next.lists[name] = (next.lists[name] || []).filter((x) => !items.some((i) => same(x, i)));
        if (!next.lists[name].length) delete next.lists[name];
        break;
      }
      case "note_save":
        if (a.text) next.notes.unshift(String(a.text));
        break;
      case "todo_add":
        if (a.text) next.todos.push({ id: id(), text: String(a.text), done: false });
        break;
      case "todo_done":
        next.todos = next.todos.map((t) => (same(t.text, String(a.text || "")) ? { ...t, done: true } : t));
        break;
      case "device": {
        const d = String(a.device);
        const on = a.state !== "off";
        const v = Number(a.value);
        if (d === "lights" || d === "tv") next.devices[d] = on ? "on" : "off";
        if (d === "fan") next.devices.fan = !on ? "off" : ([1, 2, 3].includes(v) ? (v as 1 | 2 | 3) : 2);
        if (d === "ac") next.devices.ac = !on ? "off" : v >= 16 && v <= 30 ? v : 24;
        break;
      }
    }
  }
  return next;
}

/** Reminders that are due now and not yet announced. */
export const dueReminders = (w: World) => w.reminders.filter((r) => !r.done && new Date(r.at).getTime() <= Date.now());
