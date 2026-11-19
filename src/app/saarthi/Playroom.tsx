"use client";
// Saarthi's playroom: the real character and its real rules, running in the browser.
// The state machine is a port of the app's states.py (same thresholds for typing and scrolling, same 1.2 s
// hold before switching, waking up after a rest). Away and asleep happen after 20 s / 40 s here instead of
// 3 min / 15 min, and break, lunch and breathing are shortened, so you can see everything in a minute.
import { useCallback, useEffect, useRef, useState } from "react";
import { SPRITES, type SpriteState } from "./sprites";
import { line, type Lang } from "./lines";

const DISPLAY = 190; // css px for the character
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

// ---------------------------------------------------------------- sprite
function Sprite({ state, flip }: { state: SpriteState; flip: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const s = SPRITES[state];
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      let f = Math.floor(((t - start) / 1000) * s.fps);
      f = s.loop ? f % s.frames : Math.min(f, s.frames - 1);
      if (el.current) el.current.style.backgroundPosition = `${-f * DISPLAY}px 0`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);
  const s = SPRITES[state];
  return (
    <div
      ref={el}
      aria-hidden
      style={{
        width: DISPLAY,
        height: DISPLAY,
        backgroundImage: `url(/saarthi/sprites/${state}.webp)`,
        backgroundSize: `${s.frames * DISPLAY}px ${DISPLAY}px`,
        backgroundRepeat: "no-repeat",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    />
  );
}

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
            if (target === "idle" && R.walking && t - R.entered > 7 && Math.random() < 0.02) {
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

  const stretch = () => { touch(); if (!r.current.session) { enter("stretch", TRANSIENT.stretch); say("stretch"); } };

  // ------------------------------------------------ render
  const btn = "px-3 py-1.5 rounded-lg border bw-rule text-[13px] bw-chip cursor-pointer";
  const on = "bw-accent bw-accent-border bw-tint";
  const left = `calc((100% - ${DISPLAY}px) * ${x.toFixed(4)})`; // keeps the character inside the stage

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-4" onPointerMove={touch}>
      {/* stage */}
      <div className="relative rounded-2xl border bw-rule overflow-hidden h-[440px] sm:h-[480px] lg:sticky lg:top-24 self-start sr-stage">
        <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10 text-[11px] font-mono">
          <span className="px-2 py-1 rounded-md theme-bg-card border bw-rule">mood: <b className="bw-accent">{state}</b></span>
          {diag.session && <span className="px-2 py-1 rounded-md theme-bg-card border bw-rule">{diag.session}</span>}
          {quiet && <span className="px-2 py-1 rounded-md theme-bg-card border bw-rule">🤫 quiet</span>}
        </div>

        {/* reminder card */}
        {reminder && (
          <div className="absolute right-4 top-4 z-20 w-[250px] rounded-xl theme-bg-card border bw-rule shadow-[var(--shadow-float)] p-3 text-[13px] sr-pop">
            <div className="font-mono text-[10.5px] bw-muted uppercase tracking-wider">⏰ Reminder</div>
            <div className="font-semibold mt-1">{reminder}</div>
            <div className="flex gap-1.5 mt-3">
              <button className={`${btn} !px-2 !py-1`} onClick={() => answerReminder(true)}>✓ Done</button>
              <button className={`${btn} !px-2 !py-1`} onClick={() => answerReminder(false)}>✗ Skipped</button>
              <button className={`${btn} !px-2 !py-1`} onClick={() => answerReminder(null)}>10 min</button>
            </div>
          </div>
        )}

        {/* character + bubble */}
        <div
          className="absolute bottom-[34px] transition-[left] duration-150 ease-linear"
          style={{ left: quiet ? `calc(100% - ${DISPLAY * 0.55}px - 10px)` : left, transform: quiet ? "scale(.55)" : undefined, transformOrigin: "bottom right" }}
        >
          {bubble && !quiet && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-6px)] w-max max-w-[260px] px-3.5 py-2 rounded-2xl theme-bg-card border bw-rule shadow-[var(--shadow-float)] text-[13.5px] leading-snug text-center sr-pop" key={bubble}>
              {bubble}
              <span className="absolute left-1/2 -bottom-[7px] -ml-[7px] w-3.5 h-3.5 rotate-45 theme-bg-card border-r border-b bw-rule" />
            </div>
          )}
          <button
            type="button"
            onClick={pokeCharacter}
            aria-label="Saarthi: click the head to poke, the body to tickle"
            className={`block cursor-pointer select-none ${dizzy ? "sr-dizzy" : ""}`}
          >
            <Sprite state={state} flip={flip} />
          </button>
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-[34px] sr-floor" />
        <p className="absolute left-4 bottom-2 text-[11px] font-mono bw-muted z-10">click head = poke · body = tickle · 4 fast clicks = dizzy</p>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-3 text-sm">
        <div className="rounded-2xl border bw-rule theme-bg-card p-4">
          <div className="font-mono text-[11px] bw-muted uppercase tracking-wider mb-2">1 · Do something</div>
          <textarea
            onKeyDown={() => { r.current.keys.push(now()); touch(); }}
            placeholder="Type here: slow, then really fast…"
            rows={2}
            className="w-full rounded-lg border bw-rule bg-transparent px-3 py-2 text-[13.5px] resize-none outline-none focus:border-[var(--accent-bright)]"
          />
          <div
            data-scroll-box
            onWheel={() => { r.current.scrolls.push(now()); touch(); }}
            onScroll={() => { r.current.scrolls.push(now()); touch(); }}
            className="mt-2 h-[68px] overflow-y-auto rounded-lg border bw-rule px-3 py-2 text-[12.5px] bw-muted"
          >
            {Array.from({ length: 24 }, (_, i) => <div key={i}>Scroll me · item {i + 1} of a long feed…</div>)}
          </div>
          <button onClick={() => { touch(); setVideo((v) => !v); }} className={`${btn} mt-2 w-full flex items-center justify-center gap-2 ${video ? on : ""}`}>
            {video ? "⏸ Pause the tutorial" : "▶ Play a tutorial video"}
          </button>
        </div>

        <div className="rounded-2xl border bw-rule theme-bg-card p-4">
          <div className="font-mono text-[11px] bw-muted uppercase tracking-wider mb-2">2 · Status &amp; wellness</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={`${btn} ${status === "working" ? on : ""}`} onClick={() => setWorkStatus("working")}>💻 Working</button>
            <button className={`${btn} ${status === "break" ? on : ""}`} onClick={() => setWorkStatus("break")}>☕ Break</button>
            <button className={`${btn} ${status === "lunch" ? on : ""}`} onClick={() => setWorkStatus("lunch")}>🍱 Lunch</button>
            <button className={btn} onClick={breathe}>🧘 Breathe</button>
            <button className={btn} onClick={stretch}>🙆 Stretch</button>
            <button className={btn} onClick={fireReminder}>⏰ Reminder</button>
          </div>
          <p className="text-[11.5px] bw-muted mt-2">Is hafte: {tally.done} ✓ kiya · {tally.skipped} ✗ nahi kiya</p>
        </div>

        <div className="rounded-2xl border bw-rule theme-bg-card p-4">
          <div className="font-mono text-[11px] bw-muted uppercase tracking-wider mb-2">3 · Settings</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={`${btn} ${walking ? on : ""}`} onClick={() => setWalking((w) => !w)}>🚶 Walking {walking ? "on" : "off"}</button>
            <button className={`${btn} ${quiet ? on : ""}`} onClick={toggleQuiet}>🤫 Quiet mode</button>
            <button className={btn} onClick={() => setLang((l) => (l === "hinglish" ? "en" : "hinglish"))}>🗣 {lang === "hinglish" ? "Hinglish" : "English"}</button>
          </div>
        </div>

        <div className="rounded-2xl border bw-rule theme-bg-card p-4 font-mono text-[12px]">
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
