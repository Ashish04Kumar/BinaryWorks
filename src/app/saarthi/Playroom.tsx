"use client";
// Saarthi's playroom: the real character and its real rules, running in the browser.
// The state machine is a port of the app's states.py (same thresholds for typing and scrolling, same 1.2 s
// hold before switching, waking up after a rest). Away and asleep happen after 20 s / 40 s here instead of
// 3 min / 15 min, and break, lunch and breathing are shortened, so you can see everything in a minute.
import { useCallback, useEffect, useRef, useState } from "react";
import { SPRITES, type SpriteState } from "./sprites";
import Sprite from "./Sprite";
import { line, type Lang } from "./lines";

const DISPLAY = 190; // css px for the character (desktop)
const DISPLAY_SMALL = 116; // on phones
const TH = { fast: 4, slow: 0.3, scroll: 0.8, afk: 20, sleep: 40, hold: 1.2, videoTyping: 1 };
const TRANSIENT: Partial<Record<SpriteState, number>> = { waking: 2.5, happy: 2.5, stretch: 6, alert: 8, poked: 1.6, giggle: 2 };
const RESTING: SpriteState[] = ["afk", "sleeping"];
const BREATH = [
  { key: "breathe_in", secs: 4 },
  { key: "breathe_hold", secs: 2 },
  { key: "breathe_out", secs: 6 },
];

type Session =
  | { kind: "break"; until: number; total: number }
  | { kind: "lunch"; phase: "eat" | "walk" | "think"; phaseUntil: number }
  | { kind: "breathe"; breath: number; step: number; stepUntil: number };

const now = () => performance.now() / 1000;
const SAMPLE_REMINDERS = ["Paani peena 💧", "Stand-up call at 11", "Push the release branch", "Mom ko call karna 📞"];

