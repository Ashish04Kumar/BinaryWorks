"use client";
// A bright glass pill at the top of Glitch's stage that shows what just changed in the home ("Fan · speed 4", "Lamp ·
// 60%", "TV on"), so a gesture's effect is visible right where you're looking. A held gesture updates the same
// pill in place; several devices at once (the room went empty) become one pill. It fades out shortly after.

export type Pulse = {
  key: number; // changes on every update (re-runs the little bump)
  icon: string;
  title: string;
  value: string;
  level?: { now: number; max: number; kind: "steps" | "bar" };
  cause: string;
  off: boolean;
};

const ICONS: Record<string, string> = { light: "💡", fan: "🌀", ac: "❄️", tv: "📺" };
const SHORT: Record<string, string> = { "living room light": "Living light", "bedroom light": "Bedroom light", "bedroom lamp": "Lamp" };
const CAUSE: Record<string, string> = {
  "fan faster": "☝️ fan faster",
  "fan slower": "✊ fan slower",
  "lamp brighter": "👍 lamp brighter",
  "lamp dimmer": "👎 lamp dimmer",
  "light by hand": "🤟 by hand",
  "TV by hand": "✌️ by hand",
  "room empty": "nobody in view",
  manual: "tapped",
  voice: "asked",
};

type Row = { device_name?: string; device_id?: string; device_kind?: string; kind?: string; after?: Record<string, unknown>; trigger?: string };

/** One action record (Umbrella's home_action) as a pill. */
export function pulseOf(row: Row): Omit<Pulse, "key"> {
  const after = row.after ?? {};
  const kind = String(row.device_kind ?? row.kind ?? "");
  const raw = SHORT[String(row.device_name)] ?? String(row.device_name ?? row.device_id ?? "Device");
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);
  const on = Boolean(after.on);
  const cause = CAUSE[String(row.trigger)] ?? String(row.trigger ?? "");
  const base = { icon: ICONS[kind] ?? "✨", title: name, cause, off: !on };
  if (!on) return { ...base, value: "off" };
  if (kind === "fan") return { ...base, value: `speed ${after.speed}`, level: { now: Number(after.speed) || 0, max: 5, kind: "steps" } };
  if (kind === "ac") return { ...base, value: `${after.temperature}°C` };
  if (typeof after.brightness === "number") return { ...base, value: `${after.brightness}%`, level: { now: after.brightness, max: 100, kind: "bar" } };
  return { ...base, value: "on" };
}

/** Several devices changed together (within a moment): one pill. */
export function pulseOfMany(rows: Row[]): Omit<Pulse, "key"> {
  const allOff = rows.every((r) => !r.after?.on);
  const cause = CAUSE[String(rows[0]?.trigger)] ?? String(rows[0]?.trigger ?? "");
  return { icon: allOff ? "🌙" : "🏠", title: `${rows.length} devices`, value: allOff ? "off" : "changed", cause, off: allOff };
}

const HomePulse = ({ pulse, visible }: { pulse: Pulse | null; visible: boolean }) => {
  if (!pulse) return null;
  return (
    <div className={`bw-pulse pointer-events-none absolute left-1/2 top-14 z-20 ${visible ? "is-in" : ""}`} role="status" aria-live="polite">
      <div key={pulse.key} className="bw-pulse-pill flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full">
        <span className={`bw-pulse-icon text-base leading-none ${pulse.off ? "grayscale" : ""}`} aria-hidden>
          {pulse.icon}
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold whitespace-nowrap">
            {pulse.title} <span className="opacity-40">·</span> <span className={pulse.off ? "opacity-60" : "bw-pulse-value"}>{pulse.value}</span>
          </span>
          {pulse.level && pulse.level.kind === "steps" && (
            <span className="flex gap-0.5 mt-1" aria-hidden>
              {Array.from({ length: pulse.level.max }, (_, i) => (
                <i key={i} className={`block h-1 w-3.5 rounded-full transition-colors ${i < pulse.level!.now ? "bg-[var(--accent-bright)]" : "bg-black/10"}`} />
              ))}
            </span>
          )}
          {pulse.level && pulse.level.kind === "bar" && (
            <span className="block h-1 w-24 mt-1 rounded-full bg-black/10 overflow-hidden" aria-hidden>
              <i className="block h-full bg-[var(--accent-bright)] transition-[width] duration-300" style={{ width: `${pulse.level.now}%` }} />
            </span>
          )}
          {pulse.cause && <span className="block font-mono text-[10px] opacity-55 mt-0.5">{pulse.cause}</span>}
        </span>
      </div>
    </div>
  );
};

export default HomePulse;
