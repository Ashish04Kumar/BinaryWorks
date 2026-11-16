"use client";
// The smart home in Glitch's demo. The home is Umbrella's (its rules, simulated devices, lines and action log,
// reached through /api/home); this panel only shows it and sends it what happens: the camera's people count and
// gestures, the simulator buttons and direct device buttons. Kept compact so the room above and this console fit
// on one screen on a laptop.
import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { HomeAction, HomeDevice, HomeLog, HomeState } from "./umbrella";
import CoachTip from "./CoachTip";

export type HomeGesture = { name: string; icon: string; label: string; repeat: boolean };

const ICONS: Record<HomeDevice["kind"], string> = { light: "💡", fan: "🌀", ac: "❄️", tv: "📺" };
const SHORT: Record<string, string> = { "living room light": "Living light", "bedroom light": "Bedroom light", "bedroom lamp": "Lamp" };
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const brief = (s: Record<string, unknown>) =>
  Object.entries(s)
    .map(([k, v]) => (k === "on" ? (v ? "on" : "off") : `${k} ${v}`))
    .join(", ") || "–";

/** The empty-room countdown: how long nobody has been in view, and when everything goes off. */
function emptyRoom(s: HomeState | null): { text: string; hot: boolean } {
  if (!s) return { text: "–", hot: false };
  if (s.empty_for == null) return { text: s.present ? "someone here" : "–", hot: false };
  if (s.waiting_cooldown) return { text: "empty · off after cooldown", hot: true };
  if (s.left_sent) return { text: "empty · switched off", hot: false };
  const left = Math.max(0, Math.round((s.leave_seconds ?? 120) - s.empty_for));
  return { text: `empty · all off in ${left}s`, hot: true };
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[10px] uppercase tracking-[0.12em] bw-muted mb-1.5">{children}</p>
);

const mini = "grid place-items-center w-6 h-6 rounded-md border bw-rule bw-chip text-xs cursor-pointer";

/** One device as a slim row: click it to switch on/off; − / + only where there are levels. */
function DeviceRow({ d, send }: { d: HomeDevice; send: (device: string, action: string) => void }) {
  const level = d.kind === "fan" ? `speed ${d.speed ?? 0}` : d.kind === "ac" ? `${d.temperature}°C` : d.dimmable ? `${d.on ? d.brightness ?? 0 : 0}%` : "";
  const steps = d.kind === "fan" || d.kind === "ac" || d.dimmable;
  const [down, up] = d.kind === "fan" ? ["Slower", "Faster"] : d.kind === "ac" ? ["Cooler", "Warmer"] : ["Dimmer", "Brighter"];
  return (
    <div className={`relative flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg border overflow-hidden transition-colors ${d.on ? "bw-accent-border bw-tint" : "bw-rule"}`}>
      <button type="button" onClick={() => send(d.id, "toggle")} title={`${d.name} (${d.room}): turn ${d.on ? "off" : "on"}`} className="flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer">
        <span className={`text-sm ${d.on ? "" : "grayscale opacity-50"}`} aria-hidden>
          {ICONS[d.kind]}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] font-medium truncate">{SHORT[d.name] ?? d.name}</span>
          <span className={`block font-mono text-[9.5px] ${d.on ? "bw-accent" : "bw-faint"}`}>{d.on ? level || "on" : "off"}</span>
        </span>
      </button>
      {steps && (
        <span className="flex gap-0.5 shrink-0">
          <button type="button" aria-label={`${down}: ${d.name}`} title={down} onClick={() => send(d.id, "down")} className={mini}>
            −
          </button>
          <button type="button" aria-label={`${up}: ${d.name}`} title={up} onClick={() => send(d.id, "up")} className={mini}>
            +
          </button>
        </span>
      )}
      {d.dimmable && (
        <span className="absolute left-0 bottom-0 h-0.5 bg-[var(--accent-bright)] transition-[width] duration-300" style={{ width: `${d.on ? d.brightness ?? 0 : 0}%` }} />
      )}
    </div>
  );
}

