"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, ListChecks, NotebookPen, X } from "lucide-react";
import type { World } from "./world";
import CoachTip from "./CoachTip";

const time = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return (today ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " ") + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

/** True for a moment after `count` goes up (something was added), so its box can glow. Not on the first load. */
function useGrew(count: number) {
  const [grew, setGrew] = useState(false);
  const last = useRef(count);
  const ready = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => (ready.current = true), 1500); // what was saved from earlier visits loads in first
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const before = last.current;
    last.current = count;
    if (!ready.current || count <= before) return;
    setGrew(true);
    const t = setTimeout(() => setGrew(false), 2200);
    return () => clearTimeout(t);
  }, [count]);
  return grew;
}

const Column = ({ icon, title, children, hide, flash }: { icon: React.ReactNode; title: string; children: React.ReactNode; hide?: boolean; flash?: boolean }) => (
  <div className={`bw-saved p-4 min-w-0 ${flash ? "is-new" : ""} ${hide ? "hidden md:block" : ""}`}>
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] bw-muted mb-3">
      {icon} {title}
    </p>
    {children}
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-xs bw-faint leading-relaxed">{children}</p>;

// What Glitch is keeping for this visitor: reminders, lists and to-dos, notes. (The smart home is HomePanel.)
// Phones show it only on the "saved" tab; md and up always.
const GlitchWorld = ({ world, onChange, phonePanel, coach, onCoachDone }: { world: World; onChange: (w: World) => void; phonePanel?: string; coach?: boolean; onCoachDone?: () => void }) => {
  const saved = phonePanel !== "saved";
  const reminders = world.reminders.filter((r) => !r.done).sort((a, b) => a.at.localeCompare(b.at));
  const lists = Object.entries(world.lists);
  // something was just added: that box glows softly for a moment
  const newReminder = useGrew(reminders.length);
  const newListItem = useGrew(lists.reduce((n, [, items]) => n + items.length, 0) + world.todos.length);
  const newNote = useGrew(world.notes.length);

  return (
    <div className={`relative ${phonePanel === "saved" ? "grid" : "hidden md:grid"} md:grid-cols-3 border-t bw-rule divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)] ${coach ? "bw-coach-target" : ""}`}>
      {coach && (
        <CoachTip
          title="Glitch keeps it here"
          text="Reminders, lists, to-dos and notes you give Glitch show up in these boxes, and stay in this browser. Ask it to remove one, or use ✕."
          onDone={() => onCoachDone?.()}
        />
      )}
      <Column icon={<Bell className="w-3.5 h-3.5" />} title="Reminders" hide={saved} flash={newReminder}>
        {reminders.length ? (
          <ul className="space-y-1.5">
            {reminders.map((r) => (
              <li key={r.id} className="group flex items-start justify-between gap-2 text-sm">
                <span className="min-w-0">
                  <span className="font-mono text-[11px] bw-accent mr-1.5">{time(r.at)}</span>
                  {r.text}
                </span>
                <button
                  onClick={() => onChange({ ...world, reminders: world.reminders.filter((x) => x.id !== r.id) })}
                  aria-label={`Delete reminder ${r.text}`}
                  className="opacity-0 group-hover:opacity-100 bw-faint cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Try: “remind me to drink water in 1 minute”</Empty>
        )}
      </Column>

      <Column icon={<ListChecks className="w-3.5 h-3.5" />} title="Lists & to-dos" hide={saved} flash={newListItem}>
        {lists.length || world.todos.length ? (
          <div className="space-y-3 text-sm">
            {lists.map(([name, items]) => (
              <div key={name}>
                <p className="font-medium capitalize mb-1">{name}</p>
                <div className="flex flex-wrap gap-1">
                  {items.map((it) => (
                    <span key={it} className="px-2 py-0.5 rounded-full border bw-rule text-xs">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {world.todos.length > 0 && (
              <ul className="space-y-1">
                {world.todos.map((t) => (
                  <li key={t.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => onChange({ ...world, todos: world.todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) })}
                        className="accent-[var(--accent-bright)]"
                      />
                      <span className={t.done ? "line-through bw-faint" : ""}>{t.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Empty>Try: “add milk and eggs to my shopping list”</Empty>
        )}
      </Column>

      <Column icon={<NotebookPen className="w-3.5 h-3.5" />} title="Notes" hide={saved} flash={newNote}>
        {world.notes.length ? (
          <ul className="space-y-1.5 text-sm">
            {world.notes.slice(0, 5).map((n, i) => (
              <li key={i} className="leading-snug">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Try: “note that my wifi password is on the router”</Empty>
        )}
      </Column>

    </div>
  );
};

export default GlitchWorld;