// ---------------------------------------------------------------- playroom
export default function Playroom() {
  const [state, setState] = useState<SpriteState>("idle");
  const [bubble, setBubble] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [walking, setWalking] = useState(true);
  const [quiet, setQuiet] = useState(false);
  const [video, setVideo] = useState(false);
  const [x, setX] = useState(0.5); // 0..1 across the stage
  const [flip, setFlip] = useState(false);
  const [dizzy, setDizzy] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [tally, setTally] = useState({ done: 0, skipped: 0 });
  const [diag, setDiag] = useState({ kps: 0, sps: 0, idle: 0, session: "" });
  const [status, setStatus] = useState<"working" | "break" | "lunch">("working");
  const [clock, setClock] = useState("");
  const [small, setSmall] = useState(false); // phone layout: smaller character, compact controls
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const set = () => setSmall(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  useEffect(() => {
    const fmt = () => setClock(new Date().toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", ""));
    fmt();
    const id = setInterval(fmt, 20_000);
    return () => clearInterval(id);
  }, []);

  // live values the loop reads without re-subscribing
  const r = useRef({
    state: "idle" as SpriteState,
    entered: 0,
    candidate: null as SpriteState | null,
    candidateSince: 0,
    transientUntil: 0,
    keys: [] as number[],
    scrolls: [] as number[],
    lastInput: now(),
    lastSpoke: 0,
    lastRandom: now(),
    lastNag: 0,
    session: null as Session | null,
    walkTarget: null as number | null,
    x: 0.5,
    clicks: [] as number[],
    pendingReminder: null as string | null,
    lang: "hinglish" as Lang,
    walking: true,
    quiet: false,
    video: false,
    bubbleUntil: 0,
  });
  useEffect(() => { r.current.lang = lang; }, [lang]);
  useEffect(() => { r.current.walking = walking; }, [walking]);
  useEffect(() => { r.current.video = video; }, [video]);

  const say = useCallback((key: string, vars: Record<string, string | number> = {}, secs = 4.5, force = false) => {
    const R = r.current;
    if (R.quiet && !force) return;
    const text = line(R.lang, key, vars);
    if (!text) return;
    R.lastSpoke = now();
    R.bubbleUntil = now() + secs;
    setBubble(text);
  }, []);

  const enter = useCallback((s: SpriteState, transient?: number) => {
    const R = r.current;
    R.state = s;
    R.entered = now();
    R.candidate = null;
    R.transientUntil = transient ? now() + transient : 0;
    setState(s);
  }, []);

  const touch = useCallback(() => { r.current.lastInput = now(); }, []);

  // preload every animation so switching never flashes
  useEffect(() => {
    (Object.keys(SPRITES) as SpriteState[]).forEach((s) => { const i = new Image(); i.src = `/saarthi/sprites/${s}.webp`; });
    const t = setTimeout(() => say("hello", {}, 6), 900);
    return () => clearTimeout(t);
  }, [say]);

  // ------------------------------------------------ the loop (port of StateMachine.update + wellness sessions)
  useEffect(() => {
    const id = setInterval(() => {
      const R = r.current;
      const t = now();
      R.keys = R.keys.filter((k) => t - k < 2);
      R.scrolls = R.scrolls.filter((k) => t - k < 2);
      const kps = R.keys.length / 2, sps = R.scrolls.length / 2, idle = t - R.lastInput;
      if (R.bubbleUntil && t > R.bubbleUntil) { R.bubbleUntil = 0; setBubble(null); }

      // ---- sessions: break, lunch, breathing
      const S = R.session;
      let sessionText = "";
      if (S?.kind === "break") {
        const left = Math.max(0, Math.ceil(S.until - t));
        sessionText = `Break · ${left}s left`;
        if (kps > 0 && t - R.lastNag > 6) { R.lastNag = t; say("break_nag"); }
        if (t >= S.until) { R.session = null; setStatus("working"); enter("happy", 2.5); say("break_end"); }
      } else if (S?.kind === "lunch") {
        sessionText = `Lunch · ${S.phase}`;
        if (S.phase === "walk") {
          // stroll slowly while digesting
          if (R.walkTarget === null || Math.abs(R.walkTarget - R.x) < 0.01) R.walkTarget = 0.15 + Math.random() * 0.7;
          const dir = Math.sign(R.walkTarget - R.x);
          R.x += dir * 0.0045;
          setX(R.x);
          setFlip(dir < 0);
        }
        if (t >= S.phaseUntil) {
          if (S.phase === "eat") { R.session = { kind: "lunch", phase: "walk", phaseUntil: t + 7 }; enter("walk"); say("lunch_walk"); }
          else if (S.phase === "walk") { R.walkTarget = null; setFlip(false); R.session = { kind: "lunch", phase: "think", phaseUntil: t + 5 }; enter("think"); say("think"); }
          else { R.session = null; setStatus("working"); enter("happy", 2.5); say("lunch_end"); }
        }
      } else if (S?.kind === "breathe") {
        const step = BREATH[S.step];
        const n = Math.max(1, Math.ceil(S.stepUntil - t));
        sessionText = `Breathing · ${S.breath + 1} of 3`;
        say(step.key, { n }, 1.2, true);
        if (t >= S.stepUntil) {
          const nextStep = (S.step + 1) % BREATH.length;
          const nextBreath = nextStep === 0 ? S.breath + 1 : S.breath;
          if (nextBreath >= 3) { R.session = null; enter("happy", 2.5); say("breathe_end", {}, 4.5, true); }
          else R.session = { kind: "breathe", breath: nextBreath, step: nextStep, stepUntil: t + BREATH[nextStep].secs };
        }
      }

      if (!R.session) {
        // ---- classify (states.py)
        let target: SpriteState = "idle";
        if (R.video && kps < TH.videoTyping) target = "watching";
        else if (idle >= TH.sleep) target = "sleeping";
        else if (idle >= TH.afk) target = "afk";
        else if (kps >= TH.fast) target = "typing_fast";
        else if (kps >= TH.slow) target = "typing_slow";
        else if (sps >= TH.scroll) target = "scrolling";

        const inTransient = R.transientUntil && t < R.transientUntil;
        if (!inTransient) {
          if (R.transientUntil) R.transientUntil = 0;
          if (RESTING.includes(R.state) && !RESTING.includes(target)) {
            enter("waking", TRANSIENT.waking);
            say("waking");
          } else if (R.state === "walk" && target === "idle") {
            // walking mode: stroll to a spot, then stand
            const dir = Math.sign((R.walkTarget ?? R.x) - R.x);
            R.x += dir * 0.006;
            setX(R.x);
            if (R.walkTarget === null || Math.abs(R.walkTarget - R.x) < 0.01) { R.walkTarget = null; setFlip(false); enter("idle"); }
          } else if (target === R.state) {
            R.candidate = null;
            // idle for a while: maybe go for a walk, or say something
            if (target === "idle" && R.walking && t - R.entered > 4 && Math.random() < 0.05) {
              R.walkTarget = 0.12 + Math.random() * 0.76;
              setFlip(R.walkTarget < R.x);
              enter("walk");
            } else if (target === "idle" && t - R.lastRandom > 22 && t - R.lastSpoke > 10) {
              R.lastRandom = t;
              say("random");
            }
          } else {
            if (target !== R.candidate) { R.candidate = target; R.candidateSince = t; }
            const hold = RESTING.includes(target) ? 0 : TH.hold;
            if (t - R.candidateSince >= hold) {
              if (R.state === "walk") { R.walkTarget = null; setFlip(false); }
              enter(target);
              if (t - R.lastSpoke > 5) say(target);
            }
          }
        }
      }

      setDiag({ kps, sps, idle: Math.floor(idle), session: sessionText });
    }, 150);
    return () => clearInterval(id);
  }, [enter, say]);

  // ------------------------------------------------ actions
  const pokeCharacter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const R = r.current;
    touch();
    const t = now();
    R.clicks = [...R.clicks.filter((c) => t - c < 3), t];
    if (R.clicks.length >= 4) {
      R.clicks = [];
      setDizzy(true);
      setTimeout(() => setDizzy(false), 1400);
      say("dizzy");
      if (!R.session) enter("poked", 1.6);
      return;
    }
    const box = e.currentTarget.getBoundingClientRect();
    const head = (e.clientY - box.top) / box.height < 0.38;
    say(head ? "poked" : "giggle");
    if (!R.session) enter(head ? "poked" : "giggle", head ? TRANSIENT.poked : TRANSIENT.giggle);
  };

  const setWorkStatus = (s: "working" | "break" | "lunch") => {
    const R = r.current;
    touch();
    if (s === status || s === "working") {
      // clicking the active status again (or Working) ends the session
      if (R.session?.kind === "break" || R.session?.kind === "lunch") { R.session = null; R.walkTarget = null; setFlip(false); enter("happy", 2.5); say(R.session === null && status === "lunch" ? "lunch_end" : "break_end"); }
      setStatus("working");
      return;
    }
    setStatus(s);
    if (s === "break") { R.session = { kind: "break", until: now() + 20, total: 20 }; enter("break"); say("break_start"); }
    else { R.session = { kind: "lunch", phase: "eat", phaseUntil: now() + 8 }; enter("eat"); say("lunch_start"); }
  };

  const breathe = () => {
    const R = r.current;
    touch();
    setStatus("working");
    R.session = { kind: "breathe", breath: 0, step: 0, stepUntil: now() + BREATH[0].secs };
    enter("breathe");
  };

  const fireReminder = () => {
    const R = r.current;
    const text = SAMPLE_REMINDERS[Math.floor(Math.random() * SAMPLE_REMINDERS.length)];
    if (R.quiet) { R.pendingReminder = text; say("reminder", { t: text }, 3, true); return; }
    setReminder(text);
    if (!R.session) enter("alert", TRANSIENT.alert);
    say("reminder", { t: text }, 6);
  };

  const answerReminder = (done: boolean | null) => {
    if (done === true) setTally((v) => ({ ...v, done: v.done + 1 }));
    if (done === false) setTally((v) => ({ ...v, skipped: v.skipped + 1 }));
    setReminder(null);
    if (r.current.state === "alert") enter("happy", 2);
  };

  const toggleQuiet = () => {
    const R = r.current;
    R.quiet = !R.quiet;
    setQuiet(R.quiet);
    if (!R.quiet && R.pendingReminder) { setReminder(R.pendingReminder); R.pendingReminder = null; enter("alert", TRANSIENT.alert); }
    if (R.quiet) setBubble(null);
  };

  // a stroll across the screen, to the far side
  const walkNow = () => {
    const R = r.current;
    touch();
    if (R.session) return;
    R.walkTarget = R.x < 0.5 ? 0.72 + Math.random() * 0.25 : 0.03 + Math.random() * 0.25;
    setFlip(R.walkTarget < R.x);
    enter("walk");
  };

  // walking mode: turning it on starts a stroll right away; turning it off stops it
  const toggleWalking = () => {
    const R = r.current;
    const next = !R.walking;
    R.walking = next;
    setWalking(next);
    if (next && R.state !== "walk") walkNow();
    else if (!next && R.state === "walk") {
      R.walkTarget = null;
      setFlip(false);
      enter("idle");
    }
  };

  const stretch = () => { touch(); if (!r.current.session) { enter("stretch", TRANSIENT.stretch); say("stretch"); } };

  // ------------------------------------------------ render
  const btn = "px-3 py-1.5 rounded-lg border bw-rule text-[13px] bw-chip cursor-pointer";
  const on = "bw-accent bw-accent-border bw-tint";
  const size = small ? DISPLAY_SMALL : DISPLAY;
  const left = `calc((100% - ${size}px) * ${x.toFixed(4)})`; // keeps the character inside the stage

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-4" onPointerMove={touch}>
      {/* stage: an Ubuntu laptop, with Saarthi living on its desktop */}
      <div className="sticky top-[72px] z-20 lg:top-24 self-start">
        <div className="sr-laptop">
          <div className="sr-screen relative overflow-hidden h-[230px] sm:h-[400px] lg:h-[450px]">
            {/* GNOME top bar */}
            <div className="sr-topbar absolute inset-x-0 top-0 h-[26px] z-30 flex items-center px-3 text-[11.5px] text-white/90">
              <span className="font-semibold">Activities</span>
              <span className="hidden sm:block absolute left-1/2 -translate-x-1/2 font-semibold">{clock}</span>
              <span className="ml-auto flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-[1px] font-mono text-[10.5px] max-w-[190px] sm:max-w-none truncate">
                  🙂 {state}{diag.session ? ` · ${diag.session}` : ""}{quiet ? " · 🤫" : ""}
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0" /><circle cx="12" cy="19.5" r="1.2" fill="currentColor" /></svg>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9a4 4 0 010 6" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                <svg width="18" height="13" viewBox="0 0 28 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="1.5" width="22" height="11" rx="2.5" /><rect x="3.5" y="4" width="14" height="6" rx="1" fill="currentColor" stroke="none" /><path d="M25 5.5v3" strokeWidth="2.2" /></svg>
              </span>
            </div>

            {/* dock */}
            <div className="sr-dock absolute left-0 top-[26px] bottom-0 w-[50px] z-20 hidden sm:flex flex-col items-center gap-2 py-3">
              {[
                ["🦊", "#ff7139"],
                ["📁", "#7b8794"],
                ["›_", "#2c001e"],
                ["‹›", "#1f7ad6"],
                ["⚙", "#5e5e66"],
              ].map(([ic, bg], i) => (
                <span key={i} className="grid place-items-center w-[34px] h-[34px] rounded-[9px] text-[15px] font-bold text-white shadow-sm" style={{ background: bg }}>{ic}</span>
              ))}
              <span className="relative grid place-items-center w-[34px] h-[34px] rounded-[9px] overflow-hidden bg-[#fde68a] shadow-sm" title="Saarthi (running)">
                <span style={{ width: 34, height: 34, backgroundImage: "url(/saarthi/sprites/idle.webp)", backgroundSize: `${SPRITES.idle.frames * 34}px 34px` }} />
                <span className="absolute -left-[7px] top-1/2 -mt-[3px] w-[5px] h-[5px] rounded-full bg-[#e95420]" />
              </span>
              <span className="mt-auto grid grid-cols-3 gap-[3px] opacity-80">
                {Array.from({ length: 9 }, (_, i) => <i key={i} className="block w-[4px] h-[4px] rounded-full bg-white" />)}
              </span>
            </div>

            {/* desktop: a terminal in the back, then Saarthi */}
            <div className="absolute left-0 sm:left-[50px] right-0 top-[26px] bottom-0">
              <div className="sr-term absolute hidden sm:block left-[6%] top-[9%] w-[min(330px,62%)] rounded-[10px] overflow-hidden text-[11.5px] font-mono">
                <div className="flex items-center h-[26px] px-3 bg-[#2b2b2b] text-white/80 text-[11px] font-sans">
                  <span className="mx-auto">ashish@ubuntu: ~</span>
                  <span className="flex gap-1.5">{["#5f5f5f", "#5f5f5f", "#e95420"].map((c, i) => <i key={i} className="block w-[11px] h-[11px] rounded-full" style={{ background: c }} />)}</span>
                </div>
                <div className="px-3 py-2.5 leading-[1.55] text-[#e7e3df] bg-[#300a24]/95">
                  <div><span className="text-[#8ae234]">ashish@ubuntu</span>:<span className="text-[#729fcf]">~</span>$ saarthi</div>
                  <div className="text-white/70">Saarthi is running · skin: Saarthi (3D)</div>
                  <div className="text-white/70">typing: evdev · media: MPRIS · walking: {walking ? "on" : "off"}</div>
                  <div><span className="text-[#8ae234]">ashish@ubuntu</span>:<span className="text-[#729fcf]">~</span>$ <span className="sr-caret">▍</span></div>
                </div>
              </div>

              {/* reminder card */}
              {reminder && (
                <div className="absolute right-3 top-3 z-20 w-[250px] rounded-xl bg-white text-[#1b1b1f] shadow-xl p-3 text-[13px] sr-pop">
                  <div className="font-mono text-[10.5px] text-black/50 uppercase tracking-wider">⏰ Reminder</div>
                  <div className="font-semibold mt-1">{reminder}</div>
                  <div className="flex gap-1.5 mt-3">
                    {[["✓ Done", true], ["✗ Skipped", false], ["10 min", null]].map(([label, v]) => (
                      <button key={String(label)} className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-[12.5px] cursor-pointer" onClick={() => answerReminder(v as boolean | null)}>{label as string}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* character + bubble */}
              <div
                className="absolute bottom-0 transition-[left] duration-150 ease-linear z-10"
                style={{ left: quiet ? `calc(100% - ${size * 0.55}px - 8px)` : left, transform: quiet ? "scale(.55)" : undefined, transformOrigin: "bottom right" }}
              >
                {bubble && !quiet && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-6px)] w-max max-w-[200px] sm:max-w-[250px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-white text-[#1b1b1f] shadow-xl text-[12.5px] sm:text-[13.5px] leading-snug text-center sr-pop" key={bubble}>
                    {bubble}
                    <span className="absolute left-1/2 -bottom-[6px] -ml-[6px] w-3 h-3 rotate-45 bg-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={pokeCharacter}
                  aria-label="Saarthi: click the head to poke, the body to tickle"
                  className={`block cursor-pointer select-none ${dizzy ? "sr-dizzy" : ""}`}
                >
                  <Sprite state={state} flip={flip} size={size} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="sr-base hidden sm:block" aria-hidden><span /></div>
        <p className="hidden sm:block mt-3 text-center text-[11.5px] font-mono bw-muted">click head = poke · body = tickle · 4 fast clicks = dizzy</p>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-2 sm:gap-3 text-sm">
        <div className="rounded-2xl border bw-rule theme-bg-card p-3 sm:p-4">
          <div className="font-mono text-[11px] bw-muted uppercase tracking-wider mb-2">1 · Do something</div>
          <textarea
            onKeyDown={() => { r.current.keys.push(now()); touch(); }}
            placeholder="Type here: slow, then really fast…"
            rows={small ? 1 : 2}
            className="w-full rounded-lg border bw-rule bg-transparent px-3 py-2 text-[13.5px] resize-none outline-none focus:border-[var(--accent-bright)]"
          />
          <div
            data-scroll-box
            onWheel={() => { r.current.scrolls.push(now()); touch(); }}
            onScroll={() => { r.current.scrolls.push(now()); touch(); }}
            className="mt-2 h-[44px] sm:h-[68px] overflow-y-auto rounded-lg border bw-rule px-3 py-2 text-[12.5px] bw-muted"
          >
            {Array.from({ length: 24 }, (_, i) => <div key={i}>Scroll me · item {i + 1} of a long feed…</div>)}
          </div>
          <button onClick={() => { touch(); setVideo((v) => !v); }} className={`${btn} mt-2 w-full flex items-center justify-center gap-2 ${video ? on : ""}`}>
            {video ? "⏸ Pause the tutorial" : "▶ Play a tutorial video"}
          </button>
        </div>

        <div className="rounded-2xl border bw-rule theme-bg-card p-3 sm:p-4">
          <div className="font-mono text-[11px] bw-muted uppercase tracking-wider mb-2">2 · Status &amp; wellness</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={`${btn} ${status === "working" ? on : ""}`} onClick={() => setWorkStatus("working")}>💻 Working</button>
            <button className={`${btn} ${status === "break" ? on : ""}`} onClick={() => setWorkStatus("break")}>☕ Break</button>
            <button className={`${btn} ${status === "lunch" ? on : ""}`} onClick={() => setWorkStatus("lunch")}>🍱 Lunch</button>
            <button className={btn} onClick={breathe}>🧘 Breathe</button>
            <button className={btn} onClick={stretch}>🙆 Stretch</button>
            <button className={btn} onClick={walkNow}>🚶 Walk</button>
            <button className={btn} onClick={fireReminder}>⏰ Reminder</button>
          </div>
          <p className="text-[11.5px] bw-muted mt-2">Is hafte: {tally.done} ✓ kiya · {tally.skipped} ✗ nahi kiya</p>
        </div>

        <div className="rounded-2xl border bw-rule theme-bg-card p-3 sm:p-4">
          <div className="font-mono text-[11px] bw-muted uppercase tracking-wider mb-2">3 · Settings</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={`${btn} ${walking ? on : ""}`} onClick={toggleWalking}>🚶 Walking mode: {walking ? "on" : "off"}</button>
            <button className={`${btn} ${quiet ? on : ""}`} onClick={toggleQuiet}>🤫 Quiet mode</button>
            <button className={btn} onClick={() => setLang((l) => (l === "hinglish" ? "en" : "hinglish"))}>🗣 {lang === "hinglish" ? "Hinglish" : "English"}</button>
          </div>
        </div>

        <div className="hidden sm:block rounded-2xl border bw-rule theme-bg-card p-4 font-mono text-[12px]">
          <div className="text-[11px] bw-muted uppercase tracking-wider mb-2">What I see…</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="bw-muted">Keys / sec</span><span>{diag.kps.toFixed(1)}</span>
            <span className="bw-muted">Scrolls / sec</span><span>{diag.sps.toFixed(1)}</span>
            <span className="bw-muted">Idle</span><span>{diag.idle}s {diag.idle >= TH.afk ? (diag.idle >= TH.sleep ? "· asleep" : "· away") : ""}</span>
            <span className="bw-muted">Video</span><span>{video ? "playing" : "no"}</span>
            <span className="bw-muted">Mood</span><span className="bw-accent">{state}</span>
          </div>
          <p className="mt-2 text-[10.5px] bw-muted font-sans">Demo timings: away after 20 s and asleep after 40 s (the app uses 3 and 15 min). Keep your mouse still to see it.</p>
        </div>
      </div>
    </div>
  );
}