/** A gesture chip: tap = one step; press and hold = it keeps stepping, like a hand held up to the camera. */
function GestureChip({ g, last, fire }: { g: HomeGesture; last: string | null; fire: (name: string, repeat: boolean) => void }) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        fire(g.name, false);
        if (g.repeat) timer.current = setInterval(() => fire(g.name, true), 800);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), fire(g.name, false))}
      title={g.repeat ? "Tap for one step, hold to keep going" : "Tap"}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] cursor-pointer select-none touch-none transition-colors ${
        last === g.name ? "bw-accent-border bw-tint" : "bw-rule bw-chip"
      }`}
    >
      <span aria-hidden>{g.icon}</span>
      {g.label}
    </button>
  );
}

type Props = {
  state: HomeState | null;
  log: HomeLog;
  line: string;
  offline: string;
  people: number | null; // what the camera sees right now (null: camera off)
  lastGesture: string | null;
  gestures: HomeGesture[];
  camera: React.ReactNode; // the live camera preview and its on/off button (owned by GlitchDemo)
  speakOn: boolean;
  onSpeak: (on: boolean) => void;
  send: (device: string, action: string) => void;
  gesture: (name: string, repeat: boolean) => void;
  peopleEvent: (kind: "enter" | "empty" | "left") => void;
  phonePanel: string; // "home": line, devices, gestures; "camera": camera and the people simulator (md and up: everything)
  coach?: boolean; // first time the camera is on: point at the gestures
  onCoachDone?: () => void;
};

const HomePanel = ({ state, log, line, offline, people, lastGesture, gestures, camera, speakOn, onSpeak, send, gesture, peopleEvent, phonePanel, coach, onCoachDone }: Props) => {
  const [open, setOpen] = useState<"" | "log" | "rules">("");

  // Umbrella not reachable (it runs on Ashish's machine, not on the live site): one clear note instead of dead controls
  if (offline && !state) {
    return (
      <div className={`border-t bw-rule p-4 md:p-5 ${phonePanel === "home" || phonePanel === "camera" ? "block" : "hidden md:block"}`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] bw-muted mb-2">Smart home · offline here</p>
        <p className="text-sm bw-muted leading-relaxed max-w-2xl">
          Glitch&apos;s smart home (lights, fan, AC and TV, switched by hand gestures, by who is in the room, or by asking) runs on its brain,
          Umbrella, which lives on my own machine for now, so it isn&apos;t part of this live demo. Chat, the face and the robot still work here.
        </p>
      </div>
    );
  }

  const room = emptyRoom(state);
  const devices = [...(state?.devices ?? [])].sort((a, b) => (a.room === b.room ? 0 : a.room === "living room" ? -1 : 1));
  const show = (panel: string) => (phonePanel === panel ? "block" : "hidden md:block");
  const toggle = (k: "log" | "rules") => setOpen((o) => (o === k ? "" : k));

  return (
    <div className="border-t bw-rule">
      <div className="grid md:grid-cols-[13.5rem_1fr] lg:grid-cols-[13.5rem_1fr_19rem] md:divide-x divide-[var(--border-color)]">
        {/* camera, what it sees, and the people simulator */}
        <div className={`p-2.5 ${show("camera")}`}>
          {camera}
          <p className="mt-2 font-mono text-[10px] bw-muted leading-relaxed">
            people <b className="theme-text-primary">{people === null ? "–" : people}</b> · gesture{" "}
            <b className={lastGesture ? "bw-accent" : "theme-text-primary"}>{lastGesture ?? "–"}</b>
            <br />
            room <b className={room.hot ? "bw-accent" : "theme-text-primary"}>{room.text}</b>
          </p>
          <div className="flex gap-1 mt-2" title="“Room empty” starts the countdown (nobody in view for 2 min: everything off). “Left now” skips the wait.">
            {(
              [
                ["enter", "🚶", "Enter"],
                ["empty", "🫥", "Empty"],
                ["left", "🚪", "Left"],
              ] as const
            ).map(([k, icon, label]) => (
              <button key={k} type="button" onClick={() => peopleEvent(k)} className="flex-1 text-[10.5px] px-1 py-1 rounded-md border bw-rule bw-chip cursor-pointer whitespace-nowrap">
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Umbrella's line and the devices */}
        <div className={`p-2.5 min-w-0 ${show("home")}`}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-lg border bw-rule bg-[var(--bg-subtle)]">
            <p className="flex-1 text-[13px] leading-snug truncate" title={line}>
              {offline ? <span className="bw-muted">{offline}</span> : line ? `💬 ${line}` : <span className="bw-faint">Glitch&apos;s line appears here after each change.</span>}
            </p>
            <button
              type="button"
              onClick={() => onSpeak(!speakOn)}
              aria-pressed={speakOn}
              title={speakOn ? "Stop speaking the lines" : "Speak each new line"}
              className={`shrink-0 grid place-items-center w-7 h-7 rounded-full border cursor-pointer ${speakOn ? "bw-accent-border bw-accent bw-tint" : "bw-rule bw-chip"}`}
            >
              {speakOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-start justify-between">
            <Label>Devices · simulated · tap to switch</Label>
            {state && (
              <button type="button" onClick={() => send("everything", "off")} className="font-mono text-[10px] bw-muted hover:text-[var(--text-primary)] cursor-pointer">
                all off
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {devices.map((d) => (
              <DeviceRow key={d.id} d={d} send={send} />
            ))}
          </div>
        </div>

        {/* gestures, and the rules / action log behind buttons */}
        <div className={`p-2.5 min-w-0 md:col-span-2 lg:col-span-1 md:border-t lg:border-t-0 bw-rule ${show("home")}`}>
          <div className={`relative ${coach ? "bw-coach-target" : ""}`}>
            {coach && (
              <CoachTip
                title="Try a hand gesture"
                text="Show one of these to the camera. Hold ☝️ or 👍 to keep stepping the fan or the lamp. Tapping works too."
                onDone={() => onCoachDone?.()}
              />
            )}
            <Label>Hand gestures · show to the camera, or tap / hold</Label>
            <div className="flex flex-wrap gap-1">
              {gestures.map((g) => (
                <GestureChip key={g.name} g={g} last={lastGesture} fire={gesture} />
              ))}
            </div>
          </div>
          <div className="flex gap-1.5 mt-2.5">
            {(
              [
                ["log", `Action log${log.actions.length ? ` (${log.actions.length})` : ""}`],
                ["rules", `Rules${state ? ` (${state.rules.length})` : ""}`],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-expanded={open === k}
                onClick={() => toggle(k)}
                className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${open === k ? "bw-accent-border bw-accent bw-tint" : "bw-rule bw-chip"}`}
              >
                {label} {open === k ? "▴" : "▾"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* opened on request: the action log or the rules */}
      {open === "log" && (
        <ul data-scroll-box className="border-t bw-rule px-3 py-2 max-h-48 overflow-y-auto space-y-1">
          {!log.actions.length && <li className="text-[11px] bw-faint">Nothing yet. Try a gesture or tap a device.</li>}
          {log.actions.map((a: HomeAction) => (
            <li key={a.id} className="text-[11px] leading-snug">
              <span className="font-mono bw-faint">{clock(a.at)}</span>{" "}
              <span className={a.status === "done" ? "bw-accent" : a.status === "failed" ? "text-red-500" : "bw-faint"}>{a.status}</span>{" "}
              <b>{a.device_name || a.device_id}</b> {a.action}
              {a.value != null ? ` ${a.value}` : ""} <span className="bw-faint">· {brief(a.before)} → {brief(a.after)} · {a.trigger}</span>
              {a.error ? <span className="text-red-500"> · {a.error}</span> : null}
            </li>
          ))}
        </ul>
      )}
      {open === "rules" && state && (
        <ul className="border-t bw-rule px-3 py-2 space-y-0.5 text-[11px] bw-muted">
          {state.rules.map((r) => (
            <li key={r.name}>
              <b className="theme-text-primary">{r.name}</b> · {r.when}
              {r.cooldown ? ` · cooldown ${r.cooldown} min` : ""}
              {r.repeat ? " · repeats while held" : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomePanel;
