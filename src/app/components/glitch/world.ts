// What Glitch keeps for a visitor in the web demo: reminders, lists, notes and to-dos. Saved in the browser
// (localStorage); the real Glitch keeps these in Postgres via its brain (Umbrella). The smart home is not here:
// it lives on Umbrella (see umbrella.ts), and a chat's "device" actions are sent there.

export type Reminder = { id: string; text: string; at: string; done: boolean };
export type Todo = { id: string; text: string; done: boolean };
export type World = {
  reminders: Reminder[];
  lists: Record<string, string[]>;
  notes: string[];
  todos: Todo[];
};
export type Action = Record<string, unknown> & { type: string };

const KEY = "glitch-world";
const id = () => Math.random().toString(36).slice(2, 9);

export const EMPTY_WORLD: World = {
  reminders: [],
  lists: {},
  notes: [],
  todos: [],
};

export function loadWorld(): World {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) {
      const { reminders, lists, notes, todos } = { ...EMPTY_WORLD, ...saved }; // drops what older visits kept (devices)
      return { reminders, lists, notes, todos };
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
    }
  }
  return next;
}

/** Reminders that are due now and not yet announced. */
export const dueReminders = (w: World) => w.reminders.filter((r) => !r.done && new Date(r.at).getTime() <= Date.now());
