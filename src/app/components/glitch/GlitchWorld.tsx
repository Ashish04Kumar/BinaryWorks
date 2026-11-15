"use client";
import { AirVent, Bell, Fan, Lightbulb, ListChecks, NotebookPen, Plug, Tv, X } from "lucide-react";
import type { Devices, World } from "./world";

const time = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return (today ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " ") + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const Column = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="p-4 min-w-0">
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] bw-muted mb-3">
      {icon} {title}
    </p>
    {children}
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-xs bw-faint leading-relaxed">{children}</p>;

// What Glitch is keeping for this visitor, plus the demo smart-home devices (tap to switch them by hand too)
const GlitchWorld = ({ world, onChange }: { world: World; onChange: (w: World) => void }) => {
  const setDevice = <K extends keyof Devices>(k: K, v: Devices[K]) => onChange({ ...world, devices: { ...world.devices, [k]: v } });
  const d = world.devices;
  const reminders = world.reminders.filter((r) => !r.done).sort((a, b) => a.at.localeCompare(b.at));
  const lists = Object.entries(world.lists);

  const tile = (on: boolean) =>
    `flex flex-col items-start gap-1.5 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
      on ? "bw-accent-border bw-tint" : "bw-rule bw-row-link"
    }`;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t bw-rule divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-color)]">
      <Column icon={<Bell className="w-3.5 h-3.5" />} title="Reminders">
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

      <Column icon={<ListChecks className="w-3.5 h-3.5" />} title="Lists & to-dos">
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

      <Column icon={<NotebookPen className="w-3.5 h-3.5" />} title="Notes">
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

      <Column icon={<Plug className="w-3.5 h-3.5" />} title="Smart home · demo">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setDevice("lights", d.lights === "on" ? "off" : "on")} className={tile(d.lights === "on")}>
            <Lightbulb className={`w-4 h-4 ${d.lights === "on" ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" : "bw-faint"}`} />
            <span className="text-xs">Lights · {d.lights}</span>
          </button>
          <button onClick={() => setDevice("fan", d.fan === "off" ? 2 : d.fan === 3 ? "off" : ((d.fan + 1) as 2 | 3))} className={tile(d.fan !== "off")}>
            <Fan
              className={`w-4 h-4 ${d.fan !== "off" ? "bw-accent animate-spin" : "bw-faint"}`}
              style={d.fan !== "off" ? { animationDuration: `${1.2 / d.fan}s` } : undefined}
            />
            <span className="text-xs">Fan · {d.fan === "off" ? "off" : `speed ${d.fan}`}</span>
          </button>
          <button onClick={() => setDevice("ac", d.ac === "off" ? 24 : "off")} className={tile(d.ac !== "off")}>
            <AirVent className={`w-4 h-4 ${d.ac !== "off" ? "text-sky-400" : "bw-faint"}`} />
            <span className="text-xs">AC · {d.ac === "off" ? "off" : `${d.ac}°C`}</span>
          </button>
          <button onClick={() => setDevice("tv", d.tv === "on" ? "off" : "on")} className={tile(d.tv === "on")}>
            <Tv className={`w-4 h-4 ${d.tv === "on" ? "text-sky-400" : "bw-faint"}`} />
            <span className="text-xs">TV · {d.tv}</span>
          </button>
        </div>
      </Column>
    </div>
  );
};

export default GlitchWorld;
